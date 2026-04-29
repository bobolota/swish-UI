import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@swish/core'; // Vérifie ton chemin d'import
import { Trophy, Activity } from 'lucide-react';

export default function Jumbotron() {
  const { id } = useParams();

  // États locaux synchronisés avec la table de marque
  const [matchState, setMatchState] = useState({
    timeRemaining: 600, // 10 minutes par défaut
    isRunning: false,
    currentPeriod: 1,
    homeScore: 0,
    awayScore: 0,
    homeName: "DOMICILE",
    awayName: "EXTÉRIEUR",
    isConnected: false
  });

  // 1. RÉCUPÉRATION DES NOMS DES ÉQUIPES (Au chargement)
  useEffect(() => {
    const fetchMatchDetails = async () => {
      const { data } = await supabase
        .from('matches')
        .select('home:teams!home_team_id(name), away:teams!away_team_id(name)')
        .eq('id', id)
        .single();
        
      if (data) {
        setMatchState(prev => ({
          ...prev,
          homeName: data.home?.name || "DOMICILE",
          awayName: data.away?.name || "EXTÉRIEUR"
        }));
      }
    };
    fetchMatchDetails();
  }, [id]);

  // 2. ÉCOUTE DE LA RADIO (Le signal de la table de marque)
  useEffect(() => {
    const room = supabase.channel(`live-match-${id}`);

    room.on('broadcast', { event: 'match-state' }, (payload) => {
      const state = payload.payload;
      setMatchState(prev => ({
        ...prev,
        timeRemaining: state.timeRemaining,
        isRunning: state.isRunning,
        currentPeriod: state.currentPeriod,
        homeScore: state.homeScore,
        awayScore: state.awayScore,
      }));
    }).subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        setMatchState(prev => ({ ...prev, isConnected: true }));
      }
    });

    return () => {
      supabase.removeChannel(room);
    };
  }, [id]);

  // 3. CHRONOMÈTRE LOCAL FLUIDE
  // Fait tourner le chrono tout seul si l'arbitre a dit "isRunning: true"
  useEffect(() => {
    let interval;
    if (matchState.isRunning && matchState.timeRemaining > 0) {
      interval = setInterval(() => {
        setMatchState(prev => ({
          ...prev,
          timeRemaining: prev.timeRemaining > 0 ? prev.timeRemaining - 1 : 0
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [matchState.isRunning, matchState.timeRemaining]);

  // Formatage du temps (MM:SS)
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="h-screen w-screen bg-black text-white flex flex-col overflow-hidden font-sans selection:bg-none">
      
      {/* HEADER : PÉRIODE ET STATUT DE CONNEXION */}
      <div className="flex justify-between items-center px-12 py-6 border-b border-white/10">
        <div className="flex items-center gap-4">
          <Trophy className="w-8 h-8 text-amber-500" />
          <span className="text-3xl font-black tracking-widest text-slate-400 uppercase">
            Période {matchState.currentPeriod}
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          {matchState.isConnected ? (
            <span className="flex items-center gap-2 text-emerald-500 font-bold tracking-widest text-sm uppercase">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              En direct
            </span>
          ) : (
            <span className="text-rose-500 font-bold tracking-widest text-sm uppercase flex items-center gap-2">
              <Activity className="w-4 h-4" /> En attente du signal...
            </span>
          )}
        </div>
      </div>

      {/* CORPS CENTRAL : SCORES ET CHRONO */}
      <div className="flex-1 flex flex-col justify-center items-center gap-12">
        
        {/* LE CHRONOMÈTRE GÉANT */}
        <div className="relative">
          <div className={`text-[15rem] leading-none font-black tabular-nums tracking-tighter ${matchState.timeRemaining <= 60 && matchState.isRunning ? 'text-rose-500' : 'text-white'}`}>
            {formatTime(matchState.timeRemaining)}
          </div>
          {!matchState.isRunning && matchState.isConnected && (
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-amber-500 text-black px-4 py-1 rounded-full text-2xl font-black uppercase tracking-widest">
              Temps Mort / Arrêt
            </div>
          )}
        </div>

        {/* LES SCORES */}
        <div className="flex justify-between items-center w-full px-24 gap-12 mt-12">
          
          {/* ÉQUIPE DOMICILE */}
          <div className="flex-1 flex flex-col items-center bg-white/5 rounded-[4rem] p-12 border border-white/10 shadow-2xl">
            <h2 className="text-5xl font-black uppercase tracking-widest text-slate-400 mb-8 truncate w-full text-center">
              {matchState.homeName}
            </h2>
            <div className="text-[12rem] leading-none font-black text-blue-500 tabular-nums">
              {matchState.homeScore}
            </div>
          </div>

          {/* SÉPARATEUR */}
          <div className="text-6xl font-black text-slate-700">-</div>

          {/* ÉQUIPE EXTÉRIEUR */}
          <div className="flex-1 flex flex-col items-center bg-white/5 rounded-[4rem] p-12 border border-white/10 shadow-2xl">
            <h2 className="text-5xl font-black uppercase tracking-widest text-slate-400 mb-8 truncate w-full text-center">
              {matchState.awayName}
            </h2>
            <div className="text-[12rem] leading-none font-black text-rose-500 tabular-nums">
              {matchState.awayScore}
            </div>
          </div>

        </div>
      </div>
      
    </div>
  );
}