import { Router } from "express";
import { z } from "zod";
import { VotePhaseStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { AppError, sendError } from "../lib/errors.js";
import { validateAndUseToken } from "../services/tokens.js";

const router = Router();

const voteSchema = z.object({
  participantId: z.string().uuid(),
  tokenId: z.string().uuid(),
  standId: z.string().uuid(),
  noteGlobale: z.number().int().min(1).max(5),
  criteres: z
    .object({
      innovation: z.number().int().min(1).max(5).optional(),
      clarity: z.number().int().min(1).max(5).optional(),
      impact: z.number().int().min(1).max(5).optional(),
    })
    .optional(),
  commentaire: z.string().max(1000).optional(),
});

router.post("/", async (req, res) => {
  try {
    const body = voteSchema.parse(req.body);
    await validateAndUseToken(body.tokenId, body.participantId);

    const [settings, stand] = await Promise.all([
      prisma.eventSettings.findFirst({ where: { id: 1 } }),
      prisma.stand.findUnique({ where: { id: body.standId } }),
    ]);

    if (!stand) throw new AppError(404, "Stand introuvable");

    const voteOpen = settings?.voteOpenGlobal || stand.statutVote === VotePhaseStatus.OUVERT;
    if (!voteOpen) throw new AppError(403, "Le vote est fermé pour ce stand");

    const existing = await prisma.vote.findUnique({
      where: {
        participantId_standId: {
          participantId: body.participantId,
          standId: body.standId,
        },
      },
    });
    if (existing) throw new AppError(409, "Vote déjà enregistré pour ce stand");

    const vote = await prisma.vote.create({
      data: {
        participantId: body.participantId,
        standId: body.standId,
        noteGlobale: body.noteGlobale,
        criteres: body.criteres ?? undefined,
        commentaire: body.commentaire,
      },
    });

    res.status(201).json({ message: "Votre vote a été pris en compte", vote });
  } catch (err) {
    sendError(res, err);
  }
});

router.get("/stats", async (_req, res) => {
  try {
    const [participantCount, voteCount, stands] = await Promise.all([
      prisma.participant.count(),
      prisma.vote.count(),
      prisma.stand.findMany({
        orderBy: { ordre: "asc" },
        include: {
          _count: { select: { votes: true } },
          votes: { select: { noteGlobale: true } },
        },
      }),
    ]);

    const standStats = stands.map((s) => {
      const avg =
        s.votes.length > 0
          ? s.votes.reduce((sum, v) => sum + v.noteGlobale, 0) / s.votes.length
          : 0;
      return {
        id: s.id,
        nom: s.nom,
        voteCount: s._count.votes,
        averageNote: Math.round(avg * 10) / 10,
        statutVote: s.statutVote,
      };
    });

    res.json({ participantCount, voteCount, stands: standStats });
  } catch (err) {
    sendError(res, err);
  }
});

export default router;
