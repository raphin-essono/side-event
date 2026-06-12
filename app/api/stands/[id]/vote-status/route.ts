import { z } from "zod";
import prisma from "@/lib/prisma";
import { handleError, json, parseBody, requireStaff } from "@/lib/api";

const schema = z.object({ open: z.boolean() });

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = requireStaff(req, ["ADMIN"]);
  if ("error" in auth) return auth.error;

  try {
    const { id } = await ctx.params;
    const { open } = await parseBody(req, schema);
    const stand = await prisma.stand.update({
      where: { id },
      data: { statutVote: open ? "OUVERT" : "FERME" },
    });
    return json(stand);
  } catch (err) {
    return handleError(err);
  }
}
