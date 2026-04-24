import React from 'react';

export function ScoreBoard({
  time = "10:00",
  period = "Q1",
  homeTeam = { name: "LOCAUX", score: 0, color: "bg-blue-600" },
  awayTeam = { name: "VISITEURS", score: 0, color: "bg-red-600" }
}) {
  return (
    <div className="bg-slate-900 text-white rounded-2xl p-6 md:p-8 shadow-2xl font-mono flex flex-col items-center border-4 border-slate-800 w-full max-w-4xl mx-auto">
      
      {/* En-tête : Temps & Période */}
      <div className="flex flex-col items-center mb-8">
        <span className="text-yellow-400 text-xl md:text-2xl font-bold mb-1 tracking-widest uppercase">
          {period}
        </span>
        <span className="text-7xl md:text-9xl font-black tracking-wider leading-none tabular-nums">
          {time}
        </span>
      </div>

      {/* Zone des Scores */}
      <div className="w-full flex justify-between items-center px-2 md:px-12">
        
        {/* Équipe Domicile (Home) */}
        <div className="flex flex-col items-center w-5/12">
          <span className="text-slate-400 text-lg md:text-2xl font-bold mb-4 truncate w-full text-center">
            {homeTeam.name}
          </span>
          <div className={`w-full aspect-square max-w-[180px] flex items-center justify-center rounded-xl ${homeTeam.color} shadow-inner border-2 border-white/10`}>
            <span className="text-7xl md:text-8xl font-black tabular-nums">{homeTeam.score}</span>
          </div>
        </div>

        {/* Séparateur Central */}
        <div className="text-4xl md:text-6xl text-slate-600 font-black flex-shrink-0">-</div>

        {/* Équipe Extérieure (Away) */}
        <div className="flex flex-col items-center w-5/12">
          <span className="text-slate-400 text-lg md:text-2xl font-bold mb-4 truncate w-full text-center">
            {awayTeam.name}
          </span>
          <div className={`w-full aspect-square max-w-[180px] flex items-center justify-center rounded-xl ${awayTeam.color} shadow-inner border-2 border-white/10`}>
            <span className="text-7xl md:text-8xl font-black tabular-nums">{awayTeam.score}</span>
          </div>
        </div>

      </div>
    </div>
  );
}