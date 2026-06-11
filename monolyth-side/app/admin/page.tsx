import Link from "next/link";
import { redirect } from "next/navigation";
import Navbar from "../components/Navbar";
import VoteControls from "./VoteControls";
import StandsManager from "./StandsManager";
import prisma from "@/lib/prisma";
import { getStaffSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

type Props = { searchParams: Promise<{ p?: string }> };

export default async function AdminPage({ searchParams }: Props) {
  const staff = await getStaffSession();
  if (!staff) redirect("/login?next=/admin");
  if (staff.role !== "ADMIN") redirect("/host/register");

  const { p } = await searchParams;
  const page = Math.max(1, Number(p ?? 1) || 1);

  const [participantCount, voteCount, settings, stands, participants] = await Promise.all([
    prisma.participant.count(),
    prisma.vote.count(),
    prisma.eventSettings.findUnique({ where: { id: 1 } }),
    prisma.stand.findMany({
      orderBy: { ordre: "asc" },
      include: { votes: { select: { noteGlobale: true } } },
    }),
    prisma.participant.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { _count: { select: { votes: true } } },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(participantCount / PAGE_SIZE));

  const standRows = stands.map((s) => {
    const avg =
      s.votes.length > 0
        ? s.votes.reduce((sum, v) => sum + v.noteGlobale, 0) / s.votes.length
        : 0;
    return {
      id: s.id,
      nom: s.nom,
      tagline: s.tagline,
      description: s.description,
      initials: s.initials,
      ordre: s.ordre,
      statutVote: s.statutVote,
      voteCount: s.votes.length,
      averageNote: Math.round(avg * 10) / 10,
    };
  });

  const stats = [
    { label: "Participants enregistrés", value: participantCount },
    { label: "Votes exprimés", value: voteCount },
    { label: "Stands", value: stands.length },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-5xl px-5 py-8">
        <h1 className="text-2xl font-bold">Tableau de bord organisateur</h1>
        <p className="text-sm text-muted mt-0.5">Statistiques et pilotage du vote en direct.</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="card p-5">
              <div className="text-3xl font-bold text-primary">{s.value}</div>
              <div className="text-sm text-muted mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <section className="mt-8">
          <VoteControls voteOpenGlobal={settings?.voteOpenGlobal ?? false} />
        </section>

        <section className="mt-10">
          <StandsManager stands={standRows} />
        </section>

        <section className="mt-10">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div>
              <h2 className="font-semibold">Participants</h2>
              <p className="text-sm text-muted mt-0.5">
                {participantCount} inscrit(s) — page {page} / {totalPages}
              </p>
            </div>
            <a href="/api/participants/export" className="btn btn-accent" download>
              Exporter CSV / Excel
            </a>
          </div>

          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-4 py-3 font-semibold">Nom</th>
                  <th className="px-4 py-3 font-semibold">Prénom</th>
                  <th className="px-4 py-3 font-semibold">Fonction</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Inscrit le</th>
                  <th className="px-4 py-3 font-semibold text-right">Votes</th>
                </tr>
              </thead>
              <tbody>
                {participants.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-muted">
                      Aucun participant enregistré pour le moment.
                    </td>
                  </tr>
                )}
                {participants.map((part) => (
                  <tr key={part.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium">{part.nom}</td>
                    <td className="px-4 py-3">{part.prenom}</td>
                    <td className="px-4 py-3 text-muted">{part.fonction}</td>
                    <td className="px-4 py-3 text-muted">{part.email}</td>
                    <td className="px-4 py-3 text-muted whitespace-nowrap">
                      {part.createdAt.toLocaleString("fr-FR", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="badge badge-neutral">{part._count.votes}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              {page > 1 ? (
                <Link href={`/admin?p=${page - 1}`} className="btn btn-outline text-xs">
                  ← Précédent
                </Link>
              ) : (
                <span className="btn btn-outline text-xs opacity-40 pointer-events-none">
                  ← Précédent
                </span>
              )}
              <span className="text-xs text-muted px-2">
                {page} / {totalPages}
              </span>
              {page < totalPages ? (
                <Link href={`/admin?p=${page + 1}`} className="btn btn-outline text-xs">
                  Suivant →
                </Link>
              ) : (
                <span className="btn btn-outline text-xs opacity-40 pointer-events-none">
                  Suivant →
                </span>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
