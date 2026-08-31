import { Hono } from "hono";
import { getPlotDetail, getPlotsByProvince } from "../sponsor/dashboard";
import { parseSessionCookie } from "../auth/session";

type Bindings = {
  DB: D1Database;
  SECRET: string;
};

type Variables = {
  session: { userId: string; role: string; email: string };
};

export const sponsorRoutes = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Auth middleware: require admin OR sponsor role
sponsorRoutes.use("*", async (c, next) => {
  const cookie = c.req.header("Cookie") ?? "";
  const match = cookie.match(/nzc_session=([^;]+)/);
  if (!match) return c.json({ error: "Unauthorized" }, 401);

  const session = await parseSessionCookie(match[1] ?? "", c.env.SECRET);
  if (!session) return c.json({ error: "Unauthorized" }, 401);

  if (session.role !== "admin" && session.role !== "sponsor") {
    return c.json({ error: "Forbidden" }, 403);
  }

  c.set("session", session);
  await next();
});

sponsorRoutes.get("/", async (c) => {
  const db = c.env.DB;
  const provinces = await getPlotsByProvince(db);
  return c.json({ provinces });
});

sponsorRoutes.get("/:plotId", async (c) => {
  const db = c.env.DB;
  const plotId = c.req.param("plotId");
  const detail = await getPlotDetail(db, plotId);
  if (!detail) {
    return c.json({ error: "Plot not found" }, 404);
  }
  return c.json(detail);
});
