import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ScoreBoard, useMatchEngine, PlayByPlay, CommandCenter, MatchTimer, StarterSelection, SPORT_CONFIGS } from '@swish/match-engine';
import { TeamRosterPanel } from '@swish/roster';
import { toast } from 'sonner';

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
    if (isSettingStarters) {
      const isAlreadySelected = tempStarters.has(player.id);

      if (isAlreadySelected) {
        setTempStarters(prev => {
          const newSet = new Set(prev);
          newSet.delete(player.id);
          return newSet;
        });
      } else {
        let playersFromThisTeamCount = 0;
        tempStarters.forEach(id => {
          const p = [...matchData.homeRoster, ...matchData.awayRoster].find(x => x.id === id);
          if (p && p.team_id === teamId) playersFromThisTeamCount++;
        });

        // 👈 CORRECTION : On utilise MAX_PLAYERS
        if (playersFromThisTeamCount >= MAX_PLAYERS) {
          toast.error(`Vous ne pouvez pas sélectionner plus de ${MAX_PLAYERS} titulaires pour cette équipe !`);
          return;
        }

        setTempStarters(prev => {
          const newSet = new Set(prev);
          newSet.add(player.id);
          return newSet;
        });
      }
      return; 
    }

    if (pendingAction?.type === 'sub') {
      const isCurrentlyOnCourt = onCourtIds.has(player.id);
      
      setSubSelection(prev => {
        if (isCurrentlyOnCourt) {
          const isSelected = prev.out.includes(player.id);
          return { ...prev, out: isSelected ? prev.out.filter(id => id !== player.id) : [...prev.out, player.id] };
        } else {
          const isSelected = prev.in.includes(player.id);
          return { ...prev, in: isSelected ? prev.in.filter(id => id !== player.id) : [...prev.in, player.id] };
        }
      });
      return; 
    }

    if (!pendingAction) return; 

    if (pendingAction.outcomes) {
      setSelectedPlayerId(player.id);
    } else {
      addEvent(teamId, player.id, pendingAction.type, pendingAction.points);
      setPendingAction(null);
    }
  };

  const handleActionOutcome = (player, teamId, outcome) => {
    const finalType = `${pendingAction.type}${outcome.suffix}`;
    addEvent(teamId, player.id, finalType, outcome.points);
    setPendingAction(null);
    setSelectedPlayerId(null);
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

    setSubSelection({ in: [], out: [] });
    setPendingAction(null);
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

  // Forcer la fin définitive du match
  const handleManualEndMatch = async () => {
    if (window.confirm("Mettre fin définitivement au match et sceller le score ?")) {
      await updateMatchStatus('finished');
      toast.success("Match terminé ! Score final enregistré.");
      navigate('/matches'); // Ou vers une page de résumé
    }
  };  

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-10">
      <ScoreBoard 
        time={formatTime(timeRemaining)}
        period={periodLabel}
        maxTimeouts={MAX_TM}
        homeTeam={{ 
          name: matchData.home?.name || "DOMICILE", 
          score: homeScore, 
          color: "bg-blue-600",
          timeoutsRemaining: Math.max(0, MAX_TM - timeoutsCount.home),
          onCallTimeout: () => handleCallTimeout(matchData.home_team_id)
        }}
        awayTeam={{ 
          name: matchData.away?.name || "EXTÉRIEUR", 
          score: awayScore, 
          color: "bg-red-600",
          timeoutsRemaining: Math.max(0, MAX_TM - timeoutsCount.away),
          onCallTimeout: () => handleCallTimeout(matchData.away_team_id)
        }}
      />

      {/* BANNIÈRE DE TEMPS MORT EN COURS */}
      {timeoutTimer !== null && (
        <div className="bg-amber-500 text-white font-black text-3xl py-4 rounded-2xl text-center animate-pulse shadow-lg flex items-center justify-center gap-4">
          <span>⏳ TEMPS MORT</span>
          <span className="font-mono bg-black/20 px-4 py-1 rounded-lg">{timeoutTimer}s</span>
          <button 
            onClick={() => setTimeoutTimer(null)} 
            className="text-sm bg-white text-amber-500 px-3 py-2 rounded-lg hover:bg-amber-50 ml-4"
          >
            Reprendre
          </button>
        </div>
      )}

      <MatchTimer 
        isRunning={isRunning} 
        onToggle={toggleTimer} 
        timeRemaining={timeRemaining}
        onNextPeriod={() => goToNextPeriod(currentConfig)}
      />

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TeamRosterPanel 
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
          maxFouls={currentConfig.maxFouls}
        />

        <TeamRosterPanel 
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
          maxFouls={currentConfig.maxFouls}
        />
      </div>

      <div className="mt-4">
        <PlayByPlay 
          events={events} 
          onUndo={removeEvent} 
          homeTeamId={matchData.home_team_id} 
          currentConfig={currentConfig}
        />
      </div>
    </div>
  );
}