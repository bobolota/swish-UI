import React from 'react';

export function ScoreBoard({ time, period, homeTeam, awayTeam, maxTimeouts }) {
  
  // Fonction pour dessiner les petits "points" de temps morts
  const renderTimeouts = (remaining) => (
    <div className="flex gap-1 mt-2">
      {Array.from({ length: maxTimeouts || 0 }).map((_, i) => (
        <div 
          key={i} 
          className={`w-3 h-3 rounded-full border-2 ${
            i < remaining 
              ? 'bg-amber-400 border-amber-500 shadow-[0_0_8px_rgba(251,191,36,0.8)]' // Allumé
              : 'bg-slate-800 border-slate-700 opacity-50' // Éteint
          }`} 
        />
      ))}
    </div>
  );

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-2xl flex items-center justify-between">
      
      {/* ÉQUIPE DOMICILE */}
      <div className="flex flex-col items-center flex-1">
        <div className="text-sm font-bold text-slate-400 mb-1 uppercase tracking-widest">{homeTeam.name}</div>
        <div className={`text-6xl font-black ${homeTeam.color.replace('bg-', 'text-')}`}>
          {homeTeam.score}
        </div>
        {renderTimeouts(homeTeam.timeoutsRemaining)}
        
        {/* Bouton Temps Mort */}
        {maxTimeouts > 0 && (
          <button 
            onClick={homeTeam.onCallTimeout}
            disabled={homeTeam.timeoutsRemaining <= 0}
            className="mt-4 px-3 py-1 text-[10px] font-black uppercase bg-slate-800 hover:bg-slate-700 rounded text-slate-300 disabled:opacity-20 transition-all"
          >
            Temps Mort
          </button>
        )}
      </div>

      {/* CHRONO ET PÉRIODE */}
      <div className="flex flex-col items-center px-8">
        <div className="text-yellow-400 font-black text-2xl mb-1">{period}</div>
        <div className="text-7xl font-black font-mono tracking-tighter">{time}</div>
      </div>

      {/* ÉQUIPE EXTÉRIEURE */}
      <div className="flex flex-col items-center flex-1">
        <div className="text-sm font-bold text-slate-400 mb-1 uppercase tracking-widest">{awayTeam.name}</div>
        <div className={`text-6xl font-black ${awayTeam.color.replace('bg-', 'text-')}`}>
          {awayTeam.score}
        </div>
        {renderTimeouts(awayTeam.timeoutsRemaining)}

        {/* Bouton Temps Mort */}
        {maxTimeouts > 0 && (
          <button 
            onClick={awayTeam.onCallTimeout}
            disabled={awayTeam.timeoutsRemaining <= 0}
            className="mt-4 px-3 py-1 text-[10px] font-black uppercase bg-slate-800 hover:bg-slate-700 rounded text-slate-300 disabled:opacity-20 transition-all"
          >
            Temps Mort
          </button>
        )}
      </div>

    </div>
  );
}