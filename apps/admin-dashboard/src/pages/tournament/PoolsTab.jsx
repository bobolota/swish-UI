import React, { useState } from 'react';
import { useTournamentPools } from '@swish/competition';
import { KanbanBoard, Button, Input, Card } from '@swish/ui';
import { Plus, Shuffle, Users, Trash2, Edit2 } from 'lucide-react';
import { toast } from 'sonner';

export default function PoolsTab({ tournamentId }) {
  const { pools, teams, isLoading, createPool, assignTeamToPool, deletePool, resetAllPools, generatePoolsAndDistribute } = useTournamentPools(tournamentId);
  const [newPoolName, setNewPoolName] = useState("");
  const [autoPoolCount, setAutoPoolCount] = useState(4);
  const hasUnassignedTeams = teams.some(t => !t.poolId);

  const handleRenameClick = (poolId, currentName) => {
    const newName = window.prompt("Nouveau nom de la poule :", currentName);
    if (newName && newName !== currentName) {
      renamePool(poolId, newName);
    }
  };

  // Préparation des colonnes pour le Kanban
  const columns = [
    // On n'ajoute la colonne que si hasUnassignedTeams est vrai
    ...(hasUnassignedTeams ? [{ id: 'unassigned', title: 'Équipes non assignées' }] : []),
    ...pools.map(p => ({ 
      id: p.id, 
      title: (
        <div className="flex items-center justify-between w-full">
          <span className="font-bold text-slate-700">{p.name}</span>
          
          <div className="flex gap-1"> {/* Conteneur pour nos deux boutons */}
            {/* BOUTON RENOMMER */}
            <button 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleRenameClick(p.id, p.name); }}
              className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="Renommer cette poule"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>

            {/* BOUTON SUPPRIMER (Celui que tu as déjà) */}
            <button 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); deletePool(p.id); }}
              className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
              title="Supprimer cette poule"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )
    }))
  ];

  // 2. Préparation des items (on ajoute la propriété status pour le Kanban)
  const kanbanItems = teams.map(t => ({
    ...t,
    status: t.poolId || 'unassigned'
  }));

  const handleAddPool = (e) => {
    e.preventDefault();
    if (!newPoolName.trim()) return;
    createPool(newPoolName);
    setNewPoolName("");
  };

  const handleStatusChange = (registrationId, newStatus) => {
    const targetPoolId = newStatus === 'unassigned' ? null : newStatus;
    assignTeamToPool(registrationId, targetPoolId);
  };

  // Logique de répartition dans les poules EXISTANTES
  const handleAutoGenerate = async () => {
    const unassigned = teams.filter(t => !t.poolId);
    if (unassigned.length === 0) return toast.error("Toutes les équipes sont déjà assignées !");
    if (pools.length < 2) return toast.error("Créez au moins 2 poules pour la répartition.");

    const shuffled = [...unassigned].sort(() => Math.random() - 0.5);
    
    toast.promise(
      Promise.all(shuffled.map((team, i) => {
        const poolIndex = i % pools.length;
        return assignTeamToPool(team.id, pools[poolIndex].id);
      })),
      {
        loading: 'Répartition en cours...',
        success: 'Répartition automatique terminée !',
        error: 'Erreur lors de la répartition',
      }
    );
  };

  if (isLoading) return <div className="p-8 text-center">Chargement des poules...</div>;

  return (
    <div className="flex flex-col h-full gap-6 p-6">
      {/* Barre d'outils */}      
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        
        {/* Ajout manuel */}
        <form onSubmit={handleAddPool} className="flex gap-2">
          <Input 
            placeholder="Nom de la poule..." 
            value={newPoolName}
            onChange={(e) => setNewPoolName(e.target.value)}
            className="w-48"
          />
          <Button type="submit" disabled={!newPoolName.trim()}>
            <Plus className="w-4 h-4 mr-2" />
            Créer
          </Button>
        </form>

        {/* NOUVEAU : L'interface intelligente de répartition */}
        <div className="flex items-center gap-2 border-l border-slate-200 pl-4 ml-auto">
          {pools.length === 0 ? (
            // S'IL N'Y A PAS DE POULES : Mode "Création + Répartition"
            <>
              <span className="text-sm font-medium text-slate-600">Génération :</span>
              <Input 
                type="number" 
                min="2" 
                max="16"
                value={autoPoolCount}
                onChange={(e) => setAutoPoolCount(parseInt(e.target.value))}
                className="w-20"
                title="Nombre de poules à créer"
              />
              <Button 
                variant="default" 
                onClick={() => generatePoolsAndDistribute(autoPoolCount)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Shuffle className="w-4 h-4 mr-2" />
                Créer & Répartir
              </Button>
            </>
          ) : (
            // S'IL Y A DÉJÀ DES POULES : Mode "Répartition Uniquement"
            <Button 
              variant="default" 
              onClick={handleAutoGenerate}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Shuffle className="w-4 h-4 mr-2" />
              Répartir les équipes
            </Button>
          )}
        </div>

        {/* Le bouton Danger pour nettoyer */}
        <Button 
          variant="ghost" 
          onClick={resetAllPools}
          disabled={pools.length === 0}
          className="text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Réinitialiser
        </Button>
      </div>

      {/* Le Board des Poules */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 pb-4">
        <div className="w-full h-full pr-2
          [&>div]:grid 
          [&>div]:grid-cols-1 
          md:[&>div]:grid-cols-2 
          lg:[&>div]:grid-cols-4 
          [&>div]:gap-3
          [&>div]:items-start
          /* NOUVEAU : Ces deux lignes forcent les colonnes internes à rétrécir */
          [&>div>div]:min-w-0
          [&>div>div]:w-full
        ">
          <KanbanBoard 
            columns={columns}
            items={kanbanItems}
            onStatusChange={handleStatusChange}
            renderCard={(team) => (
              <Card className="p-3 mb-2 cursor-grab active:cursor-grabbing border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800">{team.name}</p>
                    <p className="text-xs text-slate-500 flex items-center mt-1">
                      <Users className="w-3 h-3 mr-1" />
                      {team.captainName}
                    </p>
                  </div>
                </div>
              </Card>
            )}
          />
        </div>
      </div>
    </div>
  );
}