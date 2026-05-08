import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TeamProfile } from '@swish/roster';
import { ArrowLeft } from 'lucide-react';

export default function TeamPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    // ✅ On enlève le padding px-4/sm:px-8/lg:px-12 et le mt-6 
    // pour laisser le TeamProfile s'étirer via ses marges négatives
    <div className="flex flex-col gap-6 pb-10 w-full">
      
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold w-fit transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200"
      >
        <ArrowLeft className="w-4 h-4" /> Retour
      </button>

      {/* TeamProfile va maintenant coller aux bords grâce à ses marges négatives 
          car son parent direct (cette div) n'a plus de padding horizontal */}
      <TeamProfile 
        teamId={id} 
        onPlayerClick={(playerId) => navigate(`/player/${playerId}`)}
        onMatchClick={(matchId) => navigate(`/match/${matchId}`)}
      />
      
    </div>
);
}