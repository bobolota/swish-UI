import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@swish/core';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@swish/ui';

export function StandingsTab({ tournamentId }) {
  const [data, setData] = useState({ pools: [], matches: [], teams: [] });
  const [isLoading, setIsLoading] = useState(true);
  
  // 👇 AU LIEU DE : const [qualifiersByPool, setQualifiersByPool] = useState({}); 👇
  const [qualifiersByPool, setQualifiersByPool] = useState(() => {
    // On essaie de récupérer les réglages sauvegardés pour CE tournoi
    const saved = localStorage.getItem(`qualifiers-${tournamentId}`);
    return saved ? JSON.parse(saved) : {};
  });

  const handleQualifiersChange = (poolId, value) => {
    setQualifiersByPool(prev => {
      // On calcule le nouveau réglage
      const newState = { ...prev, [poolId]: value };
      
      // On le sauvegarde physiquement dans le navigateur
      localStorage.setItem(`qualifiers-${tournamentId}`, JSON.stringify(newState));
      
      return newState;
    });
  };

  // --- PARAMÈTRES DU CLASSEMENT ---
  const POINTS = { win: 3, draw: 1, loss: 0 };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      const [poolsRes, matchesRes, teamsRes] = await Promise.all([
        supabase.from('pools').select('id, name').eq('tournament_id', tournamentId),
        supabase.from('matches').select('*').eq('tournament_id', tournamentId).not('home_score', 'is', null),
        supabase.from('teams').select('id, name')
      ]);

      setData({
        pools: poolsRes.data || [],
        matches: matchesRes.data || [],
        teams: teamsRes.data || []
      });
      
      setIsLoading(false);
    };

    if (tournamentId) fetchData();
  }, [tournamentId]);

  // --- LE MOTEUR DE CALCUL ---
  const standingsByPool = useMemo(() => {
    const standings = {};

    data.pools.forEach(pool => {
      standings[pool.id] = { name: pool.name, teams: {} };
    });

    data.matches.forEach(match => {
      const poolId = match.pool_id;
      if (!poolId || !standings[poolId]) return;

      const homeId = match.home_team_id;
      const awayId = match.away_team_id;

      const initTeam = (teamId) => {
        if (!standings[poolId].teams[teamId]) {
          const teamInfo = data.teams.find(t => t.id === teamId);
          standings[poolId].teams[teamId] = {
            id: teamId,
            name: teamInfo?.name || `Équipe ${teamId.substring(0,4)}`,
            played: 0, won: 0, drawn: 0, lost: 0,
            goalsFor: 0, goalsAgainst: 0, goalDiff: 0, points: 0
          };
        }
      };

      initTeam(homeId);
      initTeam(awayId);

      const home = standings[poolId].teams[homeId];
      const away = standings[poolId].teams[awayId];

      home.played += 1; away.played += 1;
      home.goalsFor += match.home_score;
      home.goalsAgainst += match.away_score;
      away.goalsFor += match.away_score;
      away.goalsAgainst += match.home_score;

      if (match.home_score > match.away_score) {
        home.won += 1; away.lost += 1;
        home.points += POINTS.win; away.points += POINTS.loss;
      } else if (match.home_score < match.away_score) {
        away.won += 1; home.lost += 1;
        away.points += POINTS.win; home.points += POINTS.loss;
      } else {
        home.drawn += 1; away.drawn += 1;
        home.points += POINTS.draw; away.points += POINTS.draw;
      }
    });

    const finalStandings = {};
    Object.keys(standings).forEach(poolId => {
      finalStandings[poolId] = {
        name: standings[poolId].name,
        teams: Object.values(standings[poolId].teams).map(t => {
          t.goalDiff = t.goalsFor - t.goalsAgainst;
          return t;
        }).sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points; 
          return b.goalDiff - a.goalDiff; 
        })
      };
    });

    return finalStandings;
  }, [data]);


  if (isLoading) return <div className="p-8 text-center text-slate-500">Calcul des classements...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">     
      {Object.entries(standingsByPool).map(([poolId, poolData]) => {
        const currentQualifiers = qualifiersByPool[poolId] ?? 2;

        return (
          <div key={poolId} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-lg">Classement - {poolData.name}</h3>
              
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Qualifiés :</label>
                <select 
                  value={currentQualifiers}
                  onChange={(e) => handleQualifiersChange(poolId, Number(e.target.value))}
                  className="border border-slate-300 rounded-md px-2 py-1 text-sm font-bold text-emerald-600 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value={0}>0</option>
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  <option value={4}>4</option>
                </select>
              </div>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50">
                  <TableHead className="w-12 text-center">#</TableHead>
                  <TableHead>Équipe</TableHead>
                  <TableHead className="text-center w-16 tooltip" title="Matchs Joués">MJ</TableHead>
                  <TableHead className="text-center w-16">V</TableHead>
                  <TableHead className="text-center w-16">N</TableHead>
                  <TableHead className="text-center w-16">D</TableHead>
                  <TableHead className="text-center w-24">BP - BC</TableHead>
                  <TableHead className="text-center w-20 font-bold">Diff</TableHead>
                  <TableHead className="text-center w-20 font-black text-indigo-600">Pts</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {poolData.teams.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-slate-400 py-8">
                      Aucun match joué dans cette poule.
                    </TableCell>
                  </TableRow>
                ) : (
                  poolData.teams.map((team, index) => {
                    const isQualified = index < currentQualifiers;

                    return (
                      <TableRow 
                        key={team.id} 
                        // J'ai enlevé la bordure de la ligne elle-même, on garde juste le fond vert
                        className={`transition-colors ${
                          isQualified ? 'bg-emerald-50/60 hover:bg-emerald-100/60' : 'hover:bg-slate-50'
                        }`}
                      >
                        {/* C'est ICI qu'on met la bordure gauche pour que ça marche à 100% ! */}
                        <TableCell className={`text-center font-medium text-slate-500 ${isQualified ? 'border-l-4 border-l-emerald-500' : 'border-l-4 border-transparent'}`}>
                          {index + 1}
                        </TableCell>
                        <TableCell className="font-bold">{team.name}</TableCell>
                        <TableCell className="text-center text-slate-600">{team.played}</TableCell>
                        <TableCell className="text-center text-emerald-600 font-medium">{team.won}</TableCell>
                        <TableCell className="text-center text-slate-400 font-medium">{team.drawn}</TableCell>
                        <TableCell className="text-center text-rose-500 font-medium">{team.lost}</TableCell>
                        <TableCell className="text-center text-slate-500 text-xs">{team.goalsFor} - {team.goalsAgainst}</TableCell>
                        <TableCell className={`text-center font-bold ${team.goalDiff > 0 ? 'text-emerald-500' : team.goalDiff < 0 ? 'text-rose-500' : 'text-slate-400'}`}>
                          {team.goalDiff > 0 ? '+' : ''}{team.goalDiff}
                        </TableCell>
                        <TableCell className="text-center font-black text-indigo-600 text-lg">{team.points}</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        );
      })}
    </div>
  );
}