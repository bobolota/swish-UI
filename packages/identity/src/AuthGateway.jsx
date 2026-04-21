import React, { useState } from 'react';
import { useAuth } from "./useAuth";
import { useProfile } from './useProfile';
import { RegisterForm } from './RegisterForm';
import { ProfileForm } from './ProfileForm';
import { Card, CardHeader, CardTitle, CardContent, Input, Label, Button, Toaster } from '@swish/ui';
import { toast } from 'sonner';

export function AuthGateway({ children, appName = "Swish OS", appIcon = "🏀" }) {
  const { user, login } = useAuth();
  const { profile, loadingProfile } = useProfile(user?.id);
  const [showRegister, setShowRegister] = useState(false);

  // 1. SI NON CONNECTÉ : On affiche le Login ou le Register
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
        <Toaster richColors />
        {showRegister ? (
          <RegisterForm onSwitchToLogin={() => setShowRegister(false)} />
        ) : (
          <Card className="w-full max-w-md shadow-2xl border-0">
            <CardHeader className="text-center space-y-2">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center text-3xl">
                {appIcon}
              </div>
              <CardTitle className="text-2xl font-black">{appName}</CardTitle>
              <p className="text-slate-500 text-sm">Veuillez vous identifier pour continuer.</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={async (e) => { 
                e.preventDefault(); 
                const { error } = await login(e.target.email.value, e.target.password.value);
                if (error) toast.error("Identifiants incorrects");
                else toast.success("Connexion réussie !");
              }} className="space-y-4">
                <div className="space-y-2"><Label>Email</Label><Input name="email" type="email" required /></div>
                <div className="space-y-2"><Label>Mot de passe</Label><Input name="password" type="password" required /></div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Se connecter</Button>
              </form>
              <div className="mt-6 text-center">
                <button onClick={() => setShowRegister(true)} className="text-sm text-blue-600 font-bold hover:underline">
                  Pas encore de compte ? S'inscrire
                </button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // 2. SI CONNECTÉ MAIS PROFIL INCOMPLET : On force le ProfileForm
  // On attend que le profil charge pour éviter un clignotement
  if (loadingProfile) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-bold">Chargement de votre profil...</div>;
  }

  if (user && !profile?.first_name) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Toaster richColors />
        <Card className="w-full max-w-2xl shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-black text-center text-slate-800">Dernière étape ! 🚀</CardTitle>
            <p className="text-center text-slate-500">Complétez votre profil pour accéder à {appName}.</p>
          </CardHeader>
          <CardContent>
            <ProfileForm user={user} />
          </CardContent>
        </Card>
      </div>
    );
  }

  // 3. TOUT EST BON : On ouvre les portes de l'application !
  return children;
}