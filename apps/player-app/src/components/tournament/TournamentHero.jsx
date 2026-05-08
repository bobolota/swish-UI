import React from 'react';
import { Calendar, MapPin, Users } from 'lucide-react';
import { Badge, Button } from '@swish/ui'; 

// 👇 AJOUT DE isAdmin = false dans les paramètres
export function TournamentHero({ tournament, onRegister, isRegistered = false, isAdmin = false }) {
  if (!tournament) return null;

  const statusConfig = {
    open: { label: 'Inscriptions Ouvertes', styles: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    live: { label: 'Tournoi En Cours', styles: 'bg-amber-100 text-amber-700 border-amber-200' },
    finished: { label: 'Tournoi Terminé', styles: 'bg-slate-100 text-slate-600 border-slate-200' },
    draft: { label: 'Brouillon', styles: 'bg-slate-100 text-slate-500 border-slate-200' }
  };

  const currentStatus = statusConfig[tournament.status] || { label: tournament.status, styles: 'bg-slate-100 text-slate-700' };

  const formattedDate = tournament.start_date 
    ? new Date(tournament.start_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) 
    : 'Date à définir';

  return (
    <div className="bg-white rounded-3xl p-6 md:p-10 border border-slate-200 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        
        <div className="flex-1">
          <Badge className={`mb-4 border font-bold uppercase tracking-widest px-3 py-1 ${currentStatus.styles}`}>
            {currentStatus.label}
          </Badge>
          
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
            {tournament.name}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm font-medium text-slate-600">
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
              <Calendar className="w-4 h-4 text-indigo-500" />
              {formattedDate}
            </div>
            
            {tournament.location && (
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                <MapPin className="w-4 h-4 text-rose-500" />
                {tournament.location}
              </div>
            )}
            
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
              <Users className="w-4 h-4 text-emerald-500" />
              Max {tournament.max_teams || 16} équipes
            </div>
          </div>
        </div>

        {/* 👇 AJOUT DE LA CONDITION : On n'affiche cette zone QUE si on n'est PAS admin */}
        {!isAdmin && (
          <div className="w-full md:w-auto shrink-0 flex flex-col items-center gap-2">
            {isRegistered ? (
              <div className="px-6 py-3 bg-indigo-50 text-indigo-700 font-black rounded-xl border border-indigo-200 text-center w-full shadow-sm">
                ✨ Ton équipe est inscrite
              </div>
            ) : tournament.status === 'open' ? (
              <Button 
                onClick={onRegister} 
                size="lg" 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg px-8 py-6 rounded-xl shadow-lg shadow-indigo-600/20 transition-all hover:-translate-y-1"
              >
                Inscrire mon équipe
              </Button>
            ) : (
              <Button disabled size="lg" className="w-full bg-slate-100 text-slate-400 font-bold text-lg px-8 py-6 rounded-xl border border-slate-200">
                Inscriptions fermées
              </Button>
            )}
            
            {tournament.status === 'open' && !isRegistered && (
               <p className="text-xs text-slate-400 font-medium">Clôture des inscriptions bientôt</p>
            )}
          </div>
        )}

      </div>
    </div>
  );
}