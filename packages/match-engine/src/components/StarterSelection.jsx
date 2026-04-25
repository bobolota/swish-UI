import React from 'react';

export function StarterSelection({ 
  canStartMatch, 
  onConfirm, 
  homeSelectedCount, 
  awaySelectedCount,
  maxPlayers // 👈 NOUVEAU PARAMÈTRE
}) {
  return (
    <div className="bg-slate-900 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      <div className="py-4 text-center">
        <h3 className="text-white font-black text-xl mb-2">
          SÉLECTION DES TITULAIRES
        </h3>
        <p className="text-slate-400 text-sm mb-6">
          Cliquez sur les titulaires ({maxPlayers} par équipe) puis validez.
        </p>
        <button 
          disabled={!canStartMatch}
          onClick={onConfirm}
          className={`px-8 py-4 rounded-xl font-black shadow-lg transition-all ${
            canStartMatch 
              ? 'bg-indigo-500 hover:bg-indigo-400 text-white active:scale-95' 
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
          }`}
        >
          {canStartMatch 
            ? 'VALIDER ET DÉMARRER' 
            : `SÉLECTIONNEZ LES JOUEURS (${homeSelectedCount}/${maxPlayers} DOM - ${awaySelectedCount}/${maxPlayers} EXT)`}
        </button>
      </div>
    </div>
  );
}