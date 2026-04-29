import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import TournamentManager from './pages/tournament'; // L'index.jsx de ton tournoi
import TeamPlayersPage from './pages/tournament/TeamPlayersPage';
import ActiveMatch from './pages/ActiveMatch';
import MatchSummary from './pages/MatchSummary';
import Jumbotron from './pages/Jumbotron';


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tournament/:id" element={<TournamentManager />} />
        <Route path="/tournament/:tournamentId/team/:teamId" element={<TeamPlayersPage />} />
        <Route path="/match/:id" element={<ActiveMatch />} />
        <Route path="/matches/:id/summary" element={<MatchSummary />} />
        <Route path="/matches/:id/jumbotron" element={<Jumbotron />} />
        
        <Route path="*" element={
          <div className="flex h-screen items-center justify-center bg-slate-100">
            <h1 className="text-4xl font-black text-red-500">Erreur 404 : Page introuvable</h1>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}