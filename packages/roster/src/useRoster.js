import { useState } from 'react';
import { supabase } from '@swish/core';

export function useRoster(userId) {
  const [isCreating, setIsCreating] = useState(false);

  // Fonction de création d'équipe
  const createTeam = async (name, sport) => {
    if (!userId) return { error: { message: "Non autorisé" } };
    setIsCreating(true);

    // 1. On crée l'équipe (Supabase va générer l'ID et le invite_token tout seul)
    const { data: newTeam, error: teamError } = await supabase
      .from('teams')
      .insert([{ 
        name: name, 
        sport: sport, 
        captain_id: userId 
      }])
      .select() // Demande à Supabase de nous renvoyer la ligne créée
      .single();

    if (teamError) {
      setIsCreating(false);
      return { error: teamError };
    }

    // 2. On ajoute automatiquement le capitaine dans les membres de l'équipe
    const { error: memberError } = await supabase
      .from('team_members')
      .insert([{ 
        team_id: newTeam.id, 
        user_id: userId 
      }]);

    setIsCreating(false);

    if (memberError) return { error: memberError };

    // Tout s'est bien passé, on renvoie l'équipe (qui contient le lien d'invitation)
    return { data: newTeam };
  };

  // 1. Lire les infos de l'équipe à partir du lien
  const getTeamByToken = async (token) => {
    // On fait une requête SQL puissante (JOIN) pour récupérer l'équipe ET le prénom du capitaine !
    const { data, error } = await supabase
      .from('teams')
      .select(`
        *,
        captain:profiles!captain_id(first_name, last_name, pseudo)
      `)
      .eq('invite_token', token)
      .single();
      
    return { data, error };
  };

  // 2. Rejoindre l'équipe
  const joinTeam = async (teamId) => {
    if (!userId) return { error: { message: "Non connecté" } };
    
    const { error } = await supabase
      .from('team_members')
      .insert([{ team_id: teamId, user_id: userId }]);
      
    // Si l'erreur est un conflit (PGRST116 ou 23505), c'est qu'il est déjà dans l'équipe !
    if (error && error.code === '23505') {
      return { error: { message: "Tu fais déjà partie de cette équipe !" } };
    }
    
    return { error };
  };

  return { createTeam, isCreating, getTeamByToken, joinTeam };
}