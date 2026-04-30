import React from 'react';
import { X, Check, Crosshair, Shield, AlertTriangle, RefreshCw } from 'lucide-react';

export function CommandCenter({
  actions = [],
  pendingAction,
  canConfirmSub,
  onActionSelect,
  onCancel,
  onConfirmSub
}) {

  if (pendingAction) {
    // --- MODE REMPLACEMENT ---
    if (pendingAction.type === 'sub') {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-slate-800 text-white rounded-2xl p-6 border-4 border-slate-700 shadow-xl">
          <RefreshCw className="w-10 h-10 text-slate-400 mb-4 animate-spin-slow" />
          <h3 className="text-xl font-black uppercase tracking-widest mb-2">Remplacement</h3>
          <p className="text-slate-400 text-sm font-bold text-center mb-6">
            Sélectionnez les joueurs qui entrent et sortent.
          </p>
          <div className="flex gap-4 w-full">
            <button onClick={onCancel} className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-black uppercase tracking-widest text-xs transition-colors border-b-4 border-slate-900">
              Annuler
            </button>
            <button 
              onClick={onConfirmSub} 
              disabled={!canConfirmSub}
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:border-slate-800 disabled:text-slate-500 rounded-xl font-black uppercase tracking-widest text-xs transition-colors border-b-4 border-emerald-800 flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" /> Valider
            </button>
          </div>
        </div>
      );
    }

    // --- MODE PASSE DÉCISIVE ---
    if (pendingAction.type === 'assist_selection') {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-slate-800 text-white rounded-2xl p-6 border-4 border-emerald-600 shadow-xl animate-in fade-in zoom-in-95 duration-200">
          <h3 className="text-xl font-black uppercase tracking-widest mb-2 text-emerald-400">
            Passe Décisive ?
          </h3>
          <p className="text-slate-300 text-sm font-bold text-center mb-8 bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-700">
            👉 Cliquez sur le passeur de <span className="text-emerald-400">{pendingAction.teamName}</span>.
          </p>
          <button onClick={onCancel} className="w-full py-4 bg-slate-700 hover:bg-slate-600 rounded-xl font-black uppercase tracking-widest text-sm transition-colors border-b-4 border-slate-900 active:scale-95 text-slate-300">
            Aucune passe (Iso/Rebond)
          </button>
        </div>
      );
    }

    // --- MODE ACTION STANDARD ---
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-800 text-white rounded-2xl p-6 border-4 border-slate-700 shadow-xl">
        <h3 className="text-xl font-black uppercase tracking-widest mb-2 text-amber-400">
          {pendingAction.label || pendingAction.type}
        </h3>
        <p className="text-slate-300 text-sm font-bold text-center mb-8 bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-700">
          👉 Cliquez sur un joueur pour attribuer l'action.
        </p>
        <button onClick={onCancel} className="w-full py-4 bg-slate-700 hover:bg-slate-600 rounded-xl font-black uppercase tracking-widest text-sm transition-colors border-b-4 border-slate-900 active:scale-95 flex items-center justify-center gap-2">
          <X className="w-5 h-5 text-rose-400" /> Annuler l'action
        </button>
      </div>
    );
  }

  const visibleActions = actions.filter(a => a.type !== 'assist');

  const scoring = visibleActions.filter(a => a.type.includes('pt') || a.type.includes('free_throw'));
  const possession = visibleActions.filter(a => ['off_rebound', 'def_rebound', 'steal', 'block'].includes(a.type));
  const penalties = visibleActions.filter(a => ['foul', 'turnover'].includes(a.type));
  const tactical = visibleActions.filter(a => a.type === 'sub');

  const ActionButton = ({ action, colorClass, borderClass }) => (
    <button
      onClick={() => onActionSelect(action)}
      className={`relative w-full h-16 flex items-center justify-center rounded-xl shadow-md transition-all active:scale-95 border-b-4 text-white font-black uppercase tracking-widest text-xs md:text-sm ${colorClass} ${borderClass}`}
    >
      {action.label}
    </button>
  );

  return (
    <div className="flex flex-col gap-4 h-full bg-slate-200/50 p-3 rounded-2xl overflow-y-auto border border-slate-200">
      
      {/* SECTION 1 : SCORING (Vert Intense) */}
      {scoring.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-slate-500 pl-1">
            <Crosshair className="w-4 h-4" /> <span className="text-[10px] font-black uppercase tracking-widest">Attaque</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {scoring.map(action => (
              <ActionButton 
                key={action.type} 
                action={action} 
                colorClass="bg-emerald-600 hover:bg-emerald-500" 
                borderClass="border-emerald-800 hover:border-emerald-700" 
              />
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2 : POSSESSION ET DÉFENSE (Bleu Intense) */}
      {possession.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-slate-500 pl-1">
            <Shield className="w-4 h-4" /> <span className="text-[10px] font-black uppercase tracking-widest">Défense & Balle</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {possession.map(action => (
              <ActionButton 
                key={action.type} 
                action={action} 
                colorClass="bg-blue-600 hover:bg-blue-500" 
                borderClass="border-blue-800 hover:border-blue-700" 
              />
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3 : PÉNALITÉS (Rouge Intense) & LOGISTIQUE (Gris Anthracite) */}
      <div className="grid grid-cols-2 gap-4">
        
        {penalties.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-500 pl-1">
              <AlertTriangle className="w-4 h-4" /> <span className="text-[10px] font-black uppercase tracking-widest">Fautes & Pertes</span>
            </div>
            <div className="flex flex-col gap-2">
              {penalties.map(action => (
                <ActionButton 
                  key={action.type} 
                  action={action} 
                  colorClass="bg-rose-600 hover:bg-rose-500" 
                  borderClass="border-rose-800 hover:border-rose-700" 
                />
              ))}
            </div>
          </div>
        )}

        {tactical.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-500 pl-1">
              <RefreshCw className="w-4 h-4" /> <span className="text-[10px] font-black uppercase tracking-widest">Équipe</span>
            </div>
            <div className="flex flex-col gap-2">
              {tactical.map(action => (
                <ActionButton 
                  key={action.type} 
                  action={action} 
                  colorClass="bg-slate-700 hover:bg-slate-600" 
                  borderClass="border-slate-900 hover:border-slate-800" 
                />
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}