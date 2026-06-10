import { Router } from "express";
import { z } from "zod";
import { createSession, verifyStaffLogin } from "../middleware/auth.js";
import { sendError } from "../lib/errors.js";

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post("/login", async (req, res) => {
  try {
    const body = loginSchema.parse(req.body);
    const staff = await verifyStaffLogin(body.email, body.password);
    const token = createSession(staff);
    res.json({ token, staff });
  } catch (err) {
    sendError(res, err);
  }
});

export default router;
