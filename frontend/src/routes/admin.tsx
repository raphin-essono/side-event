import { createFileRoute, Link } from "@tanstack/react-router";
import { actions, STANDS, useEventStore, useHydrated } from "@/lib/event-store";
import { Brand } from "@/components/Brand";
import { Users, Vote as VoteIcon, Star, Power } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Pilotage — SING VivaTech" }] }),
  component: AdminPage,
});

function AdminPage() {
  useHydrated();
  const votes = useEventStore(s => s.votes);
  const participants = useEventStore(s => s.participants);
  const standsOpen = useEventStore(s => s.standsOpen);
  const globalOpen = useEventStore(s => s.voteOpenGlobal);

  const stats = STANDS.map(s => {
    const v = votes.filter(x => x.standId === s.id);
    const avg = v.length ? v.reduce((a, b) => a + b.global, 0) / v.length : 0;
    return { ...s, count: v.length, avg, open: standsOpen[s.id] };
  });

  return (
    <div className="min-h-screen">
      <header className="border-b bg-card">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <Brand subtitle="Pilotage — organisateur" />
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Menu</Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10 space-y-8">
        <section>
          <h1 className="text-3xl font-bold">Pilotage du vote</h1>
          <p className="text-muted-foreground mt-1">Ouvrez ou fermez le vote globalement, ou stand par stand.</p>
        </section>

        <section className="grid sm:grid-cols-3 gap-4">
          <Stat icon={Users} label="Participants enregistrés" value={participants.length} />
          <Stat icon={VoteIcon} label="Votes exprimés" value={votes.length} />
          <Stat icon={Star} label="Note moyenne globale" value={votes.length ? (votes.reduce((a, b) => a + b.global, 0) / votes.length).toFixed(2) : "—"} />
        </section>

        <section className="rounded-3xl bg-[var(--gradient-hero)] text-primary-foreground p-6 sm:p-8 shadow-[var(--shadow-glow)] flex items-center justify-between gap-6 flex-wrap">
          <div>
            <div className="text-xs uppercase tracking-widest opacity-80">Vote global</div>
            <div className="text-2xl font-bold mt-1">{globalOpen ? "Ouvert pour tous les stands" : "Fermé"}</div>
            <p className="text-sm opacity-90 mt-1">Bascule l'état de tous les stands en une action.</p>
          </div>
          <button onClick={() => actions.toggleGlobal()} className="inline-flex items-center gap-2 rounded-xl bg-white text-primary px-5 py-3 font-semibold hover:opacity-90">
            <Power className="h-4 w-4" /> {globalOpen ? "Fermer le vote" : "Ouvrir le vote"}
          </button>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3">Stands</h2>
          <div className="rounded-2xl bg-card ring-1 ring-border overflow-hidden">
            <div className="hidden sm:grid grid-cols-[1fr_120px_120px_140px_160px] gap-3 px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider border-b">
              <span>Stand</span><span>Statut</span><span>Votes</span><span>Note moyenne</span><span className="text-right">Action</span>
            </div>
            <ul className="divide-y">
              {stats.map(s => (
                <li key={s.id} className="grid sm:grid-cols-[1fr_120px_120px_140px_160px] gap-3 px-5 py-4 items-center">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg grid place-items-center font-bold text-white text-xs" style={{ background: s.color }}>{s.initials}</div>
                    <div>
                      <div className="font-semibold">{s.name}</div>
                      <div className="text-xs text-muted-foreground">{s.tagline}</div>
                    </div>
                  </div>
                  <div>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${s.open ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${s.open ? "bg-success" : "bg-muted-foreground"}`} /> {s.open ? "Ouvert" : "Fermé"}
                    </span>
                  </div>
                  <div className="font-mono text-sm">{s.count}</div>
                  <div className="font-mono text-sm">{s.avg ? s.avg.toFixed(2) : "—"}</div>
                  <div className="sm:text-right">
                    <button onClick={() => actions.toggleStand(s.id)} className={`rounded-lg px-3 py-2 text-xs font-medium ${s.open ? "bg-destructive/10 text-destructive hover:bg-destructive/20" : "bg-primary text-primary-foreground hover:opacity-90"}`}>
                      {s.open ? "Fermer" : "Ouvrir"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="text-center">
          <button onClick={() => { if (confirm("Réinitialiser toute la démo ?")) actions.reset(); }}
            className="text-xs text-muted-foreground hover:text-destructive underline">
            Réinitialiser la démo
          </button>
        </section>
      </main>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-card p-5 ring-1 ring-border">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="mt-2 text-3xl font-bold font-display">{value}</div>
    </div>
  );
}
