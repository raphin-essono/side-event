"use client";
import { useState } from "react";
import Link from "next/link";

type Props = {
  participantId: string;
  tokenId: string;
  standId: string;
  standName: string;
};

const CRITERIA = [
  { key: "innovation", label: "Innovation" },
  { key: "clarte", label: "Clarté de la démo" },
  { key: "impact", label: "Impact métier" },
] as const;

function Stars({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-label={`${n} étoile(s)`}
          className="star"
          data-active={n <= value}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function VoteForm({ participantId, tokenId, standId, standName }: Props) {
  const [note, setNote] = useState(0);
  const [criteres, setCriteres] = useState<Record<string, number>>({});
  const [commentaire, setCommentaire] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const backUrl = `/participants/${participantId}?t=${tokenId}&tab=stands`;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (note < 1) {
      setError("Attribuez une note globale (1 à 5 étoiles)");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/votes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          participantId,
          tokenId,
          standId,
          noteGlobale: note,
          criteres: Object.keys(criteres).length > 0 ? criteres : undefined,
          commentaire: commentaire.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Vote impossible");
        return;
      }
      setDone(true);
    } catch {
      setError("Erreur réseau — réessayez");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="card p-8 text-center">
        <span className="badge badge-open">Vote confirmé</span>
        <h2 className="mt-4 text-lg font-bold">Votre vote a été pris en compte</h2>
        <p className="mt-1.5 text-sm text-muted">Merci pour votre participation !</p>
        <Link href={backUrl} className="btn mt-6 inline-flex">
          Retour aux stands
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-5">
      <div className="card p-5">
        <h2 className="text-sm font-semibold">
          Note globale <span className="text-danger">*</span>
        </h2>
        <p className="text-xs text-muted mt-0.5 mb-3">Votre évaluation générale de {standName}.</p>
        <Stars value={note} onChange={setNote} />
      </div>

      <div className="card p-5 grid gap-4">
        <div>
          <h2 className="text-sm font-semibold">Critères détaillés</h2>
          <p className="text-xs text-muted mt-0.5">Optionnel — de 1 à 5.</p>
        </div>
        {CRITERIA.map((c) => (
          <label key={c.key} className="grid gap-1.5">
            <span className="flex justify-between text-xs font-medium">
              {c.label}
              <span className="text-muted">{criteres[c.key] ?? "—"}</span>
            </span>
            <input
              type="range"
              min={1}
              max={5}
              step={1}
              value={criteres[c.key] ?? 3}
              onChange={(e) =>
                setCriteres((prev) => ({ ...prev, [c.key]: Number(e.target.value) }))
              }
              className="w-full accent-(--primary)"
            />
          </label>
        ))}
      </div>

      <div className="card p-5">
        <h2 className="text-sm font-semibold">Commentaire</h2>
        <textarea
          value={commentaire}
          onChange={(e) => setCommentaire(e.target.value)}
          rows={3}
          maxLength={1000}
          placeholder="Optionnel — ce qui vous a marqué…"
          className="input mt-2.5 resize-none"
        />
      </div>

      {error && (
        <div className="rounded-lg bg-danger-pale text-danger text-sm px-3 py-2">{error}</div>
      )}

      <div className="flex gap-3">
        <Link href={backUrl} className="btn btn-outline flex-1 text-center">
          Annuler
        </Link>
        <button type="submit" disabled={loading} className="btn flex-1">
          {loading ? "Envoi…" : "Valider mon vote"}
        </button>
      </div>
    </form>
  );
}
