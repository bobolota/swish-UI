import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// 👇 1. On importe le vrai système d'authentification !
import { useAuth } from '@swish/identity'; 

import PlayerLayout from './components/PlayerLayout';

// Pages
import TournamentExplorer from './pages/TournamentExplorer';
import TournamentDetails from './pages/TournamentDetails';
import { MatchSummary } from '@swish/match-engine';
import TeamPage from './pages/TeamPage';

function App() {
  const { user, signOut } = useAuth(); 

  return (
    <BrowserRouter>
      <PlayerLayout user={user} logout={signOut}>
        <Routes>
          {/* ✅ ACCUEIL : On redirige la racine vers /tournaments pour plus de clarté */}
          <Route path="/" element={<Navigate to="/tournaments" replace />} />

          {/* ✅ EXPLORATEUR : On utilise l'URL /tournaments (celle de ta Sidebar) */}
          <Route path="/tournaments" element={<TournamentExplorer userId={user?.id} />} />

          {/* ✅ HUB DU TOURNOI : Attention, tes cartes font navigate(`/tournament/${id}`) 
              On utilise donc /tournament/:id (sans le "t") pour que ça marche partout */}
          <Route path="/tournament/:id" element={<TournamentDetails />} />

          {/* 3. Match Center */}
          <Route path="/match/:id" element={<MatchSummary />} />

          {/* 4. Profil Joueur */}
          <Route path="/player/:id" element={
            <div className="p-10 text-center text-slate-500 font-bold uppercase tracking-widest">
              Profil Joueur (En construction)
            </div>
          } />

          {/* 5. Profil Équipe */}
          <Route path="/team/:id" element={<TeamPage />} />

          {/* ✅ 6. MES ÉQUIPES : Nouvelle route pour le lien de ta Sidebar */}
          <Route path="/my-teams" element={
            <div className="p-10 text-center text-slate-500 font-bold uppercase tracking-widest">
              Mes Équipes (En construction - Prochaine étape !)
            </div>
          } />

          {/* 7. INVITATIONS : Nouvelle route pour le lien de ta Sidebar */}
          <Route path="/invitations" element={
            <div className="p-10 text-center text-slate-500 font-bold uppercase tracking-widest">
              Mes Invitations (En construction)
            </div>
          } />

          {/* 8. PROFIL PERSONNEL */}
          <Route path="/profile" element={
            <div className="p-10 text-center text-slate-500 font-bold uppercase tracking-widest">
              Mon Profil (En construction)
            </div>
          } />
        </Routes>
      </PlayerLayout>
    </BrowserRouter>
  );
}

export default App;