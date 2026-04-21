import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button, Card, CardHeader, CardTitle, CardContent } from '@swish/ui';
import { useAuth, usePlayerCard, PlayerCardForm } from '@swish/identity';
import { useRoster } from '@swish/roster';

export function InvitePage({ inviteToken, onGoToDashboard }) {
  const { user } = useAuth();
  const { getTeamByToken, joinTeam } = useRoster(user?.id);
  
  // On importe la fiche joueur pour vérifier si le joueur a ses mensurations !
  const { playerCard, loadingCard } = usePlayerCard(user?.id);

  const [teamInfo, setTeamInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasJoined, setHasJoined] = useState(false);

  // 1. Au chargement, on va chercher de quelle équipe il s'agit
  useEffect(() => {
    const fetchTeam = async () => {
      const { data, error } = await getTeamByToken(inviteToken);
      if (error || !data) {
        toast.error("Lien d'invitation invalide ou expiré.");
      } else {
        setTeamInfo(data);
      }
      setLoading(false);
    };
    
    if (inviteToken) fetchTeam();
  }, [inviteToken]);

  // 2. L'action de rejoindre
  const handleJoin = async () => {
    const { error } = await joinTeam(teamInfo.id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`Bienvenue chez les ${teamInfo.name} !`);
      setHasJoined(true);
    }
  };

  if (loading || loadingCard) return <div className="p-8 text-center animate-pulse">Recherche de la franchise...</div>;
  if (!teamInfo) return <div className="p-8 text-center text-red-500 font-bold">Équipe introuvable.</div>;

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-2xl border-0 overflow-hidden">
        
        {/* EN-TÊTE VISUEL */}
        <div className="bg-slate-900 p-8 text-center text-white">
          <div className="text-4xl mb-4">🏆</div>
          <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mb-2">Invitation Officielle</p>
          <CardTitle className="text-3xl font-black">{teamInfo.name}</CardTitle>
          <p className="text-slate-300 mt-2">
            Sport : <span className="font-bold capitalize">{teamInfo.sport}</span>
          </p>
        </div>

        <CardContent className="p-8 space-y-6">
          <p className="text-center text-slate-600">
            Le capitaine <b>{teamInfo.captain?.first_name} {teamInfo.captain?.last_name}</b> t'a invité à rejoindre son effectif.
          </p>

          {/* LA LOGIQUE ARCHITECTURALE */}
          {hasJoined ? (
             <Button onClick={onGoToDashboard} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 text-lg">
               Accéder au vestiaire
             </Button>
          ) : !playerCard ? (
            // LE JOUEUR N'A PAS DE FICHE ATHLÈTE : ON LE FORCE À LA REMPLIR !
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <p className="text-center text-sm font-bold text-red-500 mb-4 uppercase">
                ⚠️ Le coach exige tes statistiques athlétiques avant de signer !
              </p>
              {/* On réutilise notre super composant ! */}
              <PlayerCardForm user={user} />
            </div>
          ) : (
            // LE JOUEUR A TOUT CE QU'IL FAUT : BOUTON REJOINDRE
            <Button onClick={handleJoin} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-bold">
              Signer le contrat ✍️
            </Button>
          )}

        </CardContent>
      </Card>
    </div>
  );
}