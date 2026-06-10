import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { actions, useHydrated, type Participant } from "@/lib/event-store";
import { QRCode } from "@/components/QRCode";
import { CheckCircle2, RotateCcw, Smartphone } from "lucide-react";

export const Route = createFileRoute("/host/register")({
  component: RegisterPage,
});

function RegisterPage() {
  useHydrated();
  const [form, setForm] = useState({ firstName: "", lastName: "", role: "", email: "" });
  const [created, setCreated] = useState<Participant | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email) return;
    const p = actions.register(form);
    setCreated(p);
    setForm({ firstName: "", lastName: "", role: "", email: "" });
  }

  if (created) {
    const url = `${typeof window !== "undefined" ? window.location.origin : ""}/m/${created.id}?t=${created.token}`;
    return (
      <div className="grid md:grid-cols-2 gap-8 items-start">
        <div className="rounded-3xl bg-card p-8 ring-1 ring-border shadow-[var(--shadow-soft)] text-center">
          <div className="inline-flex items-center gap-2 text-success text-sm font-medium">
            <CheckCircle2 className="h-4 w-4" /> Participant enregistré
          </div>
          <h2 className="mt-3 text-2xl font-bold">{created.firstName} {created.lastName}</h2>
          <p className="text-muted-foreground">{created.role || "—"} · {created.email}</p>
          <p className="mt-1 text-xs text-muted-foreground">ID : <span className="font-mono">{created.id}</span></p>
          <div className="mt-6 flex justify-center"><QRCode value={url} /></div>
          <p className="mt-5 text-sm text-muted-foreground flex items-center justify-center gap-2">
            <Smartphone className="h-4 w-4" /> Demandez au participant de scanner ce QR avec son smartphone.
          </p>
          <div className="mt-6 flex gap-3 justify-center">
            <button onClick={() => setCreated(null)} className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90">
              Enregistrer un autre participant
            </button>
            <a href={url} className="rounded-xl bg-secondary px-5 py-2.5 text-sm font-medium hover:bg-muted">
              Tester l'espace mobile
            </a>
          </div>
        </div>
        <aside className="rounded-3xl bg-secondary/60 p-6 ring-1 ring-border text-sm space-y-3">
          <div className="font-semibold flex items-center gap-2"><RotateCcw className="h-4 w-4" /> Et si ça ne marche pas ?</div>
          <p className="text-muted-foreground">Direction l'onglet <Link to="/host/search" className="text-primary underline">Rechercher / Régénérer</Link> pour retrouver le participant et générer un nouveau QR. L'ancien sera automatiquement révoqué.</p>
        </aside>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-[1.2fr_1fr] gap-8">
      <form onSubmit={submit} className="rounded-3xl bg-card p-8 ring-1 ring-border shadow-[var(--shadow-soft)] space-y-5">
        <div>
          <h1 className="text-2xl font-bold">Enregistrement participant</h1>
          <p className="text-muted-foreground text-sm mt-1">Renseignez les informations puis présentez le QR au participant.</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Prénom" value={form.firstName} onChange={v => setForm(f => ({ ...f, firstName: v }))} placeholder="Camille" required />
          <Field label="Nom" value={form.lastName} onChange={v => setForm(f => ({ ...f, lastName: v }))} placeholder="Dupont" required />
        </div>
        <Field label="Fonction" value={form.role} onChange={v => setForm(f => ({ ...f, role: v }))} placeholder="Product Manager" />
        <Field label="Email" type="email" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} placeholder="camille@exemple.com" required />
        <button type="submit" className="w-full rounded-2xl bg-primary py-4 text-base font-semibold text-primary-foreground shadow-[var(--shadow-glow)] hover:opacity-95 active:scale-[0.99] transition">
          Enregistrer & générer le QR
        </button>
      </form>
      <aside className="rounded-3xl bg-[var(--gradient-hero)] text-primary-foreground p-8 shadow-[var(--shadow-glow)]">
        <div className="text-xs uppercase tracking-widest opacity-80">Étape 1/3</div>
        <h2 className="mt-2 text-2xl font-bold leading-tight">Bienvenue à l'événement interne SING.</h2>
        <p className="mt-3 text-sm opacity-90">Chaque participant repart avec un QR personnel à usage unique. Pas de mot de passe, pas d'application à installer.</p>
        <ul className="mt-6 space-y-2 text-sm opacity-90">
          <li>· Saisir les informations du participant</li>
          <li>· Scanner le QR depuis son smartphone</li>
          <li>· Accéder au programme et aux votes</li>
        </ul>
      </aside>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", placeholder, required }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}{required && <span className="text-destructive"> *</span>}</span>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-3 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
      />
    </label>
  );
}
