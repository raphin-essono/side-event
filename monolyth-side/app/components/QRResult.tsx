"use client";

type Props = {
  participant: { id: string; prenom: string; nom: string };
  qrDataUrl: string;
  loginUrl: string;
};

export default function QRResult({ participant, qrDataUrl, loginUrl }: Props) {
  return (
    <div className="card p-6 grid gap-4 sm:grid-cols-[auto_1fr] items-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={qrDataUrl}
        alt={`QR code de ${participant.prenom} ${participant.nom}`}
        className="h-44 w-44 rounded-xl border border-border bg-white p-2 mx-auto"
      />
      <div>
        <div className="badge badge-open">Participant enregistré</div>
        <h3 className="mt-2 text-lg font-semibold">
          {participant.prenom} {participant.nom}
        </h3>
        <p className="text-xs text-muted mt-1 font-mono">ID : {participant.id}</p>
        <p className="text-sm text-muted mt-3">
          Présentez ce QR au participant — il le scanne avec son smartphone pour accéder au
          portail.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <a href={loginUrl} target="_blank" rel="noreferrer" className="btn-outline btn text-xs">
            Ouvrir l&apos;espace participant
          </a>
          <button
            onClick={() => navigator.clipboard.writeText(loginUrl)}
            className="btn-outline btn text-xs"
          >
            Copier le lien
          </button>
        </div>
      </div>
    </div>
  );
}
