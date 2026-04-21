import { useState, useEffect } from 'react';
import { supabase } from '@swish/core';

export function usePlayerCard(userId) {
  const [playerCard, setPlayerCard] = useState(null);
  const [loadingCard, setLoadingCard] = useState(true);

  // 1. LECTURE : On cherche la fiche si elle existe
  useEffect(() => {
    if (!userId) return;

    const fetchCard = async () => {
      setLoadingCard(true);
      const { data, error } = await supabase
        .from('player_cards')
        .select('*')
        .eq('user_id', userId)
        .single();

      // Si erreur = PGRST116, c'est juste que la ligne n'existe pas encore, ce n'est pas grave !
      if (data) setPlayerCard(data);
      setLoadingCard(false);
    };

    fetchCard();
  }, [userId]);

  // 2. ÉCRITURE : Le fameux "Upsert"
  const savePlayerCard = async (updates) => {
    if (!userId) return { error: { message: "Utilisateur non connecté" } };

    const dataToSave = {
      ...updates,
      user_id: userId, // Très important pour la clé étrangère
      updated_at: new Date().toISOString(),
    };

    // UPSERT : Crée la ligne si elle manque, ou la met à jour si elle est déjà là
    const { error } = await supabase
      .from('player_cards')
      .upsert(dataToSave, { onConflict: 'user_id' });

    if (!error) {
      setPlayerCard((prev) => ({ ...prev, ...updates }));
    }
    
    return { error };
  };

  return { playerCard, loadingCard, savePlayerCard };
}