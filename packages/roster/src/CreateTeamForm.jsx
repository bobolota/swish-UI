import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button, Input, Label, Card, CardHeader, CardTitle, CardContent } from '@swish/ui';
import { SUPPORTED_SPORTS } from '@swish/core'; // Notre source de vérité !
import { useRoster } from './useRoster';

export function CreateTeamForm({ user, onTeamCreated }) {
  const { createTeam, isCreating } = useRoster(user?.id);
  
  // État du formulaire
  const [teamName, setTeamName] = useState("");
  const [selectedSport, setSelectedSport] = useState(SUPPORTED_SPORTS[0].id);
  
  // État de réussite pour afficher le lien
  const [createdTeam, setCreatedTeam] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { data, error } = await createTeam(teamName, selectedSport);

    if (error) {
      toast.error("Erreur lors de la création : " + error.message);
    } else {
      toast.success("Équipe créée avec succès !");
      setCreatedTeam(data); // On stocke l'équipe pour afficher l'écran de victoire
      if (onTeamCreated) onTeamCreated(data);
    }
  };

  const copyInviteLink = () => {
    // Le lien magique qui pointera vers ton app (ex: http://localhost:5173/invite/swish-abc123)
    const inviteUrl = `${window.location.origin}/invite/${createdTeam.invite_token}`;
    navigator.clipboard.writeText(inviteUrl);
    toast.success("Lien d'invitation copié dans le presse-papier !");
  };

  // --- ÉCRAN 2 : SUCCÈS & LIEN MAGIQUE ---
  if (createdTeam) {
    return (
      <Card className="border-emerald-500 shadow-xl bg-emerald-50">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-2">
            <span className="text-3xl text-white">🏆</span>
          </div>
          <CardTitle className="text-2xl font-black text-emerald-900">Franchise Créée !</CardTitle>
          <p className="text-emerald-700">Ton équipe <b>{createdTeam.name}</b> est prête.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-emerald-200 text-center">
            <p className="text-sm font-bold text-slate-500 uppercase mb-2">Lien d'invitation secret</p>
            <div className="flex gap-2">
              <code className="flex-1 bg-slate-100 p-3 rounded-lg text-sm text-slate-800 font-mono overflow-x-auto text-left whitespace-nowrap border border-slate-200">
                {window.location.origin}/invite/{createdTeam.invite_token}
              </code>
              <Button onClick={copyInviteLink} className="bg-emerald-600 hover:bg-emerald-700">Copier</Button>
            </div>
          </div>
          <Button variant="outline" onClick={() => setCreatedTeam(null)} className="w-full">
            Créer une autre équipe
          </Button>
        </CardContent>
      </Card>
    );
  }

  // --- ÉCRAN 1 : FORMULAIRE DE CRÉATION ---
  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Fonder une nouvelle équipe</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Nom de la franchise</Label>
            <Input 
              required 
              placeholder="Ex: Chicago Bulls" 
              value={teamName} 
              onChange={(e) => setTeamName(e.target.value)} 
            />
          </div>

          <div className="space-y-2">
            <Label>Discipline sportive</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {SUPPORTED_SPORTS.map((sport) => (
                <button
                  key={sport.id}
                  type="button"
                  onClick={() => setSelectedSport(sport.id)}
                  className={`p-3 rounded-xl border-2 flex items-center gap-2 text-sm font-semibold transition-all ${
                    selectedSport === sport.id 
                      ? "border-blue-600 bg-blue-50 text-blue-800" 
                      : "border-slate-100 bg-white text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <span className="text-xl">{sport.icon}</span>
                  {sport.label}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" disabled={isCreating || !teamName} className="w-full bg-slate-900 hover:bg-slate-800">
            {isCreating ? "Création en cours..." : "Créer l'équipe"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}