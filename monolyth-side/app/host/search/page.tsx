"use client";
import { useCallback, useEffect, useState } from "react";
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

const PAGE_SIZE = 10;

export default function HostSearchPage() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [list, setList] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState<string | null>(null);
  const [qr, setQr] = useState<QR | null>(null);
  const [error, setError] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const fetchList = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!opts?.silent) {
        setLoading(true);
        setError(null);
      }
      try {
        const res = await fetch(
          `/api/participants?q=${encodeURIComponent(q)}&page=${page}&pageSize=${PAGE_SIZE}`,
        );
        const data = await res.json();
        if (!res.ok) {
          if (!opts?.silent) {
            setError(data.error ?? "Recherche impossible");
            setList([]);
            setTotal(0);
          }
          return;
        }
        setList(data.items);
        setTotal(data.total);
        // Si la page courante dépasse le nombre de pages (ex. recherche affinée), on recule
        const pages = Math.max(1, Math.ceil(data.total / PAGE_SIZE));
        if (page > pages) setPage(pages);
      } catch {
        if (!opts?.silent) setError("Erreur réseau");
      } finally {
        if (!opts?.silent) setLoading(false);
      }
    },
    [q, page],
  );

  // Recherche débouncée à la saisie / changement de page
  useEffect(() => {
    const handle = setTimeout(() => fetchList(), 250);
    return () => clearTimeout(handle);
  }, [fetchList]);

  // Synchronisation silencieuse toutes les 2 s (nouveaux inscrits, votes…)
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") fetchList({ silent: true });
    }, 2000);
    return () => clearInterval(id);
  }, [fetchList]);

  function onSearchChange(value: string) {
    setQ(value);
    setPage(1);
  }

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
        onChange={(e) => onSearchChange(e.target.value)}
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

      {total > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-muted">
            {total} participant(s) · page {page} / {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="btn btn-outline text-xs"
            >
              Précédent
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="btn btn-outline text-xs"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
