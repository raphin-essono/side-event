import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { actions, hasVoted, PROGRAM, STANDS, useEventStore, useHydrated } from "@/lib/event-store";
import { Calendar, Grid3x3, Info, LogOut, Lock, CheckCircle2, Star } from "lucide-react";

const search = z.object({ t: z.string().optional(), tab: z.enum(["program", "stands", "info"]).optional() });

export const Route = createFileRoute("/m/$id/")({
  validateSearch: search,
  component: ParticipantSpace,
});

function ParticipantSpace() {
  useHydrated();
  const { id } = Route.useParams();
  const { t, tab = "program" } = Route.useSearch();
  const nav = useNavigate({ from: "/m/$id" });
  const participant = useEventStore(s => s.participants.find(p => p.id === id));

  if (!participant) {
    return <CenterMsg title="Espace introuvable" desc="Le QR a peut-être été révoqué. Rendez-vous à l'accueil pour en générer un nouveau." />;
  }
  if (t && t !== participant.token) {
    return <CenterMsg title="QR expiré" desc="Ce QR n'est plus valide. Demandez à l'hôte d'en générer un nouveau." />;
  }

  function setTab(next: "program" | "stands" | "info") {
    nav({ search: { t, tab: next }, replace: true });
  }

  return (
    <div className="min-h-screen pb-24 bg-background">
      <header className="sticky top-0 z-10 bg-[var(--gradient-hero)] text-primary-foreground px-5 pt-6 pb-5 rounded-b-3xl shadow-[var(--shadow-glow)]">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs uppercase tracking-widest opacity-80">Bonjour</div>
            <div className="text-xl font-bold">{participant.firstName} {participant.lastName}</div>
            <div className="text-sm text-muted-foreground mt-0.5">{participant.role}</div>
            <div className="text-xs opacity-80 font-mono mt-0.5">ID · {participant.id}</div>
          </div>
          <Link to="/" className="rounded-full bg-white/10 p-2 hover:bg-white/20"><LogOut className="h-4 w-4" /></Link>
        </div>
      </header>

      <main className="px-5 pt-6">
        {tab === "program" && <ProgramTab />}
        {tab === "stands" && <StandsTab participantId={participant.id} token={t} />}
        {tab === "info" && <InfoTab />}
      </main>

      <nav className="fixed bottom-0 inset-x-0 bg-card/95 backdrop-blur border-t z-20">
        <div className="mx-auto max-w-md grid grid-cols-3">
          {[
            { k: "program", label: "Programme", icon: Calendar },
            { k: "stands", label: "Stands & Vote", icon: Grid3x3 },
            { k: "info", label: "Infos", icon: Info },
          ].map(item => {
            const active = tab === item.k;
            return (
              <button key={item.k} onClick={() => setTab(item.k as "program")}
                className={`flex flex-col items-center gap-1 py-3 text-xs font-medium transition ${active ? "text-primary" : "text-muted-foreground"}`}>
                <item.icon className={`h-5 w-5 ${active ? "scale-110" : ""} transition`} />
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function ProgramTab() {
  return (
    <section>
      <h2 className="text-lg font-bold mb-4">Programme du jour</h2>
      <ol className="relative border-l-2 border-border ml-3 space-y-5">
        {PROGRAM.map((it, i) => (
          <li key={i} className="pl-5 relative">
            <span className="absolute -left-[7px] top-1.5 h-3 w-3 rounded-full bg-primary ring-4 ring-background" />
            <div className="text-xs font-mono text-primary">{it.time}</div>
            <div className="font-semibold mt-0.5">{it.title}</div>
            <div className="text-xs text-muted-foreground">{it.room}</div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function StandsTab({ participantId, token }: { participantId: string; token?: string }) {
  const standsOpen = useEventStore(s => s.standsOpen);
  const votes = useEventStore(s => s.votes);
  return (
    <section>
      <div className="flex items-end justify-between mb-4">
        <h2 className="text-lg font-bold">Stands & Vote</h2>
        <span className="text-xs text-muted-foreground">{STANDS.length} stands</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {STANDS.map(s => {
          const voted = votes.some(v => v.participantId === participantId && v.standId === s.id);
          const open = standsOpen[s.id];
          const status: "voted" | "open" | "closed" = voted ? "voted" : open ? "open" : "closed";
          const disabled = status !== "open";
          const inner = (
            <div className={`relative rounded-2xl p-4 ring-1 ring-border bg-card shadow-[var(--shadow-soft)] h-full flex flex-col transition ${disabled ? "opacity-70" : "hover:-translate-y-0.5 hover:shadow-[var(--shadow-glow)]"}`}>
              <div className="h-12 w-12 rounded-xl grid place-items-center font-bold text-white text-sm" style={{ background: s.color }}>{s.initials}</div>
              <div className="mt-3 font-semibold leading-snug">{s.name}</div>
              <div className="text-xs text-muted-foreground mt-0.5 flex-1">{s.tagline}</div>
              <StatusBadge status={status} />
            </div>
          );
          if (disabled) return <div key={s.id}>{inner}</div>;
          return (
            <Link key={s.id} to="/m/$id/vote/$standId" params={{ id: participantId, standId: s.id }} search={{ t: token }}>
              {inner}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function StatusBadge({ status }: { status: "voted" | "open" | "closed" }) {
  const map = {
    voted: { label: "Voté", cls: "bg-success/15 text-success", icon: CheckCircle2 },
    open: { label: "Vote ouvert", cls: "bg-accent/20 text-accent-foreground", icon: Star },
    closed: { label: "Vote non ouvert", cls: "bg-muted text-muted-foreground", icon: Lock },
  } as const;
  const it = map[status];
  return (
    <span className={`mt-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${it.cls}`}>
      <it.icon className="h-3 w-3" /> {it.label}
    </span>
  );
}

function InfoTab() {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-bold">Infos pratiques</h2>
      {[
        { t: "Wi-Fi", d: "Réseau : SING-GUEST · Mot de passe : vivatech2026" },
        { t: "Restauration", d: "Buffet & boissons au rooftop dès 12h30." },
        { t: "Contact accueil", d: "Une question ? Rendez-vous au desk d'accueil ou demandez à un hôte." },
        { t: "Vote", d: "Le vote ouvre à 16h. Vous ne pouvez voter qu'une seule fois par stand." },
      ].map((c, i) => (
        <div key={i} className="rounded-2xl bg-card p-4 ring-1 ring-border">
          <div className="font-semibold">{c.t}</div>
          <div className="text-sm text-muted-foreground mt-0.5">{c.d}</div>
        </div>
      ))}
    </section>
  );
}

function CenterMsg({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="min-h-screen grid place-items-center p-8 text-center">
      <div className="max-w-sm">
        <div className="h-14 w-14 mx-auto rounded-2xl bg-destructive/10 grid place-items-center text-destructive">
          <Lock className="h-6 w-6" />
        </div>
        <h1 className="mt-5 text-xl font-bold">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
        <Link to="/" className="mt-6 inline-block text-sm text-primary underline">Retour</Link>
      </div>
    </div>
  );
}

export { hasVoted };
