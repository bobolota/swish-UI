import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import TournamentManager from './pages/tournament'; // ou le chemin exact de ton index.jsx

export default function App() {
  // Ce petit log va s'afficher dans F12 si ce fichier est bien lu
  console.log("🚀 Le routeur App.jsx est bien lancé !"); 

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tournament/:id" element={<TournamentManager />} />
        
        {/* LE FILET DE SÉCURITÉ : Si l'URL est mauvaise, on le verra tout de suite */}
        <Route path="*" element={
          <div className="flex h-screen items-center justify-center bg-slate-100">
            <div className="text-center">
              <h1 className="text-4xl font-black text-red-500 mb-4">Erreur 404</h1>
              <p className="text-slate-600">L'URL actuelle ne correspond à aucune page.</p>
              <a href="/dashboard" className="text-blue-500 underline mt-4 block">Forcer le retour au Dashboard</a>
            </div>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}