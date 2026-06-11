"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function VoteControls({ voteOpenGlobal }: { voteOpenGlobal: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/settings/vote-global", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ open: !voteOpenGlobal }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Action impossible");
        return;
      }
      router.refresh();
    } catch {
      setError("Erreur réseau");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-3">
      <div className="card p-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold">Pilotage du vote</h2>
          <p className="text-sm text-muted mt-0.5">
            Ouverture globale — effet immédiat sur tous les stands.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`badge ${voteOpenGlobal ? "badge-open" : "badge-closed"}`}>
            {voteOpenGlobal ? "Vote ouvert" : "Vote fermé"}
          </span>
          <button
            onClick={toggle}
            disabled={busy}
            className={`btn ${voteOpenGlobal ? "btn-danger" : ""}`}
          >
            {busy ? "…" : voteOpenGlobal ? "Fermer le vote" : "Ouvrir le vote"}
          </button>
        </div>
      </div>
      {error && (
        <div className="rounded-lg bg-danger-pale text-danger text-sm px-3 py-2">{error}</div>
      )}
    </div>
  );
}
