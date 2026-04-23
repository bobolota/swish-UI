import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@swish/core';
import { toast } from 'sonner';

export function useTournamentPools(tournamentId) {
  const [pools, setPools] = useState([]);
  const [teams, setTeams] = useState([]); // Seulement les équipes VALIDÉES
  const [isLoading, setIsLoading] = useState(true);

  const fetchPoolsAndTeams = useCallback(async () => {
    if (!tournamentId) return;
    setIsLoading(true);

    // 1. On récupère les poules du tournoi
    const { data: poolsData, error: poolsError } = await supabase
      .from('pools')
      .select('*')
      .eq('tournament_id', tournamentId)
      .order('created_at', { ascending: true });

    if (poolsError) console.error("Erreur pools:", poolsError);

    // 2. On récupère UNIQUEMENT les équipes qui ont payé/sont validées
    const { data: teamsData, error: teamsError } = await supabase
      .from('tournament_registrations')
      .select(`
        id,
        status,
        pool_id,
        team_id,
        teams ( name, display_captain_name )
      `)
      .eq('tournament_id', tournamentId)
      .eq('status', 'validated'); // La magie est ici !

    if (teamsError) console.error("Erreur teams:", teamsError);

    // Formatage propre pour notre interface
    const formattedTeams = (teamsData || []).map(reg => ({
      id: reg.id,
      teamId: reg.team_id,
      poolId: reg.pool_id,
      name: reg.teams?.name || "Équipe sans nom",
      captainName: reg.teams?.display_captain_name || "Capitaine inconnu"
    }));

    setPools(poolsData || []);
    setTeams(formattedTeams);
    setIsLoading(false);
  }, [tournamentId]);

  useEffect(() => {
    fetchPoolsAndTeams();
  }, [fetchPoolsAndTeams]);

  // Fonction pour créer une nouvelle poule (ex: "Poule A")
  const createPool = async (name) => {
    const { data, error } = await supabase
      .from('pools')
      .insert([{ tournament_id: tournamentId, name }])
      .select();

    if (error) {
      toast.error("Erreur lors de la création de la poule");
    } else {
      toast.success(`Poule "${name}" créée !`);
      setPools(prev => [...prev, data[0]]);
    }
  };

  // Fonction pour déplacer une équipe d'une poule à une autre
  const assignTeamToPool = async (registrationId, poolId) => {
    // Mise à jour visuelle instantanée
    setTeams(prev => prev.map(t => 
      t.id === registrationId ? { ...t, poolId: poolId } : t
    ));

    // Sauvegarde en base de données
    const { error } = await supabase
      .from('tournament_registrations')
      .update({ pool_id: poolId })
      .eq('id', registrationId);

    if (error) {
      toast.error("Erreur lors du déplacement de l'équipe");
      fetchPoolsAndTeams(); // On annule et on recharge en cas d'erreur
    }
  };

  // 1. Supprimer une poule précise
const deletePool = async (poolId) => {
  if (!window.confirm("Supprimer cette poule ? Les équipes seront désassignées.")) return;

  const { error } = await supabase.from('pools').delete().eq('id', poolId);

  if (error) {
    toast.error("Erreur lors de la suppression");
  } else {
    setPools(prev => prev.filter(p => p.id !== poolId));
    // On force le rafraîchissement des équipes pour voir qu'elles sont revenues en "unassigned"
    fetchPoolsAndTeams(); 
    toast.success("Poule supprimée");
  }
};

// 2. Tout réinitialiser (Vider le tournoi)
const resetAllPools = async () => {
  if (!window.confirm("ATTENTION : Supprimer TOUTES les poules et désassigner TOUTES les équipes ?")) return;

  // Supprimer toutes les poules du tournoi (les équipes se détachent automatiquement)
  const { error } = await supabase.from('pools').delete().eq('tournament_id', tournamentId);

  if (error) {
    toast.error("Erreur lors de la réinitialisation");
  } else {
    setPools([]);
    fetchPoolsAndTeams();
    toast.success("Le tournoi a été remis à zéro");
  }
};

// NOUVEAU : Création des poules et répartition en 1 clic
  const generatePoolsAndDistribute = async (numberOfPools) => {
    const unassigned = teams.filter(t => !t.poolId);
    
    if (unassigned.length === 0) {
      toast.error("Aucune équipe en attente à répartir !");
      return;
    }

    // 1. Déterminer la lettre de départ (Ex: S'il y a déjà Poule A et B, on commence à C)
    const startingCharCode = 65 + pools.length; // 65 correspond à la lettre 'A'
    
    // 2. Créer les poules en lot (Bulk Insert)
    const poolsToCreate = Array.from({ length: numberOfPools }).map((_, i) => ({
      tournament_id: tournamentId,
      name: `Poule ${String.fromCharCode(startingCharCode + i)}`
    }));

    const { data: newPools, error: poolsError } = await supabase
      .from('pools')
      .insert(poolsToCreate)
      .select();

    if (poolsError) {
      toast.error("Erreur lors de la création automatique des poules");
      return;
    }

    // 3. Définir toutes les poules actives (anciennes + les nouvelles qu'on vient de créer)
    const allActivePools = [...pools, ...newPools];

    // 4. Mélanger les équipes non assignées
    const shuffled = [...unassigned].sort(() => Math.random() - 0.5);
    
    // 5. Répartir tout le monde dans les poules
    toast.promise(
      Promise.all(shuffled.map((team, i) => {
        const poolIndex = i % allActivePools.length;
        // On utilise ta fonction existante pour assigner chaque équipe
        return assignTeamToPool(team.id, allActivePools[poolIndex].id); 
      })),
      {
        loading: 'Création et répartition magique en cours...',
        success: () => {
          fetchPoolsAndTeams(); // On recharge tout l'écran une fois fini
          return `${numberOfPools} poules créées et équipes réparties !`;
        },
        error: 'Erreur lors de la répartition',
      }
    );
  };

  // Renommer une poule
  const renamePool = async (poolId, newName) => {
    if (!newName || !newName.trim()) return;

    // 1. Mise à jour visuelle immédiate
    setPools(prev => prev.map(p => 
      p.id === poolId ? { ...p, name: newName.trim() } : p
    ));

    // 2. Mise à jour dans Supabase
    const { error } = await supabase
      .from('pools')
      .update({ name: newName.trim() })
      .eq('id', poolId);

    if (error) {
      toast.error("Erreur lors du renommage");
      fetchPoolsAndTeams(); // On annule en cas d'erreur
    } else {
      toast.success("Poule renommée !");
    }
  };

  return { pools, teams, isLoading, createPool, assignTeamToPool, deletePool, resetAllPools, generatePoolsAndDistribute, renamePool };
}