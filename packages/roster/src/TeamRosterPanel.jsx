import React from 'react';
import { CheckCircle2, LogOut, LogIn, Clock } from 'lucide-react';

export function TeamRosterPanel({ 
  variant = 'view', 
  currentConfig, 
  title, roster, teamId, pendingAction, 
  selectedPlayerId, onPlayerClick, onActionOutcome, colorClass,
  isSettingStarters, tempStarters, onCourtIds, 
  subSelection, playerStats = {}, playingTimes = {}
}) {
  
  if (!roster) return null;

  const maxFouls = currentConfig?.maxFouls || 5;
  const playersOnCourt = currentConfig?.playersOnCourt || 5;

  const sortedRoster = [...roster].sort((a, b) => {
    const numA = parseInt(a.number) || 0;
    const numB = parseInt(b.number) || 0;
    return numA - numB;
  });

  const formatPT = (sec) => {
    if (!sec) return "00:00";
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // --- MODE 1 : VIEW (Lecture Seule) ---
  if (variant === 'view') {
    return (
      <div className="flex flex-col h-full bg-slate-50/50 rounded-2xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-2">
          <h3 className={`text-lg font-black uppercase tracking-widest ${colorClass || 'text-slate-800'}`}>{title}</h3>
          <span className="text-xs font-bold text-slate-400 bg-slate-200 px-2 py-1 rounded-md">{roster.length} Joueurs</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 overflow-y-auto pb-4">
          {sortedRoster.map(player => (
            <div key={player.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-white shrink-0 ${(colorClass || 'text-slate-800').replace('text-', 'bg-')}`}>
                {player.number}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="font-black text-sm uppercase truncate text-slate-800">{player.name}</span>
                <span className="text-xs text-slate-500 truncate">{player.position || 'Joueur'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- MODE 2 : MATCH (Contrôle Avancé) ---
  const FoulLEDs = ({ currentFouls }) => {
    if (!maxFouls) return null;
    return (
      <div className="flex gap-1 items-center justify-center">
        {Array.from({ length: maxFouls }).map((_, i) => {
          let ledClass = "bg-slate-200/60 border border-slate-300/50";
          if (i < currentFouls) {
            ledClass = i === maxFouls - 1 
              ? "bg-rose-500 shadow-[0_0_4px_rgba(244,63,94,0.6)] border-rose-600" 
              : "bg-amber-400 shadow-[0_0_4px_rgba(251,191,36,0.6)] border-amber-500";
          }
          return <div key={i} className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${ledClass}`} />;
        })}
      </div>
    );
  };

  const DynamicStats = ({ stats, justify = 'justify-center' }) => {
    const excludedKeys = ['points', 'fouls'];
    const validStats = Object.entries(stats)
      .filter(([key, val]) => !excludedKeys.includes(key) && val > 0)
      .map(([key, val]) => ({ label: key.substring(0, 3).toUpperCase(), val }));

    if (validStats.length === 0) return null;

    return (
      <div className={`flex gap-1 text-[8px] md:text-[9px] font-black text-slate-600 leading-none flex-wrap ${justify} mt-1.5 w-full`}>
        {validStats.map(s => (
          <span key={s.label} className="bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-200 shadow-sm">
            {s.val}{s.label[0]}
          </span>
        ))}
      </div>
    );
  };

  if (isSettingStarters) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 h-full flex flex-col">
        <h3 className={`text-xl font-black uppercase tracking-widest mb-4 ${colorClass}`}>{title}</h3>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 overflow-y-auto pr-1 pb-4">
          {sortedRoster.map(player => {
            const isSelected = tempStarters.has(player.id);
            return (
              <button
                key={player.id}
                onClick={() => onPlayerClick(player, teamId)}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                  isSelected ? `${colorClass.replace('text-', 'bg-').replace('600', '50')} ${colorClass.replace('text-', 'border-').replace('600', '500')} shadow-md scale-105` 
                             : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-white ${isSelected ? colorClass.replace('text-', 'bg-').replace('600', '500') : 'bg-slate-300'}`}>
                  {player.number}
                </div>
                <div className="flex-1 font-bold truncate text-sm text-slate-800">{player.name}</div>
                {isSelected && <CheckCircle2 className={`w-5 h-5 ${colorClass}`} />}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const onCourtPlayers = sortedRoster.filter(p => onCourtIds?.has(p.id));
  const benchPlayers = sortedRoster.filter(p => !onCourtIds?.has(p.id));

  const renderPlayerCard = (player, isOnCourt) => {
    const isSelected = selectedPlayerId === player.id;
    const stats = playerStats[player.id] || { points: 0, fouls: 0 };
    const pTime = playingTimes[player.id] || 0;
    const isFouledOut = maxFouls > 0 && stats.fouls >= maxFouls;
    
    const isSubbingOut = subSelection?.out?.includes(player.id);
    const isSubbingIn = subSelection?.in?.includes(player.id);
    const isSubMode = pendingAction?.type === 'sub';

    const isRestrictedForBench = !isOnCourt && pendingAction && !['sub', 'foul'].includes(pendingAction.type);
    const isDisabled = isFouledOut || isRestrictedForBench;

    let baseStyle = "relative flex flex-col justify-between p-2 rounded-xl border-2 transition-all bg-white w-full shadow-sm ";
    let activeStyle = isSelected 
      ? "ring-4 ring-amber-400/50 border-amber-500 bg-amber-50 scale-105 z-10 " 
      : "border-slate-200 hover:border-slate-300 hover:shadow-md active:scale-95 ";

    if (isFouledOut) {
      baseStyle += "opacity-50 grayscale ";
      activeStyle = "border-red-200 bg-red-50 cursor-not-allowed ";
    } else if (isRestrictedForBench) {
      baseStyle += "opacity-40 ";
      activeStyle = "border-slate-200 bg-slate-50 cursor-not-allowed ";
    } else if (isSubMode) {
      if (isSubbingOut) activeStyle = "border-rose-500 bg-rose-50 ring-2 ring-rose-300/50 ";
      if (isSubbingIn) activeStyle = "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-300/50 ";
    }

    return (
      <button
        key={player.id}
        onClick={() => !isDisabled && onPlayerClick(player, teamId)}
        disabled={isDisabled}
        className={`${baseStyle} ${activeStyle} ${isOnCourt ? 'h-[120px] md:h-[130px]' : 'flex-row h-16 items-center'}`}
      >
        {isSubbingOut && <LogOut className="absolute top-1 right-1 w-4 h-4 text-rose-500 font-black" />}
        {isSubbingIn && <LogIn className="absolute top-1 right-1 w-4 h-4 text-emerald-500 font-black" />}

        {isOnCourt ? (
          // --- LAYOUT TERRAIN (Vertical) ---
          <>
            <div className="flex justify-between items-start w-full">
              <div className={`w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center font-black text-white text-sm shrink-0 shadow-inner ${colorClass.replace('text-', 'bg-')}`}>
                {player.number}
              </div>
              <div className="flex flex-col items-end">
                <span className="text-emerald-500 font-black text-xl md:text-2xl leading-none tracking-tighter">
                  {stats.points}
                </span>
                <div className="flex items-center gap-0.5 mt-1 text-slate-400">
                  <Clock className="w-2.5 h-2.5" />
                  <span className="text-[12px] font-mono tracking-tighter leading-none">
                    {formatPT(pTime)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex-1 flex items-center justify-center w-full px-1 overflow-hidden">
              <span className="font-black text-[10px] md:text-xs uppercase tracking-tighter truncate text-slate-800">
                {player.name}
              </span>
            </div>
            
            <div className="flex flex-col items-center w-full pb-0.5">
              <FoulLEDs currentFouls={stats.fouls} />
              <DynamicStats stats={stats} justify="justify-center" />
            </div>
          </>
        ) : (
          // --- LAYOUT BANC (Horizontal) ---
          <>
            <div className="flex items-center flex-1 min-w-0 h-full">
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center font-black text-slate-400 bg-slate-200 shrink-0 text-sm shadow-inner">
                {player.number}
              </div>
              <div className="flex flex-col items-start justify-center ml-3 flex-1 min-w-0">
                <div className="flex items-center gap-1.5 w-full">
                  <span className="font-black text-[10px] md:text-xs uppercase truncate text-slate-800">
                    {player.name}
                  </span>
                  <div className="flex items-center gap-0.5 text-slate-400 shrink-0">
                    <Clock className="w-2 h-2 md:w-2.5 md:h-2.5" />
                    <span className="text-[8px] md:text-[12px] font-mono leading-none">
                      {formatPT(pTime)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-1 w-full">
                  <FoulLEDs currentFouls={stats.fouls} />
                  <DynamicStats stats={stats} justify="justify-start" />
                </div>
              </div>
            </div>
            <div className="text-emerald-500 font-black text-xl md:text-2xl pl-2 tracking-tighter shrink-0 border-l border-slate-100 ml-2">
              {stats.points}
            </div>
          </>
        )}

        {/* OVERLAY D'ACTIONS (Popover de tir/faute) */}
        {isSelected && pendingAction?.outcomes && (
          <div className="absolute top-0 left-0 w-full h-full bg-slate-900/95 flex flex-col justify-center items-center gap-1 z-20 rounded-xl p-1.5 animate-in zoom-in-95 duration-150">
            {pendingAction.outcomes.map(outcome => (
              <button
                key={outcome.suffix}
                onClick={(e) => { e.stopPropagation(); onActionOutcome(player, teamId, outcome); }}
                className={`w-full py-1.5 text-[10px] md:text-xs font-black uppercase tracking-widest rounded transition-colors ${
                  outcome.points > 0 ? 'text-emerald-400 hover:bg-emerald-500 hover:text-white' : 'text-rose-400 hover:bg-rose-500 hover:text-white'
                }`}
              >
                {outcome.label}
              </button>
            ))}
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50 rounded-2xl border border-slate-200 p-3 shadow-sm min-w-0">
      <div className="flex items-center justify-between mb-3 pl-1 shrink-0">
        <h3 className={`text-base md:text-lg font-black uppercase tracking-widest truncate ${colorClass}`}>{title}</h3>
      </div>

      {/* Grille Terrain */}
      <div 
        className="grid gap-2 md:gap-2.5 mb-4 shrink-0"
        style={{ gridTemplateColumns: `repeat(${playersOnCourt}, minmax(0, 1fr))` }}
      >
        {onCourtPlayers.map(p => renderPlayerCard(p, true))}
        {Array.from({ length: Math.max(0, playersOnCourt - onCourtPlayers.length) }).map((_, i) => (
          <div key={`empty-${i}`} className="h-[120px] md:h-[130px] border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 flex flex-col items-center justify-center opacity-50">
             <div className="w-8 h-8 rounded-full bg-slate-200 mb-2 shadow-inner"></div>
            <span className="text-[7px] md:text-[8px] font-black text-slate-400 uppercase tracking-widest">Vide</span>
          </div>
        ))}
      </div>

      {/* Zone Banc */}
      <div className="flex-1 overflow-y-auto pr-1">
        <div className="flex items-center gap-2 mb-3 pl-1 sticky top-0 bg-slate-50/90 py-1 z-10 backdrop-blur-sm">
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest bg-slate-200/80 px-2 py-0.5 rounded-md border border-slate-300/50">
            Sur le banc ({benchPlayers.length})
          </span>
          <div className="flex-1 h-px bg-slate-200"></div>
        </div>
        <div className="grid grid-cols-2 gap-2 pb-10">
          {benchPlayers.map(p => renderPlayerCard(p, false))}
        </div>
      </div>
    </div>
  );
}