import React from 'react';
// 1️⃣ Ajoute l'import ici
import { useNavigate } from 'react-router-dom'; 
import { useTournamentTeams } from '@swish/competition';
import { Users } from 'lucide-react';

export function TournamentParticipantsTab({ tournamentId }) {
  // 2️⃣ Initialise la navigation
  const navigate = useNavigate(); 
  
  const { teams, loading } = useTournamentTeams(tournamentId);
  console.log("DONNÉES BRUTES DU HOOK :", teams);

  if (loading) {
    return <div className="p-10 text-center text-slate-400 font-medium animate-pulse">Chargement des équipes...</div>;
  }

  if (!teams || teams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
        <Users className="w-12 h-12 text-slate-300 mb-3" />
        <p className="text-slate-500 font-medium">Aucune équipe n'est encore inscrite.</p>
        <p className="text-sm text-slate-400 mt-1">Sois le premier à inscrire la tienne !</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {teams.map((team) => (
        <div 
          key={team.id} 
          // 3️⃣ Ajoute l'action au clic juste ici 👇
          onClick={() => {
  // On cherche l'ID partout où il pourrait se cacher
  const finalId = team.teamId || team.team_id || team.id;
  
  if (finalId) {
    navigate(`/team/${finalId}`);
  } else {
    console.error("Oups, aucun ID trouvé pour cette équipe :", team);
  }
}}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all group cursor-pointer flex items-center gap-4"
        >
          {/* Logo par défaut (Initiale de l'équipe) */}
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-full flex items-center justify-center text-indigo-700 font-black text-xl border border-indigo-100 shrink-0 group-hover:scale-105 transition-transform">
            {team.name ? team.name.charAt(0).toUpperCase() : 'T'}
          </div>
          
          {/* Infos de l'équipe */}
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-slate-800 truncate group-hover:text-indigo-700 transition-colors">
              {team.name}
            </h4>
            <span className="text-xs font-medium text-slate-500">
              {team.players_count || 0} joueurs
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}