import React, { useState } from 'react';
import { useAuth } from "./useAuth";
import { useProfile } from './useProfile';
import { RegisterForm } from './RegisterForm';
import { LoginForm } from './LoginForm'; // Import du nouveau Lego
import { ProfileForm } from './ProfileForm';
import { Card, CardHeader, CardTitle, CardContent, Toaster } from '@swish/ui'; // Nettoyage des imports inutilisés (Input, Label, Button)

export function AuthGateway({ children, appName = "Swish OS", appIcon = "🏀" }) {
  // Plus besoin d'importer 'login' ici, c'est LoginForm qui s'en charge
  const { user } = useAuth();
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
          <LoginForm onSwitchToRegister={() => setShowRegister(true)} />
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