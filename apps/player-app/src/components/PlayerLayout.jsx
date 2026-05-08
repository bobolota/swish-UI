import * as React from 'react';
import { useState } from 'react';
import { Sidebar, Topbar } from '@swish/ui';
import { useNavigate, useLocation } from 'react-router-dom';
import { Trophy, User, Home, ArrowLeftRight } from 'lucide-react';

export default function PlayerLayout({ children, user, logout }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Définir les menus spécifiques au joueur
  const menuItems = [
    { id: '/tournaments', label: 'Explorer', icon: <Trophy size={20} /> },
    { id: '/profile', label: 'Mon Profil', icon: <User size={20} /> },
  ];

  // 2. Définir le bouton "Context Switcher" (Stratégie 2)
  // On simule isOrganizer = true pour le test
  const isOrganizer = true; 
  const SwitcherButton = isOrganizer ? (
    <a 
      href="http://localhost:5173" 
      className="flex items-center justify-center gap-2 w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all text-sm font-semibold shadow-md"
    >
      <ArrowLeftRight className="w-4 h-4" />
      Espace Organisateur
    </a>
  ) : null;

  const handleTabChange = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 overflow-hidden">
      {/* Overlay Mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* On réutilise ta Sidebar du package UI */}
      <Sidebar 
        appName="Swish App" 
        appIcon="🏀" 
        menuItems={menuItems} 
        activeTab={location.pathname} 
        handleTabChange={handleTabChange} 
        logout={logout} 
        isOpen={isMobileMenuOpen}
        footerContent={SwitcherButton}
      />

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <Topbar 
          currentTabTitle="Espace Joueur" 
          user={user} 
          toggleMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
  <div className="w-full h-full"> {/* h-full optionnel selon ton design */}
    {children}
  </div>
</div>
      </main>
    </div>
  );
}