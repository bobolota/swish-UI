import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// 👇 1. CORRECTION : Ajout de PlayByPlay dans l'import
import { ScoreBoard, ScoreButton, useMatchEngine, PlayByPlay } from '@swish/match-engine';
import { TeamRosterPanel } from '@swish/roster';
import { Play, Pause, X } from 'lucide-react';

export default function ActiveMatch() {
  const { id } = useParams();
  const navigate = useNavigate();

  // 👇 2. CORRECTION : Ajout de events et removeEvent
  const { 
    matchData, loading, 
    timeRemaining, isRunning, homeScore, awayScore,
    toggleTimer, addEvent, events, removeEvent 
  } = useMatchEngine(id);

  const [pendingAction, setPendingAction] = useState(null);

  if (loading) return <div className="flex justify-center items-center h-full">Chargement du match...</div>;
  if (!matchData) return <div className="text-center text-red-500 p-10">Match introuvable.</div>;

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleActionSelect = (points, type, label) => {
    setPendingAction({ points, type, label });
  };

  const handlePlayerSelect = (player, teamId) => {
    if (!pendingAction) return; 
    addEvent(teamId, player.id, pendingAction.type, pendingAction.points);
    setPendingAction(null);
  };

  const MATCH_ACTIONS = [
    { type: 'free_throw', label: '+1 LF', points: 1, category: 'primary', color: 'bg-emerald-500' },
    { type: '2pt_made',   label: '+2 Pts', points: 2, category: 'primary', color: 'bg-emerald-600' },
    { type: '3pt_made',   label: '+3 Pts', points: 3, category: 'primary', color: 'bg-emerald-700' },
    { type: 'foul',       label: 'Faute',  points: 0, category: 'primary', color: 'bg-red-600' },
    { type: 'assist',     label: 'Passe',  points: 0, category: 'secondary', color: 'bg-indigo-500' },
    { type: 'def_rebound',label: 'Reb Def',points: 0, category: 'secondary', color: 'bg-teal-500' },
    { type: 'off_rebound',label: 'Reb Off',points: 0, category: 'secondary', color: 'bg-teal-600' },
    { type: 'steal',      label: 'Interc.',points: 0, category: 'secondary', color: 'bg-amber-500' },
    { type: 'block',      label: 'Contre', points: 0, category: 'secondary', color: 'bg-amber-600' },
    { type: 'turnover',   label: 'Perte',  points: 0, category: 'secondary', color: 'bg-orange-600' },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-10">
      
      <ScoreBoard 
        time={formatTime(timeRemaining)}
        period="Q1"
        homeTeam={{ name: matchData.home?.name || "DOMICILE", score: homeScore, color: "bg-blue-600" }}
        awayTeam={{ name: matchData.away?.name || "EXTÉRIEUR", score: awayScore, color: "bg-red-600" }}
      />

      <div className="flex justify-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <button onClick={toggleTimer} className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white transition-all ${isRunning ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}>
          {isRunning ? <><Pause /> PAUSE</> : <><Play /> REPRENDRE</>}
        </button>
      </div>

      <div className="bg-slate-900 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <h3 className="text-white font-bold mb-6 uppercase tracking-widest text-sm text-center text-slate-400">
          {pendingAction ? `JOUEUR POUR : ${pendingAction.label}` : '1. SÉLECTIONNEZ UNE ACTION'}
        </h3>
        
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {MATCH_ACTIONS.filter(a => a.category === 'primary').map(action => (
            <button
              key={action.type}
              onClick={() => handleActionSelect(action.points, action.type, action.label)}
              className={`px-6 py-4 rounded-xl font-bold text-white transition-all shadow-lg active:scale-95 ${
                pendingAction?.type === action.type ? `${action.color} ring-4 ring-white` : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              {action.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-2 pt-6 border-t border-slate-700/50">
          {MATCH_ACTIONS.filter(a => a.category === 'secondary').map(action => (
            <button
              key={action.type}
              onClick={() => handleActionSelect(action.points, action.type, action.label)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-tight transition-all active:scale-95 ${
                pendingAction?.type === action.type ? `${action.color} text-white shadow-md` : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {action.label}
            </button>
          ))}
        </div>

        {pendingAction && (
          <button onClick={() => setPendingAction(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white flex items-center gap-1 text-sm font-bold bg-slate-800/50 py-1 px-2 rounded-md">
            <X className="w-4 h-4"/> Annuler
          </button>
        )}
      </div>

      {/* LES ROSTERS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TeamRosterPanel 
          title={matchData.home?.name || "Domicile"}
          teamId={matchData.home_team_id}
          roster={matchData.homeRoster}
          pendingAction={pendingAction}
          onPlayerSelect={handlePlayerSelect}
          colorClass="text-blue-600"
        />

        <TeamRosterPanel 
          title={matchData.away?.name || "Extérieur"}
          teamId={matchData.away_team_id}
          roster={matchData.awayRoster}
          pendingAction={pendingAction}
          onPlayerSelect={handlePlayerSelect}
          colorClass="text-red-600"
        />
      </div>

      {/* 👇 3. CORRECTION : Le PlayByPlay est sorti de la grille pour prendre toute la largeur ! */}
      <div className="mt-4">
        <PlayByPlay 
          events={events} 
          onUndo={removeEvent} 
          homeTeamId={matchData.home_team_id} 
        />
      </div>

    </div>
  );
}