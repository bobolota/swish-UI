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

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

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