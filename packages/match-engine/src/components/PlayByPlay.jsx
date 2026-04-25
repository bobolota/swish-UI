import React from 'react';
import { Trash2, Clock, User } from 'lucide-react';

export function PlayByPlay({ events = [], onUndo, homeTeamId }) {
  
  // Petit helper pour formater le temps (ex: 420s -> 07:00)
  const formatMatchTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Dictionnaire pour traduire les types d'événements proprement
  const EVENT_LABELS = {
    '3pt_made': 'Panier à 3pts',
    '2pt_made': 'Panier à 2pts',
    'free_throw': 'Lancer-franc',
    'foul': 'Faute',
    'assist': 'Passe décisive',
    'def_rebound': 'Rebond Défensif',
    'off_rebound': 'Rebond Offensif',
    'steal': 'Interception',
    'block': 'Contre',
    'turnover': 'Perte de balle'
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          Fil du match
        </h3>
        <span className="text-xs font-medium px-2 py-1 bg-slate-200 rounded-full text-slate-600">
          {events.length} actions
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[400px]">
        {events.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm italic">
            Aucun événement enregistré pour le moment.
          </div>
        ) : (
          events.map((event, index) => (
            <div 
              key={event.id || index} 
              className={`flex items-center justify-between p-3 rounded-xl border transition-all hover:shadow-md ${
                event.team_id === homeTeamId 
                  ? 'bg-blue-50/30 border-blue-100' 
                  : 'bg-red-50/30 border-red-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-8 rounded-full ${event.team_id === homeTeamId ? 'bg-blue-500' : 'bg-red-500'}`} />
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase">
                    {formatMatchTime(event.match_time_seconds)}
                  </div>
                  <div className="font-bold text-slate-800 text-sm">
                    {event.player?.name || "Joueur inconnu"}
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    {EVENT_LABELS[event.event_type] || event.event_type}
                  </div>
                </div>
              </div>

              {/* Bouton Annuler (Uniquement pour la dernière action idéalement, ou toutes) */}
              <button 
                onClick={() => onUndo(event)}
                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Annuler cette action"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}