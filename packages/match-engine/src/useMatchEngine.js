import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@swish/core';
import { toast } from 'sonner'; // 👈 NOUVEAU : Indispensable pour tes messages de succès

export function useMatchEngine(matchId) {
  // --- ÉTATS ---
  const [matchData, setMatchData] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [timeRemaining, setTimeRemaining] = useState(0); 
  const [isRunning, setIsRunning] = useState(false);
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [currentPeriod, setCurrentPeriod] = useState(1);

  const fetchMatch = useCallback(async () => {
    if (!matchId) {
      setLoading(false);
      return;
    }

    // 👇 CORRECTION ICI : Jointures explicites sur la table 'teams'
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select(`
        *,
        tournaments ( sport_id ),
        home_team:teams!home_team_id(name),
        away_team:teams!away_team_id(name)
      `) 
      .eq('id', matchId)
      .single();

    if (match) {
      let query = supabase
        .from('players')
        .select('*')
        .in('team_id', [match.home_team_id, match.away_team_id]);

      if (match.tournament_id) {
        query = query.eq('tournament_id', match.tournament_id);
      }

      const { data: playersData, error: playersError } = await query;
      
      if (playersError) {
        console.error("❌ Erreur lors du chargement des rosters :", playersError);
      }

      const homeRoster = playersData?.filter(p => p.team_id === match.home_team_id) || [];
      const awayRoster = playersData?.filter(p => p.team_id === match.away_team_id) || [];

      setMatchData({
        ...match,
        homeRoster,
        awayRoster
      });
      
      setHomeScore(match.home_score || 0);
      setAwayScore(match.away_score || 0);
      setTimeRemaining(match.timer_seconds || 600);
      setIsRunning(match.status === 'live');
    }

    const { data: eventData } = await supabase
      .from('match_events')
      .select('*, player:players(name)') 
      .eq('match_id', matchId)
      .order('created_at', { ascending: false });

    if (eventData) setEvents(eventData);
    setLoading(false);
  }, [matchId]);

  useEffect(() => {
    fetchMatch();
  }, [fetchMatch]);

  // --- LE MOTEUR DU TEMPS (Chronomètre Blindé) ---
  
  // 1. Le Tick régulier (Ne dépend QUE de isRunning, donc ne s'arrête jamais au clic)
  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  // Le Buzzer : Arrête le chrono à 0, mais ne bloque rien d'autre !
  useEffect(() => {
    if (timeRemaining === 0 && isRunning) {
      setIsRunning(false);
      // Optionnel : toast.info("Fin de la période !");
    }
  }, [timeRemaining, isRunning]);

  // --- ACTIONS GLOBALES DU MATCH ---
  const updateMatchStatus = async (newStatus) => {
    if (!matchData) return;
    setIsRunning(newStatus === 'live');
    
    await supabase
      .from('matches')
      .update({ status: newStatus, timer_seconds: timeRemaining })
      .eq('id', matchData.id);
      
    setMatchData({ ...matchData, status: newStatus });
  };

  const toggleTimer = () => {
    const newStatus = isRunning ? 'paused' : 'live';
    updateMatchStatus(newStatus);
  };

  // --- ACTIONS DE JEU (LIVE TRACKER OPTIMISÉ) ---
  const addEvent = async (teamId, playerId, eventType, points = 0) => {
    if (!matchData) return;

    // 1. Calcul des nouveaux scores
    const newHomeScore = teamId === matchData.home_team_id ? homeScore + points : homeScore;
    const newAwayScore = teamId === matchData.away_team_id ? awayScore + points : awayScore;
    
    if (teamId === matchData.home_team_id) setHomeScore(newHomeScore);
    if (teamId === matchData.away_team_id) setAwayScore(newAwayScore);

    // 2. Enregistrement de l'action dans l'historique
    const { data: newEvent, error: eventError } = await supabase
      .from('match_events')
      .insert([{
        match_id: matchData.id,
        team_id: teamId,
        player_id: playerId,
        event_type: eventType,
        match_time_seconds: timeRemaining
      }])
      .select('*, player:players(name)') 
      .single();

    if (eventError) {
      console.error("❌ Erreur d'insertion:", eventError);
      return;
    }

    // 3. LE CHECKPOINT DU LIVE TRACKER 📡
    // On met à jour le match à CHAQUE action (pas seulement quand il y a des points)
    // Cela permet aux spectateurs de savoir que le match est toujours actif.
    await supabase
      .from('matches') // 👈 Corrigé ici !
      .update({ 
        home_score: newHomeScore, 
        away_score: newAwayScore,
        // Si tu as créé ces colonnes dans ta base, décommente-les !
        // current_time: timeRemaining,
        // current_period: currentPeriod
      })
      .eq('id', matchData.id);

    setEvents(prev => [newEvent, ...prev]);
  };

  const removeEvent = async (event) => {
    if (!event) return;

    let pointsToSubtract = 0;
    // (Tu devras peut-être rendre ça dynamique via ta config agnostique plus tard !)
    if (event.event_type === '3pt_made') pointsToSubtract = 3;
    if (event.event_type === '2pt_made') pointsToSubtract = 2;
    if (event.event_type === 'free_throw') pointsToSubtract = 1;

    const isHome = event.team_id === matchData.home_team_id;
    const newHomeScore = isHome ? homeScore - pointsToSubtract : homeScore;
    const newAwayScore = !isHome ? awayScore - pointsToSubtract : awayScore;

    // 1. Suppression de l'action
    const { error } = await supabase
      .from('match_events')
      .delete()
      .eq('id', event.id);

    if (!error) {
      // 2. CHECKPOINT DE SYNCHRONISATION 📡
      await supabase
        .from('matches') // 👈 Corrigé ici aussi !
        .update({ 
          home_score: newHomeScore, 
          away_score: newAwayScore 
        })
        .eq('id', matchData.id);
        
      if (pointsToSubtract > 0) {
        setHomeScore(newHomeScore);
        setAwayScore(newAwayScore);
      }

      setEvents(prev => prev.filter(e => e.id !== event.id));
      toast.success("Action annulée !");
    }
  };

  // --- CALCUL DES JOUEURS SUR LE TERRAIN ---
  const onCourtIds = useMemo(() => {
    const currentlyOnCourt = new Set();
    const processedPlayers = new Set();

    // On parcourt l'historique du plus récent au plus ancien
    for (const event of events) {
      if (event.event_type === 'sub_in' || event.event_type === 'sub_out') {
        // Si c'est la première fois qu'on voit ce joueur dans la liste
        if (!processedPlayers.has(event.player_id)) {
          processedPlayers.add(event.player_id);
          
          // S'il est "entré", on l'ajoute à la liste des joueurs sur le terrain
          if (event.event_type === 'sub_in') {
            currentlyOnCourt.add(event.player_id);
          }
        }
      }
    }
    return currentlyOnCourt;
  }, [events]);

  const goToNextPeriod = (config) => {
    const nextPeriodNum = currentPeriod + 1;
    setCurrentPeriod(nextPeriodNum);
    
    // On donne le bon temps selon si c'est une période normale ou une prolongation
    if (nextPeriodNum > config.totalPeriods) {
      setTimeRemaining(config.overtimeLength || 300);
    } else {
      setTimeRemaining(config.periodLength || 600);
    }
    
    setIsRunning(false);
  };

  // 👇 LA CORRECTION MAGIQUE EST ICI : on exporte bien removeEvent !
  return {
    matchData, events, loading, 
    timeRemaining, isRunning, homeScore, awayScore,
    toggleTimer, updateMatchStatus, addEvent, removeEvent, fetchMatch, onCourtIds,
    currentPeriod, goToNextPeriod
  };
}