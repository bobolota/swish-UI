import React from 'react';
import { X } from 'lucide-react';

export function MatchStatsModal({ isOpen, onClose, matchData, playerStats, playingTimes = {}, isInline = false }) {
  if (!isOpen || !matchData) return null;

  // Helpers de calcul
  const formatMin = (seconds) => {
    if (!seconds) return "00:00";
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const calcPct = (made, miss) => {
    const total = (made || 0) + (miss || 0);
    if (total === 0) return "-";
    return Math.round((made / total) * 100) + "%";
  };

  const renderTeamStats = (teamName, roster, teamColor) => {
    const sortedRoster = [...(roster || [])].sort((a, b) => (parseInt(a.number) || 0) - (parseInt(b.number) || 0));

    // Ligne des totaux d'équipe
    const teamTotals = { pts: 0, reb: 0, ast: 0, stl: 0, blk: 0, to: 0, eff: 0 };

    return (
      <div className="flex-1 min-w-0">
        <h3 className={`text-lg font-black uppercase tracking-widest mb-3 ${teamColor} border-b-2 pb-2`}>
          {teamName}
        </h3>
        <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-[10px] text-slate-500 uppercase bg-slate-100/80">
              <tr>
                <th className="px-2 py-2 w-8 text-center border-b border-slate-200">#</th>
                <th className="px-2 py-2 border-b border-slate-200 sticky left-0 bg-slate-100/90 z-10">Joueur</th>
                <th className="px-2 py-2 text-center border-b border-slate-200 text-slate-400">MIN</th>
                <th className="px-2 py-2 text-center text-emerald-600 font-black border-b border-slate-200">PTS</th>
                <th className="px-2 py-2 text-center border-b border-slate-200 border-l border-slate-200">FG</th>
                <th className="px-2 py-2 text-center border-b border-slate-200">3P%</th>
                <th className="px-2 py-2 text-center border-b border-slate-200">2P%</th>
                <th className="px-2 py-2 text-center border-b border-slate-200">LF%</th>
                <th className="px-2 py-2 text-center border-b border-slate-200 border-l border-slate-200 text-slate-400">REB</th>
                <th className="px-2 py-2 text-center border-b border-slate-200 text-slate-400">AST</th>
                <th className="px-2 py-2 text-center border-b border-slate-200 text-slate-400">STL</th>
                <th className="px-2 py-2 text-center border-b border-slate-200 text-slate-400">BLK</th>
                <th className="px-2 py-2 text-center border-b border-slate-200 text-rose-400 border-l border-slate-200">TO</th>
                <th className="px-2 py-2 text-center text-rose-500 font-black border-b border-slate-200">FL</th>
                <th className="px-2 py-2 text-center text-indigo-600 font-black border-b border-slate-200 border-l border-slate-200">EFF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {sortedRoster.map(player => {
                const stats = playerStats[player.id] || {};
                const pTime = playingTimes[player.id] || 0;
                
                // Sécurisation des valeurs
                const pts = stats.points || 0;
                const reb = stats.reb || 0;
                const ast = stats.ast || 0;
                const stl = stats.stl || 0;
                const blk = stats.blk || 0;
                const to = stats.turnover || 0;
                const fl = stats.fouls || 0;

                const fgMade = (stats['3pt_made'] || 0) + (stats['2pt_made'] || 0);
                const fgMiss = (stats['3pt_miss'] || 0) + (stats['2pt_miss'] || 0);
                
                // Formule FIBA : (PTS + REB + AST + STL + BLK) - (Missed FG + Missed FT + TO)
                const eff = (pts + reb + ast + stl + blk) - (fgMiss + (stats.free_throw_miss || 0) + to);

                // Agrégation Totaux Équipe
                teamTotals.pts += pts; teamTotals.reb += reb; teamTotals.ast += ast;
                teamTotals.stl += stl; teamTotals.blk += blk; teamTotals.to += to; teamTotals.eff += eff;

                return (
                  <tr key={player.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-2 py-1.5 text-center font-black text-slate-400 bg-slate-50">{player.number}</td>
                    <td className="px-2 py-1.5 font-bold text-slate-800 max-w-[140px] truncate sticky left-0 bg-white z-10 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.05)]">{player.name}</td>
                    
                    <td className="px-2 py-1.5 text-center text-xs font-mono text-slate-400">{formatMin(pTime)}</td>
                    <td className="px-2 py-1.5 text-center font-black text-emerald-600 text-base bg-emerald-50/30">{pts}</td>
                    
                    {/* Détail Tirs */}
                    <td className="px-2 py-1.5 text-center text-slate-600 border-l border-slate-100 text-xs">
                      {fgMade}/{fgMade + fgMiss}
                    </td>
                    <td className="px-2 py-1.5 text-center text-slate-500 text-xs">{calcPct(stats['3pt_made'], stats['3pt_miss'])}</td>
                    <td className="px-2 py-1.5 text-center text-slate-500 text-xs">{calcPct(stats['2pt_made'], stats['2pt_miss'])}</td>
                    <td className="px-2 py-1.5 text-center text-slate-500 text-xs">{calcPct(stats.free_throw, stats.free_throw_miss)}</td>
                    
                    {/* Détail Avancé */}
                    <td className="px-2 py-1.5 text-center text-slate-600 font-medium border-l border-slate-100 bg-slate-50/50">{reb}</td>
                    <td className="px-2 py-1.5 text-center text-slate-600 font-medium bg-slate-50/50">{ast}</td>
                    <td className="px-2 py-1.5 text-center text-slate-600 font-medium bg-slate-50/50">{stl}</td>
                    <td className="px-2 py-1.5 text-center text-slate-600 font-medium bg-slate-50/50">{blk}</td>
                    
                    <td className="px-2 py-1.5 text-center text-rose-400 font-medium border-l border-slate-100">{to}</td>
                    <td className="px-2 py-1.5 text-center font-bold text-rose-500 bg-rose-50/30">{fl}</td>
                    
                    {/* Évaluation */}
                    <td className={`px-2 py-1.5 text-center font-black border-l border-slate-100 ${eff >= 15 ? 'text-indigo-600 bg-indigo-50/50' : eff < 0 ? 'text-rose-600 bg-rose-50/50' : 'text-slate-600 bg-slate-50'}`}>
                      {eff}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Pied de tableau (Totaux) */}
            <tfoot className="bg-slate-100/80 font-black text-slate-700 text-xs border-t-2 border-slate-200">
              <tr>
                <td colSpan={3} className="px-2 py-2 text-right uppercase tracking-widest sticky left-0 bg-slate-100/90 z-10">Totaux</td>
                <td className="px-2 py-2 text-center text-emerald-600">{teamTotals.pts}</td>
                <td colSpan={4} className="border-l border-slate-200"></td>
                <td className="px-2 py-2 text-center border-l border-slate-200">{teamTotals.reb}</td>
                <td className="px-2 py-2 text-center">{teamTotals.ast}</td>
                <td className="px-2 py-2 text-center">{teamTotals.stl}</td>
                <td className="px-2 py-2 text-center">{teamTotals.blk}</td>
                <td className="px-2 py-2 text-center text-rose-500 border-l border-slate-200">{teamTotals.to}</td>
                <td className="px-2 py-2 text-center text-rose-500">-</td>
                <td className="px-2 py-2 text-center text-indigo-600 border-l border-slate-200">{teamTotals.eff}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    );
  };

  // On stocke le contenu (sans le blur background) dans une variable
  const content = (
    <div className={`flex flex-col ${isInline ? 'w-full' : 'bg-white rounded-2xl shadow-2xl w-full max-w-[95vw] max-h-[95vh] overflow-hidden'}`}>
      
      {/* Header Modale - On le masque totalement en mode Inline */}
      {!isInline && (
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50 shrink-0">
          <h2 className="text-xl font-black uppercase tracking-widest text-slate-800">Box Score</h2>          
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500 hover:text-slate-800"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Corps */}
      <div className={`overflow-y-auto flex flex-col ${!isInline ? 'xl:flex-row' : ''} gap-6 md:gap-10 ${isInline ? 'p-0' : 'p-4 md:p-6'}`}>
        {renderTeamStats(
          matchData.home_team?.name || matchData.home?.name || "DOMICILE", 
          matchData.homeRoster, 
          "text-blue-600 border-blue-200"
        )}
        
        <div className="hidden xl:block w-px bg-slate-200 shrink-0"></div>
        
        {renderTeamStats(
          matchData.away_team?.name || matchData.away?.name || "EXTÉRIEUR", 
          matchData.awayRoster, 
          "text-red-600 border-red-200"
        )}
      </div>
    </div>
  );

  // Si isInline, on rend juste le bloc. Sinon, on ajoute le fond noir transparent "Modale".
  if (isInline) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-2 md:p-4 animate-in fade-in duration-200">
      {content}
    </div>
  );
}