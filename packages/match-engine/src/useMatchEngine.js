import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@swish/core';

export function useMatchEngine(matchId) {
  // --- ÉTATS ---
  const [matchData, setMatchData] = useState(null); // Les infos du match
  const [events, setEvents] = useState([]); // La liste des actions (Play-by-play)
  const [loading, setLoading] = useState(true);
  
  // États locaux pour le chronomètre et l'UI
  const [timeRemaining, setTimeRemaining] = useState(0); 
  const [isRunning, setIsRunning] = useState(false);
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);

  // --- LECTURE INITIALE ---
  const fetchMatch = useCallback(async () => {
    if (!matchId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    // 1. Récupérer le match et ses équipes
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('*, home:teams!home_team_id(*), away:teams!away_team_id(*)')
      .eq('id', matchId)
      .single();

    if (match) {
      setMatchData(match);
      setHomeScore(match.home_score);
      setAwayScore(match.away_score);
      setTimeRemaining(match.timer_seconds);
      setIsRunning(match.status === 'live');
    }

    // 2. Récupérer la feuille de match (les événements)
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

  // --- LE MOTEUR DU TEMPS (Chronomètre) ---
  useEffect(() => {
    let interval;
    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0 && isRunning) {
      // Fin du temps réglementaire
      setIsRunning(false);
      updateMatchStatus('finished');
    }
    return () => clearInterval(interval);
  }, [isRunning, timeRemaining]);

  // --- ACTIONS GLOBALES DU MATCH ---
  const updateMatchStatus = async (newStatus) => {
    if (!matchData) return;
    setIsRunning(newStatus === 'live');
    
    // On sauvegarde dans Supabase pour que les spectateurs voient le changement
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

  // --- ACTIONS DE JEU (Ajouter des points) ---
  const addEvent = async (teamId, playerId, type, points = 0) => {
    if (!matchData) return { error: "Match introuvable" };

    const { data: newEvent, error: eventError } = await supabase
      .from('match_events')
      .insert([{
        match_id: matchData.id,
        team_id: teamId,
        players_id: playerId, // 👈 TA nouvelle colonne !
        event_type: type,
        match_time_seconds: timeRemaining
      }])
      .select('*, player:players(name)') // On récupère le nom pour l'affichage direct
      .single();

    if (eventError) return { error: eventError };

    // 2. Mettre à jour le score localement instantanément (Pour que ce soit fluide)
    let newHomeScore = homeScore;
    let newAwayScore = awayScore;
    
    if (points > 0) {
      if (teamId === matchData.home_team_id) newHomeScore += points;
      else newAwayScore += points;
      
      setHomeScore(newHomeScore);
      setAwayScore(newAwayScore);
      
      // 3. Sauvegarder le nouveau score dans le match principal
      await supabase
        .from('matches')
        .update({ home_score: newHomeScore, away_score: newAwayScore })
        .eq('id', matchData.id);
    }

    // 4. Mettre à jour l'historique local
    setEvents([newEvent, ...events]);
    return { data: newEvent };
  };

  return {
    matchData, events, loading, 
    timeRemaining, isRunning, homeScore, awayScore,
    toggleTimer, updateMatchStatus, addEvent, fetchMatch
  };
}