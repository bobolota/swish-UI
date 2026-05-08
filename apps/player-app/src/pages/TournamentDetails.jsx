import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Users, Trophy as TrophyIcon } from 'lucide-react';

// 👇 On importe le hook partagé depuis notre package "competition"
import { useTournament } from '@swish/competition'; 

// Imports des composants
import { TournamentHero } from '../components/tournament/TournamentHero';
import { TournamentInfoTab } from '../components/tournament/tabs/TournamentInfoTab';
import { TournamentBracketTab } from '../components/tournament/tabs/TournamentBracketTab';
// import { TournamentInfoGrid } from '../components/tournament/TournamentInfoGrid';
// import { TournamentParticipantsTab } from '../components/tournament/tabs/TournamentParticipantsTab';

import { Calendar as CalendarIcon, Table as TableIcon } from 'lucide-react'; // Nouvelles icônes
import { TournamentMatchesTab } from '../components/tournament/tabs/TournamentMatchesTab';
import { TournamentPoolsTab } from '../components/tournament/tabs/TournamentPoolsTab';
import { TournamentParticipantsTab } from '../components/tournament/tabs/TournamentParticipantsTab';

export default function TournamentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('infos');

  // 1. RÉCUPÉRATION DES VRAIES DONNÉES SUPABASE
  const { tournament, loading, error } = useTournament(id);

  // 2. ÉCRANS DE CHARGEMENT ET D'ERREUR
  if (loading) return <div className="flex justify-center items-center h-64 text-slate-400 font-bold uppercase tracking-widest animate-pulse">Chargement du tournoi...</div>;
  if (error || !tournament) {
    return (
      <div className="flex flex-col justify-center items-center h-64 text-red-500 font-bold p-6 text-center">
        <p className="text-xl uppercase tracking-widest mb-2">Tournoi introuvable</p>
        <p className="text-sm text-slate-500 mb-4">ID cherché : {id}</p>
        <div className="text-xs font-mono bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 text-left max-w-xl">
          {error?.message || error?.details || error?.hint || "Aucune erreur explicite, la donnée est juste vide (null)."}
        </div>
      </div>
    );
  }

  // 3. ONGLETS DYNAMIQUES
  const tabs = [
    { 
      id: 'infos', 
      label: 'Infos', 
      icon: FileText, 
      content: <TournamentInfoTab tournament={tournament} /> 
    },
    { 
      id: 'participants', 
      label: 'Équipes', 
      icon: Users, 
      content: <TournamentParticipantsTab tournamentId={tournament.id} /> 
    },
    // 👇 NOUVEL ONGLET : CALENDRIER
    { 
      id: 'planning', 
      label: 'Calendrier', 
      icon: CalendarIcon, 
      content: <TournamentMatchesTab tournamentId={tournament.id} /> 
    },
    // 👇 NOUVEL ONGLET : POULES / CLASSEMENT
    { 
      id: 'poules', 
      label: 'Poules', 
      icon: TableIcon, 
      content: <TournamentPoolsTab tournamentId={tournament.id} /> 
    },
    { 
      id: 'bracket', 
      label: 'Phase Finale', 
      icon: TrophyIcon, 
      content: <TournamentBracketTab tournamentId={tournament.id} /> 
    },
  ];

  return (
  <div className="flex flex-col gap-6 pb-10 w-full px-4 sm:px-8 lg:px-12 mt-6">
      
      {/* Bouton Retour */}
      <button 
        onClick={() => navigate('/')} 
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold w-fit transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200"
      >
        <ArrowLeft className="w-4 h-4" /> Retour aux tournois
      </button>

      {/* Hero Header avec les VRAIES données */}
      <TournamentHero tournament={tournament} onRegister={() => console.log('Inscription...')} />
      
      {/* <TournamentInfoGrid tournament={tournament} /> */}

      {/* Système d'Onglets */}
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
        
        {/* Contenu de l'onglet actif */}
        <div className="p-4 sm:p-6 md:p-8 bg-slate-50/30">
          {tabs.find(t => t.id === activeTab)?.content}
        </div>
      </div>
    </div>
  );
}