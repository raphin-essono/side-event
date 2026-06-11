import prisma from "@/lib/prisma";
import { apiError, handleError, json, requireStaff } from "@/lib/api";

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = requireStaff(req);
  if ("error" in auth) return auth.error;

  try {
    const { id } = await ctx.params;
    const participant = await prisma.participant.findUnique({
      where: { id },
      include: {
        votes: { include: { stand: { select: { nom: true } } } },
        tokens: { orderBy: { createdAt: "desc" }, take: 5 },
      },
    });
    if (!participant) return apiError("Participant introuvable", 404);
    return json(participant);
  } catch (err) {
    return handleError(err);
  }
}
