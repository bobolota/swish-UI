import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button, Input, Label } from '@swish/ui';
import { usePlayerCard } from './usePlayerCard';
import { SUPPORTED_SPORTS } from '@swish/core';

// Une petite liste de sports pour notre design universel
const SPORTS_AVAILABLE = useState(SUPPORTED_SPORTS[0].id);

export function PlayerCardForm({ user }) {
  const { playerCard, loadingCard, savePlayerCard } = usePlayerCard(user?.id);
  
  const [formData, setFormData] = useState({
    height: "", 
    weight: "", 
    shoe_size: "", 
    dominant_hand: "", 
    dominant_foot: "",
    favorite_sports: []
  });
  
  const [isSaving, setIsSaving] = useState(false);

  // On remplit le formulaire quand les données de la DB arrivent
  useEffect(() => {
    if (playerCard) {
      setFormData({
        height: playerCard.height || "",
        weight: playerCard.weight || "",
        shoe_size: playerCard.shoe_size || "",
        dominant_hand: playerCard.dominant_hand || "",
        dominant_foot: playerCard.dominant_foot || "",
        favorite_sports: playerCard.favorite_sports || []
      });
    }
  }, [playerCard]);

  // Gestion des cases à cocher pour le tableau des sports
  const toggleSport = (sport) => {
    setFormData(prev => {
      const sports = prev.favorite_sports.includes(sport)
        ? prev.favorite_sports.filter(s => s !== sport) // Retire le sport
        : [...prev.favorite_sports, sport]; // Ajoute le sport
      return { ...prev, favorite_sports: sports };
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    const { error } = await savePlayerCard(formData);
    
    if (error) toast.error("Erreur : " + error.message);
    else toast.success("Fiche Athlète mise à jour ! 🏅");
    
    setIsSaving(false);
  };

  if (loadingCard) return <div className="animate-pulse h-40 bg-slate-100 rounded-xl" />;

  return (
    <div className="space-y-6 pt-2">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* MENSURATIONS */}
        <div className="space-y-1">
          <Label>Taille (cm)</Label>
          <Input type="number" placeholder="185" value={formData.height} onChange={e => setFormData({...formData, height: e.target.value})} />
        </div>
        <div className="space-y-1">
          <Label>Poids (kg)</Label>
          <Input type="number" placeholder="80" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} />
        </div>
        <div className="space-y-1">
          <Label>Pointure</Label>
          <Input type="number" step="0.5" placeholder="44.5" value={formData.shoe_size} onChange={e => setFormData({...formData, shoe_size: e.target.value})} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* LATÉRALITÉ */}
        <div className="space-y-1">
          <Label>Main Forte</Label>
          <select 
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            value={formData.dominant_hand} 
            onChange={e => setFormData({...formData, dominant_hand: e.target.value})}
          >
            <option value="">Sélectionner...</option>
            <option value="Droitier">Droitier</option>
            <option value="Gaucher">Gaucher</option>
            <option value="Ambidextre">Ambidextre</option>
          </select>
        </div>
        <div className="space-y-1">
          <Label>Pied Fort</Label>
          <select 
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            value={formData.dominant_foot} 
            onChange={e => setFormData({...formData, dominant_foot: e.target.value})}
          >
            <option value="">Sélectionner...</option>
            <option value="Droitier">Droitier</option>
            <option value="Gaucher">Gaucher</option>
            <option value="Ambidextre">Ambidextre</option>
          </select>
        </div>
      </div>

      {/* SPORTS FAVORIS */}
      <div className="space-y-2">
        <Label>Sports Favoris</Label>
        <div className="flex flex-wrap gap-2">
          {SPORTS_AVAILABLE.map(sport => {
            const isSelected = formData.favorite_sports.includes(sport);
            return (
              <button
                key={sport}
                onClick={() => toggleSport(sport)}
                className={`px-4 py-2 text-sm font-bold rounded-full transition-colors ${
                  isSelected ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                {sport}
              </button>
            );
          })}
        </div>
      </div>

      <Button onClick={handleSave} disabled={isSaving} className="w-full bg-slate-900 hover:bg-slate-800">
        {isSaving ? "Enregistrement..." : "Valider ma fiche athlète"}
      </Button>
    </div>
  );
}