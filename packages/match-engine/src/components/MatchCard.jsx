import React from 'react';
import { Card } from '@swish/ui'; 
import { Clock, MapPin, Trash2, Edit3, User, ClipboardList } from 'lucide-react';

export function MatchCard({ match, profiles = [], onClick, onDelete, onEdit, teams = [] }) {

  const referees = match.match_officials?.filter(o => o.role === 'referee') || [];
  const tableStaff = match.match_officials?.filter(o => o.role === 'table') || [];
  // Petite fonction pour trouver le nom d'un officiel grâce à son ID
  const getOfficialName = (userId) => {
    const user = profiles.find(p => p.id === userId);
    if (!user) return 'Inconnu';
    return `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Utilisateur';
  };

  // Définition des couleurs selon le statut du match
  const statusStyles = {
    'scheduled': 'bg-slate-100 text-slate-600',
    'in_progress': 'bg-green-100 text-green-700 animate-pulse border border-green-200',
    'finished': 'bg-slate-800 text-white'
  };

  const statusLabels = {
    'scheduled': 'À venir',
    'in_progress': 'En cours',
    'finished': 'Terminé'
  };

  const currentStatusStyle = statusStyles[match.status] || statusStyles['scheduled'];
  const currentStatusLabel = statusLabels[match.status] || 'À venir';

  // Formatage des scores (affiche un tiret si le score n'existe pas encore)
  const homeScore = match.home_score !== null && match.home_score !== undefined ? match.home_score : '-';
  const awayScore = match.away_score !== null && match.away_score !== undefined ? match.away_score : '-';

  // On utilise 'teamId' (avec un i majuscule) pour faire le lien !
  const homeTeamInfo = teams.find(t => t.teamId === match.home_team_id);
  const awayTeamInfo = teams.find(t => t.teamId === match.away_team_id);

  // Et on récupère simplement le 'name'
  const displayHomeTeam = homeTeamInfo?.name || match.home_team_id?.substring(0, 8) || 'Équipe Domicile';
  const displayAwayTeam = awayTeamInfo?.name || match.away_team_id?.substring(0, 8) || 'Équipe Extérieur';

  return (
    <Card 
      className="p-4 relative group hover:shadow-md transition-all cursor-pointer border border-slate-200 bg-white hover:border-indigo-300"
      onClick={() => onClick && onClick(match)}
    >
      {/* En-tête : Statut, Heure et Terrain */}
      <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
        <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-widest ${currentStatusStyle}`}>
          {currentStatusLabel}
        </span>
        
        <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
          {match.start_time ? (
            <span className="flex items-center gap-1 group-hover:text-indigo-500 transition-colors">
              <Clock className="w-3.5 h-3.5" />
              {new Date(match.start_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          ) : (
            <span className="text-slate-300 italic">Heure à définir</span>
          )}
          
          {match.court_name && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {match.court_name}
            </span>
          )}
        </div>
      </div>

      {/* Corps : Les Équipes et le Score */}
      <div className="space-y-3 mb-2">
        {/* Équipe Domicile */}
        <div className="flex justify-between items-center">
          <span className={`font-bold truncate pr-4 ${match.home_score > match.away_score ? 'text-slate-900' : 'text-slate-600'}`}>
            {displayHomeTeam}
          </span>
          <span className="text-xl font-black text-slate-800 bg-slate-50 px-3 py-1 rounded-lg min-w-[3rem] text-center">
            {homeScore}
          </span>
        </div>

        {/* Équipe Extérieur */}
        <div className="flex justify-between items-center">
          <span className={`font-bold truncate pr-4 ${match.away_score > match.home_score ? 'text-slate-900' : 'text-slate-600'}`}>
            {displayAwayTeam}
          </span>
          <span className="text-xl font-black text-slate-800 bg-slate-50 px-3 py-1 rounded-lg min-w-[3rem] text-center">
            {awayScore}
          </span>
        </div>
      </div>

      {/* Section des Officiels */}
      {(referees.length > 0 || tableStaff.length > 0) && (
        <div className="mt-4 pt-3 border-t border-slate-50 flex flex-col gap-1.5">
          {referees.length > 0 && (
            <div className="flex items-start gap-1.5 text-[11px] text-indigo-600 font-medium">
              <User className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>
                Arbitre(s) : {referees.map(r => getOfficialName(r.user_id)).join(', ')}
              </span>
            </div>
          )}
          {tableStaff.length > 0 && (
            <div className="flex items-start gap-1.5 text-[11px] text-emerald-600 font-medium">
              <ClipboardList className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>
                OTM : {tableStaff.map(t => getOfficialName(t.user_id)).join(', ')}
              </span>
            </div>
          )}
        </div>
      )}
      
      {/* Info de la poule en bas */}
      {match.pool_id && (
         <div className="mt-3 pt-3 border-t border-slate-50 text-[10px] text-slate-500 font-bold uppercase tracking-wider text-center">
            {match.pools?.name || 'Poule'}
         </div>
      )}

      {/* Bouton de Suppression : Positionné en bas à droite, caché par défaut, visible au survol de la carte */}
      <button 
        onClick={(e) => { e.stopPropagation(); onDelete(match.id); }}
        className="absolute bottom-3 right-3 p-2 bg-white/90 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-all z-10 backdrop-blur-sm"
        title="Supprimer le match"
      >
        <Trash2 className="w-4 h-4" />
      </button>

    </Card>
  );
}