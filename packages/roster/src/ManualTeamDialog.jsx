import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, Button, Input, Label } from '@swish/ui';

export function ManualTeamDialog({ onSubmit }) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [captain, setCaptain] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    onSubmit(name, captain || 'Inconnu');
    setName('');
    setCaptain('');
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-slate-900 text-white font-bold hover:bg-slate-800">
          + Équipe Manuelle
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter une équipe manuellement</DialogTitle>
          {/* ✅ NOUVEAU : La description requise (masquée avec hidden) */}
          <DialogDescription className="hidden">
            Formulaire d'ajout d'une équipe manuelle au tournoi.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="teamName">Nom de l'équipe <span className="text-red-500">*</span></Label>
            <Input 
              id="teamName" 
              placeholder="Ex: Les Monstars" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="captainName">Nom du Capitaine</Label>
            <Input 
              id="captainName" 
              placeholder="Ex: Michael J." 
              value={captain} 
              onChange={(e) => setCaptain(e.target.value)}
            />
          </div>
          
          <div className="flex justify-end pt-4">
            <Button type="submit" className="bg-blue-600 text-white font-bold hover:bg-blue-700 w-full">
              Ajouter l'équipe
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}