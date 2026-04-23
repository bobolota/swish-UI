import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@swish/core';
import { toast } from 'sonner';

export function useTournamentMatches(tournamentId) {
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Récupérer les matchs existants
  const fetchMatches = useCallback(async () => {
        
    if (!tournamentId) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          match_officials!fk_match_official_match ( 
            id,
            role,
            user_id
          ),
          pools ( name )
        `)
        .eq('tournament_id', tournamentId)
        .order('created_at', { ascending: true });

      
      if (error) {
        
      } else {
        
        setMatches(data || []);
      }
    } catch (err) {
      
    } finally {
      
      setIsLoading(false);
    }
  }, [tournamentId]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  // 2. GÉNÉRATION AUTOMATIQUE
  const generateAutoMatches = async (isTwoLegs = false) => {
    const { data: registrations } = await supabase
      .from('tournament_registrations')
      .select('pool_id, team_id')
      .eq('tournament_id', tournamentId)
      .eq('status', 'validated')
      .not('pool_id', 'is', null);

    if (!registrations || registrations.length === 0) {
      return toast.error("Aucune équipe n'est assignée à une poule !");
    }

    const teamsByPool = registrations.reduce((acc, reg) => {
      if (!acc[reg.pool_id]) acc[reg.pool_id] = [];
      acc[reg.pool_id].push(reg.team_id);
      return acc;
    }, {});

    const matchesToInsert = [];

    for (const [poolId, teamIds] of Object.entries(teamsByPool)) {
      for (let i = 0; i < teamIds.length; i++) {
        for (let j = i + 1; j < teamIds.length; j++) {
          matchesToInsert.push({
            tournament_id: tournamentId,
            pool_id: poolId,
            home_team_id: teamIds[i],
            away_team_id: teamIds[j],
            status: 'scheduled'
          });

          if (isTwoLegs) {
            matchesToInsert.push({
              tournament_id: tournamentId,
              pool_id: poolId,
              home_team_id: teamIds[j],
              away_team_id: teamIds[i],
              status: 'scheduled'
            });
          }
        }
      }
    }

    const { error } = await supabase.from('matches').insert(matchesToInsert);
    if (error) toast.error("Erreur création matchs");
    else {
      toast.success(`${matchesToInsert.length} matchs générés !`);
      fetchMatches();
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
    if (!error) { toast.success("Match ajouté !"); fetchMatches(); }
  };

  // 4. SUPPRESSION
  const deleteMatch = async (matchId) => {
    const { error } = await supabase.from('matches').delete().eq('id', matchId);
    if (!error) { toast.success("Match supprimé"); fetchMatches(); }
  };

  const deleteAllMatches = async () => {
    if (!window.confirm("Tout supprimer ?")) return;
    const { error } = await supabase.from('matches').delete().eq('tournament_id', tournamentId);
    if (!error) { toast.success("Matchs réinitialisés"); fetchMatches(); }
  };

  // 5. METTRE À JOUR UN MATCH
  const updateMatch = async (matchId, updates) => {
    const { error } = await supabase.from('matches').update(updates).eq('id', matchId);
    if (error) toast.error("Erreur mise à jour");
    else fetchMatches();
  };

  // 6. GESTION DES OFFICIELS
  const assignOfficial = async (matchId, userId, role) => {
    const { error } = await supabase
      .from('match_officials')
      .insert([{ match_id: matchId, user_id: userId, role: role }]);
      
    if (error) {
      // Si c'est l'erreur 23505 (Doublon)
      if (error.code === '23505') {
        toast.error("Cet utilisateur est déjà assigné à ce match !");
      } else {
        
        toast.error("Impossible d'assigner cet officiel.");
      }
      // On rafraîchit la liste pour "annuler" l'ajout visuel qui s'était fait dans la modale
      fetchMatches(); 
    } else {
      toast.success("Officiel assigné avec succès !");
      fetchMatches();
    }
  };

  // 👇 AJOUTE CETTE FONCTION SI ELLE A DISPARU 👇
  const removeOfficial = async (officialRecordId) => {
    const { error } = await supabase
      .from('match_officials')
      .delete()
      .eq('id', officialRecordId);
      
    if (error) {
      
    } else {
      fetchMatches();
    }
  };

  // Le return final de ton hook
  return { 
    matches, 
    isLoading, 
    generateAutoMatches, 
    createManualMatch, 
    deleteMatch, 
    deleteAllMatches, 
    updateMatch,
    assignOfficial,
    removeOfficial // C'est ici que ça plantait car la fonction n'existait plus au-dessus !
  };
}