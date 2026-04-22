import React, { useState } from 'react';

export function KanbanBoard({ 
  columns,          // Un tableau qui définit les colonnes (id, titre, couleurs)
  items,            // Les données brutes (tournois, licences, joueurs...)
  onStatusChange,   // La fonction pour sauvegarder dans Supabase
  isReadOnly = false, // Mode joueur (true) ou admin (false)
  renderCard        // La fonction qui dessine la carte spécifique (TournamentCard, LicenseCard...)
}) {
  const [draggedId, setDraggedId] = useState(null);

  const handleDragStart = (e, itemId) => {
    if (isReadOnly) return;
    e.dataTransfer.setData('itemId', itemId);
    setDraggedId(itemId);
  };

  const handleDragOver = (e) => {
    if (isReadOnly) return;
    e.preventDefault(); 
  };

  const handleDrop = (e, newStatus) => {
    if (isReadOnly) return;
    e.preventDefault();
    const itemId = e.dataTransfer.getData('itemId');
    if (itemId && onStatusChange) {
      onStatusChange(itemId, newStatus);
    }
    setDraggedId(null);
  };

  return (
    <div className="flex flex-1 gap-6 overflow-x-auto pb-4 min-h-[600px] no-scrollbar xl:justify-center">
      {columns.map(column => {
        // On cherche les items qui appartiennent à cette colonne
        const columnItems = items.filter(item => (item.status || 'draft') === column.id);

        return (
          <div 
            key={column.id}
            className={`flex-none w-95 rounded-xl border-2 flex flex-col ${column.bgColor} ${column.borderColor}`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* EN-TÊTE DE LA COLONNE */}
            <div className="p-3 border-b border-inherit bg-white/50 rounded-t-xl font-bold text-slate-700 flex justify-between items-center backdrop-blur-sm">
              <span>{column.title}</span>
              <span className="bg-white text-xs px-2 py-1 rounded-full shadow-sm">{columnItems.length}</span>
            </div>

            {/* LISTE DES CARTES */}
            <div className="flex-1 p-3 space-y-3 overflow-y-auto">
              {columnItems.map(item => (
                <div 
                  key={item.id}
                  draggable={!isReadOnly}
                  onDragStart={(e) => handleDragStart(e, item.id)}
                  onDragEnd={() => setDraggedId(null)}
                  className={`transition-opacity ${!isReadOnly ? 'cursor-grab active:cursor-grabbing' : ''} ${draggedId === item.id ? 'opacity-40' : 'opacity-100'}`}
                >
                  {/* ✅ LA CARTE PEUT MAINTENANT RECEVOIR LES CLICS */}
                  <div>
                    {renderCard(item)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}