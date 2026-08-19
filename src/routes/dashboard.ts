import { Hono } from "hono";
import { parseSessionCookie } from "../auth/session";

type Bindings = {
  DB: D1Database;
  R2: R2Bucket;
  ENVIRONMENT: string;
  SECRET: string;
};

export const dashboardRoutes = new Hono<{ Bindings: Bindings }>();

function renderAdminDashboard(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Admin Dashboard</title></head>
<body>
<h1>Admin Dashboard</h1>
<p>Welcome, admin.</p>
<nav>
  <a href="/admin/farmers">Farmers</a>
  <a href="/admin/review">Photo Review</a>
</nav>
</body>
</html>`;
}

function renderSponsorDashboard(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sponsor Dashboard</title></head>
<body>
<h1>Sponsor Dashboard</h1>
<p>Welcome, sponsor.</p>
<nav>
  <a href="/sponsor/plots">My Plots</a>
  <a href="/sponsor/estimates">Carbon Estimates</a>
</nav>
</body>
</html>`;
}

function extractSession(
  c: { req: { header: (name: string) => string | undefined } },
  secret: string,
) {
  const cookieHeader = c.req.header("Cookie") ?? "";
  const match = cookieHeader.match(/nzc_session=([^;]+)/);
  if (!match?.[1]) return null;
  return parseSessionCookie(match[1], secret);
}

dashboardRoutes.get("/admin", async (c) => {
  const secret = c.env.SECRET;
  const session = extractSession(c, secret);
  if (!session) return c.json({ error: "Unauthorized" }, 401);
  if (session.role !== "admin") return c.json({ error: "Forbidden" }, 403);
  return c.html(renderAdminDashboard());
});

dashboardRoutes.get("/sponsor", async (c) => {
  const secret = c.env.SECRET;
  const session = extractSession(c, secret);
  if (!session) return c.json({ error: "Unauthorized" }, 401);
  if (session.role !== "sponsor") return c.json({ error: "Forbidden" }, 403);
  return c.html(renderSponsorDashboard());
});
