import Link from "next/link";
import prisma from "@/lib/prisma";
import { validateToken } from "@/lib/tokens";
import ParticipantHeader from "./ParticipantHeader";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ t?: string; tab?: string }>;
};

function AccessDenied({ reason }: { reason: string }) {
  return (
    <main className="mx-auto max-w-sm px-5 py-20 text-center">
      <span className="badge badge-closed">Accès refusé</span>
      <h1 className="mt-4 text-xl font-bold">Accès impossible</h1>
      <p className="mt-2 text-sm text-muted">{reason}</p>
      <Link href="/participants" className="btn mt-6 inline-flex">
        Retour
      </Link>
    </main>
  );
}

export default async function ParticipantSpace({ params, searchParams }: Props) {
  const { id } = await params;
  const { t, tab = "stands" } = await searchParams;

  const participant = await prisma.participant.findUnique({
    where: { id },
    include: { votes: true },
  });
  if (!participant) {
    return <AccessDenied reason="Participant introuvable. Vérifiez votre lien ou rapprochez-vous de l'accueil." />;
  }

  const tokenCheck = await validateToken(id, t);
  if (!tokenCheck.ok) {
    const reason =
      tokenCheck.reason === "revoked"
        ? "Ce QR code a été révoqué. Rapprochez-vous de l'accueil pour en obtenir un nouveau."
        : "Lien invalide ou incomplet. Scannez le QR remis à l'accueil.";
    return <AccessDenied reason={reason} />;
  }

  const [stands, phases, settings] = await Promise.all([
    prisma.stand.findMany({ orderBy: { ordre: "asc" } }),
    prisma.phase.findMany({ orderBy: { ordre: "asc" } }),
    prisma.eventSettings.findUnique({ where: { id: 1 } }),
  ]);

  const votedStandIds = new Set(participant.votes.map((v) => v.standId));
  const baseQuery = `?t=${t}`;

  const tabs = [
    { key: "program", label: "Programme" },
    { key: "stands", label: "Stands & vote" },
    { key: "info", label: "Infos" },
  ];

  return (
    <div className="min-h-screen pb-12">
      <ParticipantHeader participant={participant} voteCount={participant.votes.length} />

      <nav className="sticky top-[76px] z-10 bg-background/90 backdrop-blur border-b border-border">
        <div className="mx-auto max-w-2xl px-5 py-2 flex gap-1">
          {tabs.map((item) => (
            <Link
              key={item.key}
              href={`/participants/${id}${baseQuery}&tab=${item.key}`}
              className="tab"
              data-active={tab === item.key}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      <main className="mx-auto max-w-2xl px-5 pt-6">
        {tab === "program" && (
          <div className="grid gap-2.5">
            {phases.length === 0 && <p className="text-sm text-muted">Programme à venir.</p>}
            {phases.map((p) => (
              <div key={p.id} className="card p-4 flex items-start gap-4">
                <span className="badge badge-neutral shrink-0 font-mono">{p.horaire}</span>
                <div className="min-w-0">
                  <div className="font-semibold text-sm flex items-center gap-2">
                    {p.titre}
                    {p.enCours && <span className="badge badge-open">En cours</span>}
                  </div>
                  {p.salle && <div className="text-xs text-muted mt-0.5">{p.salle}</div>}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "stands" && (
          <div className="grid gap-3">
            <p className="text-sm text-muted">
              Évaluez les stands les plus innovants — un seul vote par stand.
            </p>
            {stands.map((s) => {
              const open = settings?.voteOpenGlobal || s.statutVote === "OUVERT";
              const voted = votedStandIds.has(s.id);
              return (
                <div key={s.id} className="card p-4">
                  <div className="flex items-start gap-3.5">
                    <span
                      className="h-11 w-11 shrink-0 rounded-xl grid place-items-center text-white text-sm font-bold"
                      style={{ background: s.color ?? "var(--primary)" }}
                    >
                      {s.initials ?? s.nom.slice(0, 2).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-sm">{s.nom}</div>
                      {s.tagline && <div className="text-xs text-accent mt-0.5">{s.tagline}</div>}
                      <p className="text-xs text-muted mt-1.5">{s.description}</p>
                    </div>
                  </div>
                  <div className="mt-3.5 flex items-center justify-between">
                    <span className={`badge ${open ? "badge-open" : "badge-closed"}`}>
                      {open ? "Vote ouvert" : "Vote fermé"}
                    </span>
                    {voted ? (
                      <span className="badge badge-open">Voté</span>
                    ) : open ? (
                      <Link href={`/participants/${id}/vote/${s.id}${baseQuery}`} className="btn text-xs">
                        Voter
                      </Link>
                    ) : (
                      <button disabled className="btn text-xs">
                        Voter
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === "info" && (
          <div className="grid gap-3">
            <div className="card p-5">
              <h2 className="font-semibold text-sm">Lieu</h2>
              <p className="text-sm text-muted mt-1.5">
                Village SING — VivaTech. Les stands se trouvent dans le hall principal.
              </p>
            </div>
            <div className="card p-5">
              <h2 className="font-semibold text-sm">Comment voter ?</h2>
              <p className="text-sm text-muted mt-1.5">
                Rendez-vous dans l&apos;onglet « Stands & vote » pendant la phase d&apos;ouverture.
                Attribuez une note globale de 1 à 5, complétez si vous le souhaitez les critères
                détaillés, puis validez. Un seul vote par stand.
              </p>
            </div>
            <div className="card p-5">
              <h2 className="font-semibold text-sm">Besoin d&apos;aide ?</h2>
              <p className="text-sm text-muted mt-1.5">
                En cas de perte d&apos;accès ou de problème technique, présentez-vous à
                l&apos;accueil : un nouvel accès QR vous sera remis, vos votes sont conservés.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
