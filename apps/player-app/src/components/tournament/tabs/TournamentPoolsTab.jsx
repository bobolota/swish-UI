// apps/player-app/src/components/tournament/tabs/TournamentPoolsTab.jsx
import React from 'react';
import { StandingsTab } from '@swish/competition'; // Ajuste l'import selon où il se trouve

export function TournamentPoolsTab({ tournamentId }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h2 className="text-xl font-black uppercase tracking-widest text-slate-800 mb-2">
          Classement des poules
        </h2>
        <p className="text-slate-500 text-sm mb-6">
          Suivez l'évolution du classement. Seules les meilleures équipes accéderont aux phases finales.
        </p>

        {/* Ici on utilise ton composant existant !
          On lui passe une nouvelle prop `readOnly={true}` que l'on va 
          ajouter dans StandingsTab pour cacher le menu déroulant des qualifiés.
        */}
        <StandingsTab tournamentId={tournamentId} readOnly={true} />
      </div>
    </div>
  );
}