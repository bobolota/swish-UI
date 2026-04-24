import React from 'react';

export function MatchControls({ children, title = "Contrôles du Match" }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm w-full">
      {title && <h3 className="text-lg font-bold text-slate-800 mb-4">{title}</h3>}
      {/* Une grille flexible pour s'adapter au nombre de boutons */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {children}
      </div>
    </div>
  );
}

// Le sous-composant "Bouton" agnostique
export function ScoreButton({ label, onClick, variant = 'default', disabled = false }) {
  const baseStyle = "py-4 px-4 rounded-xl font-black text-lg transition-all flex items-center justify-center w-full";
  
  const variants = {
    default: "bg-slate-100 hover:bg-slate-200 text-slate-800 active:bg-slate-300",
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md active:bg-indigo-800",
    danger: "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 active:bg-red-200",
    success: "bg-emerald-500 hover:bg-emerald-600 text-white shadow-md active:bg-emerald-700",
  };

  const disabledStyle = disabled ? "opacity-50 cursor-not-allowed transform-none hover:bg-inherit" : "hover:scale-[1.02] active:scale-95";

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${disabledStyle}`} 
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
}