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
  Input,
  Label
} from '@swish/ui';
import { useAuth } from '@swish/identity';
import { useTournamentOrganizer } from '@swish/competition';

export default function Dashboard() {
  const { user } = useAuth();
  const { 
    managedTournaments, 
    isProcessing, 
    fetchManagedTournaments, 
    createTournament 
  } = useTournamentOrganizer(user?.id);

  // État pour la modale de création
  const [isOpen, setIsOpen] = useState(false);

  // Chargement initial des données
  useEffect(() => {
    if (user?.id) {
      fetchManagedTournaments();
    }
  }, [user?.id, fetchManagedTournaments]);

  const handleCreateTournament = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      location: formData.get('location'),
      start_date: formData.get('date'),
    };

    const { error } = await createTournament(data);
    if (!error) setIsOpen(false); // Ferme la modale si succès
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header de la page */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">
              Tableau de Bord
            </h1>
            <p className="text-slate-500">Gère tes compétitions et ton business.</p>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
                + Nouveau Tournoi
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer un nouveau tournoi</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateTournament} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Nom du tournoi</Label>
                  <Input name="name" placeholder="ex: Summer League 2024" required />
                </div>
                <div className="space-y-2">
                  <Label>Lieu</Label>
                  <Input name="location" placeholder="ex: Gymnase Central" required />
                </div>
                <div className="space-y-2">
                  <Label>Date de début</Label>
                  <Input name="date" type="date" required />
                </div>
                <Button type="submit" className="w-full bg-slate-900" disabled={isProcessing}>
                  {isProcessing ? "Création..." : "Lancer le tournoi"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Grille des tournois */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isProcessing && managedTournaments.length === 0 ? (
            // État de chargement : Skeletons
            [1, 2, 3].map((i) => <Skeleton key={i} className="h-64 w-full rounded-2xl" />)
          ) : managedTournaments.length > 0 ? (
            // État avec données : Cartes
            managedTournaments.map((tournament) => (
              <TournamentCard key={tournament.id} tournament={tournament} />
            ))
          ) : (
            // État vide
            <div className="col-span-full py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
              <p className="text-slate-400 font-medium">Aucun tournoi organisé pour le moment.</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}