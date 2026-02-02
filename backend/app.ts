import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.js";

const isProd = process.env.NODE_ENV === "production";

const DEFAULT_ORIGINS = [
  "https://loginapp554.netlify.app",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
];

const ENV_ORIGINS = [
  process.env.FRONTEND_URL,
  ...(process.env.FRONTEND_URLS?.split(",") ?? []),
]
  .map((origin) => origin?.trim())
  .filter((origin): origin is string => Boolean(origin));

const ALLOWED_ORIGINS = new Set([...DEFAULT_ORIGINS, ...ENV_ORIGINS]);

export const createApp = () => {
  const app = express();

  // Trust proxy to get real client IP (important for Netlify/proxy deployments)
  app.set("trust proxy", true);
  app.disable("x-powered-by");

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) {
          return callback(null, true);
        }

        if (ALLOWED_ORIGINS.has(origin)) {
          return callback(null, true);
        }

        return callback(new Error(`CORS blocked for origin: ${origin}`));
      },
      credentials: true,
    }),
  );

  app.use(express.json({ limit: "100kb" }));

  app.use(authRouter);

  app.get("/", (_req, res) => {
    res.json({ ok: true, service: "auth-backend" });
  });

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const message = err instanceof Error ? err.message : "Unexpected error";
    const status = message.startsWith("CORS blocked") ? 403 : 500;

    res.status(status).json({
      ok: false,
      error: isProd ? "Server error" : message,
    });
  });

  return app;
};
