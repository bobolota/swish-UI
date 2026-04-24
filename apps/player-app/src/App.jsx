import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import TournamentExplorer from './pages/TournamentExplorer';

// Si tu as un composant de Layout (ex: barre de navigation latérale/supérieure)
// import { PlayerLayout } from '@swish/ui'; 

function App() {
  // Pour l'instant, on simule un utilisateur connecté pour tester l'interface
  // Plus tard, tu récupéreras ce userId depuis ton AuthGateway / Supabase
  // Dans App.jsx, remplace l'ancien par celui-ci :
const dummyUserId = "550e8400-e29b-41d4-a716-446655440000"; 
// (Ou copie-colle un vrai ID depuis ton Supabase)

  return (
    <BrowserRouter>
      {/* Si tu as un Layout, décommente et enveloppe tes routes avec */}
      {/* <PlayerLayout> */}
        <Routes>
          {/* On redirige la racine vers l'explorateur pour le moment */}
          <Route path="/" element={<Navigate to="/tournaments" replace />} />
          
          <Route 
            path="/tournaments" 
            element={<TournamentExplorer userId={dummyUserId} />} 
          />
          
          {/* Tes futures routes iront ici :
          <Route path="/tournaments/:id" element={<TournamentDetails />} />
          <Route path="/profile" element={<MyProfile />} />
          */}
        </Routes>
      {/* </PlayerLayout> */}
    </BrowserRouter>
  );
}

export default App;