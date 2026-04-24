import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Users, Trophy as TrophyIcon } from 'lucide-react';

// Imports des nouveaux composants
import { TournamentHero } from '../components/tournament/TournamentHero';
import { TournamentInfoGrid } from '../components/tournament/TournamentInfoGrid';
import { TournamentInfoTab } from '../components/tournament/tabs/TournamentInfoTab';
import { TournamentParticipantsTab } from '../components/tournament/tabs/TournamentParticipantsTab';
import { TournamentBracketTab } from '../components/tournament/tabs/TournamentBracketTab';

export default function TournamentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('infos');

  // Données factices (à remplacer par Supabase plus tard)
  const tournament = {
    name: "Open d'été Swish",
    status: "Ouvert",
    date: "15 Juin 2026",
    location: "Gymnase des Lumières, Lyon",
    price: "50€ / équipe",
    format: "3v3",
    spots: "12 / 16 inscrits",
    description: "Le plus grand tournoi de l'été ! Venez affronter les meilleures équipes de la région.",
  };

  const tabs = [
    { id: 'infos', label: 'Informations', icon: FileText, content: <TournamentInfoTab description={tournament.description} /> },
    { id: 'participants', label: 'Inscrits', icon: Users, content: <TournamentParticipantsTab /> },
    { id: 'bracket', label: 'Tableau', icon: TrophyIcon, content: <TournamentBracketTab /> },
  ];

  return (
    <div className="flex flex-col gap-6 pb-10">
      <button onClick={() => navigate('/tournaments')} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium">
        <ArrowLeft className="w-4 h-4" /> Retour
      </button>

      <TournamentHero tournament={tournament} onRegister={() => console.log('Inscription...')} />
      <TournamentInfoGrid tournament={tournament} />

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mt-4">
        <div className="flex border-b border-slate-200 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === tab.id ? 'border-orange-600 text-orange-600 bg-orange-50/50' : 'border-transparent text-slate-500 hover:bg-slate-50'
              }`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>
        <div className="p-6 md:p-8">
          {tabs.find(t => t.id === activeTab)?.content}
        </div>
      </div>
    </div>
  );
}