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
  Input,
  Label
} from '@swish/ui';
import { useAuth } from '@swish/identity';
import { useTournamentOrganizer } from '@swish/competition';
import { SUPPORTED_SPORTS } from '@swish/core';
import { toast } from 'sonner';

// ✅ ON EXTRAIT TES SPORTS DEPUIS LE NOYAU CORE
const SPORTS_AVAILABLE = SUPPORTED_SPORTS.map(sport => sport.id || sport);

export default function Dashboard() {
  const { user, logout } = useAuth();
  
  const { 
    managedTournaments, 
    isProcessing, 
    fetchManagedTournaments, 
    createTournament 
  } = useTournamentOrganizer(user?.id);

  const [isOpen, setIsOpen] = useState(false);

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
      sport_id: formData.get('sport_id') // ✅ ON RÉCUPÈRE MAINTENANT LE SPORT !
    };

    const { error } = await createTournament(data);
    
    if (error) {
      toast.error("Erreur de création: " + error.message);
    } else {
      toast.success("Tournoi créé avec succès !");
      setIsOpen(false); 
      fetchManagedTournaments(); 
    }
  };

  return (
    <AdminLayout user={user} logout={logout}>
      <div className="space-y-8">
        
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
                <DialogDescription className="hidden">Remplissez les informations du tournoi</DialogDescription>
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
                
                {/* ✅ LE NOUVEAU MENU DÉROULANT POUR LE SPORT */}
                <div className="space-y-2">
                  <Label>Sport concerné</Label>
                  <select 
                    name="sport_id" 
                    required
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="">Sélectionnez un sport...</option>
                    {SPORTS_AVAILABLE.map(sport => (
                      <option key={sport} value={sport}>{sport}</option>
                    ))}
                  </select>
                </div>

                <Button type="submit" className="w-full bg-slate-900" disabled={isProcessing}>
                  {isProcessing ? "Création en cours..." : "Lancer le tournoi"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isProcessing && managedTournaments.length === 0 ? (
            [1, 2, 3].map((i) => <Skeleton key={i} className="h-64 w-full rounded-2xl" />)
          ) : managedTournaments.length > 0 ? (
            managedTournaments.map((tournament) => (
              <TournamentCard key={tournament.id} tournament={tournament} />
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
              <p className="text-slate-400 font-medium">Aucun tournoi organisé pour le moment.</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}