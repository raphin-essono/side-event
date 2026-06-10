import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { AppError, sendError } from "../lib/errors.js";
import { requireStaff } from "../middleware/auth.js";
import { buildLoginUrl, createActiveToken, generateQrDataUrl } from "../services/tokens.js";

const router = Router();

const registerSchema = z.object({
  nom: z.string().min(1),
  prenom: z.string().min(1),
  fonction: z.string().min(1),
  email: z.string().email(),
});

router.get("/", requireStaff(["HOST", "ADMIN"]), async (req, res) => {
  try {
    const q = String(req.query.q ?? "").trim().toLowerCase();
    const participants = await prisma.participant.findMany({
      where: q
        ? {
            OR: [
              { email: { contains: q, mode: "insensitive" } },
              { nom: { contains: q, mode: "insensitive" } },
              { prenom: { contains: q, mode: "insensitive" } },
            ],
          }
        : undefined,
      include: {
        tokens: { orderBy: { createdAt: "desc" }, take: 3 },
        _count: { select: { votes: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    res.json(participants);
  } catch (err) {
    sendError(res, err);
  }
});

router.post("/register", requireStaff(["HOST", "ADMIN"]), async (req, res) => {
  try {
    const body = registerSchema.parse(req.body);
    const existing = await prisma.participant.findUnique({ where: { email: body.email } });
    if (existing) throw new AppError(409, "Un participant avec cet email existe déjà");

    const participant = await prisma.participant.create({
      data: { ...body, hoteId: req.staff?.id },
    });

    const token = await createActiveToken(participant.id);
    const baseUrl = process.env.CORS_ORIGIN ?? "http://localhost:8080";
    const loginUrl = buildLoginUrl(participant.id, token.id, baseUrl);
    const qrDataUrl = await generateQrDataUrl(loginUrl);

    res.status(201).json({ participant, token, loginUrl, qrDataUrl });
  } catch (err) {
    sendError(res, err);
  }
});

router.post("/:id/regenerate-qr", requireStaff(["HOST", "ADMIN"]), async (req, res) => {
  try {
    const participant = await prisma.participant.findUnique({ where: { id: req.params.id } });
    if (!participant) throw new AppError(404, "Participant introuvable");

    const token = await createActiveToken(participant.id);
    const baseUrl = process.env.CORS_ORIGIN ?? "http://localhost:8080";
    const loginUrl = buildLoginUrl(participant.id, token.id, baseUrl);
    const qrDataUrl = await generateQrDataUrl(loginUrl);

    res.json({ participant, token, loginUrl, qrDataUrl });
  } catch (err) {
    sendError(res, err);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const participant = await prisma.participant.findUnique({
      where: { id: req.params.id },
      include: {
        votes: { include: { stand: true } },
        tokens: { orderBy: { createdAt: "desc" }, take: 5 },
      },
    });
    if (!participant) throw new AppError(404, "Participant introuvable");
    res.json(participant);
  } catch (err) {
    sendError(res, err);
  }
});

export default router;
