// Composant : TournamentCard.jsx
export function TournamentCard({ title, sport, status, date, location, teamsCount, maxTeams }) {
  // Petite logique pour la couleur du badge (Vert = Ouvert, Orange = En cours, Gris = Terminé)
  const statusColors = {
    'Ouvert': 'bg-green-100 text-green-700',
    'En cours': 'bg-orange-100 text-orange-700',
    'Terminé': 'bg-slate-100 text-slate-700'
  };

  return (
    <div className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-lg text-slate-900">{title}</h3>
          <p className="text-sm text-slate-500 capitalize">{sport} • {location}</p>
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded-md ${statusColors[status]}`}>
          {status}
        </span>
      </div>
      
      <div className="mt-4 flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-slate-600">
          <span>📅</span> {date}
        </div>
        <div className="font-medium text-slate-800">
          {teamsCount} / {maxTeams} Équipes
        </div>
      </div>
    </div>
  );
}