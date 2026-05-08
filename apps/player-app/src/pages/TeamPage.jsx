import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TeamProfile } from '@swish/roster';
import { ArrowLeft } from 'lucide-react';

export default function TeamPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-6 pb-10 w-full px-4 sm:px-8 lg:px-12 mt-6">
      
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold w-fit transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200"
      >
        <ArrowLeft className="w-4 h-4" /> Retour
      </button>

      {/* On passe l'ID et les fonctions de navigation spécifiques au lecteur */}
      <TeamProfile 
        teamId={id} 
        onPlayerClick={(playerId) => navigate(`/player/${playerId}`)}
        onMatchClick={(matchId) => navigate(`/match/${matchId}`)}
      />
      
    </div>
  );
}