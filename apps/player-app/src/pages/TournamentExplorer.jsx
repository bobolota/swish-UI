import React, { useState, useEffect } from 'react';
import { supabase } from '@swish/core';
import { Card, Button } from '@swish/ui';
import { Search, MapPin, Calendar, Trophy, Users, ArrowRight } from 'lucide-react';

export default function TournamentExplorer({ userId }) {
  const [tournaments, setTournaments] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // État pour les onglets de la section "Terminés"
  const [finishedTab, setFinishedTab] = useState('all'); // 'all' ou 'mine'

  useEffect(() => {
    // 🚧 Simulation de chargement des données depuis Supabase
    // Il faudra adapter selon tes vraies tables (tournaments, registrations...)
    const fetchTournaments = async () => {
      setIsLoading(true);
      
      // 1. Récupérer tous les tournois
      const { data: allTournaments } = await supabase
        .from('tournaments')
        .select('*')
        .order('created_at', { ascending: false });

      // 2. Récupérer les IDs des tournois où l'utilisateur est inscrit
      const { data: userRegs } = await supabase
        .from('tournament_registrations') // Adapte le nom de ta table
        .select('tournament_id')
        .eq('user_id', userId);

      const registeredIds = userRegs?.map(reg => reg.tournament_id) || [];

      setTournaments(allTournaments || []);
      setMyRegistrations(registeredIds);
      setIsLoading(false);
    };

    fetchTournaments();
  }, [userId]);

  // --- FILTRES DU KANBAN ---
  
  // 1. Inscriptions ouvertes (Et je n'y suis pas encore inscrit)
  const openTournaments = tournaments.filter(t => 
    t.status === 'open' && !myRegistrations.includes(t.id)
  );

  // 2. Mes tournois actifs (Inscrit, et le tournoi n'est pas terminé)
  const myActiveTournaments = tournaments.filter(t => 
    myRegistrations.includes(t.id) && t.status !== 'finished'
  );

  // 3. En cours (Et je n'y suis pas)
  const inProgressTournaments = tournaments.filter(t => 
    t.status === 'in_progress' && !myRegistrations.includes(t.id)
  );

  // --- FILTRES DE L'HISTORIQUE (Terminés) ---
  const allFinishedTournaments = tournaments.filter(t => t.status === 'finished');
  const myFinishedTournaments = allFinishedTournaments.filter(t => myRegistrations.includes(t.id));

  // --- COMPOSANT CARTE RÉUTILISABLE ---
  const TournamentCard = ({ tournament, isMine }) => (
    <Card className="p-4 mb-4 bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden">
      {isMine && (
        <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">
          Inscrit
        </div>
      )}
      <h3 className="font-bold text-slate-800 mb-1 pr-12 truncate">{tournament.name}</h3>
      
      <div className="space-y-1.5 mt-3 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5" />
          <span className="truncate">{tournament.location || 'Lieu à définir'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          <span>{new Date(tournament.start_date).toLocaleDateString('fr-FR')}</span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
          <Users className="w-3.5 h-3.5" />
          {tournament.participants_count || 0} joueurs
        </span>
        <button className="text-indigo-600 bg-indigo-50 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </Card>
  );

  if (isLoading) return <div className="p-12 text-center text-slate-500">Chargement des tournois...</div>;

  return (
    <div className="flex flex-col h-full bg-slate-50/50 p-6 overflow-y-auto">
      
      {/* HEADER */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Explorer les tournois</h1>
          <p className="text-slate-500 text-sm mt-1">Trouve ta prochaine compétition ou suis tes résultats.</p>
        </div>
        
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Rechercher un tournoi..." 
            className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none w-64"
          />
        </div>
      </div>

      {/* ZONE 1 : LE KANBAN DES TOURNOIS ACTIFS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        
        {/* Colonne 1 : Inscriptions Ouvertes */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <h2 className="font-bold text-slate-700">Inscriptions Ouvertes</h2>
            <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{openTournaments.length}</span>
          </div>
          <div className="flex-1 bg-slate-100/50 rounded-xl p-3 border border-slate-200 border-dashed">
            {openTournaments.length === 0 ? (
              <p className="text-xs text-center text-slate-400 py-8">Aucun tournoi ouvert</p>
            ) : (
              openTournaments.map(t => <TournamentCard key={t.id} tournament={t} />)
            )}
          </div>
        </div>

        {/* Colonne 2 : Mes Tournois */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
            <h2 className="font-bold text-slate-700">Mes Inscriptions</h2>
            <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{myActiveTournaments.length}</span>
          </div>
          <div className="flex-1 bg-indigo-50/30 rounded-xl p-3 border border-indigo-100 border-dashed">
            {myActiveTournaments.length === 0 ? (
              <p className="text-xs text-center text-indigo-300 py-8">Tu n'es inscrit à aucun tournoi</p>
            ) : (
              myActiveTournaments.map(t => <TournamentCard key={t.id} tournament={t} isMine={true} />)
            )}
          </div>
        </div>

        {/* Colonne 3 : En Cours (Autres) */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <h2 className="font-bold text-slate-700">En Cours</h2>
            <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{inProgressTournaments.length}</span>
          </div>
          <div className="flex-1 bg-slate-100/50 rounded-xl p-3 border border-slate-200 border-dashed">
            {inProgressTournaments.length === 0 ? (
              <p className="text-xs text-center text-slate-400 py-8">Aucun tournoi en cours</p>
            ) : (
              inProgressTournaments.map(t => <TournamentCard key={t.id} tournament={t} />)
            )}
          </div>
        </div>

      </div>

      {/* ZONE 2 : ARCHIVES / TOURNOIS TERMINÉS */}
      <div>
        <div className="flex items-center justify-between mb-6 border-b border-slate-200 pb-2">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-slate-400" />
            <h2 className="text-lg font-bold text-slate-800">Historique & Résultats</h2>
          </div>
          
          {/* Les fameux onglets */}
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button 
              onClick={() => setFinishedTab('all')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${finishedTab === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Tous les terminés
            </button>
            <button 
              onClick={() => setFinishedTab('mine')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${finishedTab === 'mine' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Mes participations
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {finishedTab === 'all' ? (
            allFinishedTournaments.length === 0 ? (
              <p className="col-span-full text-center text-slate-400 py-8">Aucun historique disponible.</p>
            ) : (
              allFinishedTournaments.map(t => <TournamentCard key={t.id} tournament={t} isMine={myRegistrations.includes(t.id)} />)
            )
          ) : (
            myFinishedTournaments.length === 0 ? (
              <p className="col-span-full text-center text-slate-400 py-8">Tu n'as encore terminé aucun tournoi.</p>
            ) : (
              myFinishedTournaments.map(t => <TournamentCard key={t.id} tournament={t} isMine={true} />)
            )
          )}
        </div>
      </div>

    </div>
  );
}