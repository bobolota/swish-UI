import React, { useState, useEffect } from 'react';
import { supabase } from '@swish/core';
import { TournamentBracket } from '@swish/competition';
import { Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function TournamentBracketTab({ tournamentId }) {
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // 1. Récupération des matchs de phase finale et des équipes
  useEffect(() => {
    const fetchBracketData = async () => {
      setIsLoading(true);
      const [mRes, tRes] = await Promise.all([
        supabase
          .from('matches')
          .select('*')
          .eq('tournament_id', tournamentId)
          .neq('stage', 'pools') // On exclut les matchs de poules
          .order('bracket_index', { ascending: true }),
        supabase.from('teams').select('*')
      ]);
      setMatches(mRes.data || []);
      setTeams(tRes.data || []);
      setIsLoading(false);
    };

    if (tournamentId) fetchBracketData();
  }, [tournamentId]);

  // 2. Configuration des étapes (Stages)
  // On définit l'ordre d'affichage des colonnes
  const stagesConfig = [
    { id: 'round_128', label: '64èmes' },
    { id: 'round_64', label: '32èmes' },
    { id: 'round_32', label: '16èmes' },
    { id: 'round_16', label: 'Huitièmes' },
    { id: 'quarter', label: 'Quarts' },
    { id: 'semi', label: 'Demies' },
    { id: 'final', label: 'Finale' }
  ];

  // On ne garde que les étapes qui contiennent des matchs pour ce tournoi
  const stages = stagesConfig
    .map(stage => ({ 
      ...stage, 
      matches: matches.filter(m => m.stage === stage.id) 
    }))
    .filter(s => s.matches.length > 0);

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest animate-pulse">
        Chargement du tableau final...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 overflow-hidden">
        
        {/* En-tête */}
        <div className="mb-8 border-b border-slate-100 pb-4">
          <h2 className="text-xl font-black uppercase tracking-widest text-slate-800 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Tableau de la Phase Finale
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Découvrez le chemin vers le titre.
          </p>
        </div>

        {/* Affichage de l'arbre ou message d'attente */}
        {stages.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <Trophy className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 font-medium italic">
              La phase finale n'est pas encore prête. Les qualifiés arrivent bientôt !
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto pb-6 custom-scrollbar">
            {/* Appel du composant partagé avec readOnly={true} 
                pour désactiver les clics et le mode édition.
            */}
            <TournamentBracket 
              stages={stages}
              teams={teams}
              readOnly={true}
              onTeamClick={(teamId) => navigate(`/team/${teamId}`)} 
            />
          </div>
        )}
      </div>
    </div>
  );
}