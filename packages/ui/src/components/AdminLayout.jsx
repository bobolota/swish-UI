import * as React from 'react';
import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

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

  // Fonction pour changer d'onglet ET fermer le menu sur mobile
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 overflow-hidden">
      
      {/* LE FOND SOMBRE (OVERLAY) SUR MOBILE */}
      {/* Apparaît uniquement quand le menu est ouvert, et le ferme si on clique dessus */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* LA SIDEBAR (Maintenant intelligente : Glissante sur mobile, Fixe sur PC) */}
      <Sidebar 
        appName={appName} 
        appIcon={appIcon} 
        menuItems={menuItems} 
        activeTab={activeTab} 
        handleTabChange={handleTabChange} 
        logout={logout} 
        isOpen={isMobileMenuOpen}
      />

      {/* ZONE DE CONTENU PRINCIPALE */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <Topbar 
          currentTabTitle={currentTab?.label} 
          user={user} 
          toggleMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        {/* Le conteneur scrollable (avec ta fameuse classe no-scrollbar si tu veux) */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-5xl mx-auto pb-20 md:pb-0">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}