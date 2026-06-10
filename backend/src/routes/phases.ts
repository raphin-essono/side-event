import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { sendError } from "../lib/errors.js";
import { requireStaff } from "../middleware/auth.js";

const router = Router();

const phaseSchema = z.object({
  titre: z.string().min(1),
  horaire: z.string().min(1),
  salle: z.string().optional(),
  enCours: z.boolean().optional(),
  ordre: z.number().int().optional(),
});

router.get("/", async (_req, res) => {
  try {
    const phases = await prisma.phase.findMany({ orderBy: { ordre: "asc" } });
    res.json(phases);
  } catch (err) {
    sendError(res, err);
  }
});

router.post("/", requireStaff(["ADMIN"]), async (req, res) => {
  try {
    const body = phaseSchema.parse(req.body);
    const phase = await prisma.phase.create({ data: body });
    res.status(201).json(phase);
  } catch (err) {
    sendError(res, err);
  }
});

router.patch("/:id/current", requireStaff(["ADMIN"]), async (req, res) => {
  try {
    await prisma.phase.updateMany({ data: { enCours: false } });
    const phase = await prisma.phase.update({
      where: { id: req.params.id },
      data: { enCours: true },
    });
    res.json(phase);
  } catch (err) {
    sendError(res, err);
  }
});

export default router;
