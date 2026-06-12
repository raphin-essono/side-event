type ChartStand = {
  id: string;
  nom: string;
  statutVote: string;
  voteCount: number;
  averageNote: number;
};

/** Classement des stands par nombre de votes — barres horizontales (sans dépendance). */
export default function StandsChart({ stands }: { stands: ChartStand[] }) {
  const ranked = [...stands].sort(
    (a, b) => b.voteCount - a.voteCount || b.averageNote - a.averageNote,
  );
  const maxVotes = Math.max(...ranked.map((s) => s.voteCount), 0);

  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-semibold">Classement des votes</h2>
          <p className="text-sm text-muted mt-0.5">
            Stands classés par nombre de votes reçus, en direct.
          </p>
        </div>
        {maxVotes > 0 && (
          <span className="badge badge-accent">En tête : {ranked[0].nom}</span>
        )}
      </div>

      {maxVotes === 0 ? (
        <p className="mt-5 text-sm text-muted">
          Aucun vote pour le moment — le classement apparaîtra dès les premiers votes.
        </p>
      ) : (
        <div className="mt-5 grid gap-3">
          {ranked.map((s, i) => {
            const pct = Math.max(4, Math.round((s.voteCount / maxVotes) * 100));
            const isTop = i === 0 && s.voteCount > 0;
            return (
              <div key={s.id} className="grid grid-cols-[1.5rem_8.5rem_1fr_auto] items-center gap-3">
                <span
                  className={`text-xs font-bold ${isTop ? "text-primary" : "text-muted"}`}
                >
                  {i + 1}
                </span>
                <span className="text-sm font-medium truncate" title={s.nom}>
                  {s.nom}
                </span>
                <div className="h-5 rounded-full bg-primary-pale overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${pct}%`,
                      background: isTop ? "var(--gradient-hero)" : "var(--primary-light)",
                      opacity: isTop ? 1 : 0.75,
                    }}
                  />
                </div>
                <span className="text-xs text-muted whitespace-nowrap tabular-nums">
                  <strong className="text-foreground">{s.voteCount}</strong> vote(s)
                  {s.averageNote > 0 && <> · {s.averageNote}/5</>}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
