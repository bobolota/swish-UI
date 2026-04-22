import React from 'react';
import { Button, Input, Label } from '@swish/ui';
import { useTournamentOrganizer } from './useTournamentOrganizer';
import { SUPPORTED_SPORTS } from '@swish/core';
import { toast } from 'sonner';

const SPORTS_AVAILABLE = SUPPORTED_SPORTS.map(sport => sport.id || sport);

export function CreateTournamentForm({ userId, onSuccess }) {
  const { isProcessing, createTournament } = useTournamentOrganizer(userId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const data = {
      name: formData.get('name'),
      location: formData.get('location'),
      start_date: formData.get('date'),
      sport_id: formData.get('sport_id'),
      entry_fee: parseFloat(formData.get('entry_fee')) || 0,
      entry_fee_currency: formData.get('entry_fee_currency') || 'EUR',
      entry_fee_type: formData.get('entry_fee_type') // ✅ NOUVEAU CHAMP
    };

    const { error } = await createTournament(data);
    
    if (error) {
      toast.error("Erreur de création : " + error.message);
    } else {
      toast.success("Tournoi créé avec succès !");
      if (onSuccess) onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label>Nom du tournoi</Label>
        <Input name="name" placeholder="ex: Summer League 2026" required />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Date de début</Label>
          <Input name="date" type="date" required />
        </div>
        <div className="space-y-2">
          <Label>Sport concerné</Label>
          <select 
            name="sport_id" 
            required
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Sélectionner...</option>
            {SPORTS_AVAILABLE.map(sport => (
              <option key={sport} value={sport}>{sport}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Lieu principal</Label>
        <Input name="location" placeholder="ex: Gymnase Central" required />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Frais</Label>
          <Input name="entry_fee" type="number" placeholder="50" min="0" required />
        </div>
        <div className="space-y-2">
          <Label>Unité</Label>
          <select 
            name="entry_fee_type" 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="per_team">Par équipe</option>
            <option value="per_player">Par joueur</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label>Devise</Label>
          <select 
            name="entry_fee_currency" 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="EUR">€ (Euro)</option>
            <option value="USD">$ (Dollar US)</option>
          </select>
        </div>
      </div>

      <Button type="submit" className="w-full bg-slate-900 text-white mt-4" disabled={isProcessing}>
        {isProcessing ? "Création..." : "Lancer le tournoi"}
      </Button>
    </form>
  );
}