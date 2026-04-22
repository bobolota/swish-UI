import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import TournamentManager from './pages/tournament'; // L'index.jsx de ton tournoi

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tournament/:id" element={<TournamentManager />} />
        
        <Route path="*" element={
          <div className="flex h-screen items-center justify-center bg-slate-100">
            <h1 className="text-4xl font-black text-red-500">Erreur 404 : Page introuvable</h1>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}