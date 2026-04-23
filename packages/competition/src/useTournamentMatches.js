import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@swish/core';
import { toast } from 'sonner';

export function useTournamentMatches(tournamentId) {
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Récupérer les matchs existants
  const fetchMatches = useCallback(async () => {
    if (!tournamentId) return;
    setIsLoading(true);
    
    const { data, error } = await supabase
      .from('matches')
      .select(`
        id, pool_id, status, start_time, court_name,
        home_team_id, away_team_id, home_score, away_score
      `)
      .eq('tournament_id', tournamentId)
      .order('created_at', { ascending: true });

    if (error) console.error("Erreur chargement matchs:", error);
    else setMatches(data || []);
    
    setIsLoading(false);
  }, [tournamentId]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  // 2. GÉNÉRATION AUTOMATIQUE (L'Algorithme)
  const generateAutoMatches = async (isTwoLegs = false) => {
    // A. Récupérer la composition actuelle des poules
    const { data: registrations } = await supabase
      .from('tournament_registrations')
      .select('pool_id, team_id')
      .eq('tournament_id', tournamentId)
      .eq('status', 'validated')
      .not('pool_id', 'is', null);

    if (!registrations || registrations.length === 0) {
      return toast.error("Aucune équipe n'est assignée à une poule !");
    }

    // B. Grouper les équipes par poule
    const teamsByPool = registrations.reduce((acc, reg) => {
      if (!acc[reg.pool_id]) acc[reg.pool_id] = [];
      acc[reg.pool_id].push(reg.team_id);
      return acc;
    }, {});

    const matchesToInsert = [];

    // C. Générer les combinaisons mathématiques
    for (const [poolId, teamIds] of Object.entries(teamsByPool)) {
      for (let i = 0; i < teamIds.length; i++) {
        for (let j = i + 1; j < teamIds.length; j++) {
          
          // Match Aller
          matchesToInsert.push({
            tournament_id: tournamentId,
            pool_id: poolId,
            home_team_id: teamIds[i],
            away_team_id: teamIds[j],
            status: 'scheduled'
          });

          // Match Retour (Si l'option est cochée)
          if (isTwoLegs) {
            matchesToInsert.push({
              tournament_id: tournamentId,
              pool_id: poolId,
              home_team_id: teamIds[j], // On inverse Domicile/Extérieur
              away_team_id: teamIds[i],
              status: 'scheduled'
            });
          }
        }
      }
    }

    // D. Sauvegarder dans Supabase
    const { error } = await supabase.from('matches').insert(matchesToInsert);
    
    if (error) {
      toast.error("Erreur lors de la création des matchs");
    } else {
      toast.success(`${matchesToInsert.length} matchs générés avec succès !`);
      fetchMatches(); // On met à jour l'affichage
    }
  };

  // 3. CRÉATION MANUELLE
  const createManualMatch = async (poolId, homeTeamId, awayTeamId) => {
    if (!homeTeamId || !awayTeamId || homeTeamId === awayTeamId) {
      return toast.error("Veuillez sélectionner deux équipes différentes.");
    }

    const { error } = await supabase.from('matches').insert([{
      tournament_id: tournamentId,
      pool_id: poolId || null,
      home_team_id: homeTeamId,
      away_team_id: awayTeamId,
      status: 'scheduled'
    }]);

    if (error) {
      toast.error("Erreur lors de la création manuelle");
    } else {
      toast.success("Match ajouté manuellement !");
      fetchMatches();
    }
  };

  return { matches, isLoading, generateAutoMatches, createManualMatch };
}