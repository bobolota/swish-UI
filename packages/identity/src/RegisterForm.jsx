import * as React from 'react';
import { useState } from 'react';
import { useAuth } from "./useAuth";
import { toast } from 'sonner';
import { Button, Input, Label } from '@swish/ui';

export function RegisterForm({ onSwitchToLogin }) {
  const { signup } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.target);
    const { error } = await signup(
      formData.get('email'), 
      formData.get('password'), 
      formData.get('firstName'), 
      formData.get('lastName'), 
      formData.get('pseudo')
    );

    if (error) toast.error(`Erreur : ${error.message}`);
    else toast.success("Compte créé avec succès !");
    
    setIsSubmitting(false);
  };

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Rejoindre l'Arène</h2>
        <p className="text-slate-500 mt-2 text-sm">Crée ton profil joueur ou spectateur.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 space-y-1">
            <Label>Prénom</Label>
            <Input name="firstName" required placeholder="Michael" />
          </div>
          <div className="flex-1 space-y-1">
            <Label>Nom</Label>
            <Input name="lastName" required placeholder="Jordan" />
          </div>
        </div>

        <div className="space-y-1">
          <Label>Pseudo (Unique)</Label>
          <Input name="pseudo" required placeholder="AirJordan23" />
        </div>

        <div className="space-y-1 mt-4">
          <Label>Email</Label>
          <Input name="email" type="email" required placeholder="mj@bulls.com" />
        </div>

        <div className="space-y-1">
          <Label>Mot de passe</Label>
          <Input name="password" type="password" required minLength={6} placeholder="••••••••" />
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full mt-6 bg-slate-900 text-white">
          {isSubmitting ? "Création en cours..." : "Créer mon compte"}
        </Button>
      </form>

      {onSwitchToLogin && (
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500">
            Déjà inscrit ? <button onClick={onSwitchToLogin} className="text-blue-600 font-bold hover:underline">Connecte-toi</button>
          </p>
        </div>
      )}
    </div>
  );
}