import React from 'react';

// 1️⃣ Ajout de readOnly = false
export function TournamentBracket({ stages, teams, selectedSlot, onSlotClick, readOnly = false, onTeamClick }) {
  // On récupère le nom de la première phase pour savoir quand afficher "Bye"
  const firstRoundStage = stages[0]?.matches[0]?.stage;

  const renderMatch = (match) => {
    const isFinished = match.home_score !== null && match.away_score !== null;
    const winnerId = isFinished ? (match.home_score > match.away_score ? match.home_team_id : match.away_team_id) : null;

    const homeTeamInfo = teams.find(t => t.id === match.home_team_id || t.teamId === match.home_team_id);
    const awayTeamInfo = teams.find(t => t.id === match.away_team_id || t.teamId === match.away_team_id);

    const homeName = homeTeamInfo ? homeTeamInfo.name : (match.stage === firstRoundStage ? <span className="text-slate-400 italic text-xs">Bye</span> : <span className="text-slate-300 italic text-xs">À déterminer</span>);
    const awayName = awayTeamInfo ? awayTeamInfo.name : (match.stage === firstRoundStage ? <span className="text-slate-400 italic text-xs">Bye</span> : <span className="text-slate-300 italic text-xs">À déterminer</span>);

    const getSlotStyle = (slotType, teamId) => {
      if (selectedSlot?.matchId === match.id && selectedSlot?.slotType === slotType) return 'bg-indigo-100 ring-2 ring-indigo-500 z-10';
      if (winnerId === teamId && teamId !== null) return 'bg-emerald-50';
      
      // 2️⃣ Si readOnly est vrai, curseur normal. Sinon, curseur main + hover
      return readOnly ? 'cursor-default' : 'hover:bg-slate-50 cursor-pointer transition-colors';
    };

    return (
      <div key={match.id} className="relative mb-8 last:mb-0">
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden w-64">
          
          {/* 3️⃣ Ajout de !readOnly dans le onClick Domicile */}
          <div 
            onClick={() => !readOnly && onSlotClick && onSlotClick(match.id, 'home_team_id', match.home_team_id)} 
            className={`flex justify-between items-center p-3 border-b border-slate-100 ${getSlotStyle('home_team_id', match.home_team_id)}`}
          >
            {/* 👇 ICI : On remplace le span du nom Domicile */}
            <span 
              className={`text-sm font-bold truncate ${onTeamClick && match.home_team_id ? 'cursor-pointer hover:text-indigo-600 transition-colors' : ''}`}
              onClick={(e) => {
                if (onTeamClick && match.home_team_id) {
                  e.stopPropagation(); // Empêche de cliquer sur tout le cadre "slot"
                  onTeamClick(match.home_team_id);
                }
              }}
            >
              {homeName}
            </span>
            <span className="font-black text-indigo-600">{match.home_score ?? '-'}</span>
          </div>
          
          {/* 3️⃣ Ajout de !readOnly dans le onClick Extérieur */}
          <div 
            onClick={() => !readOnly && onSlotClick && onSlotClick(match.id, 'away_team_id', match.away_team_id)} 
            className={`flex justify-between items-center p-3 ${getSlotStyle('away_team_id', match.away_team_id)}`}
          >
            {/* 👇 ICI : On remplace le span du nom Extérieur */}
            <span 
              className={`text-sm font-bold truncate ${onTeamClick && match.away_team_id ? 'cursor-pointer hover:text-indigo-600 transition-colors' : ''}`}
              onClick={(e) => {
                if (onTeamClick && match.away_team_id) {
                  e.stopPropagation(); // Empêche de cliquer sur tout le cadre "slot"
                  onTeamClick(match.away_team_id);
                }
              }}
            >
              {awayName}
            </span>
            <span className="font-black text-indigo-600">{match.away_score ?? '-'}</span>
          </div>

        </div>
      </div>
    );
  };

  return (
    <div className="flex gap-12 overflow-x-auto pb-8">
      {stages.map((stage) => (
        <div key={stage.id} className="flex flex-col">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 text-center">
            {stage.label}
          </h3>
          <div className="flex flex-col justify-around flex-1 min-h-[500px]">
            {stage.matches.map(renderMatch)}
          </div>
        </div>
      ))}
    </div>
  );
}