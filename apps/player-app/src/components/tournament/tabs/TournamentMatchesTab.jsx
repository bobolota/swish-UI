import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTournamentMatches, useTournament, useTournamentTeams } from '@swish/competition';
import { useAuth } from '@swish/identity';
import { MatchCard } from '@swish/match-engine';
import { ChevronDown, ChevronUp, Calendar, Trophy, PlayCircle } from 'lucide-react';

export function TournamentMatchesTab({ tournamentId }) {
  const navigate = useNavigate();
  
  // 1. Récupération des données
  const { matches, loading } = useTournamentMatches(tournamentId);
  const { teams } = useTournamentTeams(tournamentId);
  const { user } = useAuth();
  const { checkMyRegistration } = useTournament(tournamentId, user?.id);
  
  // 2. États de l'interface
  const [myTeamId, setMyTeamId] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all' ou 'mine'
  
  // 3. États pour les bandeaux (Accordéons)
  const [showLive, setShowLive] = useState(true);
  const [showUpcoming, setShowUpcoming] = useState(true);
  const [showFinished, setShowFinished] = useState(false); // 👈 Terminé est plié par défaut !

  // Au chargement, on vérifie si l'utilisateur connecté fait partie d'une équipe inscrite
  useEffect(() => {
    if (user && tournamentId) {
      checkMyRegistration().then(reg => {
        if (reg && reg.team_id) {
          setMyTeamId(reg.team_id);
        }
      });
    }
  }, [user, tournamentId]);

  if (loading) return <div className="p-10 text-center animate-pulse text-slate-400 font-bold tracking-widest uppercase">Chargement du calendrier...</div>;

  if (!matches || matches.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
        <p className="text-slate-400 font-medium">Le calendrier n'est pas encore disponible.</p>
      </div>
    );
  }

  // --- LOGIQUE DE FILTRAGE ---
  const filteredMatches = matches.filter(m => {
    if (!m.home_team_id || !m.away_team_id) {
    return false; 
  }
    
    // 2. L'ancien filtre "Mes matchs / Tous les matchs"
    if (filter === 'mine' && myTeamId) {
      return m.home_team_id === myTeamId || m.away_team_id === myTeamId;
    }
    
    return true;
  });

  // --- CATÉGORISATION DES MATCHS ---
  const liveMatches = filteredMatches.filter(m => m.status === 'paused' || m.status === 'live');
  const upcomingMatches = filteredMatches.filter(m => m.status === 'idle' || m.status === 'scheduled');
  const finishedMatches = filteredMatches.filter(m => m.status === 'finished');

  return (
    <div className="flex flex-col gap-6">
      
      {/* LE TOGGLE (Visible uniquement si l'utilisateur est inscrit) */}
      {myTeamId && (
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <h3 className="font-bold text-slate-800">Filtre du calendrier</h3>
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button 
              onClick={() => setFilter('all')}
              className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${filter === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Tous les matchs
            </button>
            <button 
              onClick={() => setFilter('mine')}
              className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all flex items-center gap-2 ${filter === 'mine' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Mes matchs
            </button>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* BANDEAU 1 : MATCHS EN COURS (LIVE)        */}
      {/* ========================================= */}
      {liveMatches.length > 0 && (
        <div className="bg-white rounded-2xl border border-amber-200 overflow-hidden shadow-sm">
          <button 
            onClick={() => setShowLive(!showLive)}
            className="w-full flex items-center justify-between p-4 bg-amber-50/50 hover:bg-amber-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <PlayCircle className="w-5 h-5 text-amber-500" />
              <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm">Matchs en cours</h3>
              <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">LIVE</span>
            </div>
            {showLive ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>
          
          {showLive && (
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 bg-slate-50/30">
              {liveMatches.map(match => (
                <div key={match.id} className="cursor-pointer transition-transform hover:-translate-y-1" onClick={() => navigate(`/match/${match.id}`)}>
                  <MatchCard match={match} readOnly={true} teams={teams} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================= */}
      {/* BANDEAU 2 : MATCHS À VENIR                */}
      {/* ========================================= */}
      {upcomingMatches.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <button 
            onClick={() => setShowUpcoming(!showUpcoming)}
            className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-indigo-500" />
              <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm">À venir</h3>
              <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">{upcomingMatches.length}</span>
            </div>
            {showUpcoming ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>
          
          {showUpcoming && (
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {upcomingMatches.map(match => (
                <div key={match.id} className="cursor-pointer transition-transform hover:-translate-y-1" onClick={() => navigate(`/match/${match.id}`)}>
                  <MatchCard match={match} readOnly={true} teams={teams}/>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================= */}
      {/* BANDEAU 3 : MATCHS TERMINÉS               */}
      {/* ========================================= */}
      {finishedMatches.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm opacity-80 hover:opacity-100 transition-opacity">
          <button 
            onClick={() => setShowFinished(!showFinished)}
            className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Trophy className="w-5 h-5 text-slate-400" />
              <h3 className="font-black text-slate-600 uppercase tracking-widest text-sm">Matchs Terminés</h3>
              <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">{finishedMatches.length}</span>
            </div>
            {showFinished ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>
          
          {showFinished && (
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 bg-slate-50/50">
              {finishedMatches.map(match => (
                <div key={match.id} className="cursor-pointer transition-transform hover:-translate-y-1" onClick={() => navigate(`/match/${match.id}`)}>
                  <MatchCard match={match} readOnly={true} teams={teams}/>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MESSAGE SI AUCUN MATCH DANS LE FILTRE */}
      {filteredMatches.length === 0 && (
        <div className="text-center py-12 text-slate-400 font-medium bg-slate-50 rounded-xl border border-dashed border-slate-200">
          Tu n'as aucun match programmé dans cette catégorie.
        </div>
      )}

    </div>
  );
}