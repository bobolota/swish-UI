// Composant : NextMatchWidget.jsx
export function NextMatchWidget({ homeTeam, awayTeam, time, court }) {
  return (
    <div className="bg-slate-900 text-white rounded-xl p-6 shadow-lg relative overflow-hidden">
      {/* Petit effet visuel de fond */}
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
      
      <h3 className="text-slate-400 text-sm font-semibold mb-4 uppercase tracking-wider">
        Ton Prochain Match
      </h3>
      
      <div className="flex items-center justify-between mb-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center font-bold text-xl mb-2 mx-auto">
            {homeTeam.substring(0, 1)}
          </div>
          <span className="font-medium text-sm">{homeTeam}</span>
        </div>
        
        <div className="text-center px-4">
          <div className="text-2xl font-black text-blue-400 mb-1">{time}</div>
          <div className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded">VS</div>
        </div>

        <div className="text-center">
          <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center font-bold text-xl mb-2 mx-auto">
            {awayTeam.substring(0, 1)}
          </div>
          <span className="font-medium text-sm">{awayTeam}</span>
        </div>
      </div>

      <div className="bg-slate-800 rounded-lg p-3 flex justify-between items-center text-sm">
        <span className="text-slate-300">📍 {court}</span>
        <button className="text-blue-400 font-bold hover:text-blue-300">Feuille de match →</button>
      </div>
    </div>
  );
}