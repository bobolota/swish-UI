import React from 'react';
import { Play, Pause, ArrowRight } from 'lucide-react';

// On ajoute timeRemaining et onNextPeriod dans les paramètres
export function MatchTimer({ isRunning, onToggle, timeRemaining, onNextPeriod }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <button 
        onClick={onToggle}
        className={`flex items-center gap-2 px-8 py-4 rounded-xl font-black text-xl shadow-lg transition-all active:scale-95 ${
          isRunning 
            ? 'bg-amber-500 hover:bg-amber-400 text-white' 
            : 'bg-emerald-500 hover:bg-emerald-400 text-white'
        }`}
      >
        {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
        {isRunning ? 'METTRE EN PAUSE' : 'DÉMARRER CHRONO'}
      </button>

      {/* Le bouton manuel qui n'apparaît qu'à 00:00 */}
      {timeRemaining === 0 && (
        <button 
          onClick={onNextPeriod}
          className="flex items-center gap-2 px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold text-sm transition-all animate-in fade-in zoom-in"
        >
          PÉDIODE SUIVANTE <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}