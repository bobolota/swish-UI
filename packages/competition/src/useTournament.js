import { useState, useEffect } from 'react';
import { supabase } from '@swish/core';

export function useTournament(tournamentId, userId = null) {
  // --- ÉTATS POUR LES INFOS DU TOURNOI ---
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- ÉTAT POUR L'INSCRIPTION ---
  const [isRegistering, setIsRegistering] = useState(false);

  // 1. CHARGEMENT DU TOURNOI
  useEffect(() => {
    if (!tournamentId) return;

    const fetchTournament = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', tournamentId)
        .single();

      if (error) {
        setError(error);
      } else {
        setTournament(data);
      }
      setLoading(false);
    };

    fetchTournament();
  }, [tournamentId]);

  // 2. INSCRIPTION (Polymorphe : Solo ou Équipe)
  const register = async (teamId = null) => {
    if (!userId) return { error: { message: "Non connecté" } };
    setIsRegistering(true);

    const payload = {
      tournament_id: tournamentId,
      status: 'pending'
    };

    if (teamId) {
      payload.team_id = teamId;
    } else {
      payload.user_id = userId;
    }

    const { data, error } = await supabase
      .from('tournament_registrations')
      .insert([payload])
      .select()
      .single();

    setIsRegistering(false);
    return { data, error };
  };

  // 3. VÉRIFIER L'INSCRIPTION (Correction de l'erreur 400)
  const checkMyRegistration = async () => {
    if (!userId || !tournamentId) return null;

    try {
      // ÉTAPE 1 : On cherche d'abord s'il est inscrit en SOLO
      const { data: soloReg } = await supabase
        .from('tournament_registrations')
        .select('*')
        .eq('tournament_id', tournamentId)
        .eq('user_id', userId)
        .maybeSingle(); // maybeSingle ne plante pas si le joueur n'est pas trouvé

      if (soloReg) return soloReg;

      // ÉTAPE 2 : Sinon, on cherche s'il est inscrit via une ÉQUIPE
      const { data: teamReg } = await supabase
        .from('tournament_registrations')
        .select('*, teams!inner(team_members!inner(user_id))')
        .eq('tournament_id', tournamentId)
        .eq('teams.team_members.user_id', userId)
        .maybeSingle();

      return teamReg || null;

    } catch (error) {
      console.error("Erreur lors de la vérification de l'inscription:", error);
      return null;
    }
  };

  return { 
    tournament, 
    loading, 
    error, 
    register, 
    checkMyRegistration, 
    isRegistering 
  };
}