import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMatchEngine, PlayByPlay, SPORT_CONFIGS, MatchStatsModal } from '@swish/match-engine';
import { ChevronLeft, Printer, Share2 } from 'lucide-react';

export default function MatchSummary() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { matchData, events, loading } = useMatchEngine(id);

  const sportId = matchData?.tournaments?.sport_id;
  const currentConfig = SPORT_CONFIGS[sportId] || SPORT_CONFIGS['basketball'];

  // 1. RE-CALCUL DES STATS (FIBA)
  const playerStats = useMemo(() => {
    const stats = {};
    if (!events || !Array.isArray(events)) return stats;

    events.forEach(event => {
      const pId = event.player_id || event.player?.id;
      if (!pId) return;
      
      if (!stats[pId]) {
        stats[pId] = { 
          points: 0, fouls: 0, 
          '3pt_made': 0, '3pt_miss': 0, 
          '2pt_made': 0, '2pt_miss': 0, 
          free_throw: 0, free_throw_miss: 0,
          ast: 0, reb: 0, stl: 0, blk: 0, turnover: 0 
        };
      }
      
      const type = event.event_type;
      let actionPoints = 0;
      let isFoul = false;

      if (currentConfig && currentConfig.actions) {
        for (const action of currentConfig.actions) {
          if (action.type === type) {
            actionPoints = action.points || 0;
            isFoul = action.isFoul || false;
            break;
          }
          if (action.outcomes) {
            const matchingOutcome = action.outcomes.find(o => `${action.type}${o.suffix}` === type);
            if (matchingOutcome) {
              actionPoints = matchingOutcome.points || 0;
              isFoul = action.isFoul || false;
              break;
            }
          }
        }
      }

      stats[pId].points += actionPoints;
      if (isFoul) stats[pId].fouls += 1;

      if (type === '3pt_made') stats[pId]['3pt_made'] += 1;
      if (type === '3pt_miss') stats[pId]['3pt_miss'] += 1;
      if (type === '2pt_made') stats[pId]['2pt_made'] += 1;
      if (type === '2pt_miss') stats[pId]['2pt_miss'] += 1;
      if (type === 'free_throw') stats[pId].free_throw += 1;
      if (type === 'free_throw_miss') stats[pId].free_throw_miss += 1;
      if (type === 'assist') stats[pId].ast += 1;
      if (type === 'def_rebound' || type === 'off_rebound') stats[pId].reb += 1;
      if (type === 'steal') stats[pId].stl += 1;
      if (type === 'block') stats[pId].blk += 1;
      if (type === 'turnover') stats[pId].turnover += 1;
    });
    
    return stats;
  }, [events, currentConfig]);

  if (loading) return <div className="flex justify-center items-center h-screen bg-slate-50 text-slate-500 font-bold tracking-widest uppercase">Chargement du rapport...</div>;
  if (!matchData) return <div className="flex justify-center items-center h-screen bg-slate-50 text-red-500 font-bold tracking-widest uppercase">Match introuvable</div>;

  return (
    <div className="min-h-screen bg-slate-50/80 p-4 md:p-6 lg:p-8 font-sans">
      
      {/* HEADER BAR */}
      <div className="max-w-[1600px] mx-auto flex justify-between items-center mb-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200">
          <ChevronLeft className="w-5 h-5" /> Retour au tournoi
        </button>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition-all hover:border-slate-300">
            <Printer className="w-4 h-4" /> Imprimer la feuille
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5">
            <Share2 className="w-4 h-4" /> Partager
          </button>
        </div>
      </div>

      {/* SUPER-LAYOUT GRID (1600px max) */}
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* ======================================================== */}
        {/* COLONNE GAUCHE : SCORE ET STATISTIQUES (Prend 70% de la largeur) */}
        {/* ======================================================== */}
        <div className="xl:col-span-8 2xl:col-span-9 flex flex-col gap-8 min-w-0">
          
          {/* 1. SCORE FINAL JUMBOTRON */}
          <div className="bg-white rounded-3xl shadow-md border border-slate-200 p-8 flex items-center justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 w-3 h-full bg-blue-600"></div>
            <div className="absolute top-0 right-0 w-3 h-full bg-red-600"></div>
            
            <div className="text-center flex-1">
              <h2 className="text-2xl font-black uppercase text-slate-800 truncate px-4">{matchData.home_team?.name}</h2>
              <p className="text-6xl sm:text-7xl font-black text-blue-600 mt-2">{matchData.home_score}</p>
            </div>
            
            <div className="px-4 sm:px-8 text-slate-200 font-black text-3xl sm:text-5xl flex flex-col items-center">
              <span>VS</span>
              <span className="text-xs uppercase tracking-widest text-slate-400 mt-2 bg-slate-100 px-3 py-1 rounded-full">Terminé</span>
            </div>
            
            <div className="text-center flex-1">
              <h2 className="text-2xl font-black uppercase text-slate-800 truncate px-4">{matchData.away_team?.name}</h2>
              <p className="text-6xl sm:text-7xl font-black text-red-600 mt-2">{matchData.away_score}</p>
            </div>
          </div>

          {/* 2. BOX SCORE COMPLÈTE */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <h3 className="text-xl font-black uppercase tracking-widest text-slate-800">Box Score</h3>                
              </div>
              <div className="flex-1 h-px bg-slate-200 ml-6"></div>
            </div>
            
            {/* Le tableau prendra maintenant 100% de l'espace disponible */}
            <MatchStatsModal 
              isOpen={true} 
              onClose={() => {}} 
              matchData={matchData} 
              playerStats={playerStats} 
              playingTimes={matchData.playing_times || {}} 
              isInline={true} 
            />
          </div>
        </div>

        {/* ======================================================== */}
        {/* COLONNE DROITE : PLAY-BY-PLAY (Alignée et Sticky)       */}
        {/* ======================================================== */}
        <div className="xl:col-span-4 2xl:col-span-3">
          {/* On utilise h-full pour s'aligner sur la Box Score et max-h pour le sticky */}
          <div className="sticky top-8 flex flex-col h-full max-h-[calc(100vh-64px)]">
            
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
              
              <div className="p-5 border-b border-slate-100 bg-slate-50/80 shrink-0 flex items-center justify-between z-10 shadow-[0_4px_15px_-3px_rgba(0,0,0,0.05)]">
                <h3 className="text-lg font-black uppercase tracking-widest text-slate-800 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                  Film du Match
                </h3>
                <span className="text-xs font-bold text-slate-400 bg-slate-200/50 px-2 py-1 rounded-lg">
                  {events?.length || 0} Actions
                </span>
              </div>
              
              {/* La zone de scroll interne */}
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-white">
                <PlayByPlay 
                  events={events} 
                  homeTeamId={matchData.home_team_id}
                  readOnly={true} 
                  currentConfig={currentConfig}
                />
              </div>

            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}