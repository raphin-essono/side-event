import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { actions, STANDS, useEventStore, useHydrated } from "@/lib/event-store";
import { ArrowLeft, CheckCircle2, Star } from "lucide-react";

const search = z.object({ t: z.string().optional() });

export const Route = createFileRoute("/m/$id/vote/$standId")({
  validateSearch: search,
  component: VotePage,
});

function VotePage() {
  useHydrated();
  const { id, standId } = Route.useParams();
  const { t } = Route.useSearch();
  const nav = useNavigate();
  const participant = useEventStore(s => s.participants.find(p => p.id === id));
  const existing = useEventStore(s => s.votes.find(v => v.participantId === id && v.standId === standId));
  const stand = STANDS.find(s => s.id === standId);

  const [global, setGlobal] = useState(existing?.global ?? 4);
  const [innovation, setInnovation] = useState(existing?.innovation ?? 4);
  const [clarity, setClarity] = useState(existing?.clarity ?? 4);
  const [impact, setImpact] = useState(existing?.impact ?? 4);
  const [comment, setComment] = useState(existing?.comment ?? "");
  const [done, setDone] = useState(false);

  if (!stand || !participant) {
    return <div className="p-8 text-center text-sm text-muted-foreground">Stand introuvable.</div>;
  }

  if (existing && !done) {
    return (
      <Center>
        <CheckCircle2 className="h-10 w-10 text-success mx-auto" />
        <h1 className="mt-3 text-xl font-bold">Vous avez déjà voté</h1>
        <p className="text-sm text-muted-foreground mt-1">Votre vote pour <strong>{stand.name}</strong> a bien été enregistré. Il n'est pas modifiable.</p>
        <Link to="/m/$id" params={{ id }} search={{ t, tab: "stands" }} className="mt-6 inline-block rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">Retour aux stands</Link>
      </Center>
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    actions.castVote({ participantId: id, standId, global, innovation, clarity, impact, comment, at: Date.now() });
    setDone(true);
    setTimeout(() => nav({ to: "/m/$id", params: { id }, search: { t, tab: "stands" } }), 1400);
  }

  if (done) {
    return (
      <Center>
        <div className="h-16 w-16 mx-auto rounded-full bg-success/15 grid place-items-center">
          <CheckCircle2 className="h-8 w-8 text-success" />
        </div>
        <h1 className="mt-4 text-xl font-bold">Merci pour votre vote !</h1>
        <p className="text-sm text-muted-foreground mt-1">Redirection vers la liste des stands…</p>
      </Center>
    );
  }

  return (
    <div className="min-h-screen pb-10 bg-background">
      <header className="px-5 pt-6 pb-5 bg-card border-b">
        <Link to="/m/$id" params={{ id }} search={{ t, tab: "stands" }} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Retour
        </Link>
        <div className="mt-4 flex items-center gap-3">
          <div className="h-14 w-14 rounded-2xl grid place-items-center text-white font-bold" style={{ background: stand.color }}>{stand.initials}</div>
          <div>
            <h1 className="text-xl font-bold leading-tight">{stand.name}</h1>
            <p className="text-xs text-muted-foreground">{stand.tagline}</p>
          </div>
        </div>
      </header>

      <form onSubmit={submit} className="px-5 pt-6 space-y-6">
        <StarRating label="Note globale" value={global} onChange={setGlobal} />
        <div className="grid gap-5 rounded-2xl bg-card p-5 ring-1 ring-border">
          <SliderField label="Innovation" value={innovation} onChange={setInnovation} />
          <SliderField label="Clarté" value={clarity} onChange={setClarity} />
          <SliderField label="Impact" value={impact} onChange={setImpact} />
        </div>
        <label className="block">
          <span className="text-sm font-medium">Commentaire (optionnel)</span>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            rows={3}
            placeholder="Un mot à partager avec l'équipe du stand ?"
            className="mt-1.5 w-full rounded-xl border border-input bg-card px-4 py-3 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </label>
        <button type="submit" className="w-full rounded-2xl bg-primary py-4 text-base font-semibold text-primary-foreground shadow-[var(--shadow-glow)] active:scale-[0.99]">
          Valider mon vote
        </button>
        <p className="text-center text-xs text-muted-foreground">Attention&nbsp;: vous ne pouvez voter qu'une seule fois par stand.</p>
      </form>
    </div>
  );
}

function StarRating({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <div className="rounded-2xl bg-card p-5 ring-1 ring-border text-center">
      <div className="text-sm font-medium">{label}</div>
      <div className="mt-3 flex justify-center gap-2">
        {[1, 2, 3, 4, 5].map(n => (
          <button key={n} type="button" onClick={() => onChange(n)}
            className="p-1 transition active:scale-90">
            <Star className={`h-9 w-9 ${n <= value ? "fill-warning text-warning" : "text-muted-foreground/40"}`} />
          </button>
        ))}
      </div>
      <div className="text-xs text-muted-foreground mt-2">{value}/5</div>
    </div>
  );
}

function SliderField({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <label className="block">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="font-mono text-primary">{value}/5</span>
      </div>
      <input type="range" min={1} max={5} step={1} value={value} onChange={e => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-[color:var(--primary)]" />
    </label>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen grid place-items-center p-8 text-center"><div className="max-w-sm">{children}</div></div>;
}
