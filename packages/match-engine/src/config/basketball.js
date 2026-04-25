export const BASKETBALL_CONFIG = {
  // 👈 NOUVEAU : On définit les règles du sport
  playersOnCourt: 5,
  
  // 👈 NOUVELLES RÈGLES DE TEMPS
  totalPeriods: 4,      // Le basket a 4 périodes
  periodPrefix: 'Q',    // On écrit "Q" pour Quart-temps
  periodLength: 600,    // (Optionnel pour l'instant) 10 minutes par quart-temps en secondes 

  periodLength: 600,     // 10 minutes (en secondes)
  allowOvertime: true,   // Prolongations autorisées
  overtimePrefix: 'OT',  // Préfixe pour la prolongation
  overtimeLength: 300,   // 5 minutes (en secondes)
  maxFouls: 5,

  timeoutsPerHalf: 3,
  timeoutDuration: 60,
  
  // Ton tableau d'actions actuel glisse ici
  actions: [
   { 
      type: 'free_throw', label: '1 LF', category: 'primary', color: 'bg-emerald-500',
      outcomes: [
        { label: 'Marqué', suffix: '_made', points: 1, color: 'bg-emerald-500' },
        { label: 'Raté', suffix: '_missed', points: 0, color: 'bg-red-500' }
      ]
    },
    { 
      type: '2pt', label: '2 Pts', category: 'primary', color: 'bg-emerald-600',
      outcomes: [
        { label: 'Marqué', suffix: '_made', points: 2, color: 'bg-emerald-500' },
        { label: 'Raté', suffix: '_missed', points: 0, color: 'bg-red-500' }
      ]
    },
    { 
      type: '3pt', label: '3 Pts', category: 'primary', color: 'bg-emerald-700',
      outcomes: [
        { label: 'Marqué', suffix: '_made', points: 3, color: 'bg-emerald-500' },
        { label: 'Raté', suffix: '_missed', points: 0, color: 'bg-red-500' }
      ]
    },

    { type: 'foul',       label: 'Faute', points: 0, isFoul: true, category: 'primary', color: 'bg-red-600' },
    { type: 'sub',        label: 'Remplacement', points: 0, category: 'system', color: 'bg-indigo-600' },
    { type: 'assist',     label: 'Passe', points: 0, category: 'secondary', color: 'bg-indigo-500' },
    { type: 'def_rebound',label: 'Reb Def', points: 0, category: 'secondary', color: 'bg-teal-500' },
    { type: 'off_rebound',label: 'Reb Off', points: 0, category: 'secondary', color: 'bg-teal-600' },
    { type: 'steal',      label: 'Interc.', points: 0, category: 'secondary', color: 'bg-amber-500' },
    { type: 'block',      label: 'Contre', points: 0, category: 'secondary', color: 'bg-amber-600' },
    { type: 'turnover',   label: 'Perte', points: 0, category: 'secondary', color: 'bg-orange-600' }
  ]
};