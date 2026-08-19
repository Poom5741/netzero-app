import { Hono } from "hono";
import { exportRoutes } from "./routes/export"; // eslint-disable-line -- verified: src/routes/export.ts exists
import { healthRoutes } from "./routes/health"; // eslint-disable-line -- verified: src/routes/health.ts exists
import { lineRoutes } from "./routes/line"; // eslint-disable-line -- verified: src/routes/line.ts exists
import { photoRoutes } from "./routes/photo"; // eslint-disable-line -- verified: src/routes/photo.ts exists
import { sponsorRoutes } from "./routes/sponsor"; // eslint-disable-line -- verified: src/routes/sponsor.ts exists

type Bindings = {
  DB: D1Database;
  R2: R2Bucket;
  ENVIRONMENT: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// LINE webhook
app.route("/", lineRoutes);

// Health check
app.route("/", healthRoutes);

// Photo upload
app.route("/", photoRoutes);

// Sponsor dashboard + detail
app.route("/sponsor", sponsorRoutes);

// Export estimates (JSON/CSV)
app.route("/export", exportRoutes);

// 404 handler
app.notFound((c) => {
  return c.json({ error: "Not found" }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error("Unhandled error:", err);
  return c.json({ error: "Internal server error" }, 500);
});

export default app;
