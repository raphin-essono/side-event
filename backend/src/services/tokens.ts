import QRCode from "qrcode";
import { TokenStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../lib/errors.js";

export function buildLoginUrl(participantId: string, tokenId: string, baseUrl: string) {
  const url = new URL(`/m/${participantId}`, baseUrl);
  url.searchParams.set("t", tokenId);
  return url.toString();
}

export async function createActiveToken(participantId: string) {
  await prisma.token.updateMany({
    where: { participantId, statut: TokenStatus.ACTIF },
    data: { statut: TokenStatus.REVOQUE },
  });

  return prisma.token.create({
    data: { participantId, statut: TokenStatus.ACTIF },
  });
}

export async function validateAndUseToken(tokenId: string, participantId: string) {
  const token = await prisma.token.findFirst({
    where: { id: tokenId, participantId },
    include: { participant: true },
  });

  if (!token) throw new AppError(401, "QR code invalide");
  if (token.statut === TokenStatus.REVOQUE) {
    throw new AppError(401, "QR code révoqué — rapprochez-vous de l'accueil");
  }

  if (token.statut === TokenStatus.ACTIF) {
    await prisma.token.update({
      where: { id: token.id },
      data: { statut: TokenStatus.UTILISE, usedAt: new Date() },
    });
  }

  return token.participant;
}

export async function generateQrDataUrl(loginUrl: string) {
  return QRCode.toDataURL(loginUrl, { margin: 1, width: 280 });
}
