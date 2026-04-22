import React from 'react';

// On reçoit l'objet 'tournament' complet
export function TournamentCard({ tournament }) {
  // On extrait les valeurs avec les noms exacts de ta base de données Supabase
  const { name, sport_id, status, start_date, location, entry_fee, entry_fee_currency } = tournament;

  // Traduction et couleur du statut
  const getStatusBadge = (currentStatus) => {
    switch (currentStatus) {
      case 'draft': 
        return { label: 'Brouillon', color: 'bg-slate-100 text-slate-700 border-slate-200' };
      case 'open': 
        return { label: 'Inscriptions', color: 'bg-green-100 text-green-700 border-green-200' };
      case 'live': 
        return { label: 'En cours', color: 'bg-orange-100 text-orange-700 border-orange-200' };
      case 'finished': 
        return { label: 'Terminé', color: 'bg-blue-100 text-blue-700 border-blue-200' };
      default: 
        return { label: currentStatus || 'Inconnu', color: 'bg-slate-100 text-slate-700' };
    }
  };

  const badge = getStatusBadge(status);
  
  // Formatage de la date à la française
  const formattedDate = start_date 
    ? new Date(start_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Date à définir';

  return (
    <div className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between h-full">
      
      <div>
        <div className="flex justify-between items-start mb-4 gap-2">
          <div>
            {/* Le nom du tournoi */}
            <h3 className="font-bold text-lg text-slate-900 leading-tight">{name || 'Tournoi sans nom'}</h3>
            {/* Le sport et le lieu */}
            <p className="text-sm text-slate-500 capitalize mt-1">
              {sport_id || 'Sport inconnu'} • {location || 'Lieu à définir'}
            </p>
          </div>
          {/* Le badge de statut */}
          <span className={`text-xs font-bold px-2 py-1 rounded-md border whitespace-nowrap ${badge.color}`}>
            {badge.label}
          </span>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-slate-600 font-medium">
          <span>📅</span> {formattedDate}
        </div>
        
        {/* Affichage du prix si renseigné */}
        {entry_fee > 0 && (
          <div className="font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded-md">
            {entry_fee} {entry_fee_currency === 'EUR' ? '€' : entry_fee_currency}
          </div>
        )}
      </div>
      
    </div>
  );
}