import { useState, useEffect } from 'react';
import { supabase } from '@swish/core';

export function useProfile(userId) {
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // 1. LECTURE : Aller chercher le profil quand l'ID de l'utilisateur change
  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setLoadingProfile(false);
      return;
    }

    const fetchProfile = async () => {
      setLoadingProfile(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error("Erreur de chargement du profil:", error.message);
      } else if (data) {
        setProfile(data);
      }
      
      setLoadingProfile(false);
    };

    fetchProfile();
  }, [userId]);

  // 2. ÉCRITURE : Mettre à jour des informations spécifiques (ex: bio, taille)
  const updateProfile = async (updates) => {
    if (!userId) return { error: { message: "Aucun utilisateur connecté" } };

    // On prépare les données à envoyer
    const dataToUpdate = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('profiles')
      .update(dataToUpdate)
      .eq('id', userId);

    if (!error) {
      // On met à jour l'affichage local instantanément si la base de données a dit "OK"
      setProfile((prev) => ({ ...prev, ...updates }));
    }
    
    return { error };
  };

  return { profile, loadingProfile, updateProfile };
}