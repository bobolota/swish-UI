import React from 'react';
import { Trash2, Clock, Users } from 'lucide-react';

export function PlayByPlay({ events = [], onUndo, homeTeamId, currentConfig }) {
  
  const formatMatchTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const translateEvent = (eventType) => {
    if (eventType === 'sub_in') return 'Entrée en jeu';
    if (eventType === 'sub_out') return 'Sortie';
    if (eventType === 'timeout') return 'Temps Mort'; // Traduction spécifique pour le TM

    if (!currentConfig || !currentConfig.actions) return eventType;

    for (const action of currentConfig.actions) {
      if (action.type === eventType) {
        return action.label;
      }
      
      if (action.outcomes) {
        const matchingOutcome = action.outcomes.find(o => `${action.type}${o.suffix}` === eventType);
        if (matchingOutcome) {
          return `${action.label} - ${matchingOutcome.label}`;
        }
      }
    }

    return eventType;
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
          events.map((event, index) => {
            // 👇 LOGIQUE DU NOM : On gère spécifiquement les actions d'équipe
            const isTeamAction = !event.player_id && !event.player;
            let displayName = "Joueur inconnu";
            
            if (isTeamAction) {
              displayName = "ACTION D'ÉQUIPE";
            } else if (event.player?.name) {
              displayName = event.player.name;
            }

            return (
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
                    
                    {/* AFFICHAGE DU NOM (Joueur ou Équipe) */}
                    <div className={`font-bold text-sm flex items-center gap-1 ${isTeamAction ? 'text-amber-600' : 'text-slate-800'}`}>
                      {isTeamAction && <Users className="w-3 h-3" />}
                      {displayName}
                    </div>
                    
                    <div className="text-xs text-slate-500 font-medium">
                      {translateEvent(event.event_type)} 
                      
                      {event.points > 0 && (
                        <span className="ml-1 font-black text-emerald-600">
                          (+{event.points} pts)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => onUndo(event)}
                  className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Annuler cette action"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}