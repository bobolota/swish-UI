import React from 'react';
import { PaymentStatusToggle } from '@swish/ui';
import { ChevronRight } from 'lucide-react'; // Si tu as lucide-react

export function TeamCard({ team, onPaymentChange, onClick }) {
  if (!team) return null;

  const { 
    id,
    name = "Équipe sans nom", 
    captainName = "Capitaine inconnu", 
    hasPaid = false 
  } = team || {};

  // 2. Sécurité : si on n'a pas d'ID, on ne peut pas cliquer
  const handleClick = () => {
    if (id && onClick) {
      onClick();
    }
  };

  return (
    <div 
      onClick={onClick}
      className="group bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md hover:border-blue-200 transition-all relative overflow-hidden cursor-pointer"
    >
      {/* Barre de couleur latérale */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${hasPaid ? 'bg-green-500' : 'bg-amber-400'}`} />
      
      <div className="flex items-start justify-between pl-2">
        <div className="pr-2 truncate">
          <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate">
            {name}
          </h3>
          
          <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
            <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 border border-slate-200">
              {captainName.charAt(0).toUpperCase()}
            </div>
            <span className="truncate">{captainName}</span>
          </div>
        </div>

        {/* Le PaymentStatusToggle doit avoir un e.stopPropagation() dans son code 
            pour ne pas déclencher le onClick de la carte quand on gère le paiement */}
        <PaymentStatusToggle 
          isPaid={hasPaid} 
          onChange={(newVal) => onPaymentChange(id, newVal)} 
        />
      </div>

      {/* Petit indicateur discret en bas */}
      <div className="mt-4 pl-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-blue-400 transition-colors">
        <span>Gérer l'effectif</span>
        <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
      </div>
    </div>
  );
}