import React from 'react';
import { X, Check, RefreshCcw } from 'lucide-react';

export function CommandCenter({ 
  actions,          // 👈 Le tableau des boutons (injecté dynamiquement)
  pendingAction,    // L'action cliquée
  canConfirmSub,    // Booléen pour activer la validation du remplacement
  onActionSelect,   // Fonction déclenchée au clic sur un bouton d'action
  onCancel,         // Fonction pour la croix d'annulation
  onConfirmSub      // Fonction pour valider un remplacement
}) {
  
  // Le composant filtre lui-même les actions reçues pour les ranger
  const primaryActions = actions.filter(a => a.category === 'primary' || a.category === 'system');
  const secondaryActions = actions.filter(a => a.category === 'secondary');

  return (
    <div className="bg-slate-900 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      
      {/* 1. TITRE DYNAMIQUE */}
      <h3 className="text-white font-bold mb-6 uppercase tracking-widest text-sm text-center text-slate-400">
        {pendingAction?.type === 'sub' ? 'REMPLACEMENT : SORTANTS & ENTRANTS' :
         pendingAction ? `ACTION : ${pendingAction.label}` : '1. SÉLECTIONNEZ UNE ACTION'}
      </h3>
      
      {/* 2. GROS BOUTONS PRINCIPAUX */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {primaryActions.map(action => (
          <button
            key={action.type}
            onClick={() => onActionSelect(action)}
            className={`px-6 py-4 rounded-xl font-bold text-white transition-all shadow-lg active:scale-95 ${
              pendingAction?.type === action.type ? `${action.color} ring-4 ring-white` : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            {action.type === 'sub' && <RefreshCcw className="inline w-5 h-5 mr-2 -mt-1" />}
            {action.label}
          </button>
        ))}
      </div>

      {/* 3. PETITS BOUTONS SECONDAIRES */}
      {secondaryActions.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 pt-6 border-t border-slate-700/50">
          {secondaryActions.map(action => (
            <button
              key={action.type}
              onClick={() => onActionSelect(action)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-tight transition-all active:scale-95 ${
                pendingAction?.type === action.type ? `${action.color} text-white shadow-md` : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}

      {/* 4. ZONE DES VALIDATIONS ET ANNULATIONS (En haut à droite) */}
      {pendingAction && (
        <div className="absolute top-4 right-4 flex gap-2">
          {pendingAction.type === 'sub' && canConfirmSub && (
            <button onClick={onConfirmSub} className="bg-emerald-500 hover:bg-emerald-400 text-white flex items-center gap-1 text-sm font-bold py-1 px-3 rounded-md shadow-lg transition-colors">
              <Check className="w-4 h-4"/> VALIDER L'ÉCHANGE
            </button>
          )}
          <button onClick={onCancel} className="text-slate-400 hover:text-white flex items-center gap-1 text-sm font-bold bg-slate-800/80 py-1 px-3 rounded-md transition-colors">
            <X className="w-4 h-4"/> ANNULER
          </button>
        </div>
      )}
    </div>
  );
}