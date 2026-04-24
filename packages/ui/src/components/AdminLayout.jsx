import * as React from 'react';
import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ArrowLeftRight } from 'lucide-react'; // 👈 NOUVEAU : l'icône du bouton

export function AdminLayout({ 
  appName = "Swish OS", 
  appIcon = "🏢", 
  user, 
  logout, 
  menuItems = [], 
  activeTab, 
  setActiveTab, 
  children 
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const currentTab = menuItems.find(item => item.id === activeTab);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

  // 👇 NOUVEAU : Le bouton pour retourner à l'espace Joueur
  // J'ai adapté les couleurs (bg-slate-800) pour qu'il s'intègre parfaitement
  // sur le fond sombre de ta Sidebar existante (bg-slate-900).
  const BackToPlayerButton = (
    <a 
      href="http://localhost:5174" // Assure-toi que c'est bien le port de ton app joueur
      className="flex items-center justify-center gap-2 w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:border-slate-600 rounded-lg transition-all text-sm font-semibold shadow-sm"
    >
      <ArrowLeftRight className="w-4 h-4" />
      Mode Joueur
    </a>
  );

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 overflow-hidden">
      
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <Sidebar 
        appName={appName} 
        appIcon={appIcon} 
        menuItems={menuItems} 
        activeTab={activeTab} 
        handleTabChange={handleTabChange} 
        logout={logout} 
        isOpen={isMobileMenuOpen}
        footerContent={BackToPlayerButton} // 👈 NOUVEAU : On injecte le bouton ici !
      />

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <Topbar 
          currentTabTitle={currentTab?.label} 
          user={user} 
          toggleMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        {/* ✅ C'EST ICI QUE TOUT CHANGE */}
        {/* On ajoute flex flex-col pour que la zone prenne 100% de la hauteur */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col">
          
          {/* ✅ NOUVELLE LARGEUR : max-w-[1600px] au lieu de 5xl. 
              mx-auto garantit que tout restera parfaitement centré sur les très grands écrans. 
              flex-1 pousse le contenu jusqu'en bas. */}
          <div className="w-full max-w-[1600px] mx-auto flex-1 flex flex-col pb-20 md:pb-0">
            {children}
          </div>
          
        </div>
      </main>
    </div>
  );
}