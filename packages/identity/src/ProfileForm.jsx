import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button, Input, Label, Avatar, AvatarFallback, AvatarImage } from '@swish/ui';
import { useProfile } from './useProfile';

export function ProfileForm({ user }) {
  const { profile, loadingProfile, updateProfile } = useProfile(user?.id);
  
  // 1. On aligne EXACTEMENT les clés avec les colonnes de la table SQL 'profiles'
  const [formData, setFormData] = useState({
    first_name: "", 
    last_name: "", 
    pseudo: "", 
    birth_date: "", 
    avatar_url: ""
  });
  
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) setFormData(profile);
  }, [profile]);

  const handleSave = async () => {
    setIsSaving(true);
    const { error } = await updateProfile(formData);
    
    if (error) toast.error("Erreur de sauvegarde : " + error.message);
    else toast.success("Profil mis à jour !");
    
    setIsSaving(false);
  };

  if (loadingProfile) return <div className="animate-pulse h-40 bg-slate-100 rounded-xl" />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
      
      {/* BLOC AVATAR */}
      <div className="flex items-center gap-4 mb-2 md:col-span-2">
        <Avatar className="h-16 w-16 border-2 border-slate-200">
          <AvatarImage src={formData.avatar_url} />
          <AvatarFallback className="bg-slate-900 text-white text-xl">
            {formData.pseudo?.substring(0, 2).toUpperCase() || "?"}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-1 flex-1">
          <Label>Photo de profil (URL de l'image)</Label>
          <Input 
            placeholder="https://..." 
            value={formData.avatar_url || ""} 
            onChange={e => setFormData({...formData, avatar_url: e.target.value})} 
          />
        </div>
      </div>

      {/* BLOC IDENTITÉ */}
      <div className="space-y-4">
        <div className="space-y-1">
          <Label>Pseudo (Unique)</Label>
          <Input 
            value={formData.pseudo || ""} 
            onChange={e => setFormData({...formData, pseudo: e.target.value})} 
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label>Prénom</Label>
            <Input 
              value={formData.first_name || ""} 
              onChange={e => setFormData({...formData, first_name: e.target.value})} 
            />
          </div>
          <div className="space-y-1">
            <Label>Nom</Label>
            <Input 
              value={formData.last_name || ""} 
              onChange={e => setFormData({...formData, last_name: e.target.value})} 
            />
          </div>
        </div>
      </div>

      {/* BLOC INFORMATIONS COMPLÉMENTAIRES */}
      <div className="space-y-4 flex flex-col justify-between">
        <div className="space-y-1">
          <Label>Date de naissance</Label>
          <Input 
            type="date" 
            value={formData.birth_date || ""} 
            onChange={e => setFormData({...formData, birth_date: e.target.value})} 
          />
        </div>
        
        <Button onClick={handleSave} disabled={isSaving} className="w-full mt-auto">
          {isSaving ? "Sauvegarde en cours..." : "Sauvegarder mon profil"}
        </Button>
      </div>
      
    </div>
  );
}