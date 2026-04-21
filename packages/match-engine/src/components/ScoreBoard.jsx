import React from 'react';
import { CardHeader, Badge } from '@swish/ui';

export function ScoreBoard({ matchData, homeScore, awayScore, timeRemaining, isRunning }) {
  if (!matchData) return null;

  return (
    <CardHeader className="text-center bg-slate-900 text-white pb-8">
      <Badge variant={isRunning ? "destructive" : "secondary"} className="w-fit mx-auto mb-4">
        {isRunning ? '🔴 EN DIRECT' : matchData.status === 'finished' ? 'TERMINE' : 'EN ATTENTE'}
      </Badge>
      
      <div className="flex justify-between items-center px-2">
        <div className="text-center w-1/4 space-y-2">
          <p className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-wider">{matchData.home.name}</p>
          <p className="text-5xl sm:text-6xl font-black tabular-nums">{homeScore}</p>
        </div>
        
        {/* LA ZONE DU CHRONO : Plus large et plus voyante */}
        <div className="text-center w-2/4 px-2">
          <div className="bg-black p-3 sm:p-4 rounded-xl border-2 border-slate-700 shadow-inner">
            <p className="text-6xl sm:text-7xl md:text-8xl font-black font-mono text-yellow-400 tabular-nums tracking-tighter">
              {Math.floor(timeRemaining / 60).toString().padStart(2, '0')}:{(timeRemaining % 60).toString().padStart(2, '0')}
            </p>
          </div>
        </div>
        
        <div className="text-center w-1/4 space-y-2">
          <p className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-wider">{matchData.away.name}</p>
          <p className="text-5xl sm:text-6xl font-black tabular-nums">{awayScore}</p>
        </div>
      </div>
    </CardHeader>
  );
}