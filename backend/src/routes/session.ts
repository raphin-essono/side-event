import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { sendError } from "../lib/errors.js";
import { validateAndUseToken } from "../services/tokens.js";

const router = Router();

const loginSchema = z.object({
  participantId: z.string().uuid(),
  tokenId: z.string().uuid(),
});

router.post("/login", async (req, res) => {
  try {
    const body = loginSchema.parse(req.body);
    const participant = await validateAndUseToken(body.tokenId, body.participantId);

    const [stands, phases, settings, votes] = await Promise.all([
      prisma.stand.findMany({ orderBy: { ordre: "asc" } }),
      prisma.phase.findMany({ orderBy: { ordre: "asc" } }),
      prisma.eventSettings.findFirst({ where: { id: 1 } }),
      prisma.vote.findMany({ where: { participantId: participant.id } }),
    ]);

    res.json({
      participant,
      stands,
      phases,
      settings,
      votes,
    });
  } catch (err) {
    sendError(res, err);
  }
});

export default router;
