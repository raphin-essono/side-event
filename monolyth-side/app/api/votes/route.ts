import { z } from "zod";
import prisma from "@/lib/prisma";
import { apiError, handleError, json, parseBody } from "@/lib/api";
import { validateToken } from "@/lib/tokens";

const voteSchema = z.object({
  participantId: z.string().min(1),
  tokenId: z.string().min(1),
  standId: z.string().min(1),
  noteGlobale: z.number().int().min(1, "Note 1 à 5").max(5, "Note 1 à 5"),
  criteres: z
    .object({
      innovation: z.number().int().min(1).max(5).optional(),
      clarte: z.number().int().min(1).max(5).optional(),
      impact: z.number().int().min(1).max(5).optional(),
    })
    .optional(),
  commentaire: z.string().max(1000).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await parseBody(req, voteSchema);

    const tokenCheck = await validateToken(body.participantId, body.tokenId);
    if (!tokenCheck.ok) {
      return apiError("Accès invalide — rapprochez-vous de l'accueil", 401);
    }

    const [settings, stand] = await Promise.all([
      prisma.eventSettings.findUnique({ where: { id: 1 } }),
      prisma.stand.findUnique({ where: { id: body.standId } }),
    ]);
    if (!stand) return apiError("Stand introuvable", 404);

    const voteOpen = settings?.voteOpenGlobal || stand.statutVote === "OUVERT";
    if (!voteOpen) return apiError("Le vote est fermé pour ce stand", 403);

    const existing = await prisma.vote.findUnique({
      where: {
        participantId_standId: {
          participantId: body.participantId,
          standId: body.standId,
        },
      },
    });
    if (existing) return apiError("Vote déjà enregistré pour ce stand", 409);

    const vote = await prisma.vote.create({
      data: {
        participantId: body.participantId,
        standId: body.standId,
        noteGlobale: body.noteGlobale,
        criteres: body.criteres ?? undefined,
        commentaire: body.commentaire,
      },
    });

    return json({ message: "Votre vote a été pris en compte", vote }, 201);
  } catch (err) {
    return handleError(err);
  }
}
