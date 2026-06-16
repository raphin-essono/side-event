"use client";
import { useState } from "react";
import Link from "next/link";

type Props = {
  participantId: string;
  tokenId: string;
  standId: string;
  standName: string;
};

// Les 5 questions officielles d'évaluation — notées chacune de 1 à 5
const QUESTIONS = [
  {
    key: "adequation" as const,
    label: "Adéquation Problème-Solution",
    hint: "La startup démontre-t-elle clairement qu'elle répond à un problème réel, important et bien identifié auprès de sa cible ?",
  },
  {
    key: "innovation" as const,
    label: "Innovation et Proposition de Valeur",
    hint: "La solution apporte-t-elle une valeur ajoutée différenciante et innovante par rapport aux solutions existantes ?",
  },
  {
    key: "modele" as const,
    label: "Modèle Économique et Viabilité Financière",
    hint: "La startup dispose-t-elle d'un modèle économique clair, générateur de revenus, et présente-t-elle des prévisions financières cohérentes avec son niveau de développement ?",
  },
  {
    key: "presentation" as const,
    label: "Qualité de la Présentation",
    hint: "L'équipe a-t-elle présenté son projet de façon claire, structurée et convaincante ?",
  },
  {
    key: "perspectives" as const,
    label: "Perspectives de Développement",
    hint: "La startup présente-t-elle un potentiel crédible de croissance, de passage à l'échelle et d'impact à moyen terme ?",
  },
] as const;

type QuestionKey = (typeof QUESTIONS)[number]["key"];
type Criteres = Partial<Record<QuestionKey, number>>;

// Moyenne arrondie à 1 décimale, ou null si non complète
function computeAvg(c: Criteres): number | null {
  const vals = QUESTIONS.map((q) => c[q.key]).filter((v): v is number => v !== undefined);
  if (vals.length < QUESTIONS.length) return null;
  return Math.round((vals.reduce((s, v) => s + v, 0) / vals.length) * 10) / 10;
}

// Composant cases à cocher 1–5
function RatingGroup({
  questionKey,
  value,
  onChange,
}: {
  questionKey: QuestionKey;
  value: number | undefined;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((n) => {
        const checked = value === n;
        return (
          <label key={n} className="cursor-pointer select-none">
            <input
              type="radio"
              name={`q-${questionKey}`}
              value={n}
              checked={checked}
              onChange={() => onChange(n)}
              className="sr-only"
            />
            <span
              className="flex h-11 w-11 items-center justify-center rounded-xl border-2 text-sm font-bold transition-all"
              style={
                checked
                  ? {
                      background: "var(--primary)",
                      borderColor: "var(--primary)",
                      color: "#fff",
                      boxShadow: "0 0 0 3px color-mix(in srgb, var(--primary) 20%, transparent)",
                    }
                  : {
                      background: "var(--card)",
                      borderColor: "var(--border)",
                      color: "var(--muted)",
                    }
              }
            >
              {n}
            </span>
          </label>
        );
      })}
    </div>
  );
}

export default function VoteForm({ participantId, tokenId, standId, standName }: Props) {
  const [criteres, setCriteres] = useState<Criteres>({});
  const [commentaire, setCommentaire] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const backUrl = `/participants/${participantId}?t=${tokenId}&tab=stands`;
  const avg = computeAvg(criteres);
  const allAnswered = avg !== null;

  function setQuestion(key: QuestionKey, val: number) {
    setCriteres((prev) => ({ ...prev, [key]: val }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!allAnswered) {
      setError("Répondez aux 3 questions pour valider votre vote.");
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
          criteres,
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
        <p className="mt-1.5 text-sm text-muted">
          Note attribuée à {standName} :{" "}
          <span className="font-bold text-foreground">{avg} / 5</span>
        </p>
        <p className="mt-1 text-xs text-muted">Merci pour votre participation !</p>
        <Link href={backUrl} className="btn mt-6 inline-flex">
          Retour aux stands
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-5">
      {/* Questions */}
      <div className="card p-5 grid gap-6">
        <div>
          <h2 className="text-sm font-semibold">Évaluez {standName}</h2>
          <p className="text-xs text-muted mt-0.5">
            Répondez aux 3 questions — notez de 1 (faible) à 5 (excellent).
          </p>
        </div>

        {QUESTIONS.map((q, i) => (
          <fieldset key={q.key} className="grid gap-2">
            <legend className="text-sm font-medium">
              <span className="text-primary font-bold mr-1">{i + 1}.</span>
              {q.label}
              <span className="text-danger ml-0.5">*</span>
            </legend>
            <p className="text-xs text-muted">{q.hint}</p>
            <RatingGroup
              questionKey={q.key}
              value={criteres[q.key]}
              onChange={(v) => setQuestion(q.key, v)}
            />
          </fieldset>
        ))}
      </div>

      {/* Note calculée en temps réel */}
      <div
        className="card p-4 flex items-center justify-between gap-3 transition-all"
        style={{
          borderColor: allAnswered ? "var(--primary)" : "var(--border)",
          background: allAnswered ? "var(--primary-pale)" : undefined,
        }}
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Note globale calculée
          </p>
          <p className="text-xs text-muted mt-0.5">Moyenne automatique des 3 questions</p>
        </div>
        <div className="text-right shrink-0">
          {allAnswered ? (
            <>
              <span className="text-3xl font-extrabold text-primary">{avg}</span>
              <span className="text-sm text-muted"> / 5</span>
            </>
          ) : (
            <span className="text-sm text-muted italic">
              {QUESTIONS.length - Object.keys(criteres).length} réponse
              {QUESTIONS.length - Object.keys(criteres).length > 1 ? "s" : ""} restante
              {QUESTIONS.length - Object.keys(criteres).length > 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {/* Commentaire optionnel */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold">
          Commentaire <span className="text-muted font-normal">(optionnel)</span>
        </h2>
        <textarea
          value={commentaire}
          onChange={(e) => setCommentaire(e.target.value)}
          rows={3}
          maxLength={1000}
          placeholder="Ce qui vous a marqué…"
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
        <button type="submit" disabled={loading || !allAnswered} className="btn flex-1">
          {loading ? "Envoi…" : "Valider mon vote"}
        </button>
      </div>
    </form>
  );
}
