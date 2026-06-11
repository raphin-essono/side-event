"use client";
import { useEffect, useState } from "react";
import QRResult from "../../components/QRResult";

type Participant = {
  id: string;
  prenom: string;
  nom: string;
  fonction: string;
  email: string;
  _count?: { votes: number };
};

type QR = {
  participant: { id: string; prenom: string; nom: string };
  loginUrl: string;
  qrDataUrl: string;
};

export default function HostSearchPage() {
  const [q, setQ] = useState("");
  const [list, setList] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState<string | null>(null);
  const [qr, setQr] = useState<QR | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handle = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/participants?q=${encodeURIComponent(q)}&pageSize=50`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Recherche impossible");
          setList([]);
          return;
        }
        setList(data.items);
      } catch {
        setError("Erreur réseau");
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(handle);
  }, [q]);

  async function regenerate(id: string) {
    setRegenerating(id);
    setError(null);
    try {
      const res = await fetch(`/api/participants/${id}/regenerate-qr`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Régénération impossible");
        return;
      }
      setQr(data);
    } catch {
      setError("Erreur réseau");
    } finally {
      setRegenerating(null);
    }
  }

  return (
    <div className="grid gap-5">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Rechercher par nom, prénom ou email…"
        className="input"
        autoFocus
      />

      {error && (
        <div className="rounded-lg bg-danger-pale text-danger text-sm px-3 py-2">{error}</div>
      )}

      {qr && (
        <QRResult participant={qr.participant} qrDataUrl={qr.qrDataUrl} loginUrl={qr.loginUrl} />
      )}

      <div className="grid gap-2.5">
        {loading && list.length === 0 && <p className="text-sm text-muted">Recherche…</p>}
        {!loading && list.length === 0 && (
          <p className="text-sm text-muted">Aucun participant trouvé.</p>
        )}
        {list.map((p) => (
          <div key={p.id} className="card p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="font-semibold text-sm">
                {p.prenom} {p.nom}
              </div>
              <div className="text-xs text-muted mt-0.5">
                {p.fonction} · {p.email}
              </div>
              <div className="text-[11px] font-mono text-muted mt-1">
                {p.id} · {p._count?.votes ?? 0} vote(s)
              </div>
            </div>
            <button
              onClick={() => regenerate(p.id)}
              disabled={regenerating === p.id}
              className="btn btn-accent text-xs"
            >
              {regenerating === p.id ? "Génération…" : "Nouveau QR"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
