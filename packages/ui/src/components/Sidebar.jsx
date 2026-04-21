import * as React from 'react';
import { Button } from './button';

export function Sidebar({ appName, appIcon, menuItems, activeTab, handleTabChange, logout, isOpen }) {
  return (
    <aside 
      className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 md:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-black text-white flex items-center gap-2">
          <span>{appIcon}</span> {appName}
        </h1>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto no-scrollbar">
        {menuItems.map((item) => (
          <button 
            key={item.id}
            onClick={() => handleTabChange(item.id)} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
              activeTab === item.id 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            {/* Si tu as des icônes, elles s'affichent ici */}
            <span>{item.icon}</span> {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/20" 
          onClick={logout}
        >
          Déconnexion
        </Button>
      </div>
    </aside>
  );
}