import React, { useState, useEffect } from 'react';
import { Card } from '@swish/ui'; 
import { Clock, MapPin, Trash2, Edit3, User, ClipboardList, Check, X } from 'lucide-react';

export function MatchCard({ match, profiles = [], onSaveScore, onClick, onDelete, onEdit, teams = [], readOnly = false }) {

  const [isEditing, setIsEditing] = useState(false);
  const [localHomeScore, setLocalHomeScore] = useState(match.home_score ?? '');
  const [localAwayScore, setLocalAwayScore] = useState(match.away_score ?? '');

  useEffect(() => {
    setLocalHomeScore(match.home_score ?? '');
    setLocalAwayScore(match.away_score ?? '');
  }, [match.home_score, match.away_score]);

  const handleValidate = (e) => {
    e.stopPropagation(); // 👈 Ajout de stopPropagation
    const hScore = localHomeScore === '' ? null : Number(localHomeScore);
    const aScore = localAwayScore === '' ? null : Number(localAwayScore);
    
    if (onSaveScore) onSaveScore(match.id, hScore, aScore);
    setIsEditing(false); 
  };

  const handleCancel = (e) => {
    e.stopPropagation(); // 👈 Ajout de stopPropagation
    setLocalHomeScore(match.home_score ?? '');
    setLocalAwayScore(match.away_score ?? '');
    setIsEditing(false);
  };

  // --- NOUVEAU : GESTION DYNAMIQUE DU NOM DE L'ÉTAPE / POULE ---
  // Si c'est une poule ET qu'on a le nom de la poule, on l'affiche (ex: "Poule A")
  const poolName = match.pools?.name ? `${match.pools.name}` : 'Poule';
  
  const stageLabels = {
    'pools': poolName,
    'round_32': '1/16 Finale',
    'round_16': '1/8 Finale',
    'quarter': '1/4 Finale',
    'semi': '1/2 Finale',
    'final': 'Finale'
  };
  const currentStageLabel = stageLabels[match.stage] || 'Match';

  // --- INFOS DE BASE ---
  const referees = match.match_officials?.filter(o => o.role === 'referee') || [];
  const tableStaff = match.match_officials?.filter(o => o.role === 'table') || [];
  
  const getOfficialName = (userId) => {
    const user = profiles.find(p => p.id === userId);
    if (!user) return 'Inconnu';
    return `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Utilisateur';
  };

  

  const statusStyles = {
    'scheduled': 'bg-slate-100 text-slate-600',
    'live': 'bg-green-100 text-green-700 animate-pulse border border-green-200',
    'paused': 'bg-green-100 text-green-700 animate-pulse border border-green-200',
    'finished': 'bg-slate-800 text-white'
  };

  const statusLabels = {
    'scheduled': 'À venir',
    'live': 'En cours',
    'paused': 'En cours',
    'finished': 'Terminé'
  };

  const currentStatusStyle = statusStyles[match.status] || statusStyles['scheduled'];
  const currentStatusLabel = statusLabels[match.status] || 'À venir';

  const homeTeamInfo = teams.find(t => t.teamId === match.home_team_id);
  const awayTeamInfo = teams.find(t => t.teamId === match.away_team_id);

  const displayHomeTeam = homeTeamInfo?.name || match.home_team_id?.substring(0, 8) || 'Équipe Domicile';
  const displayAwayTeam = awayTeamInfo?.name || match.away_team_id?.substring(0, 8) || 'Équipe Extérieur';
  

  return (
    
    <Card 
      onClick={() => { if (!isEditing && onClick) onClick(match); }} // 👈 Ajout du onClick et on s'assure qu'on ne navigue pas en mode édition
      className={`p-4 pb-14 relative group transition-all border bg-white cursor-pointer ${isEditing ? 'border-indigo-400 shadow-md ring-1 ring-indigo-400' : 'border-slate-200 hover:border-slate-300'}`} // 👈 Ajout de cursor-pointer
    >
      
      {/* En-tête : Statut, Étape, Date/Heure et Terrain */}
      <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-3">
        
        {/* Gauche : Les badges (Statut + Étape) */}
        <div className="flex flex-col gap-1.5">
          <span className={`text-[10px] w-fit font-extrabold px-2.5 py-1 rounded-full uppercase tracking-widest ${currentStatusStyle}`}>
            {currentStatusLabel}
          </span>
          {/* L'étiquette qui affichera "Poule A" ou "1/4 Finale" */}
          <span className="text-[10px] w-fit font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded uppercase tracking-wider border border-slate-100">
            {currentStageLabel}
          </span>
        </div>
        
        {/* Droite : Logistique (Date, Heure, Terrain) */}
        <div className="flex flex-col items-end gap-1.5 text-xs text-slate-400 font-medium">
          {match.start_time ? (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {new Date(match.start_time).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })} à {new Date(match.start_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          ) : (
            <span className="text-slate-300 italic">Date à définir</span>
          )}

          {match.court_name && (
            <span className="flex items-center gap-1 text-slate-500">
              <MapPin className="w-3.5 h-3.5" />
              {match.court_name}
            </span>
          )}
        </div>

      </div>

      {/* Équipe Domicile */}
        <div className="flex justify-between items-center">
          <span className={`font-bold truncate pr-4 ${!isEditing && match.home_score > match.away_score ? 'text-slate-900' : 'text-slate-600'}`}>
            {displayHomeTeam}
          </span>
          {isEditing ? (
            <input 
              type="number" 
              value={localHomeScore}                        
              onChange={(e) => setLocalHomeScore(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              disabled={readOnly}
              className="w-16 text-xl font-black text-center text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
          ) : (
            <span 
              onClick={(e) => { 
                e.stopPropagation(); 
                if (!readOnly) setIsEditing(true); // 👈 Bloque le passage en édition si readOnly
              }}
              // 👇 Conditionne les classes de hover et le pointeur selon readOnly
              className={`text-xl font-black text-slate-800 bg-slate-50 px-3 py-1 rounded-lg min-w-[3rem] text-center transition-colors
                ${readOnly ? 'cursor-default' : 'hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer'}
              `}
              title={readOnly ? undefined : "Cliquez pour modifier"} // 👈 Cache le tooltip en lecture seule
            >
              {match.home_score ?? '-'}
            </span>
          )}
        </div>

        {/* Équipe Extérieur */}
        <div className="flex justify-between items-center mt-2">
          <span className={`font-bold truncate pr-4 ${!isEditing && match.away_score > match.home_score ? 'text-slate-900' : 'text-slate-600'}`}>
            {displayAwayTeam}
          </span>
          {isEditing ? (
            <input 
              type="number" 
              value={localAwayScore}              
              onChange={(e) => setLocalAwayScore(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              disabled={readOnly}
              className="w-16 text-xl font-black text-center text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          ) : (
            <span 
              onClick={(e) => { 
                e.stopPropagation(); 
                if (!readOnly) setIsEditing(true); // 👈 Bloque le passage en édition si readOnly
              }}
              className={`text-xl font-black text-slate-800 bg-slate-50 px-3 py-1 rounded-lg min-w-[3rem] text-center transition-colors
                ${readOnly ? 'cursor-default' : 'hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer'}
              `}
              title={readOnly ? undefined : "Cliquez pour modifier"} // 👈 Cache le tooltip
            >
              {match.away_score ?? '-'}
            </span>
          )}
        </div>

      {/* BARRE D'ACTION ÉDITION */}
      {/* 👇 1. On cache si readOnly. 2. On affiche SI isEditing (j'ai enlevé le '!') 👇 */}
      {!readOnly && isEditing && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end gap-2 animate-in fade-in slide-in-from-top-2">
          <button 
            onClick={handleCancel}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Annuler
          </button>
          <button 
            onClick={handleValidate}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-md transition-colors shadow-sm"
          >
            <Check className="w-3.5 h-3.5" />
            Valider
          </button>
        </div>
      )}

      {/* 👇 Section des Officiels RESTAURÉE (Arbitres + OTM) 👇 */}
      {!isEditing && (referees.length > 0 || tableStaff.length > 0) && (
        <div className="mt-4 pt-3 border-t border-slate-50 flex flex-col gap-1.5">
          {referees.length > 0 && (
            <div className="flex items-start gap-1.5 text-[11px] text-indigo-600 font-medium">
              <User className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>Arbitre(s) : {referees.map(r => getOfficialName(r.user_id)).join(', ')}</span>
            </div>
          )}
          {tableStaff.length > 0 && (
            <div className="flex items-start gap-1.5 text-[11px] text-emerald-600 font-medium">
              <ClipboardList className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>OTM : {tableStaff.map(t => getOfficialName(t.user_id)).join(', ')}</span>
            </div>
          )}
        </div>
      )}

      {/* Boutons d'Action Rapide */}
      {/* 👇 On ajoute !readOnly ici 👇 */}
      {!readOnly && !isEditing && (
        <div className="absolute bottom-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all z-10">
          <button 
            onClick={(e) => { 
              e.stopPropagation(); 
              if (onEdit) onEdit(match); 
              else if (onClick) onClick(match); 
            }}
            className="p-2 bg-white/95 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg shadow-sm border border-slate-100 backdrop-blur-sm transition-colors"
            title="Modifier les détails du match"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          {onDelete && (
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(match.id); }}
              className="p-2 bg-white/95 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg shadow-sm border border-slate-100 backdrop-blur-sm transition-colors"
              title="Supprimer le match"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

    </Card>
  );
}