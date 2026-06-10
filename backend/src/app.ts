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

  // Dev request logger to help debug 404s
  app.use((req, _res, next) => {
    console.log(`[req] ${req.method} ${req.originalUrl}`);
    next();
  });

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

  // Root helper: point users/tools to /health
  app.get("/", (_req, res) => {
    res.json({ status: "ok", service: "sing-vivatech-api", health: "/health", apiPrefix: "/api" });
  });

  // Log registered routes (including routes from mounted routers)
  try {
    const listRoutes = (layer: any, prefix = ""): string[] => {
      if (!layer) return [];
      // router stack
      if (layer.handle && layer.handle.stack && Array.isArray(layer.handle.stack)) {
        const p = layer.regexp && layer.regexp.source !== '^\\/?$' ? (layer?.path || '') : '';
        return layer.handle.stack.flatMap((l: any) => listRoutes(l, prefix + (p || layer?.path || '')));
      }
      if (layer.route) {
        const methods = Object.keys(layer.route.methods).map((m) => m.toUpperCase()).join(',');
        return [`${methods} ${prefix}${layer.route.path}`];
      }
      return [];
    };

    const stack = (app as any)._router?.stack || [];
    const routes = stack.flatMap((layer: any) => listRoutes(layer, ''));
    console.log('Registered routes:', routes);
  } catch (e) {
    // ignore in production
  }

  app.use((_req, _res, next) => {
    next(new AppError(404, "Route introuvable"));
  });

  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    sendError(res, err);
  });

  return app;
}
