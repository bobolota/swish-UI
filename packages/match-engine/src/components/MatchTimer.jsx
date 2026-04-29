import React from 'react';
import { Play, Pause, ChevronLast, Flag } from 'lucide-react';

export function MatchTimer({ 
  isRunning, 
  onToggle, 
  timeRemaining, 
  onNextPeriod, 
  onManualNext, 
  onEndMatch 
}) {
  return (
    <div className="flex flex-col items-center gap-4">
      
      {/* BOUTON PRINCIPAL (PLAY/PAUSE) */}
      <button 
        onClick={onToggle}
        className={`flex items-center gap-3 px-10 py-5 rounded-2xl font-black text-2xl shadow-xl transition-all active:scale-95 ${
          isRunning 
            ? 'bg-amber-500 hover:bg-amber-400 text-white' 
            : 'bg-emerald-600 hover:bg-emerald-500 text-white ring-4 ring-emerald-500/20'
        }`}
      >
        {isRunning ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current" />}
        {isRunning ? 'PAUSE' : 'DÉMARRER'}
      </button>

      {/* BOUTONS DE CONTRÔLE MANUEL (ADMIN) */}
      <div className="flex items-center gap-3 mt-2">
        
        {/* Passer à la suite (N'apparaît QUE si le temps est à 0 ou via bouton forcer) */}
        {timeRemaining === 0 ? (
          <button 
            onClick={onNextPeriod}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold text-sm shadow-lg animate-bounce"
          >
            <ChevronLast className="w-4 h-4" /> PÉRIODE SUIVANTE
          </button>
        ) : (
          <button 
            onClick={onManualNext}
            className="flex items-center gap-2 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-lg font-bold text-xs transition-colors"
            title="Forcer la fin de période"
          >
            <ChevronLast className="w-3 h-3" /> FIN DE PÉRIODE
          </button>
        )}

        <button 
          onClick={onEndMatch}
          className="flex items-center gap-2 px-4 py-2 bg-slate-200 hover:bg-red-100 hover:text-red-600 text-slate-600 rounded-lg font-bold text-xs transition-all"
          title="Terminer le match"
        >
          <Flag className="w-3 h-3" /> TERMINER LE MATCH
        </button>
      </div>

    </div>
  );
}