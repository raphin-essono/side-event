import { z } from "zod";
import prisma from "@/lib/prisma";
import { apiError, handleError, json, parseBody, requireStaff } from "@/lib/api";

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

const patchSchema = z.object({
  nom:      z.string().min(1).optional(),
  prenom:   z.string().min(1).optional(),
  fonction: z.string().min(1).optional(),
  email:    z.string().email().optional(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = requireStaff(req, ["ADMIN"]);
  if ("error" in auth) return auth.error;

  try {
    const { id } = await ctx.params;
    const data = await parseBody(req, patchSchema);
    const participant = await prisma.participant.update({ where: { id }, data });
    return json(participant);
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = requireStaff(req, ["ADMIN"]);
  if ("error" in auth) return auth.error;

  try {
    const { id } = await ctx.params;
    await prisma.participant.delete({ where: { id } });
    return json({ ok: true });
  } catch (err) {
    return handleError(err);
  }
}
