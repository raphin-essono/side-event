import { createHmac, timingSafeEqual } from "crypto";
import prisma from "./prisma";

const SECRET = process.env.SESSION_SECRET ?? "dev-secret-change-me";

/** Durée de vie d'un QR affiché à l'accueil (rotation automatique même sans scan). */
export const CODE_TTL_MS = 60 * 1000;
/** Temps laissé au participant pour remplir le formulaire après le scan. */
export const TICKET_TTL_MS = 15 * 60 * 1000;

function sign(payload: string): string {
  return createHmac("sha256", SECRET).update(payload).digest("base64url");
}

/**
 * Retourne le code d'enregistrement actif à afficher à l'accueil.
 * Expire les codes périmés et en crée un nouveau si nécessaire :
 * dès qu'un code est scanné (SCANNE), l'appel suivant en génère un autre
 * → le QR affiché change après chaque scan.
 */
export async function getCurrentRegistrationCode() {
  const freshAfter = new Date(Date.now() - CODE_TTL_MS);

  await prisma.registrationCode.updateMany({
    where: { statut: "ACTIF", createdAt: { lt: freshAfter } },
    data: { statut: "EXPIRE" },
  });

  const existing = await prisma.registrationCode.findFirst({
    where: { statut: "ACTIF", createdAt: { gte: freshAfter } },
    orderBy: { createdAt: "desc" },
  });
  if (existing) return existing;

  return prisma.registrationCode.create({ data: {} });
}

/**
 * Consomme un code au moment du scan (ACTIF → SCANNE).
 * Usage unique : un code déjà scanné, utilisé ou expiré est refusé —
 * un QR transféré à un tiers ne fonctionne donc qu'une seule fois.
 */
export async function consumeRegistrationCode(codeId: string): Promise<boolean> {
  const freshAfter = new Date(Date.now() - CODE_TTL_MS);
  const { count } = await prisma.registrationCode.updateMany({
    where: { id: codeId, statut: "ACTIF", createdAt: { gte: freshAfter } },
    data: { statut: "SCANNE", scannedAt: new Date() },
  });
  return count === 1;
}

/** Ticket signé remis après un scan valide — autorise une seule inscription. */
export function createRegistrationTicket(codeId: string): string {
  const payload = Buffer.from(
    JSON.stringify({ codeId, exp: Date.now() + TICKET_TTL_MS }),
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifyRegistrationTicket(ticket: string | undefined): string | null {
  if (!ticket) return null;
  const [payload, sig] = ticket.split(".");
  if (!payload || !sig) return null;
  const expected = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as {
      codeId: string;
      exp: number;
    };
    if (data.exp < Date.now()) return null;
    return data.codeId;
  } catch {
    return null;
  }
}

export function buildRegisterUrl(origin: string, codeId: string) {
  const url = new URL("/register", origin);
  url.searchParams.set("c", codeId);
  return url.toString();
}
