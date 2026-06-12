import Link from "next/link";
import prisma from "@/lib/prisma";
import { validateToken } from "@/lib/tokens";
import AutoRefresh from "../../../../components/AutoRefresh";
import VoteForm from "./VoteForm";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string; standId: string }>;
  searchParams: Promise<{ t?: string }>;
};

export default async function VotePage({ params, searchParams }: Props) {
  const { id, standId } = await params;
  const { t } = await searchParams;

  const tokenCheck = await validateToken(id, t);
  if (!tokenCheck.ok) {
    return (
      <main className="mx-auto max-w-sm px-5 py-20 text-center">
        <h1 className="text-xl font-bold">Accès impossible</h1>
        <p className="mt-2 text-sm text-muted">
          Lien invalide ou révoqué — rapprochez-vous de l&apos;accueil.
        </p>
        <Link href="/participants" className="btn mt-6 inline-flex">
          Retour
        </Link>
      </main>
    );
  }

  const [stand, existingVote] = await Promise.all([
    prisma.stand.findUnique({ where: { id: standId } }),
    prisma.vote.findUnique({
      where: { participantId_standId: { participantId: id, standId } },
    }),
  ]);

  const backUrl = `/participants/${id}?t=${t}&tab=stands`;

  if (!stand) {
    return (
      <main className="mx-auto max-w-sm px-5 py-20 text-center">
        <h1 className="text-xl font-bold">Stand introuvable</h1>
        <Link href={backUrl} className="btn mt-6 inline-flex">
          Retour aux stands
        </Link>
      </main>
    );
  }

  const open = stand.statutVote === "OUVERT";

  return (
    <div className="min-h-screen pb-12">
      <AutoRefresh />
      <header className="sticky top-0 z-20 text-white [background:var(--gradient-hero)] shadow-md">
        <div className="mx-auto max-w-2xl px-5 py-4 flex items-center gap-3">
          <Link
            href={backUrl}
            className="h-9 w-9 shrink-0 rounded-full bg-white/15 grid place-items-center hover:bg-white/25 transition"
            aria-label="Retour"
          >
            ←
          </Link>
          <div className="min-w-0">
            <div className="text-xs text-white/70">Voter pour</div>
            <div className="font-semibold leading-tight truncate">{stand.nom}</div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-5 pt-6">
        {existingVote ? (
          <div className="card p-8 text-center">
            <span className="badge badge-neutral">Un vote par stand</span>
            <h2 className="mt-4 text-lg font-bold">Vote déjà enregistré</h2>
            <p className="mt-1.5 text-sm text-muted">
              Vous avez déjà voté pour ce stand — un seul vote par stand est autorisé.
            </p>
            <Link href={backUrl} className="btn mt-6 inline-flex">
              Retour aux stands
            </Link>
          </div>
        ) : !open ? (
          <div className="card p-8 text-center">
            <span className="badge badge-closed">Phase fermée</span>
            <h2 className="mt-4 text-lg font-bold">Le vote est fermé</h2>
            <p className="mt-1.5 text-sm text-muted">
              La phase de vote n&apos;est pas encore ouverte pour ce stand.
            </p>
            <Link href={backUrl} className="btn mt-6 inline-flex">
              Retour aux stands
            </Link>
          </div>
        ) : (
          <VoteForm
            participantId={id}
            tokenId={t!}
            standId={standId}
            standName={stand.nom}
          />
        )}
      </main>
    </div>
  );
}
