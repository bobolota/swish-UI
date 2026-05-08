import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams, useNavigate, Outlet } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import TournamentManager from './pages/tournament';
import TeamPlayersPage from './pages/tournament/TeamPlayersPage';
import ActiveMatch from './pages/ActiveMatch';
import { MatchSummary } from '@swish/match-engine';
import Jumbotron from './pages/Jumbotron';
import { TeamProfile } from '@swish/roster';
import { ArrowLeft } from 'lucide-react';

// NOUVEAUX IMPORTS POUR LE LAYOUT GLOBAL
import { AdminLayout } from '@swish/ui';
import { useAuth } from '@swish/identity';

// 1️⃣ LE COMPOSANT MAGIQUE : Il enveloppe les pages avec la Sidebar
function AppLayout() {
  const { user, logout } = useAuth();
  
  return (
    <AdminLayout user={user} logout={logout}>
      {/* <Outlet /> est la "fenêtre" où React Router injectera tes pages */}
      <Outlet /> 
    </AdminLayout>
  );
}

// 2️⃣ TA PAGE ÉQUIPE (Elle n'a plus besoin de fond gris car le Layout gère ça !)
function AdminTeamPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  return (
    <div className="max-w-7xl mx-auto w-full w-full">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold mb-8 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Retour au Tournoi
      </button>
      <TeamProfile teamId={id} />
    </div>
  );
}

// 3️⃣ LE ROUTEUR : Organisé par groupes !
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* 📦 GROUPE 1 : LES PAGES AVEC SIDEBAR */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tournament/:id" element={<TournamentManager />} />
          <Route path="/tournament/:tournamentId/team/:teamId" element={<TeamPlayersPage />} />
          <Route path="/team/:id" element={<AdminTeamPage />} />
        </Route>

        {/* 📺 GROUPE 2 : LES PAGES PLEIN ÉCRAN (Sans Sidebar) */}
        <Route path="/match/:id" element={<ActiveMatch />} />
        <Route path="/matches/:id/summary" element={<MatchSummary />} />
        <Route path="/matches/:id/jumbotron" element={<Jumbotron />} />

        {/* ERREUR 404 */}
        <Route path="*" element={
          <div className="flex h-screen items-center justify-center bg-slate-100">
            <h1 className="text-4xl font-black text-red-500">Erreur 404 : Page introuvable</h1>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}