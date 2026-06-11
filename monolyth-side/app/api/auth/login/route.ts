import bcrypt from "bcryptjs";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { createSessionToken, STAFF_COOKIE, type StaffRole } from "@/lib/auth";
import { apiError, handleError, json, parseBody } from "@/lib/api";

const loginSchema = z.object({
  email: z.email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export async function POST(req: Request) {
  try {
    const { email, password } = await parseBody(req, loginSchema);

    const staff = await prisma.staffUser.findUnique({ where: { email } });
    if (!staff || !(await bcrypt.compare(password, staff.passwordHash))) {
      return apiError("Identifiants invalides", 401);
    }

    const token = createSessionToken({
      id: staff.id,
      email: staff.email,
      role: staff.role as StaffRole,
      nom: staff.nom,
    });

    const res = json({
      staff: { id: staff.id, email: staff.email, role: staff.role, nom: staff.nom },
    });
    res.cookies.set(STAFF_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 12 * 60 * 60,
    });
    return res;
  } catch (err) {
    return handleError(err);
  }
}
