import * as React from 'react';
import { useState } from 'react';
import { Sidebar, Topbar } from '@swish/ui';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Trophy, 
  User, 
  LayoutDashboard, 
  Users, 
  Mail, 
  ArrowLeftRight 
} from 'lucide-react';

export default function PlayerLayout({ children, user, logout }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Définir les menus spécifiques au joueur
  const menuItems = [
    { 
      id: '/dashboard', 
      label: 'Tableau de bord', 
      icon: <LayoutDashboard size={20} /> 
    },
    { 
      id: '/tournaments', 
      label: 'Explorer les tournois', 
      icon: <Trophy size={20} /> 
    },
    { 
      id: '/my-teams', 
      label: 'Mes Équipes', 
      icon: <Users size={20} /> 
    },
    { 
      id: '/invitations', 
      label: 'Invitations', 
      icon: <Mail size={20} /> 
      // Plus tard, on pourra ajouter : badge: invitationsCount
    },
    { 
      id: '/profile', 
      label: 'Mon Profil', 
      icon: <User size={20} /> 
    },
  ];

  // 2. Définir le bouton "Context Switcher"
  const isOrganizer = true; 
  const SwitcherButton = isOrganizer ? (
    <a 
      href="http://localhost:5173" 
      className="flex items-center justify-center gap-2 w-full py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all text-sm font-semibold shadow-md"
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
          currentTabTitle={menuItems.find(m => m.id === location.pathname)?.label || "Espace Joueur"} 
          user={user} 
          toggleMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="w-full max-w-[1920px] mx-auto h-full pb-20 md:pb-0"> 
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}