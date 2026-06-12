import { handleError, json, requireStaff } from "@/lib/api";
import { CODE_TTL_MS, buildRegisterUrl, getCurrentRegistrationCode } from "@/lib/registration";
import { generateQrDataUrl } from "@/lib/tokens";

/**
 * Code d'enregistrement courant pour l'écran d'accueil.
 * L'écran le sonde en continu : dès qu'un participant scanne (code SCANNE),
 * un nouveau code est créé et le QR affiché change.
 */
export async function GET(req: Request) {
  const auth = requireStaff(req);
  if ("error" in auth) return auth.error;

  try {
    const code = await getCurrentRegistrationCode();
    const url = buildRegisterUrl(new URL(req.url).origin, code.id);
    const qrDataUrl = await generateQrDataUrl(url);

    return json({
      codeId: code.id,
      url,
      qrDataUrl,
      expiresAt: code.createdAt.getTime() + CODE_TTL_MS,
    });
  } catch (err) {
    return handleError(err);
  }
}
