import { NextResponse } from "next/server";
import { ZodError, type ZodType } from "zod";
import { getStaffFromRequest, type StaffRole, type StaffSession } from "./auth";

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function apiError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export function handleError(err: unknown) {
  if (err instanceof ZodError) {
    return apiError(err.issues.map((i) => i.message).join(" · "), 400);
  }
  console.error(err);
  return apiError("Erreur interne du serveur", 500);
}

export async function parseBody<T>(req: Request, schema: ZodType<T>): Promise<T> {
  const body = await req.json().catch(() => ({}));
  return schema.parse(body);
}

/** Retourne la session staff ou une réponse d'erreur 401/403. */
export function requireStaff(
  req: Request,
  roles?: StaffRole[],
): { staff: StaffSession } | { error: NextResponse } {
  const staff = getStaffFromRequest(req);
  if (!staff) return { error: apiError("Authentification requise", 401) };
  if (roles && !roles.includes(staff.role)) {
    return { error: apiError("Accès refusé", 403) };
  }
  return { staff };
}
