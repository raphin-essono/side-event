"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Re-synchronise les données serveur à intervalle régulier via router.refresh().
 * Les Server Components sont re-rendus et réconciliés sans recharger la page :
 * l'état local des composants clients (formulaires, saisies) est préservé.
 * Le polling est suspendu quand l'onglet n'est pas visible.
 */
export default function AutoRefresh({ intervalMs = 2000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, intervalMs);
    return () => clearInterval(id);
  }, [router, intervalMs]);

  return null;
}
