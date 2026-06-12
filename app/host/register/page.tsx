"use client";
import { useState } from "react";
import QRResult from "../../components/QRResult";

type Result = {
  participant: { id: string; prenom: string; nom: string };
  loginUrl: string;
  qrDataUrl: string;
};

const empty = { prenom: "", nom: "", fonction: "", email: "" };

export default function HostRegisterPage() {
  const [form, setForm] = useState(empty);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  function set(field: keyof typeof empty) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/participants", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Enregistrement impossible");
        return;
      }
      setResult(data);
      setForm(empty);
    } catch {
      setError("Erreur réseau — réessayez");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6">
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
          <input
            type="email"
            required
            value={form.email}
            onChange={set("email")}
            className="input"
          />
        </label>

        {error && (
          <div className="rounded-lg bg-danger-pale text-danger text-sm px-3 py-2">{error}</div>
        )}

        <button type="submit" disabled={loading} className="btn justify-self-start">
          {loading ? "Enregistrement…" : "Enregistrer & générer le QR"}
        </button>
      </form>

      {result && (
        <QRResult
          participant={result.participant}
          qrDataUrl={result.qrDataUrl}
          loginUrl={result.loginUrl}
        />
      )}
    </div>
  );
}
