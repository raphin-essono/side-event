"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export type StandRow = {
  id: string;
  nom: string;
  tagline: string | null;
  description: string;
  initials: string | null;
  ordre: number;
  statutVote: string; // FERME | OUVERT
  voteCount: number;
  averageNote: number;
};

type FormState = {
  nom: string;
  tagline: string;
  description: string;
  initials: string;
  ordre: string;
};

const emptyForm: FormState = { nom: "", tagline: "", description: "", initials: "", ordre: "" };

function toPayload(f: FormState) {
  return {
    nom: f.nom.trim(),
    description: f.description.trim(),
    tagline: f.tagline.trim() || undefined,
    initials: f.initials.trim() || undefined,
    ordre: f.ordre.trim() ? Number(f.ordre) : undefined,
  };
}

function StandFields({
  form,
  setForm,
}: {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
}) {
  function set(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }
  return (
    <div className="grid gap-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="grid gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">Nom *</span>
          <input required value={form.nom} onChange={set("nom")} className="input" />
        </label>
        <label className="grid gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">Tagline</span>
          <input value={form.tagline} onChange={set("tagline")} className="input" />
        </label>
      </div>
      <label className="grid gap-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">
          Description *
        </span>
        <textarea
          required
          rows={2}
          value={form.description}
          onChange={set("description")}
          className="input resize-none"
        />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="grid gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">
            Initiales (badge)
          </span>
          <input maxLength={3} value={form.initials} onChange={set("initials")} className="input" />
        </label>
        <label className="grid gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">
            Ordre d&apos;affichage
          </span>
          <input
            type="number"
            min={0}
            value={form.ordre}
            onChange={set("ordre")}
            className="input"
          />
        </label>
      </div>
    </div>
  );
}

export default function StandsManager({ stands }: { stands: StandRow[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [addForm, setAddForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FormState>(emptyForm);

  async function call(url: string, method: string, body?: unknown, key = url) {
    setBusy(key);
    setError(null);
    try {
      const res = await fetch(url, {
        method,
        headers: body ? { "content-type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Action impossible");
        return false;
      }
      router.refresh();
      return true;
    } catch {
      setError("Erreur réseau");
      return false;
    } finally {
      setBusy(null);
    }
  }

  async function createStand(e: React.FormEvent) {
    e.preventDefault();
    if (await call("/api/stands", "POST", toPayload(addForm), "add")) {
      setAddForm(emptyForm);
      setAdding(false);
    }
  }

  function startEdit(s: StandRow) {
    setEditingId(s.id);
    setEditForm({
      nom: s.nom,
      tagline: s.tagline ?? "",
      description: s.description,
      initials: s.initials ?? "",
      ordre: String(s.ordre),
    });
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    if (await call(`/api/stands/${editingId}`, "PATCH", toPayload(editForm), "edit")) {
      setEditingId(null);
    }
  }

  async function deleteStand(s: StandRow) {
    const ok = window.confirm(
      `Supprimer le stand « ${s.nom} » ?\n${s.voteCount} vote(s) associé(s) seront également supprimés.`,
    );
    if (!ok) return;
    await call(`/api/stands/${s.id}`, "DELETE", undefined, `del-${s.id}`);
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold">Gestion des stands</h2>
          <p className="text-sm text-muted mt-0.5">
            Créer, modifier, supprimer et piloter le vote stand par stand.
          </p>
        </div>
        <div className="flex gap-2">
          <a href="/api/stands/export" download className="btn btn-outline">
            Exporter les stats
          </a>
          <button onClick={() => setAdding((v) => !v)} className="btn">
            {adding ? "Annuler" : "Ajouter un stand"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-danger-pale text-danger text-sm px-3 py-2">{error}</div>
      )}

      {adding && (
        <form onSubmit={createStand} className="card p-5 grid gap-4">
          <StandFields form={addForm} setForm={setAddForm} />
          <button type="submit" disabled={busy === "add"} className="btn justify-self-start">
            {busy === "add" ? "Création…" : "Créer le stand"}
          </button>
        </form>
      )}

      <div className="grid gap-2.5">
        {stands.length === 0 && (
          <p className="text-sm text-muted">Aucun stand — ajoutez-en un pour commencer.</p>
        )}
        {stands.map((s) =>
          editingId === s.id ? (
            <form key={s.id} onSubmit={saveEdit} className="card p-5 grid gap-4">
              <StandFields form={editForm} setForm={setEditForm} />
              <div className="flex gap-2">
                <button type="submit" disabled={busy === "edit"} className="btn">
                  {busy === "edit" ? "Enregistrement…" : "Enregistrer"}
                </button>
                <button type="button" onClick={() => setEditingId(null)} className="btn btn-outline">
                  Annuler
                </button>
              </div>
            </form>
          ) : (
            <div key={s.id} className="card p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-semibold text-sm flex items-center gap-2">
                  <span className="text-muted font-mono text-xs">#{s.ordre}</span>
                  {s.nom}
                  {s.tagline && <span className="text-xs text-muted font-normal">· {s.tagline}</span>}
                </div>
                <div className="text-xs text-muted mt-0.5">
                  {s.voteCount} vote(s) · moyenne {s.averageNote > 0 ? `${s.averageNote}/5` : "—"}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`badge ${s.statutVote === "OUVERT" ? "badge-open" : "badge-closed"}`}
                >
                  {s.statutVote === "OUVERT" ? "Ouvert" : "Fermé"}
                </span>
                <button
                  onClick={() =>
                    call(
                      `/api/stands/${s.id}/vote-status`,
                      "PATCH",
                      { open: s.statutVote !== "OUVERT" },
                      `toggle-${s.id}`,
                    )
                  }
                  disabled={busy === `toggle-${s.id}`}
                  className="btn btn-outline text-xs"
                >
                  {s.statutVote === "OUVERT" ? "Fermer" : "Ouvrir"}
                </button>
                <button onClick={() => startEdit(s)} className="btn btn-outline text-xs">
                  Modifier
                </button>
                <button
                  onClick={() => deleteStand(s)}
                  disabled={busy === `del-${s.id}`}
                  className="btn btn-danger text-xs"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
