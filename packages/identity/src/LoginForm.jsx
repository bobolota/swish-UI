import React, { useState } from 'react';
import { useAuth } from "./useAuth";
import { toast } from 'sonner';
import { Button, Input, Label, Card, CardHeader, CardTitle, CardContent } from '@swish/ui';

export function LoginForm({ onSwitchToRegister }) {
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.target);
    const { error } = await login(
      formData.get('email'), 
      formData.get('password')
    );

    if (error) {
      toast.error("Identifiants incorrects. Vérifie ton email ou ton mot de passe.");
    } else {
      toast.success("Bon retour sur le terrain !");
    }
    
    setIsSubmitting(false);
  };

  return (
    <Card className="w-full max-w-md shadow-2xl border-0">
      <CardHeader className="text-center space-y-2">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center text-3xl">
          🏀
        </div>
        <CardTitle className="text-2xl font-black text-slate-900 uppercase">Connexion</CardTitle>
        <p className="text-slate-500 text-sm">Prêt pour le prochain match ?</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label>Email</Label>
            <Input name="email" type="email" required placeholder="ton@email.com" />
          </div>

          <div className="space-y-1">
            <Label>Mot de passe</Label>
            <Input name="password" type="password" required placeholder="••••••••" />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full mt-4 bg-blue-600 text-white">
            {isSubmitting ? "Connexion..." : "Se connecter"}
          </Button>
        </form>

        <div className="mt-6 text-center border-t pt-4">
          <p className="text-sm text-slate-500">
            Pas encore de compte ? 
            <button 
              onClick={onSwitchToRegister} 
              className="ml-1 text-blue-600 font-bold hover:underline"
            >
              S'inscrire
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}