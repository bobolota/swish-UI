import React from 'react';

export default function TeamsTab({ tournamentId }) {
  return (
    <div className="bg-white rounded-xl border-2 border-dashed border-slate-200 p-12 text-center mt-4">
      <h2 className="text-2xl font-bold mb-2 text-slate-800">Gestion des Inscriptions</h2>
      <p className="text-slate-500">
        C'est ici que nous allons brancher le KanbanBoard pour gérer les équipes du tournoi.
      </p>
    </div>
  );
}