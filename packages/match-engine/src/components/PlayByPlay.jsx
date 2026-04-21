import React from 'react';
import { Badge } from '@swish/ui';

export function PlayByPlay({ events, matchData }) {
  if (!matchData) return null;

  return (
    <div className="bg-white p-6 h-64 overflow-y-auto rounded-b-xl">
      <h4 className="font-bold text-slate-700 mb-4 border-b pb-2">Feuille de match</h4>
      <div className="space-y-2">
        {events.length === 0 ? (
          <p className="text-sm text-slate-400 italic text-center py-4">Aucune action pour le moment.</p>
        ) : (
          events.map(ev => (
            <div key={ev.id} className="flex items-center gap-4 text-sm p-2 rounded hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0">
              <span className="font-mono text-slate-400 text-xs bg-slate-100 px-2 py-1 rounded">
                {Math.floor(ev.match_time_seconds / 60).toString().padStart(2, '0')}:{(ev.match_time_seconds % 60).toString().padStart(2, '0')}
              </span>
              <Badge variant="outline" className={ev.team_id === matchData.home_team_id ? "border-blue-200 text-blue-700" : "border-red-200 text-red-700"}>
                {ev.team_id === matchData.home_team_id ? matchData.home.name : matchData.away.name}
              </Badge>
              <span className="font-medium text-slate-700 flex-1">
                {ev.profile?.username || "Joueur Inconnu"} <span className="text-slate-500 font-normal">a marqué</span>
              </span>
              <span className="font-bold text-lg bg-slate-900 text-white w-8 h-8 flex items-center justify-center rounded-full">
                +{ev.event_type.split('_')[1]}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}