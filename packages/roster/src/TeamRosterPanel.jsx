import React from 'react';
import { User } from 'lucide-react';

export function TeamRosterPanel({ title, teamId, roster = [], pendingAction, onPlayerSelect, colorClass }) {
  
  const PlayerCard = ({ player }) => (
    <div 
      onClick={() => onPlayerSelect && onPlayerSelect(player, teamId)}
      className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
        pendingAction 
          ? 'cursor-pointer hover:scale-105 border-indigo-300 bg-indigo-50 shadow-md animate-pulse' 
          : 'bg-white border-slate-200 opacity-70' 
      }`}
    >
      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 shrink-0">
        <User className="w-5 h-5" />
      </div>
      <div className="font-bold text-sm truncate text-slate-700">
        {player.name}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm w-full">
      <h3 className={`font-bold text-lg mb-4 border-b pb-2 ${colorClass || 'text-slate-800'}`}>
        {title}
      </h3>
      
      <div className="grid grid-cols-2 gap-3">
        {roster.map(player => (
          <PlayerCard key={player.id} player={player} />
        ))}
        
        {roster.length === 0 && (
          <p className="text-slate-400 text-sm col-span-2">Aucun joueur inscrit.</p>
        )}
      </div>
    </div>
  );
}