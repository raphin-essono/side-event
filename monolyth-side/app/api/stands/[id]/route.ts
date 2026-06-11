import { z } from "zod";
import prisma from "@/lib/prisma";
import { apiError, handleError, json, parseBody, requireStaff } from "@/lib/api";

const updateSchema = z.object({
  nom: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  tagline: z.string().optional(),
  initials: z.string().max(3).optional(),
  color: z.string().optional(),
  logoUrl: z.string().optional(),
  ordre: z.number().int().min(0).optional(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = requireStaff(req, ["ADMIN"]);
  if ("error" in auth) return auth.error;

  try {
    const { id } = await ctx.params;
    const body = await parseBody(req, updateSchema);
    const stand = await prisma.stand.update({ where: { id }, data: body });
    return json(stand);
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = requireStaff(req, ["ADMIN"]);
  if ("error" in auth) return auth.error;

  try {
    const { id } = await ctx.params;
    const stand = await prisma.stand.findUnique({ where: { id } });
    if (!stand) return apiError("Stand introuvable", 404);
    await prisma.stand.delete({ where: { id } });
    return json({ ok: true });
  } catch (err) {
    return handleError(err);
  }
}
