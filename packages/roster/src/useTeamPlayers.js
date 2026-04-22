import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@swish/core';
import { toast } from 'sonner';

export function useTeamPlayers(teamId) {
  const [team, setTeam] = useState(null);
  const [players, setPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Récupération de l'équipe et de ses joueurs
  const fetchPlayers = useCallback(async () => {
    if (!teamId) return;
    setIsLoading(true);

    // On récupère les infos de l'équipe pour le titre de la page
    const { data: teamData } = await supabase
      .from('teams')
      .select('name, display_captain_name')
      .eq('id', teamId)
      .single();
    
    if (teamData) setTeam(teamData);

    // On récupère la liste des joueurs
    const { data: playersData, error } = await supabase
      .from('players')
      .select('*')
      .eq('team_id', teamId)
      .order('name', { ascending: true });

    if (error) {
      toast.error("Erreur de chargement des joueurs");
    } else {
      setPlayers(playersData || []);
    }
    
    setIsLoading(false);
  }, [teamId]);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  // 2. Ajouter un joueur
  const addPlayer = async (playerName) => {
    if (!playerName.trim()) return;

    const { error } = await supabase
      .from('players')
      .insert([{ team_id: teamId, name: playerName, is_paid: false }]);

    if (error) {
      toast.error("Impossible d'ajouter le joueur");
    } else {
      toast.success("Joueur ajouté !");
      fetchPlayers(); // On rafraîchit la liste
    }
  };

  // 3. Payer la licence (On réutilise notre logique !)
  const togglePlayerPayment = async (playerId, currentStatus) => {
    const newStatus = !currentStatus;

    // Mise à jour visuelle (Optimistic UI)
    setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, is_paid: newStatus } : p));

    // Mise à jour Supabase
    const { error } = await supabase
      .from('players')
      .update({ is_paid: newStatus })
      .eq('id', playerId);

    if (error) {
      toast.error("Erreur de sauvegarde");
      fetchPlayers(); // Rollback
    }
  };

  return { team, players, isLoading, addPlayer, togglePlayerPayment };
}