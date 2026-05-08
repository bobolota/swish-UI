import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// 👇 1. On importe le vrai système d'authentification !
import { useAuth } from '@swish/identity'; 

import PlayerLayout from './components/PlayerLayout';

// Pages
import TournamentExplorer from './pages/TournamentExplorer';
import TournamentDetails from './pages/TournamentDetails';
import { MatchSummary } from '@swish/match-engine';
import TeamPage from './pages/TeamPage';

function App() {
  // 👇 2. On récupère le vrai utilisateur connecté et la fonction de déconnexion
  const { user, signOut } = useAuth(); 

  return (
    <BrowserRouter>
      {/* On passe les vraies données au Layout (pour afficher l'avatar en haut à droite) */}
      <PlayerLayout user={user} logout={signOut}>
        <Routes>
          {/* 1. Explorateur de Tournois (Accueil public) */}
          {/* On lui passe l'ID de l'utilisateur. S'il n'est pas connecté, ça passera "undefined" et c'est très bien ! */}
          <Route path="/" element={<TournamentExplorer userId={user?.id} />} />

          {/* 2. Hub du Tournoi (Classement, Bracket, etc.) */}
          <Route path="/t/:id" element={<TournamentDetails />} />

          {/* 3. Match Center (Box Score & Play-by-Play en mode ReadOnly) */}
          <Route path="/match/:id" element={<MatchSummary />} />

          {/* 4. Profil Joueur (Stats & Palmarès) */}
          <Route path="/player/:id" element={
            <div className="p-10 text-center text-slate-500 font-bold uppercase tracking-widest">
              Profil Joueur (En construction)
            </div>
          } />

          {/* 5. Profil Équipe (Roster) */}
          <Route path="/team/:id" element={<TeamPage />} />

          {/* 6. Espace Personnel (Mes équipes, Mes invitations) */}
          <Route path="/me" element={
            <div className="p-10 text-center text-slate-500 font-bold uppercase tracking-widest">
              Mon Espace Personnel (En construction)
            </div>
          } />

          {/* 7. Annuaire des joueurs / Recherche */}
          <Route path="/search" element={
            <div className="p-10 text-center text-slate-500 font-bold uppercase tracking-widest">
              Recherche de Joueurs (En construction)
            </div>
          } />
        </Routes>
      </PlayerLayout>
    </BrowserRouter>
  );
}

export default App;