import { z } from "zod";
import prisma from "@/lib/prisma";
import { apiError, handleError, json, parseBody, requireStaff } from "@/lib/api";
import { buildLoginUrl, createActiveToken, generateQrDataUrl } from "@/lib/tokens";

const registerSchema = z.object({
  nom: z.string().min(1, "Nom requis"),
  prenom: z.string().min(1, "Prénom requis"),
  fonction: z.string().min(1, "Fonction requise"),
  email: z.email("Email invalide"),
});

export async function GET(req: Request) {
  const auth = requireStaff(req);
  if ("error" in auth) return auth.error;

  try {
    const params = new URL(req.url).searchParams;
    const q = params.get("q")?.trim() ?? "";
    const page = Math.max(1, Number(params.get("page") ?? 1) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(params.get("pageSize") ?? 20) || 20));

    // SQLite : contains est insensible à la casse par défaut (mode "insensitive" non supporté)
    const where = q
      ? {
          OR: [
            { nom: { contains: q } },
            { prenom: { contains: q } },
            { email: { contains: q } },
          ],
        }
      : undefined;

    const [items, total] = await Promise.all([
      prisma.participant.findMany({
        where,
        include: { _count: { select: { votes: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.participant.count({ where }),
    ]);

    return json({ items, total, page, pageSize });
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: Request) {
  const auth = requireStaff(req);
  if ("error" in auth) return auth.error;

  try {
    const body = await parseBody(req, registerSchema);

    const existing = await prisma.participant.findUnique({ where: { email: body.email } });
    if (existing) return apiError("Un participant avec cet email existe déjà", 409);

    const participant = await prisma.participant.create({
      data: { ...body, hoteId: auth.staff.id },
    });
    const token = await createActiveToken(participant.id);

    const origin = new URL(req.url).origin;
    const loginUrl = buildLoginUrl(origin, participant.id, token.id);
    const qrDataUrl = await generateQrDataUrl(loginUrl);

    return json({ participant, loginUrl, qrDataUrl }, 201);
  } catch (err) {
    return handleError(err);
  }
}
