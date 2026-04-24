import React, { useState, useEffect } from 'react';
import { supabase } from '@swish/core';
import { Button } from '@swish/ui';
import { Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { TournamentBracket } from '@swish/competition';

export function BracketTab({ tournamentId }) {
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const fetchBracketData = async () => {
    setIsLoading(true);
    const [mRes, tRes] = await Promise.all([
      supabase.from('matches').select('*').eq('tournament_id', tournamentId).neq('stage', 'pools').order('bracket_index', { ascending: true }),
      supabase.from('teams').select('*')
    ]);
    setMatches(mRes.data || []);
    setTeams(tRes.data || []);
    setIsLoading(false);
  };

  useEffect(() => { if (tournamentId) fetchBracketData(); }, [tournamentId]);

  // --- MOTEUR DE QUALIFICATION (Taille dynamique) ---
  const getQualifiedTeams = async () => {
    const [pRes, mRes] = await Promise.all([
      supabase.from('pools').select('id').eq('tournament_id', tournamentId),
      supabase.from('matches').select('*').eq('tournament_id', tournamentId).eq('stage', 'pools').not('home_score', 'is', null)
    ]);

    const pools = pRes.data || [];
    const poolMatches = mRes.data || [];
    const standings = {};
    pools.forEach(p => standings[p.id] = {});

    poolMatches.forEach(m => {
      if (!m.pool_id || !standings[m.pool_id]) return;
      ['home', 'away'].forEach(side => {
        const tId = side === 'home' ? m.home_team_id : m.away_team_id;
        if (!standings[m.pool_id][tId]) standings[m.pool_id][tId] = { id: tId, pts: 0, diff: 0 };
      });
      
      const homeTeam = standings[m.pool_id][m.home_team_id];
      const awayTeam = standings[m.pool_id][m.away_team_id];
      if (!homeTeam || !awayTeam) return;

      homeTeam.diff += (m.home_score - m.away_score);
      awayTeam.diff += (m.away_score - m.home_score);
      if (m.home_score > m.away_score) homeTeam.pts += 3;
      else if (m.home_score < m.away_score) awayTeam.pts += 3;
      else { homeTeam.pts += 1; awayTeam.pts += 1; }
    });

    const savedSettings = JSON.parse(localStorage.getItem(`qualifiers-${tournamentId}`) || '{}');
    let qualifiedIds = [];

    Object.entries(standings).forEach(([poolId, poolTeams]) => {
      const sorted = Object.values(poolTeams).sort((a, b) => b.pts !== a.pts ? b.pts - a.pts : b.diff - a.diff);
      const numQualifiers = savedSettings[poolId] ?? 2;
      qualifiedIds.push(...sorted.slice(0, numQualifiers).map(t => t.id));
    });

    return qualifiedIds;
  };

  // --- GÉNÉRATION ET ACTUALISATION DYNAMIQUE ---
  const generateBracket = async () => {
    setIsLoading(true);
    try {
      // 1. LA BARRIÈRE DE SÉCURITÉ BASÉE SUR LE STATUT
      const { data: poolMatches } = await supabase
        .from('matches')
        .select('status') 
        .eq('tournament_id', tournamentId)
        .eq('stage', 'pools');

      if (!poolMatches || poolMatches.length === 0) {
        toast.error("Il n'y a aucun match de poule enregistré.");
        setIsLoading(false);
        return;
      }

      const unfinishedMatches = poolMatches.filter(m => m.status !== 'finished');

      if (unfinishedMatches.length > 0) {
        toast.error(`Action impossible : Il reste ${unfinishedMatches.length} match(s) de poule non terminé(s) !`);
        setIsLoading(false);
        return;
      }

      // 2. RÉCUPÉRATION DES QUALIFIÉS
      const qualifiedIds = await getQualifiedTeams();
      const numTeams = qualifiedIds.length; 
      
      if (numTeams < 2) {
        toast.error("Il faut au moins 2 équipes qualifiées !");
        setIsLoading(false);
        return;
      }

      // 3. CALCUL DE LA TAILLE DE L'ARBRE
      const bracketSize = Math.pow(2, Math.ceil(Math.log2(numTeams)));
      const numRounds = Math.log2(bracketSize);
      const expectedMatchesCount = bracketSize - 1;

      // 🧠 NOUVEAU : ALGORITHME DYNAMIQUE DE TÊTES DE SÉRIE (SEEDING)
      const getSeeding = (size) => {
        let pls = [1, 2];
        for (let i = 1; i < Math.log2(size); i++) {
          let nextPls = [];
          let length = pls.length * 2 + 1;
          pls.forEach(p => { nextPls.push(p); nextPls.push(length - p); });
          pls = nextPls;
        }
        return pls;
      };
      
      if (bracketSize > 128) {
        toast.error("Arbre trop grand (Max 128 équipes).");
        setIsLoading(false); return;
      }
      
      const seedingPattern = getSeeding(bracketSize);

      // 🏷 NOUVEAU : NOMMAGE DYNAMIQUE DES TOURS
      const getStageName = (idx) => {
        if (idx === 0) return 'final';
        if (idx === 1) return 'semi';
        if (idx === 2) return 'quarter';
        return `round_${Math.pow(2, idx + 1)}`; // round_16, round_32, round_64...
      };

      // 4. VÉRIFICATION DE L'EXISTANT EN BASE
      const { data: existingMatches } = await supabase
        .from('matches')
        .select('*')
        .eq('tournament_id', tournamentId)
        .neq('stage', 'pools');

      // --- SCÉNARIO A : ACTUALISATION ---
      if (existingMatches && existingMatches.length === expectedMatchesCount) {
        const matchesPerStage = {};
        existingMatches.forEach(m => {
          matchesPerStage[m.stage] = (matchesPerStage[m.stage] || 0) + 1;
        });
        
        const firstRoundStage = Object.keys(matchesPerStage).find(key => matchesPerStage[key] === bracketSize / 2);
        
        const firstRoundMatches = existingMatches
          .filter(m => m.stage === firstRoundStage)
          .sort((a, b) => a.bracket_index - b.bracket_index);

        const autoAdvancements = [];

        for (let i = 0; i < firstRoundMatches.length; i++) {
          const match = firstRoundMatches[i];
          const homeSeed = seedingPattern[i * 2];
          const awaySeed = seedingPattern[(i * 2) + 1];

          const homeTeamId = homeSeed <= numTeams ? qualifiedIds[homeSeed - 1] : null;
          const awayTeamId = awaySeed <= numTeams ? qualifiedIds[awaySeed - 1] : null;

          await supabase.from('matches')
            .update({ home_team_id: homeTeamId, away_team_id: awayTeamId })
            .eq('id', match.id);

          if (homeTeamId && !awayTeamId) {
            autoAdvancements.push({ matchToUpdate: match.next_match_id, winnerId: homeTeamId, sourceIndex: match.bracket_index });
          } else if (!homeTeamId && awayTeamId) {
            autoAdvancements.push({ matchToUpdate: match.next_match_id, winnerId: awayTeamId, sourceIndex: match.bracket_index });
          }
        }

        for (const adv of autoAdvancements) {
          const isHomeSlot = adv.sourceIndex % 2 !== 0;
          const updateData = isHomeSlot ? { home_team_id: adv.winnerId } : { away_team_id: adv.winnerId };
          await supabase.from('matches').update(updateData).eq('id', adv.matchToUpdate);
        }

        toast.success("Équipes actualisées avec succès !");
        fetchBracketData();
        return;
      }

      // --- SCÉNARIO B : CRÉATION ---
      if (existingMatches && existingMatches.length > 0) {
        await supabase.from('matches').delete().eq('tournament_id', tournamentId).neq('stage', 'pools');
      }

      let previousRoundMatches = [];
      let allCreatedMatches = [];

      for (let roundIdx = 0; roundIdx < numRounds; roundIdx++) {
        const matchesInThisRound = Math.pow(2, roundIdx);
        const currentStage = getStageName(roundIdx); // Utilisation du nom dynamique
        
        const matchesToInsert = [];
        for (let i = 0; i < matchesInThisRound; i++) {
          let nextMatchId = null;
          if (roundIdx > 0) {
            nextMatchId = previousRoundMatches[Math.floor(i / 2)].id;
          }
          matchesToInsert.push({
            tournament_id: tournamentId,
            stage: currentStage,
            bracket_index: i + 1,
            next_match_id: nextMatchId
          });
        }

        const { data, error } = await supabase.from('matches').insert(matchesToInsert).select();
        if (error) throw error;
        
        const sortedData = data.sort((a, b) => a.bracket_index - b.bracket_index);
        previousRoundMatches = sortedData;
        allCreatedMatches.push(...sortedData);
      }

      const firstRoundMatches = previousRoundMatches;
      const firstRoundUpdates = [];
      const autoAdvancements = [];

      for (let i = 0; i < firstRoundMatches.length; i++) {
        const match = firstRoundMatches[i];
        const homeSeed = seedingPattern[i * 2];
        const awaySeed = seedingPattern[(i * 2) + 1];

        const homeTeamId = homeSeed <= numTeams ? qualifiedIds[homeSeed - 1] : null;
        const awayTeamId = awaySeed <= numTeams ? qualifiedIds[awaySeed - 1] : null;

        firstRoundUpdates.push({ id: match.id, home_team_id: homeTeamId, away_team_id: awayTeamId });

        if (homeTeamId && !awayTeamId) {
          autoAdvancements.push({ matchToUpdate: match.next_match_id, winnerId: homeTeamId, sourceIndex: match.bracket_index });
        } else if (!homeTeamId && awayTeamId) {
          autoAdvancements.push({ matchToUpdate: match.next_match_id, winnerId: awayTeamId, sourceIndex: match.bracket_index });
        }
      }

      for (const update of firstRoundUpdates) {
        await supabase.from('matches').update({ home_team_id: update.home_team_id, away_team_id: update.away_team_id }).eq('id', update.id);
      }

      for (const adv of autoAdvancements) {
        const isHomeSlot = adv.sourceIndex % 2 !== 0;
        const updateData = isHomeSlot ? { home_team_id: adv.winnerId } : { away_team_id: adv.winnerId };
        await supabase.from('matches').update(updateData).eq('id', adv.matchToUpdate);
      }

      toast.success(`Arbre généré (${bracketSize} places pour ${numTeams} équipes) !`);
      fetchBracketData();

    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la génération");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetBracket = async () => {
    if (!window.confirm("⚠️ Supprimer tout l'arbre final ?")) return;
    setIsLoading(true);
    await supabase.from('matches').delete().eq('tournament_id', tournamentId).neq('stage', 'pools');
    toast.success("Arbre réinitialisé !");
    fetchBracketData();
  };

  const handleSlotClick = async (matchId, slotType, currentTeamId) => {
    const clickedMatch = matches.find(m => m.id === matchId);
    if (!clickedMatch) return;

    // 🛑 NOUVELLE SÉCURITÉ : MATCH TERMINÉ
    // On empêche de cliquer sur une équipe si son match est déjà fini.
    if (clickedMatch.status === 'finished') {
      toast.error("Verrouillé : Vous ne pouvez plus modifier les équipes d'un match terminé.");
      return;
    }

    // 🛑 SÉCURITÉ BYE (le reste de ton code actuel...)
    if (!clickedMatch.home_team_id || !clickedMatch.away_team_id) {
      toast.error("Match verrouillé : Vous ne pouvez pas modifier une confrontation contenant un 'Bye'.");
      return;
    }

    if (!selectedSlot) {
      setSelectedSlot({ 
        matchId, 
        slotType, 
        teamId: currentTeamId, 
        stage: clickedMatch.stage 
      });
      return;
    }

    if (selectedSlot.matchId === matchId && selectedSlot.slotType === slotType) {
      setSelectedSlot(null);
      return;
    }

    if (selectedSlot.stage !== clickedMatch.stage) {
      toast.error("Erreur : Les équipes doivent appartenir à la même étape.");
      setSelectedSlot(null);
      return;
    }

    // 🚨 MISE À JOUR : On inclut les nouveaux tours dans la liste de sécurité
    const stageOrder = ['round_128', 'round_64', 'round_32', 'round_16', 'quarter', 'semi', 'final'];
    const currentStageIndex = stageOrder.indexOf(clickedMatch.stage);

    if (currentStageIndex > 0) {
      const previousStage = stageOrder[currentStageIndex - 1];
      const previousMatches = matches.filter(m => m.stage === previousStage);
      const unfinishedPrev = previousMatches.filter(m => m.status !== 'finished');
      
      if (unfinishedPrev.length > 0) {
        const label = { 
          'round_128': '128èmes', 'round_64': '64èmes', 'round_32': 'Seizièmes', 
          'round_16': 'Huitièmes', 'quarter': 'Quarts', 'semi': 'Demies' 
        };
        toast.error(`Bloqué : Les ${label[previousStage] || previousStage} ne sont pas finis.`);
        setSelectedSlot(null);
        return;
      }
    }

    setIsLoading(true);
    try {
      const { error } = await Promise.all([
        supabase.from('matches').update({ [selectedSlot.slotType]: currentTeamId }).eq('id', selectedSlot.matchId),
        supabase.from('matches').update({ [slotType]: selectedSlot.teamId }).eq('id', matchId)
      ]);

      if (error) throw error;
      
      toast.success("Équipes interverties !");
      setSelectedSlot(null);
      fetchBracketData();
    } catch (err) {
      toast.error("Erreur lors de l'échange");
    } finally {
      setIsLoading(false);
    }
  };

  // 🚨 MISE À JOUR : On gère les étapes de 128 jusqu'à la Finale
  const stagesConfig = [
    { id: 'round_128', label: '64èmes de Finale' },
    { id: 'round_64', label: '32èmes de Finale' },
    { id: 'round_32', label: 'Seizièmes de Finale' },
    { id: 'round_16', label: 'Huitièmes' },
    { id: 'quarter', label: 'Quarts de Finale' },
    { id: 'semi', label: 'Demi-finales' },
    { id: 'final', label: 'Finale' }
  ];

  const stages = stagesConfig
    .map(stage => ({ ...stage, matches: matches.filter(m => m.stage === stage.id) }))
    .filter(s => s.matches.length > 0);

  if (isLoading) return <div className="p-12 text-center text-slate-500">Chargement de l'arbre...</div>;

  return (
    <div className="p-6">
      {stages.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl">
          <Trophy className="w-16 h-16 text-slate-300 mb-4" />
          <p className="text-slate-500 font-medium mb-6">La phase finale n'a pas encore été générée.</p>
          <Button onClick={generateBracket}>
            Générer l'Arbre Dynamique
          </Button>
        </div>
      ) : (
        <div className="flex flex-col">
          
          <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800">Phase Finale</h2>
            
            <div className="flex gap-3">
              <button 
                onClick={generateBracket} 
                className="px-4 py-2 text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
              >
                Actualiser les qualifiés
              </button>

              <button 
                onClick={handleResetBracket} 
                className="px-4 py-2 text-sm font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
              >
                Réinitialiser
              </button>
            </div>
          </div>

          <TournamentBracket 
            stages={stages}
            teams={teams}
            selectedSlot={selectedSlot}
            onSlotClick={handleSlotClick}
          />
          
        </div>
      )}
    </div>
  );
}