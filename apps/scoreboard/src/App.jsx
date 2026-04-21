import * as React from 'react';
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';

// ------------------------------------------------------------------
// LE FAUX ÉTAT DU MATCH (MOCK) - Ce qui viendra de Supabase plus tard
// ------------------------------------------------------------------
const mockMatchState = {
  clock: "10:00",
  period: "Q1",
  home: { name: "Lakers", score: 85, fouls: 3, color: "text-yellow-400" },
  away: { name: "Celtics", score: 82, fouls: 4, color: "text-green-500" }
};

// ------------------------------------------------------------------
// VUE : LE PANNEAU D'AFFICHAGE GÉANT (Route : "/match/:id")
// ------------------------------------------------------------------
function ScoreboardView() {
  const { id } = useParams(); // On récupère l'ID envoyé par l'arbitre

  return (
    <div className="min-h-screen bg-black text-white flex flex-col p-8 select-none font-sans cursor-none">
      
      {/* HEADER : Indicateur Live et ID du Match */}
      <header className="flex justify-between items-center mb-8">
        <div className="text-slate-600 font-bold tracking-widest text-sm uppercase">
          Match ID: <span className="font-mono text-slate-400">{id}</span>
        </div>
        <div className="flex items-center gap-3 bg-red-950/30 border border-red-900/50 px-4 py-2 rounded-full">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-red-500 font-bold uppercase text-xs tracking-widest">Live Broadcast</span>
        </div>
      </header>

      {/* ZONE PRINCIPALE : CHRONO ET SCORES */}
      <main className="flex-1 flex flex-col items-center justify-center gap-12">
        
        {/* LE CHRONOMÈTRE */}
        <div className="text-center bg-slate-900/50 px-16 py-6 rounded-3xl border border-slate-800">
          <div className="text-amber-500 font-black text-[10rem] tracking-tighter tabular-nums leading-none drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">
            {mockMatchState.clock}
          </div>
          <div className="text-slate-400 uppercase tracking-[0.5em] font-bold text-2xl mt-4">
            Période {mockMatchState.period}
          </div>
        </div>

        {/* LES ÉQUIPES */}
        <div className="w-full max-w-7xl flex justify-between items-center">
          
          {/* Domicile (HOME) */}
          <div className="flex flex-col items-center w-5/12">
            <h2 className={`text-6xl font-black uppercase tracking-wider mb-8 truncate w-full text-center ${mockMatchState.home.color}`}>
              {mockMatchState.home.name}
            </h2>
            <div className="bg-slate-900 border-4 border-slate-800 rounded-[3rem] w-full aspect-[4/3] flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent"></div>
              <span className="text-[15rem] font-black tabular-nums leading-none text-white drop-shadow-2xl">
                {mockMatchState.home.score}
              </span>
            </div>
            <div className="mt-8 text-3xl font-bold text-slate-500 uppercase tracking-widest">
              Fautes: <span className="text-white">{mockMatchState.home.fouls}</span>
            </div>
          </div>

          <div className="text-8xl text-slate-800 font-black opacity-30">VS</div>

          {/* Extérieur (AWAY) */}
          <div className="flex flex-col items-center w-5/12">
            <h2 className={`text-6xl font-black uppercase tracking-wider mb-8 truncate w-full text-center ${mockMatchState.away.color}`}>
              {mockMatchState.away.name}
            </h2>
            <div className="bg-slate-900 border-4 border-slate-800 rounded-[3rem] w-full aspect-[4/3] flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent"></div>
              <span className="text-[15rem] font-black tabular-nums leading-none text-white drop-shadow-2xl">
                {mockMatchState.away.score}
              </span>
            </div>
            <div className="mt-8 text-3xl font-bold text-slate-500 uppercase tracking-widest">
              Fautes: <span className="text-white">{mockMatchState.away.fouls}</span>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

// ------------------------------------------------------------------
// LE POINT D'ENTRÉE (Gère le Routeur)
// ------------------------------------------------------------------
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/match/:id" element={<ScoreboardView />} />
        {/* Si quelqu'un va sur l'accueil du scoreboard sans ID, on lui dit d'attendre */}
        <Route path="/" element={
          <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center space-y-6">
            <div className="text-8xl grayscale opacity-20">📺</div>
            <h1 className="text-4xl font-black tracking-[0.5em] text-slate-700 uppercase">Swish Arena</h1>
            <p className="text-slate-500 uppercase tracking-widest text-sm">En attente de connexion à un match...</p>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}