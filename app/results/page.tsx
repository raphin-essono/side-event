import prisma from "@/lib/prisma";
import AutoRefresh from "../components/AutoRefresh";
import Footer from "../components/Footer";

export const dynamic = "force-dynamic";

export default async function ResultsPage() {
  const stands = await prisma.stand.findMany({
    orderBy: { ordre: "asc" },
    include: {
      votes: { select: { noteGlobale: true } },
    },
  });

  // Calcul du classement
  const ranked = stands
    .map((s) => {
      const count = s.votes.length;
      const avg =
        count > 0
          ? s.votes.reduce((sum, v) => sum + v.noteGlobale, 0) / count
          : 0;
      return { ...s, count, avg };
    })
    .sort((a, b) => b.avg - a.avg || b.count - a.count);

  const maxAvg = ranked[0]?.avg ?? 1;
  const totalVotes = ranked.reduce((s, r) => s + r.count, 0);

  return (
    <div className="min-h-screen flex flex-col">
      <AutoRefresh intervalMs={3000} />

      {/* En-tête branded */}
      <header className="event-bg">
        <div className="mx-auto max-w-3xl px-5 py-10 sm:py-14 text-center text-white">
          <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wide backdrop-blur">
            Side Event VivaTech · Libreville 2026
          </span>
          <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight">
            Résultats des votes
          </h1>
          <p className="mt-2 text-white/80 text-sm sm:text-base">
            Classement en temps réel —{" "}
            <span className="font-semibold text-[var(--accent)]">{totalVotes}</span> vote
            {totalVotes !== 1 ? "s" : ""} enregistré{totalVotes !== 1 ? "s" : ""}
          </p>
        </div>
      </header>

      {/* Podium (top 3) */}
      {ranked.length >= 3 && (
        <section className="mx-auto w-full max-w-3xl px-5 pt-10">
          <span className="overline">Podium</span>
          <div className="mt-4 grid grid-cols-3 gap-3 items-end">
            {/* 2e place */}
            <PodiumCard stand={ranked[1]} position={2} />
            {/* 1re place */}
            <PodiumCard stand={ranked[0]} position={1} />
            {/* 3e place */}
            <PodiumCard stand={ranked[2]} position={3} />
          </div>
        </section>
      )}

      {/* Classement complet */}
      <main className="mx-auto w-full max-w-3xl px-5 py-8 flex-1">
        <span className="overline">Classement complet</span>
        <div className="mt-4 grid gap-3">
          {ranked.length === 0 && (
            <p className="text-sm text-muted">Aucun vote enregistré pour l&apos;instant.</p>
          )}
          {ranked.map((s, i) => (
            <div key={s.id} className="card p-4 flex items-center gap-4">
              {/* Rang */}
              <span
                className="shrink-0 w-9 h-9 rounded-full grid place-items-center text-sm font-bold"
                style={{
                  background: i === 0
                    ? "var(--accent)"
                    : i === 1
                    ? "var(--primary-pale)"
                    : i === 2
                    ? "var(--accent-pale)"
                    : "var(--border)",
                  color: i === 0 ? "var(--accent-foreground)" : "var(--foreground)",
                }}
              >
                {i + 1}
              </span>

              {/* Avatar */}
              <span
                className="shrink-0 h-11 w-11 rounded-xl grid place-items-center text-white text-sm font-bold"
                style={{ background: s.color ?? "var(--primary)" }}
              >
                {s.initials ?? s.nom.slice(0, 2).toUpperCase()}
              </span>

              {/* Infos + barre */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                  <span className="font-semibold text-sm truncate">{s.nom}</span>
                  <span className="text-xs text-muted shrink-0">
                    {s.count} vote{s.count !== 1 ? "s" : ""}
                  </span>
                </div>
                {/* Barre de score */}
                <div className="mt-2 h-2 rounded-full bg-border overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: maxAvg > 0 ? `${(s.avg / maxAvg) * 100}%` : "0%",
                      background: "var(--gradient-hero)",
                    }}
                  />
                </div>
                <div className="mt-1 flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span
                      key={n}
                      className="text-sm leading-none"
                      style={{ color: n <= Math.round(s.avg) ? "var(--accent)" : "var(--border)" }}
                    >
                      ★
                    </span>
                  ))}
                  <span className="text-xs text-muted ml-1">
                    {s.avg > 0 ? s.avg.toFixed(1) : "—"} / 5
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}

// ── Carte podium ────────────────────────────────────────
type RankedStand = {
  id: string;
  nom: string;
  color: string | null;
  initials: string | null;
  count: number;
  avg: number;
};

function PodiumCard({ stand: s, position }: { stand: RankedStand; position: 1 | 2 | 3 }) {
  const heights: Record<number, string> = { 1: "h-28", 2: "h-20", 3: "h-14" };
  const medals: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

  return (
    <div className={`flex flex-col items-center gap-2 ${position === 1 ? "order-2" : position === 2 ? "order-1" : "order-3"}`}>
      <span className="text-2xl">{medals[position]}</span>
      <span
        className="h-12 w-12 rounded-xl grid place-items-center text-white text-sm font-bold"
        style={{ background: s.color ?? "var(--primary)" }}
      >
        {s.initials ?? s.nom.slice(0, 2).toUpperCase()}
      </span>
      <span className="text-xs font-semibold text-center leading-tight line-clamp-2">{s.nom}</span>
      <span className="text-xs text-muted">{s.avg.toFixed(1)} ★</span>
      {/* Socle */}
      <div
        className={`w-full ${heights[position]} rounded-t-lg`}
        style={{
          background: position === 1
            ? "var(--gradient-hero)"
            : position === 2
            ? "var(--primary-pale)"
            : "var(--accent-pale)",
        }}
      />
    </div>
  );
}
