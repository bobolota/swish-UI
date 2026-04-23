import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { AdminLayout } from '@swish/ui';
import { useAuth } from '@swish/identity';
import { supabase } from '@swish/core'; 
import TeamsTab from './TeamsTab';
import PoolsTab from './PoolsTab';
import MatchesTab from './MatchesTab';

// Les onglets disponibles
const TABS = [
  { id: 'teams', label: 'Inscriptions & Équipes' },
  { id: 'pools', label: 'Poules & Format' },
  { id: 'schedule', label: 'Planning & Matchs' },
  { id: 'standings', label: 'Classement' }
];

export default function TournamentManager() {
  // useParams() récupère automatiquement le ":id" de l'URL !
  const { id } = useParams(); 
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [tournament, setTournament] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  // Fonction pour changer l'URL quand on clique sur un onglet
  const handleTabChange = (newValue) => {
    setSearchParams({ tab: newValue });
  };

  // 1. On récupère les infos basiques du tournoi pour afficher le titre
  useEffect(() => {
    async function fetchTournament() {
      const { data } = await supabase.from('tournaments').select('*').eq('id', id).single();
      if (data) setTournament(data);
    }
    if (id) fetchTournament();
  }, [id]);

  if (!tournament) return (
    <AdminLayout user={user} logout={logout}>
      <div className="flex items-center justify-center h-full text-slate-500 font-bold">Chargement du tournoi...</div>
    </AdminLayout>
  );

  return (
    <AdminLayout user={user} logout={logout}>
      <div className="flex flex-col h-full">
        
        {/* EN-TÊTE DU TOURNOI */}
        <div className="mb-8">
          <button onClick={() => navigate('/dashboard')} className="text-sm text-slate-500 hover:text-slate-800 transition-colors mb-4 flex items-center gap-2 font-medium">
            ← Retour au tableau de bord
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

        {/* NAVIGATION DES ONGLETS */}
        <div className="flex border-b border-slate-200 gap-8">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 text-sm font-bold transition-colors relative ${
                activeTab === tab.id ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        {/* AFFICHAGE DU CONTENU DE L'ONGLET ACTIF */}
        <div className="flex-1 mt-6">
          {activeTab === 'teams' && <TeamsTab tournamentId={id} />}
          {activeTab === 'pools' && <PoolsTab tournamentId={id} />}
          {activeTab === 'schedule' && <MatchesTab tournamentId={id} />}
          {activeTab === 'standings' && <div className="p-8 text-center text-slate-400 font-medium">Onglet Classement en construction...</div>}
        </div>

      </div>
    </AdminLayout>
  );
}