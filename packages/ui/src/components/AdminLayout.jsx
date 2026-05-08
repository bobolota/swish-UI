import * as React from 'react';
import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ArrowLeftRight } from 'lucide-react';

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

  const BackToPlayerButton = (
    <a 
      href="http://localhost:5174" 
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
        footerContent={BackToPlayerButton}
      />

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <Topbar 
          currentTabTitle={currentTab?.label} 
          user={user} 
          toggleMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        {/* ✅ LE LAYOUT FIXE LA LARGEUR ET LES MARGES ICI */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="w-full max-w-[1920px] mx-auto h-full pb-20 md:pb-0"> 
            {children}
          </div>
        </div>
        
      </main>
    </div>
  );
}