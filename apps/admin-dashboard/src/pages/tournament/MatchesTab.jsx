import React, { useState } from 'react';
import { useTournamentMatches } from '@swish/competition';
import { Button, Switch, Label } from '@swish/ui'; 
import { CalendarPlus, Trash2, Info } from 'lucide-react';

export default function MatchesTab({ tournamentId }) {
  const { matches, isLoading, generateAutoMatches, deleteAllMatches } = useTournamentMatches(tournamentId);
  
  // État pour savoir si on est en mode Aller-Retour ou pas
  const [isTwoLegs, setIsTwoLegs] = useState(false);

  const handleGenerate = () => {
    const confirmMsg = isTwoLegs 
      ? "Générer tous les matchs de poule en format ALLER-RETOUR ?" 
      : "Générer tous les matchs de poule en format ALLER SIMPLE ?";
    
    if (window.confirm(confirmMsg)) {
      generateAutoMatches(isTwoLegs);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-slate-500">Calcul du planning...</div>;

  return (
    <div className="flex flex-col h-full gap-6 p-6">
      
      {/* Barre d'outils de Génération */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-bold text-slate-800">Générateur de matchs</h2>
          <p className="text-sm text-slate-500">Créez automatiquement les rencontres basées sur vos poules.</p>
        </div>

        <div className="flex items-center gap-6 bg-slate-50 p-3 rounded-xl border border-slate-100">
          {/* LE BOUTON ACTIVABLE (TOGGLE) */}
          <div className="flex items-center gap-3 pr-6 border-r border-slate-200">
            <Switch 
              id="mode-retour" 
              checked={isTwoLegs} 
              onCheckedChange={setIsTwoLegs} 
            />
            <Label htmlFor="mode-retour" className="font-semibold text-slate-700 cursor-pointer">
              {isTwoLegs ? "Aller-Retour" : "Aller Simple"}
            </Label>
          </div>
          
          {/* LE BOUTON DE GÉNÉRATION QUI REÇOIT L'INFO */}
          <Button 
            onClick={handleGenerate}
            disabled={matches.length > 0} // On désactive si les matchs existent déjà
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-100"
          >
            <CalendarPlus className="w-4 h-4 mr-2" />
            Générer le planning
          </Button>

          {matches.length > 0 && (
            <Button variant="ghost" onClick={deleteAllMatches} className="text-red-500 hover:bg-red-50">
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Liste des matchs générés */}
      {matches.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
          <div className="bg-slate-50 p-4 rounded-full mb-4">
            <Info className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-slate-600 font-medium">Aucun match n'a été généré pour le moment.</h3>
          <p className="text-slate-400 text-sm max-w-xs mt-2">Choisissez le format ci-dessus pour lancer la création automatique des rencontres.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pr-2">
          {matches.map((match, idx) => (
            <div key={match.id} className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:border-indigo-200 transition-colors">
              <div className="flex justify-between items-center mb-3 text-[10px] uppercase tracking-wider font-bold text-slate-400 border-b pb-2">
                <span>Match #{idx + 1}</span>
                <span className="bg-slate-100 px-2 py-0.5 rounded">Poule {match.pool_id?.substring(0,2)}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 text-center font-bold text-slate-700 truncate">{match.home_team_id?.substring(0,8)}</div>
                <div className="text-slate-300 font-black italic">VS</div>
                <div className="flex-1 text-center font-bold text-slate-700 truncate">{match.away_team_id?.substring(0,8)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}