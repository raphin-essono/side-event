import { z } from "zod";
import prisma from "@/lib/prisma";
import { handleError, json, parseBody, requireStaff } from "@/lib/api";

const schema = z.object({ open: z.boolean() });

export async function PATCH(req: Request) {
  const auth = requireStaff(req, ["ADMIN"]);
  if ("error" in auth) return auth.error;

  try {
    const { open } = await parseBody(req, schema);
    const statut = open ? ("OUVERT" as const) : ("FERME" as const);

    const [settings] = await prisma.$transaction([
      prisma.eventSettings.upsert({
        where: { id: 1 },
        create: { id: 1, voteOpenGlobal: open, votePhase: statut },
        update: { voteOpenGlobal: open, votePhase: statut },
      }),
      prisma.stand.updateMany({ data: { statutVote: statut } }),
    ]);
    return json(settings);
  } catch (err) {
    return handleError(err);
  }
}
