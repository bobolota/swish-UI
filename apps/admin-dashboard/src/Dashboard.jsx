import React, { useEffect, useState } from 'react';
import { 
  AdminLayout, 
  TournamentCard, 
  Skeleton, 
  Button, 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription,
  KanbanBoard // <-- Correction : B majuscule
} from '@swish/ui';
import { useAuth } from '@swish/identity';
import { useTournamentOrganizer, CreateTournamentForm } from '@swish/competition';

const TOURNAMENT_COLUMNS = [
  { id: 'draft', title: 'Brouillon', bgColor: 'bg-slate-100/50', borderColor: 'border-slate-200' },
  { id: 'open', title: 'Inscriptions', bgColor: 'bg-green-50/50', borderColor: 'border-green-200' },
  { id: 'live', title: 'En cours', bgColor: 'bg-orange-50/50', borderColor: 'border-orange-200' },
  { id: 'finished', title: 'Terminé', bgColor: 'bg-blue-50/50', borderColor: 'border-blue-200' }
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  
  // NOUVEAU : On récupère updateTournamentStatus
  const { 
    managedTournaments, 
    isProcessing, 
    fetchManagedTournaments,
    updateTournamentStatus 
  } = useTournamentOrganizer(user?.id);
  
  const [isOpen, setIsOpen] = useState(false);
  
  // NOUVEAU : L'état pour basculer entre Kanban et Grille
  const [viewMode, setViewMode] = useState('kanban'); 

  useEffect(() => {
    if (user?.id) fetchManagedTournaments();
  }, [user?.id, fetchManagedTournaments]);

  return (
    <AdminLayout user={user} logout={logout}>
     <div className="space-y-8 flex-1 flex flex-col">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Tableau de Bord</h1>
            <p className="text-slate-500">Gère tes compétitions et ton business.</p>
          </div>

          <div className="flex items-center gap-4">
            {/* NOUVEAU : Les boutons pour basculer la vue */}
            <div className="hidden md:flex items-center gap-1 bg-slate-200 p-1 rounded-lg">
              <button 
                onClick={() => setViewMode('kanban')} 
                className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${viewMode === 'kanban' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Kanban
              </button>
              <button 
                onClick={() => setViewMode('grid')} 
                className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Grille
              </button>
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold">+ Nouveau Tournoi</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Créer un nouveau tournoi</DialogTitle>
                  <DialogDescription className="hidden">Paramètres de la compétition</DialogDescription>
                </DialogHeader>
                
                <CreateTournamentForm 
                  userId={user?.id} 
                  onSuccess={() => {
                    setIsOpen(false);
                    fetchManagedTournaments();
                  }} 
                />
                
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* NOUVEAU : La logique d'affichage conditionnelle */}
        {isProcessing && managedTournaments.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-64 w-full rounded-2xl" />)}
          </div>
        ) : managedTournaments.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-medium">Aucun tournoi organisé pour le moment.</p>
          </div>
        ) : viewMode === 'kanban' ? (
          /* LE FAMEUX KANBAN EST ICI */
          <KanbanBoard 
            columns={TOURNAMENT_COLUMNS}
            items={managedTournaments} 
            onStatusChange={updateTournamentStatus}
            renderCard={(tournament) => <TournamentCard tournament={tournament} />} 
          />
        ) : (
          /* LA GRILLE CLASSIQUE */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {managedTournaments.map((tournament) => (
              <TournamentCard key={tournament.id} tournament={tournament} />
            ))}
          </div>
        )}

      </div>
    </AdminLayout>
  );
}