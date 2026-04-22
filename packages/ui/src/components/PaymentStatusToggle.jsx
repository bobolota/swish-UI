import React from 'react';
import { Button } from './button';
import { Check, CreditCard, X } from 'lucide-react'; // Si tu as lucide-react, sinon utilise du texte

export function PaymentStatusToggle({ isPaid, onChange, disabled = false, size = "sm" }) {
  return (
    <Button
      variant={isPaid ? "default" : "outline"}
      size={size}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation(); // Évite de déclencher le clic de la carte parente
        onChange(!isPaid);
      }}
      className={`font-bold transition-all ${
        isPaid 
          ? "bg-green-600 hover:bg-green-700 text-white border-transparent" 
          : "text-slate-500 border-slate-200 hover:bg-slate-50"
      }`}
    >
      {isPaid ? (
        <span className="flex items-center gap-1.5">
          <Check className="w-3.5 h-3.5" /> Payé
        </span>
      ) : (
        <span className="flex items-center gap-1.5">
          <CreditCard className="w-3.5 h-3.5" /> À payer
        </span>
      )}
    </Button>
  );
}