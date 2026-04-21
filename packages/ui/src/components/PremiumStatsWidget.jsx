// Composant : PremiumStatsWidget.jsx
export function PremiumStatsWidget({ revenue, pendingValidations, activeTournaments }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="bg-white border rounded-xl p-5 shadow-sm border-l-4 border-l-green-500">
        <p className="text-sm text-slate-500 font-medium">Revenus (Caisse)</p>
        <p className="text-2xl font-black text-slate-900 mt-1">{revenue} €</p>
      </div>
      
      <div className="bg-white border rounded-xl p-5 shadow-sm border-l-4 border-l-orange-500">
        <p className="text-sm text-slate-500 font-medium">Paiements en attente</p>
        <div className="flex items-end justify-between mt-1">
          <p className="text-2xl font-black text-slate-900">{pendingValidations}</p>
          <button className="text-sm text-orange-600 font-bold hover:underline">Valider</button>
        </div>
      </div>

      <div className="bg-white border rounded-xl p-5 shadow-sm border-l-4 border-l-blue-500">
        <p className="text-sm text-slate-500 font-medium">Tournois Actifs</p>
        <p className="text-2xl font-black text-slate-900 mt-1">{activeTournaments}</p>
      </div>
    </div>
  );
}