import { z } from "zod";
import prisma from "@/lib/prisma";
import { handleError, json, parseBody, requireStaff } from "@/lib/api";

const standSchema = z.object({
  nom: z.string().min(1, "Nom requis"),
  description: z.string().min(1, "Description requise"),
  tagline: z.string().optional(),
  initials: z.string().max(3).optional(),
  color: z.string().optional(),
  logoUrl: z.string().optional(),
  ordre: z.number().int().min(0).optional(),
});

export async function GET() {
  try {
    const stands = await prisma.stand.findMany({ orderBy: { ordre: "asc" } });
    return json(stands);
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: Request) {
  const auth = requireStaff(req, ["ADMIN"]);
  if ("error" in auth) return auth.error;

  try {
    const body = await parseBody(req, standSchema);
    const maxOrdre = await prisma.stand.aggregate({ _max: { ordre: true } });
    const stand = await prisma.stand.create({
      data: { ...body, ordre: body.ordre ?? (maxOrdre._max.ordre ?? 0) + 1 },
    });
    return json(stand, 201);
  } catch (err) {
    return handleError(err);
  }
}
