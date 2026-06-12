import prisma from "@/lib/prisma";
import { handleError, requireStaff } from "@/lib/api";

type Criteres = { innovation?: number; clarte?: number; impact?: number };

function average(values: number[]): string {
  if (values.length === 0) return "";
  return (Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100)
    .toString()
    .replace(".", ",");
}

/** Export CSV des statistiques de vote par stand (UTF-8 BOM + ; — compatible Excel). */
export async function GET(req: Request) {
  const auth = requireStaff(req, ["ADMIN"]);
  if ("error" in auth) return auth.error;

  try {
    const stands = await prisma.stand.findMany({
      orderBy: { ordre: "asc" },
      include: { votes: true },
    });

    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const header = [
      "ID",
      "Ordre",
      "Nom",
      "Tagline",
      "Statut du vote",
      "Nombre de votes",
      "Moyenne note globale",
      "Moyenne innovation",
      "Moyenne clarté",
      "Moyenne impact",
      "Nombre de commentaires",
    ];

    const lines = stands.map((s) => {
      const criteres = s.votes.map((v) => (v.criteres ?? {}) as Criteres);
      const pick = (key: keyof Criteres) =>
        criteres.map((c) => c[key]).filter((n): n is number => typeof n === "number");

      return [
        s.id,
        s.ordre,
        s.nom,
        s.tagline ?? "",
        s.statutVote === "OUVERT" ? "Ouvert" : "Fermé",
        s.votes.length,
        average(s.votes.map((v) => v.noteGlobale)),
        average(pick("innovation")),
        average(pick("clarte")),
        average(pick("impact")),
        s.votes.filter((v) => v.commentaire && v.commentaire.trim().length > 0).length,
      ]
        .map(esc)
        .join(";");
    });

    const csv = "\uFEFF" + [header.map(esc).join(";"), ...lines].join("\r\n");
    const date = new Date().toISOString().slice(0, 10);

    return new Response(csv, {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="stats-stands-vivatech-${date}.csv"`,
      },
    });
  } catch (err) {
    return handleError(err);
  }
}
