import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@swish/identity';
import { supabase } from '@swish/core'; 
import TeamsTab from './TeamsTab';
import PoolsTab from './PoolsTab';
import MatchesTab from './MatchesTab';
import { StandingsTab } from '@swish/competition';
import { BracketTab } from './BracketTab';

// 👇 1. On importe les icônes pour faire comme côté joueur
import { Users, LayoutGrid, Calendar, Trophy, Table as TableIcon, ArrowLeft } from 'lucide-react';

// 👇 2. On ajoute les icônes à notre configuration d'onglets
const TABS = [
  { id: 'teams', label: 'Inscriptions & Équipes', icon: Users },
  { id: 'pools', label: 'Poules & Format', icon: LayoutGrid },
  { id: 'schedule', label: 'Planning & Matchs', icon: Calendar },
  { id: 'standings', label: 'Classement', icon: TableIcon },
  { id: 'bracket', label: 'Phase Finale', icon: Trophy }
];

export default function TournamentManager() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [tournament, setTournament] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'teams';

  useEffect(() => {
    async function fetchTournament() {
      const { data } = await supabase.from('tournaments').select('*').eq('id', id).single();
      if (data) setTournament(data);
    }
    if (id) fetchTournament();
  }, [id]);

  if (!tournament) return (
    <div className="flex items-center justify-center h-full text-slate-500 font-bold uppercase tracking-widest animate-pulse">
      Chargement du tournoi...
    </div>
  );

  return (
    // 👇 3. On uniformise les marges générales avec le côté joueur (gap-6)
    <div className="flex flex-col gap-6 pb-10 w-full mt-2">
      
      {/* EN-TÊTE DU TOURNOI */}
      <div>
        {/* 👇 4. On utilise le même bouton "Retour" encadré que le joueur */}
        <button 
          onClick={() => navigate('/dashboard')} 
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold w-fit transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Retour au tableau de bord
        </button>

        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight">{tournament.name}</h1>
            <p className="text-slate-500 mt-1 capitalize">{tournament.sport_id} • {tournament.location}</p>
          </div>
          <span className="bg-slate-200 text-slate-700 px-3 py-1 rounded-md text-sm font-bold uppercase tracking-wider">
            {tournament.status}
          </span>
        </div>
      </div>

      {/* 👇 5. LA GRANDE NOUVEAUTÉ : La carte blanche qui englobe les onglets ET le contenu */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mt-2">
        
        {/* NAVIGATION DES ONGLETS */}
        <div className="flex border-b border-slate-200 overflow-x-auto custom-scrollbar">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSearchParams({ tab: tab.id })}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'border-blue-600 text-blue-600 bg-blue-50/50' 
                    : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
              >
                <Icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-blue-600' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* AFFICHAGE DU CONTENU DE L'ONGLET ACTIF */}
        {/* 👇 6. Le fond légèrement gris pour faire ressortir les éléments de l'onglet */}
        <div className="p-4 sm:p-6 md:p-8 bg-slate-50/30">
          {activeTab === 'teams' && <TeamsTab tournamentId={id} />}
          {activeTab === 'pools' && <PoolsTab tournamentId={id} />}
          {activeTab === 'schedule' && <MatchesTab tournamentId={id} />}
          {activeTab === 'standings' && <StandingsTab tournamentId={id} />}
          {activeTab === 'bracket' && <BracketTab tournamentId={id} />}
        </div>

      </div>

    </div>
  );
}