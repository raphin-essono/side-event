import QRCode from "qrcode";
import prisma from "./prisma";

/** Révoque les anciens tokens et crée un nouveau token actif. */
export async function createActiveToken(participantId: string) {
  await prisma.token.updateMany({
    where: { participantId, statut: "ACTIF" },
    data: { statut: "REVOQUE" },
  });
  return prisma.token.create({ data: { participantId, statut: "ACTIF" } });
}

export function buildLoginUrl(origin: string, participantId: string, tokenId: string) {
  const url = new URL(`/participants/${participantId}`, origin);
  url.searchParams.set("t", tokenId);
  return url.toString();
}

export async function generateQrDataUrl(loginUrl: string) {
  return QRCode.toDataURL(loginUrl, { margin: 1, width: 300 });
}

/**
 * Valide un token pour un participant.
 * Premier scan : ACTIF → UTILISE. Un token UTILISE reste valable (même session).
 * Un token REVOQUE est refusé.
 */
export async function validateToken(participantId: string, tokenId: string | undefined) {
  if (!tokenId) return { ok: false as const, reason: "missing" as const };
  const token = await prisma.token.findFirst({
    where: { id: tokenId, participantId },
  });
  if (!token) return { ok: false as const, reason: "invalid" as const };
  if (token.statut === "REVOQUE") return { ok: false as const, reason: "revoked" as const };
  if (token.statut === "ACTIF") {
    await prisma.token.update({
      where: { id: token.id },
      data: { statut: "UTILISE", usedAt: new Date() },
    });
  }
  return { ok: true as const, token };
}
