import React, { useState, useEffect } from 'react';
import { useTournamentMatches, useTournamentTeams } from '@swish/competition'; // On récupère les équipes aussi
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Input, Label } from '@swish/ui';
import { CalendarPlus, Trash2, Plus, ArrowRightLeft, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { MatchCard } from '@swish/match-engine'; 
import { supabase } from '@swish/core';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function MatchesTab({ tournamentId }) {
  const { matches, isLoading, generateAutoMatches, createManualMatch, deleteMatch, deleteAllMatches, updateMatch, assignOfficial, removeOfficial } = useTournamentMatches(tournamentId);
  const navigate = useNavigate();
  const { teams } = useTournamentTeams(tournamentId); // Pour choisir les équipes dans le formulaire
  
  const [isTwoLegs, setIsTwoLegs] = useState(false);
  const [isManualOpen, setIsManualOpen] = useState(false);
  
  // États pour le nouveau match manuel
  const [newMatch, setNewMatch] = useState({ home: '', away: '', pool: '' });

  const [isFinishedExpanded, setIsFinishedExpanded] = useState(false);
 
  const handleManualCreate = async () => {
    await createManualMatch(newMatch.pool, newMatch.home, newMatch.away);
    setIsManualOpen(false);
    setNewMatch({ home: '', away: '', pool: '' });
  };

  // NOUVEAU : État pour le match en cours d'édition
  const [editingMatch, setEditingMatch] = useState(null);

  // 1. NOUVEAU : État pour la liste des profils
  const [profiles, setProfiles] = useState([]);

  // 2. NOUVEAU : Récupérer les profils au chargement de la page
  useEffect(() => {
    const fetchProfiles = async () => {
      // ⚠️ Modifie 'first_name, last_name' selon les colonnes de ta table profiles !
      const { data } = await supabase.from('profiles').select('id, first_name, last_name');
      if (data) setProfiles(data);
    };
    fetchProfiles();
  }, []);

  // 2. NOUVEAU : Récupérer les profils au chargement de la page
  useEffect(() => {
    const fetchProfiles = async () => {
      // ⚠️ Modifie 'first_name, last_name' selon les colonnes de ta table profiles !
      const { data } = await supabase.from('profiles').select('id, first_name, last_name');
      if (data) setProfiles(data);
    };
    fetchProfiles();
  }, []);

  // 👇👇👇 AJOUTE CE NOUVEAU BLOC JUSTE ICI 👇👇👇
  useEffect(() => {
    if (!tournamentId) return;

    const channel = supabase
      .channel('match-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'matches', // 👈 Bien écrit sans le 's' à tournament !
          filter: `tournament_id=eq.${tournamentId}`
        },
        (payload) => {
          console.log("Match mis à jour en direct par la table de marque !", payload);
          window.location.reload(); // Rafraîchit la page tout seul
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tournamentId]);
  // 👆👆👆 FIN DU NOUVEAU BLOC 👆👆👆

  const handleSaveEdit = async () => {
    // On n'envoie PLUS les scores ici, juste la logistique !
    await updateMatch(editingMatch.id, {
      court_name: editingMatch.court_name,
      start_time: editingMatch.start_time
    });
    setEditingMatch(null); // On ferme la modale
    toast.success("Détails du match mis à jour !");
  };

  const handleSaveScore = async (matchId, homeScore, awayScore) => {
    // On retrouve les détails du match actuel pour savoir où il se trouve dans l'arbre
    const currentMatch = matches.find(m => m.id === matchId);
    if (!currentMatch) return;

    const isFinished = homeScore !== null && awayScore !== null;
    const newStatus = isFinished ? 'finished' : 'in_progress';

    try {
      // 1. On sauvegarde le score du match actuel
      await updateMatch(matchId, { 
        home_score: homeScore, 
        away_score: awayScore,
        status: newStatus 
      });

      // 2. NOUVEAU : LA LOGIQUE D'AVANCEMENT
      // Si c'est un match d'arbre (il a une suite) ET qu'il y a un vainqueur
      if (currentMatch.next_match_id) {
        
        // On détermine si ce match envoie le vainqueur en "Domicile" ou "Extérieur" du match suivant
        // (Impair = Domicile, Pair = Extérieur)
        const isHomeSlot = currentMatch.bracket_index % 2 !== 0;

        if (isFinished && homeScore !== awayScore) {
          // On trouve le gagnant
          const winnerId = homeScore > awayScore ? currentMatch.home_team_id : currentMatch.away_team_id;
          
          // On le propulse dans le match suivant !
          const updateData = isHomeSlot ? { home_team_id: winnerId } : { away_team_id: winnerId };
          await updateMatch(currentMatch.next_match_id, updateData);

        } else if (!isFinished) {
          // BONUS ROBUSTE : Si on efface le score pour corriger une erreur, 
          // on retire l'équipe du match suivant pour ne pas fausser l'arbre.
          const updateData = isHomeSlot ? { home_team_id: null } : { away_team_id: null };
          await updateMatch(currentMatch.next_match_id, updateData);
        }
      }

      toast.success("Score validé et mis à jour !");
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde du score");
    }
  };

  // Petite fonction pour convertir les dates ISO pour l'input type="datetime-local"
  const formatDateForInput = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };
  
  if (isLoading) return <div className="p-8 text-center text-slate-500">Chargement...</div>;

  // 1. Définir l'ordre strict des étapes
  const stageOrder = ['pools', 'round_128', 'round_64', 'round_32', 'round_16', 'quarter', 'semi', 'final'];

  // 2. Trouver jusqu'où le tournoi a progressé
  const getVisibleStageLimit = () => {
    let limitIndex = 0; // Par défaut, on voit au moins les poules

    for (let i = 0; i < stageOrder.length; i++) {
      const stage = stageOrder[i];
      const stageMatches = matches.filter(m => m.stage === stage);

      // 🚨 NOUVEAU : On isole uniquement les "vrais" matchs (qui ont deux équipes)
      // Les matchs avec une équipe manquante (null) sont des Byes et sont ignorés.
      const realStageMatches = stageMatches.filter(m => m.home_team_id && m.away_team_id);

      // Si l'étape n'existe pas ou ne contient QUE des Byes
      if (realStageMatches.length === 0) {
        limitIndex = i + 1;
        continue;
      }

      // On vérifie si tous les "vrais" matchs sont terminés
      const isStageFinished = realStageMatches.every(m => m.status === 'finished');

      if (isStageFinished) {
        limitIndex = i + 1;
      } else {
        break;
      }
    }
    return limitIndex;
  };

  const visibleLimit = getVisibleStageLimit();

  // 3. Filtrer les matchs selon la progression ET exclure les Byes de l'affichage
  const visibleByProgression = matches.filter(m => {
    const matchStageIndex = stageOrder.indexOf(m.stage);
    const isRealMatch = m.home_team_id && m.away_team_id; // 👈 Le filtre anti-bye
    
    return matchStageIndex <= visibleLimit && isRealMatch;
  });
  
  // 4. On sépare et on TRIE les matchs pour l'affichage final
  const activeMatches = visibleByProgression
    .filter(m => m.status !== 'finished')
    .sort((a, b) => {
      // Si un match n'a pas d'heure définie, on le pousse à la fin de la liste
      if (!a.start_time) return 1;
      if (!b.start_time) return -1;
      // Ordre chronologique : le match le plus proche est en premier
      return new Date(a.start_time) - new Date(b.start_time);
    });

  const finishedMatches = visibleByProgression
    .filter(m => m.status === 'finished')
    .sort((a, b) => {
      if (!a.start_time) return 1;
      if (!b.start_time) return -1;
      // Ordre anti-chronologique : le match terminé le plus récemment est en premier
      return new Date(b.start_time) - new Date(a.start_time);
    });
    
  if (isLoading) return <div className="p-8 text-center text-slate-500">Chargement...</div>;

  

  return (
    <div className="flex flex-col h-full gap-6 p-6">
      
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border shadow-sm">
        <div className="flex items-center gap-6">
          {/* Ton sélecteur Aller-Simple / Aller-Retour que nous avons créé */}
          <div className="flex bg-slate-200/60 p-1 rounded-lg border">
            <button onClick={() => setIsTwoLegs(false)} className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-md transition-all ${!isTwoLegs ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>
              <ArrowRight className="w-4 h-4" /> Simple
            </button>
            <button onClick={() => setIsTwoLegs(true)} className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-md transition-all ${isTwoLegs ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>
              <ArrowRightLeft className="w-4 h-4" /> Aller-Retour
            </button>
          </div>

          <Button onClick={() => generateAutoMatches(isTwoLegs)} disabled={matches.length > 0} className="bg-indigo-600">
            <CalendarPlus className="w-4 h-4 mr-2" /> Générer auto
          </Button>
        </div>

        <div className="flex items-center gap-2">       
          
          {/* BOUTON AJOUT MANUEL AVEC DIALOG */}
          <Dialog open={isManualOpen} onOpenChange={setIsManualOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-50">
                <Plus className="w-4 h-4 mr-2" /> Ajouter un match
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Créer un match manuel</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Équipe Domicile</label>
                  <Select onValueChange={(v) => setNewMatch({...newMatch, home: v})}>
                    <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                    <SelectContent>{teams.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Équipe Extérieur</label>
                  <Select onValueChange={(v) => setNewMatch({...newMatch, away: v})}>
                    <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                    <SelectContent>{teams.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <Button onClick={handleManualCreate} className="w-full bg-indigo-600" disabled={!newMatch.home || !newMatch.away}>
                  Créer le match
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {matches.length > 0 && (
            <Button variant="ghost" onClick={deleteAllMatches} className="text-red-500 hover:bg-red-50">
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      
      {/* 2. LA BANDE RÉTRACTABLE DES MATCHS TERMINÉS */}
      {finishedMatches.length > 0 && (
        <div className="mt-4 pt-4 ">
          <button
            onClick={() => setIsFinishedExpanded(!isFinishedExpanded)}
            className="flex items-center justify-between w-full p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-bold transition-all group"
          >
            <div className="flex items-center gap-2">
              <span className="bg-slate-200 text-slate-600 px-2.5 py-0.5 rounded-md text-xs">
                {finishedMatches.length}
              </span>
              Matchs terminés
            </div>
            <div className="text-slate-400 group-hover:text-slate-600 transition-colors">
              {isFinishedExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </button>

          {/* Le tiroir qui s'ouvre */}
          {isFinishedExpanded && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4 animate-in slide-in-from-top-2 fade-in duration-200">
              {finishedMatches.map((match) => (
                <MatchCard 
                  key={match.id} 
                  match={match} 
                  profiles={profiles}
                  teams={teams}
                  onDelete={deleteMatch}
                  onSaveScore={handleSaveScore}
                  onEdit={() => setEditingMatch(match)}
                  onClick={(m) => navigate(`/matches/${m.id}/summary`)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* 1. GRILLE DES MATCHS ACTIFS (À venir & En cours) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pb-4">
        {activeMatches.map((match) => (
          <MatchCard 
            key={match.id} 
            match={match} 
            profiles={profiles}
            teams={teams}
            onDelete={deleteMatch}
            onSaveScore={handleSaveScore}
            onEdit={() => setEditingMatch(match)}
            onClick={(m) => navigate(`/match/${m.id}`)}
          />
        ))}
        
        {/* Petit message sympa s'il n'y a plus de matchs à jouer */}
        {matches.length > 0 && activeMatches.length === 0 && (
          <div className="col-span-full p-8 text-center bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 font-medium">
            🎉 Tous les matchs de cette phase sont terminés !
          </div>
        )}
      </div>

      {/* MODAL D'ÉDITION D'UN MATCH */}
      <Dialog open={!!editingMatch} onOpenChange={(open) => !open && setEditingMatch(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Détails de la rencontre</DialogTitle>
            <DialogDescription className="text-slate-500 text-sm">
              Modifiez l'heure, le terrain et le score de ce match.
            </DialogDescription>
          </DialogHeader>
          
          {editingMatch && (
            <div className="grid gap-6 py-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date et Heure</Label>
                  <Input 
                    type="datetime-local" 
                    value={formatDateForInput(editingMatch.start_time)}
                    onChange={(e) => setEditingMatch({
                      ...editingMatch, 
                      start_time: e.target.value ? new Date(e.target.value).toISOString() : null
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Terrain</Label>
                  <Input 
                    placeholder="Ex: Terrain 1, Gymnase B..." 
                    value={editingMatch.court_name || ''}
                    onChange={(e) => setEditingMatch({...editingMatch, court_name: e.target.value})}
                  />
                </div>
              </div>
              

              {/* --- NOUVELLE SECTION : OFFICIELS --- */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                <h4 className="text-sm font-bold text-slate-500 uppercase text-center mb-2">Officiels (Assignation directe)</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* GESTION ARBITRE */}
                  <div className="space-y-2">
                    <Label className="text-xs text-indigo-600 font-bold">Arbitre principal</Label>
                    <Select onValueChange={async (userId) => {
                      await assignOfficial(editingMatch.id, userId, 'referee');
                      // Astuce visuelle : on met à jour la fenêtre ouverte instantanément
                      setEditingMatch(prev => ({
                        ...prev, 
                        match_officials: [...(prev.match_officials || []), { id: Date.now(), role: 'referee', user_id: userId }]
                      }));
                    }}>
                      <SelectTrigger className="bg-white"><SelectValue placeholder="Assigner..." /></SelectTrigger>
                      <SelectContent>
                        {profiles.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.first_name || 'User'} {p.last_name || ''}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Liste des arbitres déjà assignés */}
                    <div className="space-y-1 mt-2">
                      {editingMatch.match_officials?.filter(o => o.role === 'referee').map(official => (
                        <div key={official.id} className="flex justify-between items-center bg-white p-1.5 rounded border border-slate-200 text-xs">
                          <span className="truncate pr-2">
                            {profiles.find(p => p.id === official.user_id)?.first_name || 'Utilisateur'}
                          </span>
                          <button onClick={() => {
                            removeOfficial(official.id);
                            setEditingMatch(prev => ({...prev, match_officials: prev.match_officials.filter(o => o.id !== official.id)}));
                          }} className="text-red-500 hover:underline font-bold">X</button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* GESTION TABLE DE MARQUE */}
                  <div className="space-y-2">
                    <Label className="text-xs text-emerald-600 font-bold">Table de marque</Label>
                    <Select onValueChange={async (userId) => {
                      await assignOfficial(editingMatch.id, userId, 'table');
                      setEditingMatch(prev => ({
                        ...prev, 
                        match_officials: [...(prev.match_officials || []), { id: Date.now(), role: 'table', user_id: userId }]
                      }));
                    }}>
                      <SelectTrigger className="bg-white"><SelectValue placeholder="Assigner..." /></SelectTrigger>
                      <SelectContent>
                        {profiles.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.first_name || 'User'} {p.last_name || ''}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Liste de la table déjà assignée */}
                    <div className="space-y-1 mt-2">
                      {editingMatch.match_officials?.filter(o => o.role === 'table').map(official => (
                        <div key={official.id} className="flex justify-between items-center bg-white p-1.5 rounded border border-slate-200 text-xs">
                          <span className="truncate pr-2">
                            {profiles.find(p => p.id === official.user_id)?.first_name || 'Utilisateur'}
                          </span>
                          <button onClick={() => {
                            removeOfficial(official.id);
                            setEditingMatch(prev => ({...prev, match_officials: prev.match_officials.filter(o => o.id !== official.id)}));
                          }} className="text-red-500 hover:underline font-bold">X</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              {/* --- FIN SECTION OFFICIELS --- */}

              <Button onClick={handleSaveEdit} className="w-full bg-indigo-600 mt-2">
                Enregistrer les modifications
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}