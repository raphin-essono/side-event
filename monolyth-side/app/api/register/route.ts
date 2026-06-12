import { z } from "zod";
import prisma from "@/lib/prisma";
import { apiError, handleError, json, parseBody } from "@/lib/api";
import { verifyRegistrationTicket } from "@/lib/registration";
import { buildLoginUrl, createActiveToken } from "@/lib/tokens";

const registerSchema = z.object({
  ticket: z.string().min(1),
  nom: z.string().min(1, "Nom requis"),
  prenom: z.string().min(1, "Prénom requis"),
  fonction: z.string().min(1, "Fonction requise"),
  email: z.email("Email invalide"),
});

/**
 * Auto-inscription d'un participant après scan du QR d'accueil.
 * Le ticket signé prouve un scan valide ; chaque ticket ne permet
 * qu'une seule inscription (code SCANNE → UTILISE).
 */
export async function POST(req: Request) {
  try {
    const body = await parseBody(req, registerSchema);

    const codeId = verifyRegistrationTicket(body.ticket);
    if (!codeId) {
      return apiError("Session d'inscription expirée — scannez le QR à l'accueil", 401);
    }

    const code = await prisma.registrationCode.findUnique({ where: { id: codeId } });
    if (!code || code.statut !== "SCANNE") {
      return apiError("Ce QR a déjà servi à une inscription — scannez le QR à l'accueil", 409);
    }

    const existing = await prisma.participant.findUnique({ where: { email: body.email } });
    if (existing) {
      return apiError("Un participant avec cet email existe déjà — rapprochez-vous de l'accueil", 409);
    }

    const participant = await prisma.participant.create({
      data: {
        nom: body.nom,
        prenom: body.prenom,
        fonction: body.fonction,
        email: body.email,
      },
    });

    await prisma.registrationCode.update({
      where: { id: codeId },
      data: { statut: "UTILISE", participantId: participant.id },
    });

    const token = await createActiveToken(participant.id);
    const redirectUrl = buildLoginUrl(new URL(req.url).origin, participant.id, token.id);

    return json({ participant, redirectUrl }, 201);
  } catch (err) {
    return handleError(err);
  }
}
