import { Hono } from "hono";
import { parseSessionCookie } from "../auth/session";

type Bindings = {
  DB: D1Database;
  R2: R2Bucket;
  ENVIRONMENT: string;
  SECRET: string;
};

export const dashboardRoutes = new Hono<{ Bindings: Bindings }>();

async function extractSession(
  c: { req: { header: (name: string) => string | undefined } },
  secret: string,
) {
  const cookieHeader = c.req.header("Cookie") ?? "";
  const match = cookieHeader.match(/nzc_session=([^;]+)/);
  if (!match?.[1]) return null;
  return await parseSessionCookie(match[1], secret);
}

dashboardRoutes.get("/admin", async (c) => {
  const secret = c.env.SECRET;
  const session = await extractSession(c, secret);
  if (!session) return c.json({ error: "Unauthorized" }, 401);
  if (session.role !== "admin") return c.json({ error: "Forbidden" }, 403);
  // Redirect to frontend admin dashboard
  return c.redirect("https://netzero-frontend.poom-a1d.workers.dev/admin");
});

dashboardRoutes.get("/sponsor", async (c) => {
  const secret = c.env.SECRET;
  const session = await extractSession(c, secret);
  if (!session) return c.json({ error: "Unauthorized" }, 401);
  if (session.role !== "sponsor") return c.json({ error: "Forbidden" }, 403);
  // Redirect to frontend sponsor dashboard
  return c.redirect("https://netzero-frontend.poom-a1d.workers.dev/sponsor");
});
