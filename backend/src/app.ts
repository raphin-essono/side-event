import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import participantRoutes from "./routes/participants.js";
import standRoutes from "./routes/stands.js";
import voteRoutes from "./routes/votes.js";
import phaseRoutes from "./routes/phases.js";
import settingsRoutes from "./routes/settings.js";
import sessionRoutes from "./routes/session.js";
import { AppError, sendError } from "./lib/errors.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: process.env.CORS_ORIGIN ?? "http://localhost:8080",
      credentials: true,
    }),
  );
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "sing-vivatech-api" });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/participants", participantRoutes);
  app.use("/api/stands", standRoutes);
  app.use("/api/votes", voteRoutes);
  app.use("/api/phases", phaseRoutes);
  app.use("/api/settings", settingsRoutes);
  app.use("/api/session", sessionRoutes);

  app.use((_req, _res, next) => {
    next(new AppError(404, "Route introuvable"));
  });

  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    sendError(res, err);
  });

  return app;
}
