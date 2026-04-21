import { useState, useEffect } from 'react';
import { supabase } from '@swish/core';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Vérification de la session au démarrage
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // La fonction pour se connecter
  const login = async (email, password) => {
    return await supabase.auth.signInWithPassword({ email, password });
  };

  // 🚀 LA NOUVELLE FONCTION D'INSCRIPTION
  const signup = async (email, password, firstName, lastName, pseudo) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { 
          // Ces clés correspondent EXACTEMENT à ce que le Trigger SQL attend !
          first_name: firstName,
          last_name: lastName,
          pseudo: pseudo 
        },
      }
    });
    setLoading(false);
    return { data, error };
  };

  // La fonction pour se déconnecter
  const logout = async () => {
    return await supabase.auth.signOut();
  };

  return { user, loading, login, logout, signup };
}