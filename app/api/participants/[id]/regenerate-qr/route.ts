import prisma from "@/lib/prisma";
import { apiError, handleError, json, requireStaff } from "@/lib/api";
import { buildLoginUrl, createActiveToken, generateQrDataUrl } from "@/lib/tokens";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = requireStaff(req);
  if ("error" in auth) return auth.error;

  try {
    const { id } = await ctx.params;
    const participant = await prisma.participant.findUnique({ where: { id } });
    if (!participant) return apiError("Participant introuvable", 404);

    const token = await createActiveToken(participant.id);
    const origin = new URL(req.url).origin;
    const loginUrl = buildLoginUrl(origin, participant.id, token.id);
    const qrDataUrl = await generateQrDataUrl(loginUrl);

    return json({ participant, loginUrl, qrDataUrl });
  } catch (err) {
    return handleError(err);
  }
}
