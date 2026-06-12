import prisma from "@/lib/prisma";
import { handleError, requireStaff } from "@/lib/api";

/** Export CSV (UTF-8 BOM + séparateur ; — s'ouvre directement dans Excel). */
export async function GET(req: Request) {
  const auth = requireStaff(req, ["ADMIN"]);
  if ("error" in auth) return auth.error;

  try {
    const participants = await prisma.participant.findMany({
      include: { _count: { select: { votes: true } } },
      orderBy: { createdAt: "desc" },
    });

    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const header = ["ID", "Nom", "Prénom", "Fonction / Organisation", "Email", "Inscrit le", "Nombre de votes"];
    const lines = participants.map((p) =>
      [
        p.id,
        p.nom,
        p.prenom,
        p.fonction,
        p.email,
        p.createdAt.toLocaleString("fr-FR"),
        p._count.votes,
      ]
        .map(esc)
        .join(";"),
    );

    const csv = "\uFEFF" + [header.map(esc).join(";"), ...lines].join("\r\n");
    const date = new Date().toISOString().slice(0, 10);

    return new Response(csv, {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="participants-vivatech-${date}.csv"`,
      },
    });
  } catch (err) {
    return handleError(err);
  }
}
