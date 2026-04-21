// GESTION INSCRIPTION //

import { useState } from 'react';
import { supabase } from '@swish/core';

export function useTournament(userId) {
  const [isRegistering, setIsRegistering] = useState(false);

  // 1. Inscription (Polymorphe : Solo ou Équipe)
  const register = async (tournamentId, teamId = null) => {
    if (!userId) return { error: { message: "Non connecté" } };
    setIsRegistering(true);

    // On prépare la donnée selon le mode (Solo ou Équipe)
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

  // 2. Vérifier si l'utilisateur (ou une de ses équipes) est déjà inscrit
  const checkMyRegistration = async (tournamentId) => {
    if (!userId) return null;

    // On cherche une inscription où soit c'est SON profil, soit c'est une équipe dont il est membre
    const { data } = await supabase
      .from('tournament_registrations')
      .select('*, teams!inner(team_members!inner(user_id))')
      .eq('tournament_id', tournamentId)
      .or(`user_id.eq.${userId},teams.team_members.user_id.eq.${userId}`)
      .single();

    return data; // Retournera l'inscription (avec son statut 'pending' ou 'confirmed')
  };

  return { register, checkMyRegistration, isRegistering };
}