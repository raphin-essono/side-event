import { json } from "@/lib/api";
import { STAFF_COOKIE } from "@/lib/auth";

export async function POST() {
  const res = json({ ok: true });
  res.cookies.set(STAFF_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
