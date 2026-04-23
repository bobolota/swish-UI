import React, { useState, useEffect } from 'react';
import { useTournamentMatches, useTournamentTeams } from '@swish/competition'; // On récupère les équipes aussi
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Input, Label } from '@swish/ui';
import { CalendarPlus, Trash2, Plus, ArrowRightLeft, ArrowRight } from 'lucide-react';
import { MatchCard } from '@swish/match-engine'; 
import { supabase } from '@swish/core';

export default function MatchesTab({ tournamentId }) {
  const { matches, isLoading, generateAutoMatches, createManualMatch, deleteMatch, deleteAllMatches, updateMatch, assignOfficial, removeOfficial } = useTournamentMatches(tournamentId);
  const { teams } = useTournamentTeams(tournamentId); // Pour choisir les équipes dans le formulaire
  
  const [isTwoLegs, setIsTwoLegs] = useState(false);
  const [isManualOpen, setIsManualOpen] = useState(false);
  
  // États pour le nouveau match manuel
  const [newMatch, setNewMatch] = useState({ home: '', away: '', pool: '' });

  const handleManualCreate = async () => {
    await createManualMatch(newMatch.pool, newMatch.home, newMatch.away);
    setIsManualOpen(false);
    setNewMatch({ home: '', away: '', pool: '' });
  };

  // NOUVEAU : État pour le match en cours d'édition
  const [editingMatch, setEditingMatch] = useState(null);

  // 1. NOUVEAU : État pour la liste des profils
  const [profiles, setProfiles] = useState([]);

  // 2. NOUVEAU : Récupérer les profils au chargement de la page
  useEffect(() => {
    const fetchProfiles = async () => {
      // ⚠️ Modifie 'first_name, last_name' selon les colonnes de ta table profiles !
      const { data } = await supabase.from('profiles').select('id, first_name, last_name');
      if (data) setProfiles(data);
    };
    fetchProfiles();
  }, []);

  const handleSaveEdit = async () => {
    // On envoie les modifications à la base de données
    await updateMatch(editingMatch.id, {
      home_score: editingMatch.home_score,
      away_score: editingMatch.away_score,
      court_name: editingMatch.court_name,
      start_time: editingMatch.start_time
    });
    setEditingMatch(null); // On ferme la modal
  };

  // Petite fonction pour convertir les dates ISO pour l'input type="datetime-local"
  const formatDateForInput = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };
  
  if (isLoading) return <div className="p-8 text-center text-slate-500">Chargement...</div>;

  return (
    <div className="flex flex-col h-full gap-6 p-6">
      
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border shadow-sm">
        <div className="flex items-center gap-6">
          {/* Ton sélecteur Aller-Simple / Aller-Retour que nous avons créé */}
          <div className="flex bg-slate-200/60 p-1 rounded-lg border">
            <button onClick={() => setIsTwoLegs(false)} className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-md transition-all ${!isTwoLegs ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>
              <ArrowRight className="w-4 h-4" /> Simple
            </button>
            <button onClick={() => setIsTwoLegs(true)} className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-md transition-all ${isTwoLegs ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>
              <ArrowRightLeft className="w-4 h-4" /> Aller-Retour
            </button>
          </div>

          <Button onClick={() => generateAutoMatches(isTwoLegs)} disabled={matches.length > 0} className="bg-indigo-600">
            <CalendarPlus className="w-4 h-4 mr-2" /> Générer auto
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* BOUTON AJOUT MANUEL AVEC DIALOG */}
          <Dialog open={isManualOpen} onOpenChange={setIsManualOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-50">
                <Plus className="w-4 h-4 mr-2" /> Ajouter un match
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Créer un match manuel</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Équipe Domicile</label>
                  <Select onValueChange={(v) => setNewMatch({...newMatch, home: v})}>
                    <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                    <SelectContent>{teams.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Équipe Extérieur</label>
                  <Select onValueChange={(v) => setNewMatch({...newMatch, away: v})}>
                    <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                    <SelectContent>{teams.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <Button onClick={handleManualCreate} className="w-full bg-indigo-600" disabled={!newMatch.home || !newMatch.away}>
                  Créer le match
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {matches.length > 0 && (
            <Button variant="ghost" onClick={deleteAllMatches} className="text-red-500 hover:bg-red-50">
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pb-4">
        {matches.map((match) => (
          <MatchCard 
            key={match.id} 
            match={match} 
            profiles={profiles}
            teams={teams}
            onDelete={deleteMatch}
            onEdit={() => setEditingMatch(match)} // ✅ On passe la fonction de suppression
            onClick={(m) => setEditingMatch(m)}
          />
        ))}
      </div>

      {/* MODAL D'ÉDITION D'UN MATCH */}
      <Dialog open={!!editingMatch} onOpenChange={(open) => !open && setEditingMatch(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Détails de la rencontre</DialogTitle>
            <DialogDescription className="text-slate-500 text-sm">
              Modifiez l'heure, le terrain et le score de ce match.
            </DialogDescription>
          </DialogHeader>
          
          {editingMatch && (
            <div className="grid gap-6 py-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date et Heure</Label>
                  <Input 
                    type="datetime-local" 
                    value={formatDateForInput(editingMatch.start_time)}
                    onChange={(e) => setEditingMatch({
                      ...editingMatch, 
                      start_time: e.target.value ? new Date(e.target.value).toISOString() : null
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Terrain</Label>
                  <Input 
                    placeholder="Ex: Terrain 1, Gymnase B..." 
                    value={editingMatch.court_name || ''}
                    onChange={(e) => setEditingMatch({...editingMatch, court_name: e.target.value})}
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                <h4 className="text-sm font-bold text-slate-500 uppercase text-center mb-2">Scores</h4>
                
                <div className="flex items-center gap-4">
                  <div className="flex-1 space-y-2">
                    <Label className="text-xs truncate block">{editingMatch.home_team_id?.substring(0,8) || 'Domicile'}</Label>
                    <Input 
                      type="number" 
                      min="0"
                      className="text-center font-bold text-lg"
                      value={editingMatch.home_score ?? ''}
                      onChange={(e) => setEditingMatch({
                        ...editingMatch, 
                        home_score: e.target.value === '' ? null : parseInt(e.target.value, 10)
                      })}
                    />
                  </div>
                  
                  <div className="text-xl font-black text-slate-300 mt-6">-</div>
                  
                  <div className="flex-1 space-y-2">
                    <Label className="text-xs truncate block">{editingMatch.away_team_id?.substring(0,8) || 'Extérieur'}</Label>
                    <Input 
                      type="number" 
                      min="0"
                      className="text-center font-bold text-lg"
                      value={editingMatch.away_score ?? ''}
                      onChange={(e) => setEditingMatch({
                        ...editingMatch, 
                        away_score: e.target.value === '' ? null : parseInt(e.target.value, 10)
                      })}
                    />
                  </div>
                </div>
              </div>

              {/* --- NOUVELLE SECTION : OFFICIELS --- */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                <h4 className="text-sm font-bold text-slate-500 uppercase text-center mb-2">Officiels (Assignation directe)</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* GESTION ARBITRE */}
                  <div className="space-y-2">
                    <Label className="text-xs text-indigo-600 font-bold">Arbitre principal</Label>
                    <Select onValueChange={async (userId) => {
                      await assignOfficial(editingMatch.id, userId, 'referee');
                      // Astuce visuelle : on met à jour la fenêtre ouverte instantanément
                      setEditingMatch(prev => ({
                        ...prev, 
                        match_officials: [...(prev.match_officials || []), { id: Date.now(), role: 'referee', user_id: userId }]
                      }));
                    }}>
                      <SelectTrigger className="bg-white"><SelectValue placeholder="Assigner..." /></SelectTrigger>
                      <SelectContent>
                        {profiles.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.first_name || 'User'} {p.last_name || ''}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Liste des arbitres déjà assignés */}
                    <div className="space-y-1 mt-2">
                      {editingMatch.match_officials?.filter(o => o.role === 'referee').map(official => (
                        <div key={official.id} className="flex justify-between items-center bg-white p-1.5 rounded border border-slate-200 text-xs">
                          <span className="truncate pr-2">
                            {profiles.find(p => p.id === official.user_id)?.first_name || 'Utilisateur'}
                          </span>
                          <button onClick={() => {
                            removeOfficial(official.id);
                            setEditingMatch(prev => ({...prev, match_officials: prev.match_officials.filter(o => o.id !== official.id)}));
                          }} className="text-red-500 hover:underline font-bold">X</button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* GESTION TABLE DE MARQUE */}
                  <div className="space-y-2">
                    <Label className="text-xs text-emerald-600 font-bold">Table de marque</Label>
                    <Select onValueChange={async (userId) => {
                      await assignOfficial(editingMatch.id, userId, 'table');
                      setEditingMatch(prev => ({
                        ...prev, 
                        match_officials: [...(prev.match_officials || []), { id: Date.now(), role: 'table', user_id: userId }]
                      }));
                    }}>
                      <SelectTrigger className="bg-white"><SelectValue placeholder="Assigner..." /></SelectTrigger>
                      <SelectContent>
                        {profiles.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.first_name || 'User'} {p.last_name || ''}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Liste de la table déjà assignée */}
                    <div className="space-y-1 mt-2">
                      {editingMatch.match_officials?.filter(o => o.role === 'table').map(official => (
                        <div key={official.id} className="flex justify-between items-center bg-white p-1.5 rounded border border-slate-200 text-xs">
                          <span className="truncate pr-2">
                            {profiles.find(p => p.id === official.user_id)?.first_name || 'Utilisateur'}
                          </span>
                          <button onClick={() => {
                            removeOfficial(official.id);
                            setEditingMatch(prev => ({...prev, match_officials: prev.match_officials.filter(o => o.id !== official.id)}));
                          }} className="text-red-500 hover:underline font-bold">X</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              {/* --- FIN SECTION OFFICIELS --- */}

              <Button onClick={handleSaveEdit} className="w-full bg-indigo-600 mt-2">
                Enregistrer les modifications
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}