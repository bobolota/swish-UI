import { useState, useCallback } from 'react';
import { supabase } from '@swish/core';
import { toast } from 'sonner';

export function useTournamentOrganizer(userId) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [managedTournaments, setManagedTournaments] = useState([]);

  // 1. Fonder un nouveau tournoi (Business Mode)
  const createTournament = async (tournamentData) => {
    if (!userId) return { error: { message: "Non autorisé" } };
    setIsProcessing(true);

    // On prépare le paquet avec l'Owner (celui qui clique) et le statut par défaut
    const payload = {
      ...tournamentData,
      owner_id: userId,
      status: 'draft', // Toujours en "Brouillon" jusqu'à ce qu'il soit prêt à être publié
    };

    const { data, error } = await supabase
      .from('tournaments')
      .insert([payload])
      .select()
      .single();

    setIsProcessing(false);
    
    if (error) {
      toast.error("Erreur de création : " + error.message);
    } else {
      toast.success("Tournoi créé ! Tu peux maintenant le configurer.");
      fetchManagedTournaments(); // On met à jour la liste automatiquement
    }

    return { data, error };
  };

  // 2. Récupérer MON tableau de bord (Les tournois que je gère)
  const fetchManagedTournaments = useCallback(async () => {
    if (!userId) return;
    
    // La Magie SQL : "Montre-moi les tournois où je suis Owner OU Co-organisateur"
    const { data, error } = await supabase
      .from('tournaments')
      .select(`
        *,
        co_organizer:profiles!co_organizer_id(first_name, last_name, pseudo)
      `)
      .or(`owner_id.eq.${userId},co_organizer_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setManagedTournaments(data);
    }
  }, [userId]);

  // 3. Le Pointage Manuel (Le côté Business)
  const togglePaymentStatus = async (registrationId, currentStatus) => {
    const newStatus = currentStatus === 'paid' ? 'unpaid' : 'paid';
    
    const { error } = await supabase
      .from('tournament_registrations')
      .update({ payment_status: newStatus })
      .eq('id', registrationId);

    if (error) {
      toast.error("Erreur lors de la mise à jour du paiement.");
    } else {
      toast.success(`Statut financier mis à jour : ${newStatus === 'paid' ? 'Payé 💰' : 'En attente ⏳'}`);
    }
    
    return { error };
  };

  return {
    isProcessing,
    managedTournaments,
    createTournament,
    fetchManagedTournaments,
    togglePaymentStatus
  };
}