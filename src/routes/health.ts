import { Hono } from "hono";

type Bindings = {
  DB: D1Database;
  R2: R2Bucket;
  ENVIRONMENT: string;
  /** D-4 residue (Rakazo r3): set per deploy so backend provenance can be
   * attested the same way as the frontend's /_staging-build.json. Deploy with
   * `wrangler deploy --var BUILD_ID:<sha>`; unset falls back to "unknown". */
  BUILD_ID?: string;
};

export const healthRoutes = new Hono<{ Bindings: Bindings }>();

healthRoutes.get("/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: c.env.ENVIRONMENT,
    build: c.env.BUILD_ID ?? "unknown",
  });
});

// Build fingerprint — parity with the frontend's /_staging-build.json so the
// J0 environment receipt can attest BOTH worker sides of staging.
healthRoutes.get("/_staging-build.json", (c) => {
  return c.json({
    build: c.env.BUILD_ID ?? "unknown",
    side: "backend",
    note: "set via BUILD_ID var at deploy time",
  });
});
