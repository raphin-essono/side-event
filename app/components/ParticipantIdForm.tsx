"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ParticipantIdForm() {
  const [pid, setPid] = useState("");
  const router = useRouter();

  function go(e: React.FormEvent) {
    e.preventDefault();
    if (pid.trim()) router.push(`/participants/${pid.trim()}`);
  }

  return (
    <form onSubmit={go} className="mt-3 flex gap-2">
      <input
        value={pid}
        onChange={(e) => setPid(e.target.value)}
        placeholder="Votre ID participant"
        className="input"
      />
      <button type="submit" className="btn shrink-0">
        Ouvrir
      </button>
    </form>
  );
}
