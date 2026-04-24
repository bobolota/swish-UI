import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PlayerLayout from './components/PlayerLayout';
import TournamentExplorer from './pages/TournamentExplorer';

function App() {
  // Simuler les fonctions/données (à remplacer par ton useAuth plus tard)
  const user = { name: "Joueur Test" };
  const logout = () => console.log("Logout");

  return (
    <BrowserRouter>
      <PlayerLayout user={user} logout={logout}>
        <Routes>
          <Route path="/" element={<Navigate to="/tournaments" replace />} />
          <Route path="/tournaments" element={<TournamentExplorer userId="test-uuid" />} />
          {/* Tes futures routes */}
          <Route path="/profile" element={<div>Page Profil</div>} />
        </Routes>
      </PlayerLayout>
    </BrowserRouter>
  );
}

export default App;