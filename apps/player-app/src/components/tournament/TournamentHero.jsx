import React from 'react';
import { Badge } from '@swish/ui/src/components/badge';
import { Button } from '@swish/ui/src/components/button';

export function TournamentHero({ tournament, onRegister }) {
  return (
    <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 mb-3">{tournament.status}</Badge>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">{tournament.name}</h1>
          <p className="text-slate-500 text-lg">Tournoi Officiel • Format {tournament.format}</p>
        </div>
        <div className="w-full md:w-auto">
          <Button onClick={onRegister} size="lg" className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/20">
            Inscrire mon équipe
          </Button>
        </div>
      </div>
    </div>
  );
}