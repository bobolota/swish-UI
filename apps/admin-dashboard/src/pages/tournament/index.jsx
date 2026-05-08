import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, LayoutGrid, Calendar as CalendarIcon, Trophy as TrophyIcon, Table as TableIcon } from 'lucide-react';

// On utilise le hook partagé
import { useTournament } from '@swish/competition'; 

// On importe tes composants Organisateur
import TeamsTab from './TeamsTab';
import PoolsTab from './PoolsTab';
import MatchesTab from './MatchesTab';
import { StandingsTab } from '@swish/competition';
import { BracketTab } from './BracketTab';

// 👇 ASTUCE : On importe le composant Hero depuis le dossier joueur (en attendant de le mettre dans un package partagé)
import { TournamentHero } from '../../../../player-app/src/components/tournament/TournamentHero';

export default function TournamentManager() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('teams');

  // RÉCUPÉRATION DES DONNÉES
  const { tournament, loading, error } = useTournament(id);

  if (loading) return <div className="flex justify-center items-center h-64 text-slate-400 font-bold uppercase tracking-widest animate-pulse">Chargement du tournoi...</div>;
  if (error || !tournament) {
    return (
      <div className="flex flex-col justify-center items-center h-64 text-red-500 font-bold p-6 text-center">
        <p className="text-xl uppercase tracking-widest mb-2">Tournoi introuvable</p>
      </div>
    );
  }

  // LES ONGLETS DE L'ORGANISATEUR
  const tabs = [
    { 
      id: 'teams', 
      label: 'Équipes', 
      icon: Users, 
      content: <TeamsTab tournamentId={tournament.id} /> 
    },
    { 
      id: 'pools', 
      label: 'Poules', 
      icon: LayoutGrid, 
      content: <PoolsTab tournamentId={tournament.id} /> 
    },
    { 
      id: 'schedule', 
      label: 'Matchs', 
      icon: CalendarIcon, 
      content: <MatchesTab tournamentId={tournament.id} /> 
    },
    { 
      id: 'standings', 
      label: 'Classement', 
      icon: TableIcon, 
      content: <StandingsTab tournamentId={tournament.id} /> 
    },
    { 
      id: 'bracket', 
      label: 'Phase Finale', 
      icon: TrophyIcon, 
      content: <BracketTab tournamentId={tournament.id} /> 
    },
  ];

  return (
    // On reprend exactement tes marges de l'application User
    <div className="flex flex-col gap-6 pb-10 w-full px-4 sm:px-8 lg:px-12 mt-6">
      
      {/* Bouton Retour */}
      <button 
        onClick={() => navigate('/dashboard')} 
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold w-fit transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200"
      >
        <ArrowLeft className="w-4 h-4" /> Retour au Dashboard
      </button>

      {/* Hero Header avec les VRAIES données */}
      <TournamentHero tournament={tournament} isAdmin={true}/>

      {/* Système d'Onglets (La fameuse carte blanche) */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mt-2">
        <div className="flex border-b border-slate-200 overflow-x-auto custom-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' 
                  : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400'}`} /> 
              {tab.label}
            </button>
          ))}
        </div>
        
        {/* Contenu de l'onglet actif (Avec le fond légèrement grisé) */}
        <div className="p-4 sm:p-6 md:p-8 bg-slate-50/30">
          {tabs.find(t => t.id === activeTab)?.content}
        </div>
      </div>
    </div>
  );
}