import React from 'react';
import { Play, Pause, Tv, Flag, StepForward, Timer, MonitorPlay, BarChart2 } from 'lucide-react';

export function ScoreBoard({ 
  timeRemainingFormatted, 
  isRunning, 
  onToggleTimer, 
  periodLabel, 
  homeTeam, 
  awayTeam, 
  onNextPeriod, 
  onEndMatch, 
  onOpenJumbotron,
  onOpenStats 
}) {
  
  // Petit composant interne pour les points lumineux
  const DotIndicator = ({ total, active, colorClass }) => (
    <div className="flex gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div 
          key={i} 
          className={`w-3 h-3 rounded-full transition-all duration-300 ${
            i < active 
              ? `${colorClass} shadow-[0_0_8px_rgba(255,255,255,0.5)]` 
              : 'bg-slate-800 border border-white/5'
          }`}
        />
      ))}
    </div>
  );

  return (
    <div className="w-full bg-slate-900 text-white shadow-xl flex flex-col items-center justify-center pt-4 pb-3 sticky top-0 z-50 shrink-0 border-b-4 border-slate-950">
      
      <div className="flex items-center justify-center gap-12 md:gap-20 w-full max-w-7xl px-8">
        
        {/* ÉQUIPE DOMICILE */}
        <div className="flex items-center gap-8 flex-1 justify-end">
          <div className="flex flex-col items-end gap-3">
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-wider text-slate-200">
              {homeTeam.name}
            </h2>
            
            {/* Indicateurs Domicile */}
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Fautes d'équipe</span>
                <DotIndicator total={5} active={homeTeam.fouls} colorClass="bg-blue-500" />
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={homeTeam.onCallTimeout}
                  className="flex items-center gap-1.5 px-2 py-1 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 rounded text-[10px] font-black uppercase transition-colors"
                >
                  <Timer className="w-3 h-3" /> Temps Mort
                </button>
                <DotIndicator total={3} active={homeTeam.timeoutsRemaining} colorClass="bg-amber-400" />
              </div>
            </div>
          </div>

          <div className={`text-7xl md:text-9xl font-black tabular-nums tracking-tighter text-blue-500`}>
            {homeTeam.score}
          </div>
        </div>

        {/* BLOC CENTRAL (CHRONO) */}
        <div className="flex flex-col items-center justify-center shrink-0 min-w-[220px]">
          <span className="text-amber-500 font-black uppercase tracking-[0.3em] text-sm mb-1">
            {periodLabel}
          </span>
          <div className={`text-6xl md:text-8xl font-black tabular-nums tracking-tighter mb-4 ${isRunning ? 'text-emerald-400' : 'text-white'}`}>
            {timeRemainingFormatted}
          </div>
          <button 
            onClick={onToggleTimer}
            className={`w-24 h-16 flex items-center justify-center rounded-2xl shadow-lg transition-all active:scale-95 border-b-4 ${
              isRunning 
                ? 'bg-slate-700 hover:bg-slate-600 text-white border-slate-900' 
                : 'bg-emerald-500 hover:bg-emerald-400 text-white border-emerald-700'
            }`}
          >
            {isRunning ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
          </button>
        </div>

        {/* ÉQUIPE EXTÉRIEUR */}
        <div className="flex items-center gap-8 flex-1 justify-start">
          <div className={`text-7xl md:text-9xl font-black tabular-nums tracking-tighter text-red-500`}>
            {awayTeam.score}
          </div>

          <div className="flex flex-col items-start gap-3">
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-wider text-slate-200">
              {awayTeam.name}
            </h2>
            
            {/* Indicateurs Extérieur */}
            <div className="flex flex-col items-start gap-2">
              <div className="flex items-center gap-3">
                <DotIndicator total={5} active={awayTeam.fouls} colorClass="bg-red-500" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Fautes d'équipe</span>
              </div>
              <div className="flex items-center gap-3">
                <DotIndicator total={3} active={awayTeam.timeoutsRemaining} colorClass="bg-amber-400" />
                <button 
                  onClick={awayTeam.onCallTimeout}
                  className="flex items-center gap-1.5 px-2 py-1 bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 rounded text-[10px] font-black uppercase transition-colors"
                >
                  <Timer className="w-3 h-3" /> Temps Mort
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ACTIONS SECONDAIRES */}
      <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mt-6 pt-4 border-t border-white/5 w-full max-w-4xl">
        <button onClick={onOpenStats} className="flex items-center gap-2 px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-black uppercase transition-colors">
          <BarChart2 className="w-4 h-4 text-emerald-400" /> Stats
        </button>
        <button onClick={onOpenJumbotron} className="flex items-center gap-2 px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-black uppercase transition-colors">
          <Tv className="w-4 h-4 text-amber-400" /> Jumbotron
        </button>
        <button onClick={onNextPeriod} className="flex items-center gap-2 px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-black uppercase transition-colors">
          <StepForward className="w-4 h-4 text-blue-400" /> Fin Période
        </button>
        <button onClick={onEndMatch} className="flex items-center gap-2 px-5 py-2 bg-rose-950/30 hover:bg-rose-900/50 text-rose-400 rounded-xl text-xs font-black uppercase transition-colors border border-rose-900/50">
          <Flag className="w-4 h-4" /> Clôturer
        </button>
      </div>
    </div>
  );
}