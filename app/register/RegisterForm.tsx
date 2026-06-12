"use client";
import { useState } from "react";

const empty = { prenom: "", nom: "", fonction: "", email: "" };

export default function RegisterForm({ ticket }: { ticket: string }) {
  const [form, setForm] = useState(empty);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function set(field: keyof typeof empty) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ticket, ...form }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Inscription impossible");
        return;
      }
      // Accès direct à la plateforme avec le token personnel
      window.location.href = data.redirectUrl;
    } catch {
      setError("Erreur réseau — réessayez");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="card p-6 grid gap-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="grid gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">
            Prénom *
          </span>
          <input required value={form.prenom} onChange={set("prenom")} className="input" />
        </label>
        <label className="grid gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">Nom *</span>
          <input required value={form.nom} onChange={set("nom")} className="input" />
        </label>
      </div>
      <label className="grid gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">
          Fonction / Organisation *
        </span>
        <input required value={form.fonction} onChange={set("fonction")} className="input" />
      </label>
      <label className="grid gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">Email *</span>
        <input type="email" required value={form.email} onChange={set("email")} className="input" />
      </label>

      {error && (
        <div className="rounded-lg bg-danger-pale text-danger text-sm px-3 py-2">{error}</div>
      )}

      <button type="submit" disabled={loading} className="btn">
        {loading ? "Inscription…" : "Valider et accéder à la plateforme"}
      </button>
    </form>
  );
}
