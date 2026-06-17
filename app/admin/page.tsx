import Link from "next/link";
import { redirect } from "next/navigation";
import Navbar from "../components/Navbar";
import AutoRefresh from "../components/AutoRefresh";
import VoteControls from "./VoteControls";
import StandsManager from "./StandsManager";
import StandsChart from "./StandsChart";
import ParticipantsTable from "./ParticipantsTable";
import prisma from "@/lib/prisma";
import { getStaffSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

type Props = { searchParams: Promise<{ p?: string }> };

export default async function AdminPage({ searchParams }: Props) {
  const staff = await getStaffSession();
  if (!staff) redirect("/login?next=/admin");
  if (staff.role !== "ADMIN") redirect("/host/welcome");

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

  const maxVoters = Math.max(...stands.map((s) => s.votes.length), 1);

  const standRows = stands.map((s) => {
    const sum = s.votes.reduce((acc, v) => acc + v.noteGlobale, 0);
    // Score normalisé : somme des notes / nombre max de votants (équité entre stands)
    const avg = Math.round((sum / maxVoters) * 100) / 100;
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
      <AutoRefresh />
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

        <section className="mt-8">
          <StandsChart stands={standRows} />
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

          <ParticipantsTable participants={participants} />

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
