import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMatchEngine, SPORT_CONFIGS, PlayByPlay } from '@swish/match-engine';
import { ChevronLeft, Trophy, Users, Hash, Activity, Star } from 'lucide-react';

export default function MatchSummary() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { matchData, events, loading } = useMatchEngine(id);

  // On récupère la config pour savoir quelles stats afficher (ex: maxFouls)
  const sportId = matchData?.tournaments?.sport_id;
  const currentConfig = SPORT_CONFIGS[sportId] || SPORT_CONFIGS['basketball'];
  const tournamentId = matchData?.tournament_id;

  // 2. Fonction pour retourner au planning du tournoi
  const handleBack = () => {
    if (tournamentId) {
      // On construit l'URL exacte que tu as citée
      navigate(`/tournament/${tournamentId}?tab=schedule`);
    } else {
      // Sécurité si les données ne sont pas encore là
      navigate(-1); 
    }
  };

  // CALCUL DES STATS (On réutilise notre logique blindée)
  const playerStats = useMemo(() => {
    const stats = {};
    if (!events) return [];

    events.forEach(event => {
      const pId = event.player_id || event.player?.id;
      if (!pId) return;
      if (!stats[pId]) {
        stats[pId] = { 
          id: pId, 
          name: event.player?.name || "Joueur", 
          team_id: event.team_id,
          points: 0, fouls: 0, ast: 0, reb: 0, stl: 0, blk: 0 
        };
      }

      // Points dynamiques via config
      let pts = 0;
      let isFoul = false;
      const type = event.event_type;

      for (const action of currentConfig.actions) {
        if (action.type === type) { pts = action.points || 0; isFoul = action.isFoul; break; }
        if (action.outcomes) {
          const out = action.outcomes.find(o => `${action.type}${o.suffix}` === type);
          if (out) { pts = out.points || 0; isFoul = action.isFoul; break; }
        }
      }

      stats[pId].points += pts;
      if (isFoul) stats[pId].fouls += 1;
      if (type === 'assist') stats[pId].ast += 1;
      if (type === 'def_rebound' || type === 'off_rebound') stats[pId].reb += 1;
      if (type === 'steal') stats[pId].stl += 1;
      if (type === 'block') stats[pId].blk += 1;
    });

    return Object.values(stats).sort((a, b) => b.points - a.points);
  }, [events, currentConfig]);

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-slate-400">CHARGEMENT DES STATS...</div>;

  const homePlayers = playerStats.filter(p => p.team_id === matchData?.home_team_id);
  const awayPlayers = playerStats.filter(p => p.team_id === matchData?.away_team_id);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* HEADER NAVIGATION CORRIGÉ */}
      <div className="max-w-6xl mx-auto p-4">
        <button 
          onClick={handleBack} 
          className="flex items-center gap-2 text-slate-500 hover:text-black font-bold transition-all"
        >
          <ChevronLeft className="w-5 h-5" /> RETOUR AU PLANNING
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4 space-y-6">
        
        {/* SCOREBOARD FINAL STYLE "BROADCAST" */}
        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
          
          <div className="relative z-10 flex justify-between items-center px-4 md:px-12">
            <div className="text-center space-y-2">
              <div className="w-20 h-20 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center text-3xl font-black shadow-lg shadow-blue-500/20">
                {matchData?.home?.name?.charAt(0)}
              </div>
              <div className="text-xl font-black uppercase tracking-tighter">{matchData?.home?.name}</div>
            </div>

            <div className="text-center">
              <div className="text-amber-400 font-black text-xs uppercase tracking-[0.3em] mb-4">Score Final</div>
              <div className="flex items-center gap-6">
                <span className="text-7xl md:text-8xl font-black tracking-tighter">{matchData?.home_score}</span>
                <span className="text-2xl font-light text-slate-500">-</span>
                <span className="text-7xl md:text-8xl font-black tracking-tighter">{matchData?.away_score}</span>
              </div>
              <div className="mt-4 inline-block px-4 py-1 bg-slate-800 rounded-full text-[10px] font-bold text-slate-400 uppercase">
                Terminé • {new Date(matchData?.updated_at).toLocaleDateString()}
              </div>
            </div>

            <div className="text-center space-y-2">
              <div className="w-20 h-20 bg-red-600 rounded-2xl mx-auto flex items-center justify-center text-3xl font-black shadow-lg shadow-red-500/20">
                {matchData?.away?.name?.charAt(0)}
              </div>
              <div className="text-xl font-black uppercase tracking-tighter">{matchData?.away?.name}</div>
            </div>
          </div>
        </div>

        {/* CONTENU PRINCIPAL */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLONNE DE GAUCHE : BOX SCORE (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <h3 className="text-lg font-black uppercase mb-6 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" /> Statistiques Individuelles
              </h3>
              
              <div className="space-y-8">
                {/* TABLEAU DOMICILE */}
                <div>
                  <h4 className="text-xs font-black text-blue-600 uppercase mb-3 px-2 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full" /> {matchData?.home?.name}
                  </h4>
                  <StatTable players={homePlayers} />
                </div>

                {/* TABLEAU EXTÉRIEUR */}
                <div>
                  <h4 className="text-xs font-black text-red-600 uppercase mb-3 px-2 flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-600 rounded-full" /> {matchData?.away?.name}
                  </h4>
                  <StatTable players={awayPlayers} />
                </div>
              </div>
            </section>
          </div>

          {/* COLONNE DE DROITE : FIL DU MATCH (1/3) */}
          <div className="space-y-6">
            <PlayByPlay 
              events={events} 
              homeTeamId={matchData?.home_team_id} 
              currentConfig={currentConfig}
              readOnly={true} // Optionnel: pour cacher le bouton poubelle
            />
          </div>

        </div>
      </div>
    </div>
  );
}

// Sous-composant pour le tableau (Agnostique)
function StatTable({ players }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="text-[10px] font-black text-slate-400 uppercase border-b border-slate-100">
            <th className="pb-2 px-2">Joueur</th>
            <th className="pb-2 px-2 text-center">PTS</th>
            <th className="pb-2 px-2 text-center">AST</th>
            <th className="pb-2 px-2 text-center">REB</th>
            <th className="pb-2 px-2 text-center">FLT</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {players.map(p => (
            <tr key={p.id} className="group hover:bg-slate-50/50 transition-colors">
              <td className="py-3 px-2">
                <div className="font-bold text-slate-800 text-sm">{p.name}</div>
              </td>
              <td className="py-3 px-2 text-center">
                <span className="font-black text-slate-900">{p.points}</span>
              </td>
              <td className="py-3 px-2 text-center text-sm text-slate-500">{p.ast}</td>
              <td className="py-3 px-2 text-center text-sm text-slate-500">{p.reb}</td>
              <td className="py-3 px-2 text-center">
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${p.fouls >= 4 ? 'bg-red-100 text-red-600' : 'text-slate-400'}`}>
                  {p.fouls}
                </span>
              </td>
            </tr>
          ))}
          {players.length === 0 && (
            <tr><td colSpan="5" className="py-8 text-center text-xs italic text-slate-400">Aucune statistique enregistrée</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}