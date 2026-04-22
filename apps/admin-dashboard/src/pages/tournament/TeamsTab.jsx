import React from 'react';
import { KanbanBoard, Skeleton } from '@swish/ui';
import { TeamCard, ManualTeamDialog } from '@swish/roster'; // <-- Import du nouveau composant
import { useTournamentTeams } from '@swish/competition';
import { useNavigate, useParams } from 'react-router-dom';

const TEAM_COLUMNS = [
  { id: 'pending', title: 'En attente', bgColor: 'bg-slate-50/50', borderColor: 'border-slate-200' },
  { id: 'validated', title: 'Validées', bgColor: 'bg-green-50/50', borderColor: 'border-green-200' },
  { id: 'rejected', title: 'Refusées', bgColor: 'bg-red-50/50', borderColor: 'border-red-200' }
];

export default function TeamsTab({ tournamentId }) {

  const navigate = useNavigate();
  // On récupère addManualTeam depuis le hook
  const { teams, isLoading, updateTeamStatus, updatePaymentStatus, addManualTeam } = useTournamentTeams(tournamentId);

  if (isLoading) {
    return (
      <div className="flex gap-4 mt-4">
        {[1, 2, 3].map(i => <Skeleton key={i} className="w-80 h-[600px] rounded-xl" />)}
      </div>
    );
  }

  const handleCardClick = (team) => {
    // Redirige vers la page de gestion de l'équipe
    // On utilise l'ID de la registration ou de la team selon ta structure de route
    navigate(`/tournament/${tournamentId}/team/${team.id}`);
  };

  return (
    <div className="mt-4 flex flex-col h-full">
      
      {/* NOUVEAU : En-tête avec le bouton */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Inscriptions ({teams.length})</h2>
          <p className="text-sm text-slate-500">Gérez les équipes participantes.</p>
        </div>
        
        {/* LE BOUTON MAGIQUE */}
        <ManualTeamDialog onSubmit={addManualTeam} />
      </div>

      {/* LE KANBAN */}
      <div className="flex-1 overflow-hidden">
        <KanbanBoard 
          columns={TEAM_COLUMNS}
          items={teams}
          onStatusChange={updateTeamStatus}
          renderCard={(team) => <TeamCard team={team} onPaymentChange={updatePaymentStatus} onClick={() => handleCardClick(team)} />} 
        />
      </div>
    </div>
  );
}