import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ScoreBoard, useMatchEngine, PlayByPlay, CommandCenter, StarterSelection, SPORT_CONFIGS, MatchStatsModal } from '@swish/match-engine';
import { TeamRosterPanel } from '@swish/roster';
import { toast } from 'sonner';
import { supabase } from '@swish/core'
import { Tv, ChevronLeft, Settings } from 'lucide-react';

export default function ActiveMatch() {
  const { id } = useParams();
  const navigate = useNavigate();

  // 1. TOUS LES HOOKS STANDARDS
  const { 
    matchData, loading, 
    timeRemaining, isRunning, homeScore, awayScore,
    toggleTimer, addEvent, events, removeEvent, onCourtIds, updateMatchStatus,
    currentPeriod, goToNextPeriod
  } = useMatchEngine(id);

  const [timeoutTimer, setTimeoutTimer] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [subSelection, setSubSelection] = useState({ in: [], out: [] });
  const [tempStarters, setTempStarters] = useState(new Set());

  // --- CHRONOMÈTRE DE TEMPS DE JEU (LIVE UI - PERSISTANT) ---
  const [playingTimes, setPlayingTimes] = useState(() => {
    try {
      const saved = localStorage.getItem(`swish_pt_${id}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    let interval;
    if (isRunning && onCourtIds?.size > 0) {
      interval = setInterval(() => {
        setPlayingTimes(prev => {
          const next = { ...prev };
          onCourtIds.forEach(playerId => {
            next[playerId] = (next[playerId] || 0) + 1;
          });
          // Synchronisation locale à chaque tick
          localStorage.setItem(`swish_pt_${id}`, JSON.stringify(next));
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, onCourtIds, id]);

  // 2. LA CONFIGURATION
  const sportId = matchData?.tournaments?.sport_id;
  const currentConfig = SPORT_CONFIGS[sportId] || SPORT_CONFIGS['basketball'];
  const MAX_PLAYERS = currentConfig.playersOnCourt; 
  const currentActions = currentConfig.actions;

  // 3. LE USEMEMO (Calculateur intelligent par dictionnaire)
  const playerStats = useMemo(() => {
    const stats = {};
    if (!events || !Array.isArray(events)) return stats;

    events.forEach(event => {
      const pId = event.player_id || event.player?.id;
      if (!pId) return;
      
      // On initialise le joueur
      if (!stats[pId]) {
        stats[pId] = { points: 0, fouls: 0, ast: 0, reb: 0, stl: 0, blk: 0 };
      }
      
      const type = event.event_type;
      let actionPoints = 0;
      let isFoul = false;

      // 👇 NOUVEAU : On cherche la valeur de l'action directement dans la configuration !
      if (currentConfig && currentConfig.actions) {
        for (const action of currentConfig.actions) {
          // Cas A : Action simple (ex: 'foul')
          if (action.type === type) {
            actionPoints = action.points || 0;
            isFoul = action.isFoul || false;
            break;
          }
          // Cas B : Action avec issue (ex: '3pt_made')
          if (action.outcomes) {
            const matchingOutcome = action.outcomes.find(o => `${action.type}${o.suffix}` === type);
            if (matchingOutcome) {
              actionPoints = matchingOutcome.points || 0;
              isFoul = action.isFoul || false;
              break;
            }
          }
        }
      }

      // On ajoute les vrais points trouvés dans le dictionnaire !
      stats[pId].points += actionPoints;
      if (isFoul) stats[pId].fouls += 1;

      // Les autres stats
      if (type === 'assist') stats[pId].ast += 1;
      if (type === 'def_rebound' || type === 'off_rebound') stats[pId].reb += 1;
      if (type === 'steal') stats[pId].stl += 1;
      if (type === 'block') stats[pId].blk += 1;
    });
    
    return stats;
  }, [events, currentConfig]);

  // LA RADIO POUR LE LIVE TRACKER (BROADCAST) 📻
  useEffect(() => {
    if (!matchData) return;

    // On crée une station radio unique pour CE match
    const room = supabase.channel(`live-match-${matchData.id}`);
    room.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        // Dès qu'on est connecté, on envoie notre état actuel à ceux qui écoutent
        await room.send({
          type: 'broadcast',
          event: 'match-state',
          payload: {
            timeRemaining,
            isRunning,
            currentPeriod,
            homeScore,
            awayScore,
            timestamp: Date.now() // Pour la synchro précise
          },
        });
      }
    });

    // À chaque fois qu'une de ces valeurs change, on renvoie un message
    const sendUpdate = async () => {
      await room.send({
        type: 'broadcast',
        event: 'match-state',
        payload: { timeRemaining, isRunning, currentPeriod, homeScore, awayScore, timestamp: Date.now() },
      });
    };

    sendUpdate();

    return () => {
      supabase.removeChannel(room);
    };
  }, [matchData?.id, timeRemaining, isRunning, currentPeriod, homeScore, awayScore]);
  
  // --- GESTION DES TEMPS MORTS ---
  // 1. Le mini-chronomètre de 60 secondes
  React.useEffect(() => {
    if (timeoutTimer !== null && timeoutTimer > 0) {
      const interval = setInterval(() => setTimeoutTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    } else if (timeoutTimer === 0) {
      toast.info("Fin du temps mort ! Reprise du jeu.");
      setTimeoutTimer(null); // On cache le chrono
    }
  }, [timeoutTimer]);

  // 2. La fonction pour déclencher un temps mort
  const handleCallTimeout = (teamId) => {
    if (isRunning) toggleTimer(); // On coupe le chrono principal !
    addEvent(teamId, null, 'timeout', 0); // On enregistre l'événement (sans joueur)
    setTimeoutTimer(currentConfig.timeoutDuration || 60); // On lance les 60s
  };

  
  

  // 3. On compte combien chaque équipe a pris de temps morts
  const timeoutsCount = useMemo(() => {
    let home = 0, away = 0;
    if (!events) return { home, away };
    
    events.forEach(e => {
      if (e.event_type === 'timeout') {
        if (e.team_id === matchData?.home_team_id) home++;
        if (e.team_id === matchData?.away_team_id) away++;
      }
    });
    return { home, away };
  }, [events, matchData]);

  const MAX_TM = currentConfig.timeoutsPerHalf || 0;

  // Calcul des fautes d'équipe
  const homeFouls = Array.from(matchData?.homeRoster || []).reduce((acc, p) => acc + (playerStats[p.id]?.fouls || 0), 0);
  const awayFouls = Array.from(matchData?.awayRoster || []).reduce((acc, p) => acc + (playerStats[p.id]?.fouls || 0), 0);

  // 4. LES "EARLY RETURNS" (Après TOUS les hooks)
  if (loading) return <div className="flex justify-center items-center h-full">Chargement...</div>;
  if (!matchData) return <div className="text-center text-red-500 p-10">Match introuvable.</div>;

  // 5. LES VARIABLES DÉRIVÉES ET FONCTIONS
  const isSettingStarters = onCourtIds ? onCourtIds.size === 0 : true;

  const handleConfirmStarters = async () => {
    // 👈 CORRECTION : On utilise MAX_PLAYERS * 2
    if (tempStarters.size !== MAX_PLAYERS * 2) return;

    tempStarters.forEach(playerId => {
      const player = [...matchData.homeRoster, ...matchData.awayRoster].find(p => p.id === playerId);
      if (player) {
        addEvent(player.team_id, player.id, 'sub_in', 0);
      }
    });
    
    await updateMatchStatus('paused');
    toast.success(`Le ${MAX_PLAYERS} majeur est validé ! En attente du coup d'envoi...`);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleActionSelect = (action) => {
    setPendingAction(action);
    setSelectedPlayerId(null);
    setSubSelection({ in: [], out: [] });
  };

  const handlePlayerClick = (player, teamId) => {
    // 1. PHASE DE SÉLECTION DU ROSTER DE DÉPART
    if (isSettingStarters) {
      setTempStarters(prev => {
        const newStarters = new Set(prev);
        if (newStarters.has(player.id)) {
          newStarters.delete(player.id);
        } else {
          const teamRoster = teamId === matchData.home_team_id ? matchData.homeRoster : matchData.awayRoster;
          const teamSelectedCount = Array.from(newStarters).filter(id => 
            teamRoster.some(p => p.id === id)
          ).length;
          
          if (teamSelectedCount < MAX_PLAYERS) newStarters.add(player.id);
        }
        return newStarters;
      });
      return;
    }

    // 2. PHASE DE MATCH : EN ATTENTE D'UNE PASSE DÉCISIVE
    if (pendingAction?.type === 'assist_selection') {
      if (teamId !== pendingAction.teamId) return; 
      if (player.id === pendingAction.scorerId) return;

      addEvent(teamId, player.id, 'assist', 0);
      setPendingAction(null);
      setSelectedPlayerId(null);
      return;
    }

    // 3. PHASE DE MATCH : ACTION DIRECTE (Sans popover)
    if (pendingAction && pendingAction.type !== 'sub' && !pendingAction.outcomes) {
      addEvent(teamId, player.id, pendingAction.type, pendingAction.points || 0);
      setPendingAction(null);
      setSelectedPlayerId(null);
      return;
    }

    // 4. PHASE DE MATCH : REMPLACEMENT (Isolé via return)
    if (pendingAction?.type === 'sub') {
      const isOut = onCourtIds.has(player.id);
      setSubSelection(prev => {
        if (isOut) {
          return prev.out.includes(player.id) 
            ? { ...prev, out: prev.out.filter(id => id !== player.id) }
            : { ...prev, out: [...prev.out, player.id] };
        } else {
          return prev.in.includes(player.id)
            ? { ...prev, in: prev.in.filter(id => id !== player.id) }
            : { ...prev, in: [...prev.in, player.id] };
        }
      });
      return; // 👈 Empêche l'exécution de setSelectedPlayerId juste en dessous
    }

    // 5. PHASE DE MATCH : SÉLECTION STANDARD (Pour Popover)
    setSelectedPlayerId(prev => prev === player.id ? null : player.id);
  };

  const handleActionOutcome = (player, teamId, outcome) => {
    // 1. Enregistrement officiel via le MatchEngine
    // Concaténation du type et du suffixe (ex: '3pt' + '_made' = '3pt_made') pour matcher la configuration
    const eventType = `${pendingAction.type}${outcome.suffix}`;
    addEvent(teamId, player.id, eventType, outcome.points);

    // 2. Mécanique de Passe Décisive conditionnelle
    if (outcome.points > 0 && pendingAction.type !== 'free_throw') {
      setPendingAction({
        type: 'assist_selection',
        scorerId: player.id,
        teamId: teamId,
        teamName: teamId === matchData.home_team_id ? matchData.home?.name : matchData.away?.name
      });
      setSelectedPlayerId(null);
    } else {
      // Nettoyage standard
      setPendingAction(null);
      setSelectedPlayerId(null);
    }
  };
  
  const homeSelectedCount = Array.from(tempStarters).filter(id => matchData?.homeRoster?.some(p => p.id === id)).length;
  const awaySelectedCount = Array.from(tempStarters).filter(id => matchData?.awayRoster?.some(p => p.id === id)).length;
  
  // 👈 CORRECTION : On utilise MAX_PLAYERS
  const canStartMatch = homeSelectedCount === MAX_PLAYERS && awaySelectedCount === MAX_PLAYERS;

  const handleConfirmSub = () => {
    if (subSelection.in.length === 0) return;
    if (subSelection.in.length !== subSelection.out.length) {
      toast.error("Le nombre d'entrants et de sortants doit être identique !");
      return;
    }

    subSelection.out.forEach(playerId => {
      const player = [...matchData.homeRoster, ...matchData.awayRoster].find(p => p.id === playerId);
      if (player) addEvent(player.team_id, player.id, 'sub_out', 0);
    });

    subSelection.in.forEach(playerId => {
      const player = [...matchData.homeRoster, ...matchData.awayRoster].find(p => p.id === playerId);
      if (player) addEvent(player.team_id, player.id, 'sub_in', 0);
    });

    // Nettoyage complet des états
    setSubSelection({ in: [], out: [] });
    setPendingAction(null);
    setSelectedPlayerId(null); // 👈 PURGE DE SÉCURITÉ AJOUTÉE ICI
    
    toast.success("Remplacement effectué !");
  };

  const isOvertime = currentPeriod > currentConfig.totalPeriods;
  const periodLabel = isOvertime 
    ? `${currentConfig.overtimePrefix}${currentPeriod - currentConfig.totalPeriods}` 
    : `${currentConfig.periodPrefix}${currentPeriod}`;

  // Forcer le passage à la période suivante (même s'il reste du temps)
  const handleManualNextPeriod = () => {
    if (window.confirm("Passer manuellement à la période suivante ?")) {
      goToNextPeriod(currentConfig);
      toast.info("Passage manuel à la période " + (currentPeriod + 1));
    }
  };

  const handleManualEndMatch = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir CLÔTURER définitivement ce match ? Cette action est irréversible.")) {
      try {
        await updateMatchStatus('finished');
        
        // --- NOUVEAU : Purge du cache local du temps de jeu ---
        localStorage.removeItem(`swish_pt_${id}`);

        // 2. NOUVEAU : LA LOGIQUE D'AVANCEMENT DANS L'ARBRE 🏆
        // On vérifie si ce match a une suite dans l'arbre (next_match_id)
        if (matchData?.next_match_id) {
          
          // Sécurité : On s'assure qu'il n'y a pas d'égalité (au basket c'est rare, mais au cas où)
          if (homeScore !== awayScore) {
            // On trouve qui a gagné
            const winnerId = homeScore > awayScore ? matchData.home_team_id : matchData.away_team_id;
            
           // On calcule si le gagnant va en case "Domicile" ou "Extérieur" au prochain match
            const isHomeSlot = matchData.bracket_index % 2 !== 0;
            const updateData = isHomeSlot ? { home_team_id: winnerId } : { away_team_id: winnerId };

            console.log("Tentative d'envoi de :", updateData, " vers le match :", matchData.next_match_id);

            // On envoie le vainqueur dans le match suivant directement via Supabase
            const { data, error } = await supabase
              .from('matches')
              .update(updateData)
              .eq('id', matchData.next_match_id)
              .select(); // 👈 On force Supabase à nous renvoyer le résultat
              
            if (error) {
               console.error("❌ ERREUR SUPABASE (Arbre) :", error);
            } else {
               console.log("✅ UPDATE RÉUSSI ! Le prochain match est maintenant :", data);
            }
          }
        }

        toast.success("Match terminé ! Score final scellé.");
        navigate(`/matches/${id}/summary`);
      } catch (error) {
        console.error(error);
        toast.error("Erreur lors de la clôture du match");
      }
    }
  };

  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);



  return (
    <div className="h-screen w-full bg-slate-100 flex flex-col overflow-hidden font-sans">
      
      {/* 1. LE SUPER-BANDEAU */}
      <ScoreBoard 
        timeRemainingFormatted={formatTime(timeRemaining)}
        isRunning={isRunning}
        onToggleTimer={toggleTimer}
        periodLabel={periodLabel}
        maxTimeouts={MAX_TM}
        homeTeam={{ 
          // Interception de l'objet relationnel Supabase (teams)
          name: matchData.home_team?.name || matchData.home?.name || "ÉQUIPE 1", 
          score: homeScore, 
          fouls: homeFouls,
          color: "bg-blue-600",
          timeoutsRemaining: Math.max(0, MAX_TM - timeoutsCount.home),
          onCallTimeout: () => handleCallTimeout(matchData.home_team_id)
        }}
        awayTeam={{ 
          // Interception de l'objet relationnel Supabase (teams)
          name: matchData.away_team?.name || matchData.away?.name || "ÉQUIPE 2", 
          score: awayScore, 
          fouls: awayFouls,
          color: "bg-red-600",
          timeoutsRemaining: Math.max(0, MAX_TM - timeoutsCount.away),
          onCallTimeout: () => handleCallTimeout(matchData.away_team_id)
        }}
        onNextPeriod={handleManualNextPeriod}
        onEndMatch={handleManualEndMatch}
        onOpenJumbotron={() => window.open(`/matches/${id}/jumbotron`, '_blank')}
        onOpenStats={() => setIsStatsModalOpen(true)}
      />

      {/* BANNIÈRE DE TEMPS MORT EN COURS */}
      {timeoutTimer !== null && (
        <div className="bg-amber-500 text-white font-black text-2xl py-2 text-center animate-pulse shadow-md flex items-center justify-center gap-4 z-40 relative shrink-0">
          <span>⏳ TEMPS MORT</span>
          <span className="font-mono bg-black/20 px-4 py-1 rounded-lg">{timeoutTimer}s</span>
          <button 
            onClick={() => setTimeoutTimer(null)} 
            className="text-sm bg-white text-amber-500 px-3 py-1.5 rounded-lg hover:bg-amber-50 ml-4 font-bold"
          >
            Reprendre
          </button>
        </div>
      )}

      {/* 2. LA ZONE DE JEU (2 ÉTAGES) */}
      <div className="flex-1 flex flex-col overflow-hidden p-4 gap-4">
        
        {/* ÉTAGE HAUT : Rosters et Command Center (Hauteur fixée à 60% environ) */}
        <div className="grid grid-cols-[1fr_280px_1fr] xl:grid-cols-[1fr_340px_1fr] gap-4 h-[55%] shrink-0">
          
          {/* COLONNE GAUCHE (DOMICILE) */}
          <div className="overflow-y-auto min-w-0 pr-1">
            <TeamRosterPanel 
              variant="match"
              currentConfig={currentConfig}
              title={matchData.home?.name || "Domicile"}
              teamId={matchData.home_team_id}
              roster={matchData.homeRoster}
              pendingAction={pendingAction}
              selectedPlayerId={selectedPlayerId}
              onPlayerClick={handlePlayerClick}
              onActionOutcome={handleActionOutcome}
              colorClass="text-blue-600"
              isSettingStarters={isSettingStarters}
              tempStarters={tempStarters}
              onCourtIds={onCourtIds}
              subSelection={subSelection}
              playerStats={playerStats}
              playingTimes={playingTimes}
            />
          </div>

          {/* COLONNE CENTRALE (ACTIONS UNIQUEMENT) */}
          <div className="flex flex-col overflow-hidden h-full">
            {isSettingStarters ? (
              <StarterSelection 
                canStartMatch={canStartMatch}
                onConfirm={handleConfirmStarters}
                homeSelectedCount={homeSelectedCount}
                awaySelectedCount={awaySelectedCount}
                maxPlayers={MAX_PLAYERS}
              />
            ) : (
              <CommandCenter 
                actions={currentActions}
                pendingAction={pendingAction}
                canConfirmSub={subSelection.in.length > 0 && subSelection.in.length === subSelection.out.length}
                onActionSelect={handleActionSelect}
                onCancel={() => { setPendingAction(null); setSelectedPlayerId(null); setSubSelection({in:[], out:[]}); }}
                onConfirmSub={handleConfirmSub}
              />
            )}
          </div>

          {/* COLONNE DROITE (EXTÉRIEUR) */}
          <div className="overflow-y-auto min-w-0 pl-1">
            <TeamRosterPanel 
              variant="match"
              currentConfig={currentConfig}
              title={matchData.away?.name || "Extérieur"}
              teamId={matchData.away_team_id}
              roster={matchData.awayRoster}
              pendingAction={pendingAction}
              selectedPlayerId={selectedPlayerId}
              onPlayerClick={handlePlayerClick}
              onActionOutcome={handleActionOutcome}
              colorClass="text-red-600"
              isSettingStarters={isSettingStarters}
              tempStarters={tempStarters}
              onCourtIds={onCourtIds}
              subSelection={subSelection}
              playerStats={playerStats}
              playingTimes={playingTimes}
            />
          </div>
        </div>

        {/* ÉTAGE BAS : Play-By-Play en pleine largeur */}
        <div className="flex-1 overflow-y-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-3 w-full">
          <PlayByPlay 
            events={events} 
            onUndo={removeEvent} 
            homeTeamId={matchData.home_team_id} 
            currentConfig={currentConfig}
          />
        </div>

        <MatchStatsModal 
          isOpen={isStatsModalOpen}
          onClose={() => setIsStatsModalOpen(false)}
          matchData={matchData}
          playerStats={playerStats}
          />

      </div>
    </div>
  );
}