import { Trophy } from 'lucide-react';

export function TournamentBracketTab() {
  return (
    <div className="text-center py-10 text-slate-500">
      <Trophy className="w-12 h-12 mx-auto text-slate-300 mb-3" />
      <p>L'arbre du tournoi sera généré une fois les inscriptions closes.</p>
    </div>
  );
}