import React from 'react';
import { CheckCircle2, LogOut, LogIn } from 'lucide-react';

export function TeamRosterPanel({ 
  title, roster, teamId, pendingAction, 
  selectedPlayerId, onPlayerClick, onShotResult, colorClass,
  isSettingStarters, tempStarters, onCourtIds, 
  subSelection, onActionOutcome,
  playerStats = {}, maxFouls
}) {
  
  const onCourtPlayers = roster.filter(p => onCourtIds?.has(p.id));
  const benchPlayers = roster.filter(p => !onCourtIds?.has(p.id));

  const isSubMode = pendingAction?.type === 'sub';

  // 👇 CORRECTION ICI : On utilise un mot-clé au lieu d'un booléen
  const renderPlayer = (player, playerStatus = 'court') => {
    // On déduit proprement si le joueur est sur le banc
    const isBench = playerStatus === 'bench';
    const status = isBench ? 'bench' : 'court';
    
    // --- 1. STATS DU JOUEUR ---
    const stats = playerStats[player.id] || { points: 0, fouls: 0 };
    const hasFouledOut = maxFouls && stats.fouls >= maxFouls;

    // --- 2. LOGIQUE D'EXCLUSION ---
    const isExcluded = hasFouledOut && !isSettingStarters;
    const canOnlyBeSubbedOut = isExcluded && !isBench && pendingAction?.type === 'sub';
    const isClickDisabled = isExcluded && !canOnlyBeSubbedOut; 
    
    const isSelectedForOutcome = selectedPlayerId === player.id;
    
    const isSelectedToOut = subSelection?.out?.includes(player.id);
    const isSelectedToIn = subSelection?.in?.includes(player.id);

    let style = "";
    let icon = null;

    if (isSettingStarters) {
      // --- MODE 1 : SÉLECTION DU 5 MAJEUR ---
      const isSelectedStarter = tempStarters?.has(player.id);
      style = isSelectedStarter 
        ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500 font-bold" 
        : "border-slate-200 bg-white hover:bg-slate-50";
      if (isSelectedStarter) icon = <CheckCircle2 className="w-5 h-5 text-indigo-500" />;
      
    } else if (isSubMode) {
      // --- MODE 2 : REMPLACEMENT ---
      if (status === 'court') {
        style = isSelectedToOut 
          ? "border-red-500 bg-red-50 ring-2 ring-red-500 font-bold text-red-700" 
          : "border-slate-300 bg-white hover:bg-red-50 hover:border-red-300";
        if (isSelectedToOut) icon = <LogOut className="w-5 h-5 text-red-500" />;
      } else {
        style = isSelectedToIn 
          ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500 font-bold text-emerald-700" 
          : "border-slate-300 bg-white hover:bg-emerald-50 hover:border-emerald-300";
        if (isSelectedToIn) icon = <LogIn className="w-5 h-5 text-emerald-500" />;
      }
    } else {
      // --- MODE 3 : MATCH NORMAL ---
      if (status === 'court') {
        style = isSelectedForOutcome
          ? "border-slate-800 bg-slate-900 text-white" 
          : pendingAction 
            ? "border-slate-300 bg-white hover:border-slate-800 shadow-sm" 
            : "border-slate-200 bg-white opacity-80";
      } else {
        style = "opacity-40 bg-slate-50 grayscale cursor-not-allowed border-slate-100";
      }
    }

    if (isExcluded && !isSelectedToOut) {
      style += " opacity-50 grayscale";
    }

    // --- 3. BLOCAGE GLOBAL ---
    const baseIsDisabled = isSettingStarters 
      ? false 
      : selectedPlayerId 
        ? !isSelectedForOutcome 
        : !pendingAction 
          ? true 
          : (!isSubMode && status === 'bench'); // Maintenant status est bien calculé !

    const isDisabled = baseIsDisabled || isClickDisabled;

    return (
      <div key={player.id} className="relative overflow-hidden rounded-xl mb-2">
        <button 
          disabled={isDisabled}
          onClick={() => onPlayerClick(player, teamId)}
          className={`w-full flex items-center justify-between p-3 border transition-all text-left ${style}`}
        >
          {/* BLOC DE GAUCHE : Nom + Stats conditionnelles */}
          <div className="flex flex-col">
            <span className="font-bold flex items-center gap-2">
              {player.name}
              {icon}
            </span>
            
            {/* LIGNE DE STATISTIQUES */}
            {!isSettingStarters && (
              <div className="flex flex-wrap items-center gap-2 mt-1 text-[10px] font-black uppercase">
                <span className={status === 'bench' ? 'text-slate-400' : 'text-slate-700'}>
                  {stats.points} PTS
                </span>
                {/* On affiche le reste que si c'est > 0 ! */}
                {stats.ast > 0 && <span className="text-slate-400">{stats.ast} AST</span>}
                {stats.reb > 0 && <span className="text-slate-400">{stats.reb} REB</span>}
                {stats.stl > 0 && <span className="text-slate-400">{stats.stl} STL</span>}
                {stats.blk > 0 && <span className="text-slate-400">{stats.blk} BLK</span>}
              </div>
            )}
          </div>
          
          {/* BLOC DE DROITE : Jauges de Fautes + Label Action */}
          <div className="flex flex-col items-end justify-center gap-1">
            
            {/* Les petites cases de fautes (façon tableau d'affichage) */}
            {!isSettingStarters && maxFouls > 0 && (
              <div className="flex gap-[2px]">
                {Array.from({ length: maxFouls }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-1.5 h-3 rounded-[1px] ${
                      i < stats.fouls 
                        ? 'bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]' // Si faute -> Rouge brillant
                        : 'bg-slate-200/50' // Si vide -> Gris transparent
                    }`} 
                  />
                ))}
              </div>
            )}

            {/* Label Action en cours */}
            {!isSettingStarters && !isSubMode && pendingAction && !selectedPlayerId && status === 'court' && !isClickDisabled && (
              <span className="text-[10px] font-black uppercase opacity-30 mt-1">Toucher</span>
            )}
          </div>
        </button>

        {/* BADGE D'EXCLUSION */}
        {hasFouledOut && (
          <div className="absolute top-0 right-0 bg-red-600 text-white text-[8px] font-black px-2 py-1 rounded-bl-xl z-10 shadow-sm">
            EXCLU
          </div>
        )}

        {/* AFFICHAGE DYNAMIQUE DES RÉSULTATS (OUTCOMES) */}
        {!isSettingStarters && isSelectedForOutcome && pendingAction?.outcomes && (
          <div className="absolute inset-0 flex p-1 bg-slate-900 animate-in fade-in zoom-in duration-200 gap-1 z-20">
            {pendingAction.outcomes.map(outcome => (
              <button 
                key={outcome.suffix}
                onClick={(e) => {
                  e.stopPropagation(); 
                  onActionOutcome(player, teamId, outcome);
                }}
                className={`flex-1 ${outcome.color} hover:brightness-110 text-white rounded-lg font-black text-[11px] uppercase transition-all`}
              >
                {outcome.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-slate-100/50 rounded-2xl p-5 shadow-inner border border-slate-200">
      <h3 className={`font-black text-xl mb-4 uppercase ${colorClass}`}>{title}</h3>
      
      {isSettingStarters ? (
        <div className="space-y-1">
          {roster.map(p => renderPlayer(p, 'initial'))}
        </div>
      ) : (
        <>
          <div className="mb-6">
            <h4 className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest flex items-center gap-1">
              🏀 Terrain ({onCourtPlayers.length})
            </h4>
            {/* Les appels ici fonctionnent maintenant parfaitement */}
            <div>{onCourtPlayers.map(p => renderPlayer(p, 'court'))}</div>
          </div>
          <div>
            <h4 className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest flex items-center gap-1">
              🪑 Banc ({benchPlayers.length})
            </h4>
            <div>{benchPlayers.map(p => renderPlayer(p, 'bench'))}</div>
          </div>
        </>
      )}
    </div>
  );
}