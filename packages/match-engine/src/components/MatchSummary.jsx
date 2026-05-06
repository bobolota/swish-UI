import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMatchEngine, PlayByPlay, SPORT_CONFIGS } from '@swish/match-engine';
import { MatchStatsModal } from '../components/MatchStatsModal'; // On va tricher en l'utilisant comme base ou l'extraire
import { ChevronLeft, Printer, Share2 } from 'lucide-react';

export default function MatchSummary() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { matchData, events, loading } = useMatchEngine(id);

  // 3. LE USEMEMO (Calculateur intelligent FIBA Exhaustif)
    const playerStats = useMemo(() => {
      const stats = {};
      if (!events || !Array.isArray(events)) return stats;
  
      events.forEach(event => {
        const pId = event.player_id || event.player?.id;
        if (!pId) return;
        
        // Initialisation exhaustive (FIBA + Avancé)
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
  
        // Résolution agnostique via currentConfig
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
  
        // Incrémentation des Totaux (Agnostique)
        stats[pId].points += actionPoints;
        if (isFoul) stats[pId].fouls += 1;
  
        // Incrémentation du Détail (Box Score Avancée)
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
      }, [events, matchData]);

  if (loading) return <div className="p-10 text-center">Chargement du résumé...</div>;
  if (!matchData) return <div className="p-10 text-center">Match introuvable.</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      {/* HEADER ACTIONS */}
      <div className="max-w-7xl mx-auto flex justify-between items-center mb-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold transition-colors">
          <ChevronLeft /> Retour
        </button>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 shadow-sm">
            <Printer className="w-4 h-4" /> PDF
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-md">
            <Share2 className="w-4 h-4" /> Partager
          </button>
        </div>
      </div>

      {/* SCORE FINAL */}
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 p-8 mb-10 flex items-center justify-between relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-blue-600"></div>
        <div className="absolute top-0 right-0 w-2 h-full bg-red-600"></div>
        
        <div className="text-center flex-1">
          <h2 className="text-2xl font-black uppercase text-slate-800">{matchData.home_team?.name}</h2>
          <p className="text-6xl font-black text-slate-900 mt-2">{matchData.home_score}</p>
        </div>
        <div className="px-8 text-slate-300 font-black text-4xl">VS</div>
        <div className="text-center flex-1">
          <h2 className="text-2xl font-black uppercase text-slate-800">{matchData.away_team?.name}</h2>
          <p className="text-6xl font-black text-slate-900 mt-2">{matchData.away_score}</p>
        </div>
      </div>

      {/* SECTION STATISTIQUES (BOX SCORE) */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="flex items-center gap-4 mb-6">
          <h3 className="text-xl font-black uppercase tracking-widest text-slate-800">Statistiques Individuelles</h3>
          <div className="flex-1 h-px bg-slate-200"></div>
        </div>
        
        {/* On réutilise le composant de la modale mais on le rend "inline" */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
           <MatchStatsModal 
              isOpen={true} 
              onClose={() => {}} 
              matchData={matchData} 
              playerStats={playerStats} 
              playingTimes={matchData.playing_times || {}} // 👈 Récupération depuis la DB !
              isInline={true} // Optionnel : pour cacher le bouton fermer et le backdrop dans ton CSS
           />
        </div>
      </div>

      {/* SECTION PLAY-BY-PLAY */}
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <h3 className="text-xl font-black uppercase tracking-widest text-slate-800">Film du match</h3>
          <div className="flex-1 h-px bg-slate-200"></div>
        </div>
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
          <PlayByPlay 
            events={events} 
            homeTeamId={matchData.home_team_id}
            readOnly={true} // On empêche la suppression des actions après clôture
          />
        </div>
      </div>
    </div>
  );
}