import { Router } from "express";
import { z } from "zod";
import { VotePhaseStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { sendError } from "../lib/errors.js";
import { requireStaff } from "../middleware/auth.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    let settings = await prisma.eventSettings.findFirst({ where: { id: 1 } });
    if (!settings) {
      settings = await prisma.eventSettings.create({ data: { id: 1 } });
    }
    res.json(settings);
  } catch (err) {
    sendError(res, err);
  }
});

router.patch("/vote-global", requireStaff(["ADMIN"]), async (req, res) => {
  try {
    const open = z.boolean().parse(req.body.open);
    const status = open ? VotePhaseStatus.OUVERT : VotePhaseStatus.FERME;

    const [settings] = await prisma.$transaction([
      prisma.eventSettings.upsert({
        where: { id: 1 },
        create: { id: 1, voteOpenGlobal: open, votePhase: status },
        update: { voteOpenGlobal: open, votePhase: status },
      }),
      prisma.stand.updateMany({ data: { statutVote: status } }),
    ]);

    res.json(settings);
  } catch (err) {
    sendError(res, err);
  }
});

export default router;
