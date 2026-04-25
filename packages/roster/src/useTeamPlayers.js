import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@swish/core';
import { toast } from 'sonner';

export function useTeamPlayers(teamId, tournamentId) { 
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
      .insert([{ 
        team_id: teamId, 
        name: playerName, 
        tournament_id: tournamentId, // 2. 👇 LA MAGIE OPÈRE ICI !
        is_paid: false 
      }]);

    if (error) {
      toast.error("Impossible d'ajouter le joueur");
    } else {
      toast.success("Joueur ajouté !");
      fetchPlayers(); // On rafraîchit la liste
    }
  };

  const togglePlayerPayment = async (playerId, currentStatus) => {
  const newStatus = !currentStatus;
  // ✅ ON CAPTURE LA DATE ICI
  const paidAt = newStatus ? new Date().toISOString() : null;

  // 1. Mise à jour visuelle (on ajoute paid_at)
  setPlayers(prev => prev.map(p => 
    p.id === playerId ? { ...p, is_paid: newStatus, paid_at: paidAt } : p
  ));

  // 2. Mise à jour Supabase (on ajoute paid_at)
  await supabase.from('players').update({ 
    is_paid: newStatus, 
    paid_at: paidAt 
  }).eq('id', playerId);

  // 3. VÉRIFICATION GLOBALE
  setPlayers(currentPlayers => {
    const allPaid = currentPlayers.length > 0 && currentPlayers.every(p => p.is_paid);
    
    const teamUpdates = allPaid 
      ? { payment_status: 'paid', status: 'validated', paid_at: new Date().toISOString() } 
      : { payment_status: 'unpaid', status: 'pending', paid_at: null }; // ✅ On gère aussi la date de l'équipe

    supabase
      .from('tournament_registrations')
      .update(teamUpdates)
      .eq('team_id', teamId)
      .then(({ error }) => {
        if (!error) {
          if (allPaid) {
            toast.success("Tout l'effectif est à jour : Équipe validée !");
          } else if (!newStatus) {
            // Si on vient de décocher un joueur, on informe que l'équipe n'est plus valide
            toast.info("Licence manquante : l'équipe repasse en attente.");
          }
        }
      });

    return currentPlayers;
  });
};

  const deletePlayer = async (playerId) => {
  // 1. Demander confirmation (optionnel mais recommandé)
  if (!window.confirm("Supprimer ce joueur de l'effectif ?")) return;

  // 2. Mise à jour locale immédiate (UI)
  setPlayers(prev => prev.filter(p => p.id !== playerId));

  // 3. Suppression Supabase
  const { error } = await supabase
    .from('players')
    .delete()
    .eq('id', playerId);

  if (error) {
    toast.error("Erreur lors de la suppression");
    fetchPlayers(); // Recharge la liste réelle en cas d'échec
  } else {
    toast.success("Joueur supprimé");
  }
};

  return { team, players, isLoading, addPlayer, togglePlayerPayment, deletePlayer };
}