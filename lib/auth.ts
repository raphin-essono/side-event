import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const SECRET = process.env.SESSION_SECRET ?? "dev-secret-change-me";
export const STAFF_COOKIE = "sing_staff";

export type StaffRole = "HOST" | "ADMIN";
export type StaffSession = {
  id: string;
  email: string;
  role: StaffRole;
  nom: string | null;
  exp: number;
};

function sign(payload: string): string {
  return createHmac("sha256", SECRET).update(payload).digest("base64url");
}

export function createSessionToken(
  staff: Omit<StaffSession, "exp">,
  ttlMs = 12 * 60 * 60 * 1000,
): string {
  const payload = Buffer.from(
    JSON.stringify({ ...staff, exp: Date.now() + ttlMs }),
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined): StaffSession | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString()) as StaffSession;
    if (session.exp < Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}

export async function getStaffSession(): Promise<StaffSession | null> {
  const store = await cookies();
  return verifySessionToken(store.get(STAFF_COOKIE)?.value);
}

export function getStaffFromRequest(req: Request): StaffSession | null {
  const cookie = req.headers.get("cookie") ?? "";
  const match = cookie.match(new RegExp(`${STAFF_COOKIE}=([^;]+)`));
  return verifySessionToken(match?.[1]);
}
