"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type CurrentCode = {
  codeId: string;
  url: string;
  qrDataUrl: string;
  expiresAt: number;
};

/**
 * Écran d'accueil : QR d'enregistrement dynamique.
 * Le code est à usage unique — dès qu'un participant le scanne,
 * le serveur en génère un nouveau et l'affichage se met à jour (~2 s).
 */
export default function HostWelcomePage() {
  const [code, setCode] = useState<CurrentCode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const lastCodeId = useRef<string | null>(null);
  const [scans, setScans] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch("/api/registration-codes/current");
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(data.error ?? "Impossible de charger le QR");
          return;
        }
        setError(null);
        setCode(data);
        if (lastCodeId.current && lastCodeId.current !== data.codeId) {
          setScans((n) => n + 1);
        }
        lastCodeId.current = data.codeId;
      } catch {
        if (!cancelled) setError("Erreur réseau");
      }
    }

    poll();
    const id = setInterval(() => {
      if (document.visibilityState === "visible") poll();
    }, 2000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return (
    <div className="grid gap-5">
      <div className="card p-8 text-center">
        <span className="badge badge-accent">QR dynamique — usage unique</span>
        <h1 className="mt-3 text-xl font-bold">Scannez pour vous inscrire</h1>
        <p className="mt-1 text-sm text-muted">
          Le participant scanne, remplit lui-même ses informations et accède directement à la
          plateforme. Le QR change automatiquement après chaque scan.
        </p>

        <div className="mt-6 grid place-items-center">
          {code ? (
            <Image
              key={code.codeId}
              src={code.qrDataUrl}
              alt="QR code d'inscription"
              width={320}
              height={320}
              unoptimized
              className="rounded-xl border border-border bg-white p-2"
            />
          ) : (
            <div className="h-[320px] w-[320px] rounded-xl border border-border grid place-items-center text-sm text-muted">
              Chargement du QR…
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-danger-pale text-danger text-sm px-3 py-2">
            {error}
          </div>
        )}

        <p className="mt-4 text-xs text-muted">
          {scans > 0 && <>{scans} scan(s) depuis l&apos;ouverture de cet écran · </>}
          Renouvellement automatique toutes les 60 secondes même sans scan.
        </p>
      </div>
    </div>
  );
}
