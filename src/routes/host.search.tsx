import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { actions, useEventStore, useHydrated, type Participant } from "@/lib/event-store";
import { QRCode } from "@/components/QRCode";
import { RefreshCw, Search as SearchIcon, X } from "lucide-react";

export const Route = createFileRoute("/host/search")({
  component: SearchPage,
});

function SearchPage() {
  useHydrated();
  const participants = useEventStore(s => s.participants);
  const [q, setQ] = useState("");
  const [active, setActive] = useState<Participant | null>(null);

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return participants;
    return participants.filter(p =>
      [p.firstName, p.lastName, p.email, p.id, p.role].some(v => v.toLowerCase().includes(t))
    );
  }, [participants, q]);

  function regen(p: Participant) {
    const updated = actions.regenerateToken(p.id);
    if (updated) setActive(updated);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Rechercher un participant</h1>
        <p className="text-muted-foreground text-sm mt-1">Retrouvez un participant et régénérez son QR si besoin. Les anciens QR sont alors révoqués.</p>
      </div>

      <div className="relative">
        <SearchIcon className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          autoFocus
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Nom, prénom, email ou ID…"
          className="w-full rounded-2xl border border-input bg-card pl-11 pr-4 py-4 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="rounded-2xl bg-card ring-1 ring-border overflow-hidden">
        {results.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-sm">
            {participants.length === 0 ? "Aucun participant enregistré pour l'instant." : "Aucun résultat."}
          </div>
        ) : (
          <ul className="divide-y">
            {results.map(p => (
              <li key={p.id} className="flex items-center gap-4 px-5 py-4 hover:bg-secondary/40 transition">
                <div className="h-11 w-11 rounded-full bg-secondary grid place-items-center font-semibold text-primary">
                  {p.firstName[0]}{p.lastName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{p.firstName} {p.lastName} <span className="text-xs font-mono text-muted-foreground ml-1">{p.id}</span></div>
                  <div className="text-sm text-muted-foreground truncate">{p.role || "—"} · {p.email}</div>
                </div>
                <button onClick={() => regen(p)} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90">
                  <RefreshCw className="h-4 w-4" /> Nouveau QR
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {active && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 backdrop-blur-sm p-6" onClick={() => setActive(null)}>
          <div className="bg-card rounded-3xl p-8 max-w-md w-full text-center shadow-2xl" onClick={e => e.stopPropagation()}>
            <button onClick={() => setActive(null)} className="absolute right-6 top-6 text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            <h3 className="text-xl font-bold">Nouveau QR généré</h3>
            <p className="text-sm text-muted-foreground mt-1">{active.firstName} {active.lastName} · <span className="font-mono">{active.id}</span></p>
            <div className="mt-5 flex justify-center">
              <QRCode value={`${window.location.origin}/m/${active.id}?t=${active.token}`} size={240} />
            </div>
            <p className="mt-4 text-xs text-warning">⚠ Les QR précédents de ce participant sont désormais révoqués.</p>
            <Link to="/m/$id" params={{ id: active.id }} search={{ t: active.token }} className="mt-5 inline-block rounded-xl bg-secondary px-5 py-2.5 text-sm font-medium hover:bg-muted">
              Ouvrir l'espace mobile
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
