import { Hono } from "hono";
import { getPlotDetail, getPlotsByProvince } from "../sponsor/dashboard";
import { parseSessionCookie } from "../auth/session";

type Bindings = {
  DB: D1Database;
  SECRET: string;
};

export const sponsorRoutes = new Hono<{ Bindings: Bindings }>();

function requireSponsor(c: { req: { header: (name: string) => string | undefined }; env: { SECRET: string } }) {
  // Cloudflare Access already validated via middleware — check for its header
  const accessEmail = c.req.header("Cf-Access-Authenticated-User-Email");
  if (accessEmail) return true;
  // Fallback: session cookie
  const cookieHeader = c.req.header("Cookie") ?? "";
  const match = cookieHeader.match(/nzc_session=([^;]+)/);
  if (!match?.[1]) return false;
  const session = parseSessionCookie(match[1], c.env.SECRET);
  return session?.role === "sponsor" || session?.role === "admin";
}

sponsorRoutes.get("/", async (c) => {
  if (!requireSponsor(c)) return c.json({ error: "Unauthorized" }, 401);
  const db = c.env.DB;
  const provinces = await getPlotsByProvince(db);
  return c.json({ provinces });
});

sponsorRoutes.get("/:plotId", async (c) => {
  if (!requireSponsor(c)) return c.json({ error: "Unauthorized" }, 401);
  const db = c.env.DB;
  const plotId = c.req.param("plotId");
  const detail = await getPlotDetail(db, plotId);
  if (!detail) {
    return c.json({ error: "Plot not found" }, 404);
  }
  return c.json(detail);
});
