import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@swish/core';
import { toast } from 'sonner';

export function useTournamentTeams(tournamentId) {
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTeams = useCallback(async () => {
    // 🔍 Sécurité : on vérifie que l'ID est bien présent
    if (!tournamentId) return;
    
    setIsLoading(true);
    

    const { data, error } = await supabase
      .from('tournament_registrations')
      .select(`
        id,
        status,
        payment_status,
        tournament_id,
        team_id,
        teams (
          name,
          display_captain_name
        )
      `)
      .eq('tournament_id', tournamentId);

    if (error) {
      console.error("❌ Erreur Supabase:", error);
      toast.error("Erreur de chargement.");
    } else {
      
      
      const formattedTeams = data.map(reg => ({
        id: reg.id, // ID de l'inscription (pour changer le statut)
        teamId: reg.team_id, // ✅ NOUVEAU : Le VRAI ID de l'équipe (pour voir les joueurs)
        status: reg.status || 'pending',
        hasPaid: reg.payment_status === 'paid' || reg.payment_status === 'succeeded',
        name: reg.teams?.name || "Équipe sans nom",
        captainName: reg.teams?.display_captain_name || "Capitaine"
      }));
      
      setTeams(formattedTeams);
    }
    setIsLoading(false);
  }, [tournamentId]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

 const updateTeamStatus = async (registrationId, newStatus) => {
  

  // 1. Mise à jour locale (pour la réactivité)
  setTeams(prev => prev.map(t => t.id === registrationId ? { ...t, status: newStatus } : t));

  // 2. Mise à jour Supabase
  const { data, error, count } = await supabase
    .from('tournament_registrations')
    .update({ status: newStatus })
    .eq('id', registrationId)
    .select(); // On demande à voir ce qui a été modifié

  if (error) {
    console.error("❌ Erreur SQL:", error.message);
    toast.error("Erreur base de données");
    fetchTeams();
  } else if (data.length === 0) {
    console.error("⚠️ Aucune ligne modifiée. Vérifie les POLICIES d'UPDATE sur Supabase.");
    toast.error("Modification refusée par le serveur");
    fetchTeams();
  } else {
    
    toast.success("Enregistré !");
  }
};

  // Dans packages/competition/src/useTournamentTeams.js

const updatePaymentStatus = async (registrationId, isPaid) => {
  const newPaymentStatus = isPaid ? 'paid' : 'unpaid';
  const newStatus = isPaid ? 'validated' : 'pending';
  
  // ✅ ON PRÉPARE LA DATE ICI
  const now = new Date().toISOString();
  const paidAt = isPaid ? now : null;

  const teamToUpdate = teams.find(t => t.id === registrationId);
  const actualTeamId = teamToUpdate?.teamId;

  // 1. Update UI Equipe
  setTeams(prev => prev.map(t => 
    t.id === registrationId ? { ...t, hasPaid: isPaid, status: newStatus } : t
  ));

  // 2. Update Supabase Equipe
  const { error: teamError } = await supabase
    .from('tournament_registrations')
    .update({ 
      payment_status: newPaymentStatus,
      status: newStatus,
      paid_at: paidAt // On met aussi à jour la date de l'équipe
    })
    .eq('id', registrationId);

  // 3. SYNCHRO JOUEURS (C'est ici qu'on ajoute la date)
  if (!teamError && isPaid && actualTeamId) {
    await supabase
      .from('players')
      .update({ 
        is_paid: true, 
        paid_at: now // ✅ ON AJOUTE LA DATE POUR CHAQUE JOUEUR ICI
      })
      .eq('team_id', actualTeamId);
      
    toast.success("Équipe et joueurs validés avec date de paiement !");
  }
};

  const addManualTeam = async (teamName, captainName) => {
    // 1. Création de l'équipe
    const { data: newTeam, error: teamError } = await supabase
      .from('teams')
      .insert([{ name: teamName, display_captain_name: captainName }]) 
      .select('id')
      .single();

    if (teamError) return toast.error("Erreur création équipe.");

    // 2. Inscription
    const { error: regError } = await supabase
      .from('tournament_registrations')
      .insert([{ 
        tournament_id: tournamentId, 
        team_id: newTeam.id, 
        status: 'pending',
        payment_status: 'unpaid'
      }]);

    if (regError) return toast.error("Erreur lien tournoi.");

    toast.success("Équipe inscrite !");
    
    // 💡 On attend un tout petit peu (300ms) pour laisser Supabase indexer la nouvelle ligne
    setTimeout(() => {
      fetchTeams();
    }, 300);
  };

  return { teams, isLoading, updateTeamStatus, fetchTeams, addManualTeam, updatePaymentStatus };
}