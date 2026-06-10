import { createFileRoute, Link } from "@tanstack/react-router";
import { Brand } from "@/components/Brand";
import { Tablet, Smartphone, Monitor, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SING · VivaTech — Plateforme événement" },
      { name: "description", content: "Enregistrement, programme et vote pour les stands SING à VivaTech." },
    ],
  }),
  component: Index,
});

const roles = [
  { to: "/host/register", title: "Hôte / Hôtesse", desc: "Enregistrer les participants à l'accueil et générer leur QR.", icon: Tablet, hint: "tablette" },
  { to: "/m", title: "Participant", desc: "Accéder au programme et voter pour les stands depuis son mobile.", icon: Smartphone, hint: "mobile" },
  { to: "/admin", title: "Organisateur", desc: "Piloter l'ouverture du vote et suivre les résultats en direct.", icon: Monitor, hint: "desktop" },
] as const;

function Index() {
  return (
    <div className="min-h-screen">
      <header className="border-b bg-card/70 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <Brand subtitle="Plateforme événement interne" />
          <span className="text-xs text-muted-foreground hidden sm:inline">Démo · prototype interactif</span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-16">
        <div className="max-w-2xl">
          <span className="inline-block text-xs font-medium tracking-widest uppercase text-accent">VivaTech · édition interne</span>
          <h1 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight">
            Une seule plateforme pour <span className="bg-[var(--gradient-hero)] bg-clip-text text-transparent">accueillir, informer et voter</span>.
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            Sélectionnez votre rôle pour ouvrir l'écran correspondant. Aucune authentification réelle — il s'agit d'un prototype navigable.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {roles.map(r => (
            <Link
              key={r.to}
              to={r.to}
              className="group relative rounded-2xl bg-card p-6 ring-1 ring-border shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-glow)] hover:ring-primary/40"
            >
              <div className="flex items-center justify-between">
                <div className="h-11 w-11 rounded-xl bg-secondary grid place-items-center text-primary">
                  <r.icon className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground rounded-full bg-secondary px-2 py-1">{r.hint}</span>
              </div>
              <h3 className="mt-5 text-lg font-semibold">{r.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{r.desc}</p>
              <div className="mt-6 flex items-center gap-1.5 text-sm font-medium text-primary">
                Ouvrir <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16 rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
          <strong className="text-foreground">Astuce démo&nbsp;:</strong> commencez par <em>Hôte</em> pour créer un participant, puis copiez l'URL du QR ou cliquez « Voir l'espace » pour basculer côté mobile.
        </div>
      </main>
    </div>
  );
}
