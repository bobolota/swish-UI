import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@swish/core";

export function useCompetition() { // 🧹 Suppression de myTeams
  const [standings, setStandings] = useState([]);
  const [fixtures, setFixtures] = useState([]);

  // 1. Récupération du calendrier (Polymorphe) - PARFAIT ✅
  const fetchFixtures = async (tournamentId) => {
    if (!tournamentId) return;

    const { data, error } = await supabase
      .from('fixtures')
      .select(`
        id,
        round_number,
        scheduled_at,
        status,
        winner_registration_id,
        home:home_registration_id (
          id,
          team:teams(name),
          user:profiles(first_name, last_name, pseudo)
        ),
        away:away_registration_id (
          id,
          team:teams(name),
          user:profiles(first_name, last_name, pseudo)
        )
      `)
      .eq('tournament_id', tournamentId)
      .order('round_number', { ascending: true });

    if (error) {
      console.error("Erreur chargement matchs:", error.message);
      toast.error("Impossible de charger le calendrier.");
      return;
    }

    const getParticipantName = (registration) => {
      if (!registration) return "TBD (À définir)";
      if (registration.team) return registration.team.name;
      if (registration.user) return registration.user.pseudo || registration.user.first_name;
      return "Inconnu";
    };

    const formattedFixtures = data.map(fixture => ({
      ...fixture,
      homeName: getParticipantName(fixture.home),
      awayName: getParticipantName(fixture.away)
    }));

    setFixtures(formattedFixtures);
  };

  // 2. Génération du Classement (VRAIES DONNÉES) 🔄
  const handleGenerateStandings = async (tournamentId) => {
    if (!tournamentId) return;

    // A. On récupère TOUS les inscrits au tournoi
    const { data: registrations } = await supabase
      .from('tournament_registrations')
      .select(`
        id,
        team:teams(name),
        user:profiles(first_name, last_name, pseudo)
      `)
      .eq('tournament_id', tournamentId);

    // B. On récupère TOUS les matchs terminés de ce tournoi
    const { data: finishedMatches } = await supabase
      .from('fixtures')
      .select('home_registration_id, away_registration_id, winner_registration_id')
      .eq('tournament_id', tournamentId)
      .eq('status', 'finished');

    if (!registrations) return;

    // C. On initialise le classement à zéro
    let currentStandings = registrations.map(reg => ({
      id: reg.id,
      name: reg.team ? reg.team.name : (reg.user?.pseudo || reg.user?.first_name),
      wins: 0,
      losses: 0,
      played: 0
    }));

    // D. On calcule les victoires/défaites réelles
    if (finishedMatches) {
      finishedMatches.forEach(match => {
        const homeIdx = currentStandings.findIndex(s => s.id === match.home_registration_id);
        const awayIdx = currentStandings.findIndex(s => s.id === match.away_registration_id);

        if (homeIdx > -1 && awayIdx > -1) {
          currentStandings[homeIdx].played += 1;
          currentStandings[awayIdx].played += 1;

          if (match.winner_registration_id === match.home_registration_id) {
            currentStandings[homeIdx].wins += 1;
            currentStandings[awayIdx].losses += 1;
          } else if (match.winner_registration_id === match.away_registration_id) {
            currentStandings[awayIdx].wins += 1;
            currentStandings[homeIdx].losses += 1;
          }
        }
      });
    }

    // E. On trie par le plus grand nombre de victoires
    currentStandings.sort((a, b) => b.wins - a.wins);
    
    setStandings(currentStandings);
    toast.success("Classement calculé à partir des résultats officiels !");
  };

  // 3. Génération du Calendrier Réel - PARFAIT ✅
  const handleGenerateCalendar = async (tournamentId) => {
    if (!tournamentId) return toast.error("Tournoi non spécifié !");

    const { data: registrations, error: fetchError } = await supabase
      .from('tournament_registrations')
      .select(`
        id,
        status,
        team:teams(id, name),
        user:profiles(id, first_name, last_name, pseudo)
      `)
      .eq('tournament_id', tournamentId);

    if (fetchError || !registrations) return toast.error("Erreur lors de la lecture des inscrits.");
    if (registrations.length < 2) return toast.error("Il faut au moins 2 inscrits pour lancer le championnat !");

    let participants = registrations.map(reg => ({
      id: reg.id,
      name: reg.team ? reg.team.name : (reg.user.pseudo || reg.user.first_name)
    }));

    if (participants.length % 2 !== 0) {
      participants.push({ id: null, name: 'BYE (Exempt)' });
    }

    const numTeams = participants.length;
    const numRounds = numTeams - 1;
    const matchesPerRound = numTeams / 2;
    const newFixtures = [];

    for (let round = 0; round < numRounds; round++) {
      for (let match = 0; match < matchesPerRound; match++) {
        const home = participants[match];
        const away = participants[numTeams - 1 - match];

        if (home.id && away.id) {
          newFixtures.push({
            tournament_id: tournamentId,
            home_registration_id: home.id,
            away_registration_id: away.id,
            round_number: round + 1,
            status: 'scheduled',
            scheduled_at: new Date(Date.now() + round * 7 * 24 * 60 * 60 * 1000).toISOString()
          });
        }
      }
      participants.splice(1, 0, participants.pop());
    }

    const { error: insertError } = await supabase.from('fixtures').insert(newFixtures);
    
    if (insertError) {
      toast.error("Erreur de génération : " + insertError.message);
    } else {
      toast.success(`${newFixtures.length} matchs générés avec succès !`);
      fetchFixtures(tournamentId);
    }
  };

  // Mettre à jour le planning d'un match spécifique
  const updateMatchSchedule = async (fixtureId, newDateISO, courtName) => {
    const { data, error } = await supabase
      .from('fixtures')
      .update({ 
        scheduled_at: newDateISO, // Format Date + Heure exacte
        court_name: courtName     // Le terrain assigné
      })
      .eq('id', fixtureId)
      .select();

    if (error) {
      toast.error("Erreur lors de la mise à jour du planning.");
    } else {
      toast.success("Match reprogrammé avec succès !");
      // fetchFixtures(tournamentId); // Penser à rafraîchir la liste
    }
    
    return { data, error };
  };

  // 4. Réinitialisation SÉCURISÉE 🔒
  const handleResetSeason = async (tournamentId) => {
    if (!tournamentId) return;
    
    const confirm = window.confirm("🚨 ATTENTION : Cela va supprimer TOUS les matchs de CE tournoi. Continuer ?");
    if (!confirm) return;

    // On supprime UNIQUEMENT les matchs de ce tournoi précis !
    const { error } = await supabase
      .from('fixtures')
      .delete()
      .eq('tournament_id', tournamentId); 
    
    if (error) toast.error("Erreur reset : " + error.message);
    else {
      setStandings([]);
      setFixtures([]);
      toast.success("Le calendrier de ce tournoi a été réinitialisé !");
    }
  };

  return {
    standings,
    fixtures,
    fetchFixtures, 
    handleGenerateStandings,
    handleGenerateCalendar,
    handleResetSeason
  };
}