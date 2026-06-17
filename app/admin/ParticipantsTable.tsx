"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Participant = {
  id: string;
  nom: string;
  prenom: string;
  fonction: string;
  email: string;
  createdAt: Date;
  _count: { votes: number };
};

type Props = { participants: Participant[] };

type EditState = { id: string; nom: string; prenom: string; fonction: string; email: string };

export default function ParticipantsTable({ participants }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState<EditState | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openEdit(p: Participant) {
    setError(null);
    setEditing({ id: p.id, nom: p.nom, prenom: p.prenom, fonction: p.fonction, email: p.email });
  }

  async function saveEdit() {
    if (!editing) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/participants/${editing.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          nom: editing.nom,
          prenom: editing.prenom,
          fonction: editing.fonction,
          email: editing.email,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Modification impossible"); return; }
      setEditing(null);
      router.refresh();
    } catch {
      setError("Erreur réseau");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete(id: string) {
    setDeleting(id);
    setError(null);
    try {
      const res = await fetch(`/api/participants/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Suppression impossible");
        return;
      }
      router.refresh();
    } catch {
      setError("Erreur réseau");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <>
      {error && (
        <div className="rounded-lg bg-danger-pale text-danger text-sm px-3 py-2 mb-3">{error}</div>
      )}

      {/* Modal d'édition */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="card w-full max-w-md p-6 grid gap-4">
            <h2 className="font-bold text-base">Modifier le participant</h2>

            {(["prenom", "nom", "fonction", "email"] as const).map((field) => (
              <label key={field} className="grid gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted capitalize">
                  {field === "prenom" ? "Prénom" : field.charAt(0).toUpperCase() + field.slice(1)}
                </span>
                <input
                  type={field === "email" ? "email" : "text"}
                  value={editing[field]}
                  onChange={(e) => setEditing((prev) => prev ? { ...prev, [field]: e.target.value } : prev)}
                  className="input"
                />
              </label>
            ))}

            {error && (
              <div className="rounded-lg bg-danger-pale text-danger text-sm px-3 py-2">{error}</div>
            )}

            <div className="flex gap-3 mt-1">
              <button
                onClick={() => setEditing(null)}
                className="btn btn-outline flex-1"
                disabled={saving}
              >
                Annuler
              </button>
              <button onClick={saveEdit} disabled={saving} className="btn flex-1">
                {saving ? "Sauvegarde…" : "Sauvegarder"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-4 py-3 font-semibold">Nom</th>
              <th className="px-4 py-3 font-semibold">Prénom</th>
              <th className="px-4 py-3 font-semibold hidden md:table-cell">Fonction</th>
              <th className="px-4 py-3 font-semibold hidden lg:table-cell">Email</th>
              <th className="px-4 py-3 font-semibold hidden sm:table-cell whitespace-nowrap">Inscrit le</th>
              <th className="px-4 py-3 font-semibold text-right">Votes</th>
              <th className="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {participants.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-muted">
                  Aucun participant enregistré pour le moment.
                </td>
              </tr>
            )}
            {participants.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-0 hover:bg-card/60">
                <td className="px-4 py-3 font-medium">{p.nom}</td>
                <td className="px-4 py-3">{p.prenom}</td>
                <td className="px-4 py-3 text-muted hidden md:table-cell">{p.fonction}</td>
                <td className="px-4 py-3 text-muted hidden lg:table-cell">{p.email}</td>
                <td className="px-4 py-3 text-muted whitespace-nowrap hidden sm:table-cell">
                  {new Date(p.createdAt).toLocaleString("fr-FR", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="badge badge-neutral">{p._count.votes}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => openEdit(p)}
                      className="btn btn-outline text-xs px-2.5 py-1"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Supprimer ${p.prenom} ${p.nom} ? Cette action est irréversible.`))
                          confirmDelete(p.id);
                      }}
                      disabled={deleting === p.id}
                      className="btn btn-danger text-xs px-2.5 py-1"
                    >
                      {deleting === p.id ? "…" : "Supprimer"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
