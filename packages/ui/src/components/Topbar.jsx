import * as React from 'react';
import { Avatar, AvatarFallback } from './avatar';

export function Topbar({ currentTabTitle, user, toggleMenu }) {
  return (
    <header className="bg-white border-b px-4 md:px-8 py-4 flex items-center justify-between shadow-sm z-10 shrink-0">
      <div className="flex items-center gap-3">
        {/* LE BOUTON HAMBURGER (Caché sur Desktop) */}
        <button 
          onClick={toggleMenu}
          className="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Ouvrir le menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>
          </svg>
        </button>

        <h2 className="text-xl md:text-2xl font-bold text-slate-800 capitalize">
          {currentTabTitle || "Tableau de bord"}
        </h2>
      </div>

      <div className="flex items-center gap-3">
         <span className="hidden md:inline-block text-sm font-medium text-slate-500">
           {user?.email || "Admin"}
         </span>
         <Avatar className="h-10 w-10 border-2 border-blue-100">
           <AvatarFallback className="bg-blue-600 text-white font-bold">
             {user?.email?.substring(0,2).toUpperCase() || "AD"}
           </AvatarFallback>
         </Avatar>
      </div>
    </header>
  );
}