"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm({ next }: { next: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Connexion impossible");
        return;
      }
      router.push(next);
      router.refresh();
    } catch {
      setError("Erreur réseau — réessayez");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="card p-6 grid gap-4">
      <label className="grid gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">Email</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="vous@sing.ga"
          className="input"
        />
      </label>
      <label className="grid gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">
          Mot de passe
        </span>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="input"
        />
      </label>

      {error && (
        <div className="rounded-lg bg-danger-pale text-danger text-sm px-3 py-2">{error}</div>
      )}

      <button type="submit" disabled={loading} className="btn">
        {loading ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}
