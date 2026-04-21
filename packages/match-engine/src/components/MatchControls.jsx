import React from 'react';
import { CardContent, Button, Badge } from '@swish/ui';
import { toast } from 'sonner';

export function MatchControls({ matchData, isRunning, onAddEvent, onToggleTimer, onUpdateStatus, userId }) {
  if (!matchData) return null;

  const handleEndMatch = () => {
    if (window.confirm("Es-tu sûr de vouloir siffler la fin du match ? Le score deviendra définitif.")) {
      onUpdateStatus('finished');
      toast.info("Le match est officiellement terminé !");
    }
  };

  return (
    <CardContent className="pt-6 bg-slate-50 border-b">
      <div className="grid grid-cols-2 gap-8">
        {/* Domicile */}
        <div className="space-y-3">
          <p className="text-center font-bold text-xs text-slate-400 uppercase tracking-widest">Points Domicile</p>
          <div className="flex gap-2 justify-center">
            {[1, 2, 3].map(pts => (
              <Button key={`home-${pts}`} disabled={!isRunning} variant="outline" size="lg" className="flex-1 font-bold" 
                      onClick={() => onAddEvent(matchData.home_team_id, userId, `point_${pts}`, pts)}>+{pts}</Button>
            ))}
          </div>
        </div>
        {/* Extérieur */}
        <div className="space-y-3">
          <p className="text-center font-bold text-xs text-slate-400 uppercase tracking-widest">Points Extérieur</p>
          <div className="flex gap-2 justify-center">
            {[1, 2, 3].map(pts => (
              <Button key={`away-${pts}`} disabled={!isRunning} variant="outline" size="lg" className="flex-1 font-bold" 
                      onClick={() => onAddEvent(matchData.away_team_id, userId, `point_${pts}`, pts)}>+{pts}</Button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
        {matchData.status !== 'finished' ? (
          <>
            <Button onClick={onToggleTimer} variant={isRunning ? "secondary" : "default"} size="lg" className="w-full sm:w-1/2 font-bold shadow-md">
              {isRunning ? "⏸ Suspendre le temps" : "▶️ Démarrer le chrono"}
            </Button>
            <Button onClick={handleEndMatch} variant="destructive" size="lg" className="w-full sm:w-auto font-bold">
              ⏹ Siffler la fin
            </Button>
          </>
        ) : (
          <Badge variant="outline" className="px-6 py-2 text-lg text-slate-500 border-slate-300">Rencontre clôturée</Badge>
        )}
      </div>
    </CardContent>
  );
}