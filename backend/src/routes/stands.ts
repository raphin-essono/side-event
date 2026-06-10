import { Router } from "express";
import { z } from "zod";
import { VotePhaseStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { AppError, sendError } from "../lib/errors.js";
import { requireStaff } from "../middleware/auth.js";

const router = Router();

const standSchema = z.object({
  nom: z.string().min(1),
  description: z.string().min(1),
  tagline: z.string().optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
  color: z.string().optional(),
  initials: z.string().optional(),
  ordre: z.number().int().optional(),
});

router.get("/", async (_req, res) => {
  try {
    const stands = await prisma.stand.findMany({ orderBy: { ordre: "asc" } });
    res.json(stands);
  } catch (err) {
    sendError(res, err);
  }
});

router.post("/", requireStaff(["ADMIN"]), async (req, res) => {
  try {
    const body = standSchema.parse(req.body);
    const stand = await prisma.stand.create({ data: body });
    res.status(201).json(stand);
  } catch (err) {
    sendError(res, err);
  }
});

router.patch("/:id", requireStaff(["ADMIN"]), async (req, res) => {
  try {
    const body = standSchema.partial().parse(req.body);
    const stand = await prisma.stand.update({ where: { id: req.params.id }, data: body });
    res.json(stand);
  } catch (err) {
    sendError(res, err);
  }
});

router.delete("/:id", requireStaff(["ADMIN"]), async (req, res) => {
  try {
    await prisma.stand.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    sendError(res, err);
  }
});

router.patch("/:id/vote-status", requireStaff(["ADMIN"]), async (req, res) => {
  try {
    const status = z.nativeEnum(VotePhaseStatus).parse(req.body.statutVote);
    const stand = await prisma.stand.update({
      where: { id: req.params.id },
      data: { statutVote: status },
    });
    res.json(stand);
  } catch (err) {
    sendError(res, err);
  }
});

export default router;
