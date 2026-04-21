export function usePermissions(profile) {
  // Le Vigile lit simplement le badge du joueur
  const isPro = profile?.plan === 'PRO';
  
  // Il en déduit les droits
  const canCreateTournament = isPro;

  return { isPro, canCreateTournament };
}