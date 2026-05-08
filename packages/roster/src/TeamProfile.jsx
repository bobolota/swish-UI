import React, { useState, useEffect } from 'react';
import { supabase } from '@swish/core';
import { MatchCard } from '@swish/match-engine';
import { Shield, Users, CalendarDays, MapPin, User } from 'lucide-react';

// NOUVEAU : On reçoit les actions en props pour être 100% réutilisable
export function TeamProfile({ teamId, onPlayerClick, onMatchClick }) {
  const [team, setTeam] = useState(null);
  const [roster, setRoster] = useState([]);
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTeamData = async () => {
      console.log("TEAM ID REÇU DANS LE COMPOSANT :", teamId);
      if (!teamId) return;
      setIsLoading(true);
      
      // 1. On cherche l'équipe en premier
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .maybeSingle();

      console.log("--- DEBUG TEAM ---", teamData, teamError);
      
      if (teamData) {
        setTeam(teamData); // On l'affiche direct !
      }

      // 2. On cherche le roster (séparément, sans faire planter le reste)
      const { data: rosterData } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', teamId);
        
      setRoster(rosterData || []);

      // On dit à Supabase de récupérer les noms en même temps
const { data: matchesData } = await supabase
        .from('matches')
        .select(`
          *,
          home_team:teams!home_team_id(id, name),
          away_team:teams!away_team_id(id, name)
        `)
        .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
        .order('created_at', { ascending: false })
        .limit(10);
      
      // ✅ LA LIGNE MANQUANTE :
      setMatches(matchesData || []);
      
      setIsLoading(false);
    };

    fetchTeamData();
  }, [teamId]);

  if (isLoading) {
    return <div className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest animate-pulse">Chargement de l'équipe...</div>;
  }

  if (!team) {
    return (
      <div className="text-center py-20 text-slate-500">
        <Shield className="w-16 h-16 mx-auto mb-4 text-slate-300" />
        <p className="text-xl font-bold">Équipe introuvable</p>
      </div>
    );
  }

  console.log("--- DEBUG MATCHES ---", matches);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* HERO HEADER */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="w-24 h-24 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner z-10 flex-shrink-0">
          <Shield className="w-12 h-12" />
        </div>
        <div className="text-center md:text-left z-10">
          <h1 className="text-3xl font-black text-slate-800 uppercase tracking-widest mb-2">{team.name}</h1>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm font-bold text-slate-500 uppercase">
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {team.city || "Ville inconnue"}</span>
            <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {roster.length} Joueurs</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ROSTER */}
        <div className="lg:col-span-1 bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-500" /> Effectif
          </h2>
          {roster.length === 0 ? (
            <p className="text-sm text-slate-400 italic">Aucun joueur renseigné.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {roster.map((member) => (
                <div 
                  key={member.id} 
                  onClick={() => onPlayerClick && onPlayerClick(member.profiles?.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-colors border border-transparent ${onPlayerClick ? 'cursor-pointer hover:bg-slate-50 hover:border-slate-100' : ''}`}
                >
                  <div className="w-10 h-10 bg-slate-200 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {member.profiles?.avatar_url ? (
                      <img src={member.profiles.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{member.profiles?.first_name} {member.profiles?.last_name}</p>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{member.role === 'captain' ? 'Capitaine' : 'Joueur'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* HISTORIQUE MATCHS */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-emerald-500" /> Derniers Matchs
          </h2>
          {matches.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <p className="text-slate-400 font-medium">Aucun match joué.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {matches.map(match => {
                // 1. On nettoie les données au cas où Supabase renvoie un tableau au lieu d'un objet
                // 1. On nettoie les données 
const cleanHomeTeam = Array.isArray(match.home_team) ? match.home_team[0] : match.home_team;
const cleanAwayTeam = Array.isArray(match.away_team) ? match.away_team[0] : match.away_team;

// 2. L'ASTUCE EST ICI : On ajoute manuellement 'teamId' pour que MatchCard le trouve à coup sûr
const matchTeams = [
  cleanHomeTeam ? { ...cleanHomeTeam, teamId: cleanHomeTeam.id } : { ...team, teamId: team.id },
  cleanAwayTeam ? { ...cleanAwayTeam, teamId: cleanAwayTeam.id } : { ...team, teamId: team.id }
].filter(Boolean);

                return (
                  <div 
                    key={match.id} 
                    onClick={() => onMatchClick && onMatchClick(match.id)} 
                    className={onMatchClick ? "cursor-pointer transition-transform hover:-translate-y-1" : ""}
                  >
                    {/* 3. Et on l'utilise ici */}
                    <MatchCard 
                      match={match} 
                      readOnly={true} 
                      teams={matchTeams} 
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}