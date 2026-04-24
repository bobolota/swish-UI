export function TournamentInfoTab({ description }) {
  return (
    <div className="prose prose-slate max-w-none">
      <h3 className="text-lg font-bold mb-4">À propos de cet événement</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}