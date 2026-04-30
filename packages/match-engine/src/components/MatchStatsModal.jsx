import React from 'react';
import { X } from 'lucide-react';

export function MatchStatsModal({ isOpen, onClose, matchData, playerStats }) {
  if (!isOpen || !matchData) return null;

  const renderTeamStats = (teamName, roster, teamColor) => {
    // Tri par numéro de maillot
    const sortedRoster = [...(roster || [])].sort((a, b) => (parseInt(a.number) || 0) - (parseInt(b.number) || 0));

    return (
      <div className="flex-1 min-w-0">
        <h3 className={`text-lg font-black uppercase tracking-widest mb-3 ${teamColor} border-b-2 pb-2`}>
          {teamName}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50">
              <tr>
                <th className="px-2 py-2 w-8 text-center">#</th>
                <th className="px-2 py-2">Joueur</th>
                <th className="px-2 py-2 text-center text-emerald-600 font-black">PTS</th>
                <th className="px-2 py-2 text-center text-rose-500">FL</th>
                <th className="px-2 py-2 text-center">3PT</th>
                <th className="px-2 py-2 text-center">2PT</th>
                <th className="px-2 py-2 text-center">LF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedRoster.map(player => {
                const stats = playerStats[player.id] || {};
                const pts = stats.points || 0;
                const fouls = stats.fouls || 0;
                
                return (
                  <tr key={player.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-2 py-1.5 text-center font-black text-slate-400">{player.number}</td>
                    <td className="px-2 py-1.5 font-bold text-slate-800 truncate max-w-[120px]">{player.name}</td>
                    <td className="px-2 py-1.5 text-center font-black text-emerald-600 text-base">{pts}</td>
                    <td className="px-2 py-1.5 text-center font-bold text-rose-500">{fouls}</td>
                    <td className="px-2 py-1.5 text-center text-slate-600">{stats['3pt_made'] || 0}</td>
                    <td className="px-2 py-1.5 text-center text-slate-600">{stats['2pt_made'] || 0}</td>
                    <td className="px-2 py-1.5 text-center text-slate-600">{stats['free_throw'] || 0}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header Modale */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
          <h2 className="text-xl font-black uppercase tracking-widest text-slate-800">Feuille de Match (Live)</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500 hover:text-slate-800"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Corps Modale */}
        <div className="p-4 md:p-6 overflow-y-auto flex flex-col lg:flex-row gap-8">
          {renderTeamStats(
            matchData.home_team?.name || matchData.home?.name || "DOMICILE", 
            matchData.homeRoster, 
            "text-blue-600 border-blue-200"
          )}
          
          <div className="hidden lg:block w-px bg-slate-200 shrink-0"></div>
          
          {renderTeamStats(
            matchData.away_team?.name || matchData.away?.name || "EXTÉRIEUR", 
            matchData.awayRoster, 
            "text-red-600 border-red-200"
          )}
        </div>
        
      </div>
    </div>
  );
}