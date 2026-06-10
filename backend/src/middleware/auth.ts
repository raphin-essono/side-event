import type { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../lib/errors.js";
import type { StaffRole } from "@prisma/client";

export type StaffSession = {
  id: string;
  email: string;
  role: StaffRole;
};

declare global {
  namespace Express {
    interface Request {
      staff?: StaffSession;
    }
  }
}

const sessions = new Map<string, StaffSession>();

export function createSession(staff: StaffSession): string {
  const token = crypto.randomUUID();
  sessions.set(token, staff);
  return token;
}

export function getSession(token: string | undefined): StaffSession | undefined {
  if (!token) return undefined;
  return sessions.get(token);
}

export function requireStaff(roles?: StaffRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
    const staff = getSession(token);
    if (!staff) return next(new AppError(401, "Authentification requise"));
    if (roles && !roles.includes(staff.role)) {
      return next(new AppError(403, "Accès refusé"));
    }
    req.staff = staff;
    next();
  };
}

export async function verifyStaffLogin(email: string, password: string) {
  const user = await prisma.staffUser.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new AppError(401, "Identifiants invalides");
  }
  return { id: user.id, email: user.email, role: user.role };
}
