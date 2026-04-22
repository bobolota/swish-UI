import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTeamPlayers } from '@swish/roster'; // Ajuste l'import selon ton architecture
import { PaymentStatusToggle, Button, Input } from '@swish/ui';
import { ArrowLeft, UserPlus, Trash2 } from 'lucide-react'; // Icônes


export default function TeamPlayersPage() {
  const { tournamentId, teamId } = useParams(); // Récupère les IDs depuis l'URL
  const navigate = useNavigate();
  const { team, players, isLoading, addPlayer, togglePlayerPayment, deletePlayer } = useTeamPlayers(teamId);
  const [newPlayerName, setNewPlayerName] = useState("");

  const handleAddPlayer = (e) => {
    e.preventDefault();
    addPlayer(newPlayerName);
    setNewPlayerName(""); // On vide le champ après l'ajout
  };

  if (isLoading) return <div className="p-8">Chargement de l'effectif...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* 1. En-tête avec bouton retour */}
      <Button 
        variant="ghost" 
        onClick={() => navigate(`/tournament/${tournamentId}`)}
        className="mb-6 -ml-4 text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Retour au Kanban
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">{team?.name || "Équipe"}</h1>
        <p className="text-slate-500 mt-1">Capitaine : {team?.display_captain_name || "Inconnu"}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* 2. Formulaire d'ajout rapide */}
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <form onSubmit={handleAddPlayer} className="flex gap-2">
            <Input 
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              placeholder="Nom du joueur..."
              className="max-w-xs bg-white"
            />
            <Button type="submit" disabled={!newPlayerName.trim()}>
              <UserPlus className="w-4 h-4 mr-2" />
              Ajouter
            </Button>
          </form>
        </div>

        {/* 3. La liste des joueurs avec le composant magique */}
        <div className="divide-y divide-slate-100">
          {players.length === 0 ? (
            <div className="p-8 text-center text-slate-500 italic">
              Aucun joueur dans l'effectif pour le moment.
            </div>
          ) : (
            players.map((player) => (
              <div key={player.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
  <div className="flex flex-col"> {/* ✅ Ajout d'un flex-col pour superposer nom et date */}
    <span className="font-medium text-slate-700">{player.name}</span>
    
    {/* ✅ AFFICHAGE DE LA DATE SI PAYÉ */}
    {player.is_paid && player.paid_at && (
      <span className="text-[10px] text-green-600 font-bold">
        Payé le {new Date(player.paid_at).toLocaleDateString('fr-FR')}
      </span>
    )}
  </div>
  
  <div className="flex items-center gap-4">
    <PaymentStatusToggle 
      isPaid={player.is_paid} 
      onChange={() => togglePlayerPayment(player.id, player.is_paid)} 
    />

    {/* NOUVEAU : Bouton supprimer (invisible par défaut, apparaît au survol via 'group-hover') */}
    <Button
      variant="ghost"
      size="icon"
      onClick={() => deletePlayer(player.id)}
      className="text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
    >
      <Trash2 className="w-4 h-4" />
    </Button>
  </div>
</div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}