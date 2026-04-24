import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ScoreBoard, ScoreButton, useMatchEngine } from '@swish/match-engine';
import { TeamRosterPanel } from '@swish/roster'; // 👈 Ton nouvel import ultra propre !
import { Play, Pause, X } from 'lucide-react';

export default function ActiveMatch() {
  const { id } = useParams();
  const navigate = useNavigate();

  // 1. Connexion au moteur de match
  const { 
    matchData, loading, 
    timeRemaining, isRunning, homeScore, awayScore,
    toggleTimer, addEvent 
  } = useMatchEngine(id);

  // 2. L'état pour l'ergonomie "Action d'abord"
  const [pendingAction, setPendingAction] = useState(null);

  // 3. Gestion des états de chargement
  if (loading) return <div className="flex justify-center items-center h-full">Chargement du match...</div>;
  if (!matchData) return <div className="text-center text-red-500 p-10">Match introuvable.</div>;

  // Formatage du temps
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // --- LOGIQUE D'ARBITRAGE ---

  const handleActionSelect = (points, type, label) => {
    setPendingAction({ points, type, label });
  };

  const handlePlayerSelect = (player, teamId) => {
    if (!pendingAction) return; 
    
    // On enregistre l'action avec le bon joueur
    addEvent(teamId, player.id, pendingAction.type, pendingAction.points);
    
    // On réinitialise pour la prochaine action
    setPendingAction(null);
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-10">
      
      {/* L'ÉCRAN GÉANT */}
      <ScoreBoard 
        time={formatTime(timeRemaining)}
        period="Q1" // Tu pourras rendre ça dynamique plus tard si besoin
        homeTeam={{ name: matchData.home?.name || "DOMICILE", score: homeScore, color: "bg-blue-600" }}
        awayTeam={{ name: matchData.away?.name || "EXTÉRIEUR", score: awayScore, color: "bg-red-600" }}
      />

      {/* LE CHRONOMÈTRE */}
      <div className="flex justify-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <button onClick={toggleTimer} className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white transition-all ${isRunning ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}>
          {isRunning ? <><Pause /> PAUSE</> : <><Play /> REPRENDRE</>}
        </button>
      </div>

      {/* LA BARRE D'ACTIONS GLOBALES (Étape 1 de l'arbitrage) */}
      <div className="bg-slate-900 rounded-2xl p-6 shadow-xl text-center relative overflow-hidden">
        <h3 className="text-white font-bold mb-4 uppercase tracking-widest text-sm text-slate-400">
          {pendingAction ? 'SÉLECTIONNEZ LE JOUEUR...' : '1. SÉLECTIONNEZ UNE ACTION'}
        </h3>
        
        <div className="flex flex-wrap justify-center gap-4">
          <ScoreButton label="+1 LF" variant={pendingAction?.type === 'free_throw' ? 'success' : 'default'} onClick={() => handleActionSelect(1, 'free_throw', '+1')} />
          <ScoreButton label="+2 Pts" variant={pendingAction?.type === '2pt_made' ? 'success' : 'default'} onClick={() => handleActionSelect(2, '2pt_made', '+2')} />
          <ScoreButton label="+3 Pts" variant={pendingAction?.type === '3pt_made' ? 'success' : 'default'} onClick={() => handleActionSelect(3, '3pt_made', '+3')} />
          <ScoreButton label="Faute" variant={pendingAction?.type === 'foul' ? 'danger' : 'default'} onClick={() => handleActionSelect(0, 'foul', 'Faute')} />
        </div>

        {/* Bouton pour annuler l'action en attente */}
        {pendingAction && (
          <button onClick={() => setPendingAction(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white flex items-center gap-1 text-sm font-bold">
            <X className="w-4 h-4"/> Annuler
          </button>
        )}
      </div>

      {/* LES ROSTERS (Étape 2 de l'arbitrage) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Équipe Domicile */}
        <TeamRosterPanel 
          title={matchData.home?.name || "Domicile"}
          teamId={matchData.home_team_id}
          roster={matchData.homeRoster}
          pendingAction={pendingAction}
          onPlayerSelect={handlePlayerSelect}
          colorClass="text-blue-600"
        />

        {/* Équipe Extérieur */}
        <TeamRosterPanel 
          title={matchData.away?.name || "Extérieur"}
          teamId={matchData.away_team_id}
          roster={matchData.awayRoster}
          pendingAction={pendingAction}
          onPlayerSelect={handlePlayerSelect}
          colorClass="text-red-600"
        />

      </div>

    </div>
  );
}