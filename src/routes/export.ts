import { Hono } from "hono";
import { parseSessionCookie } from "../auth/session";
import { estimatesToCSV, getAllEstimates } from "../export/estimates";

type Bindings = {
  DB: D1Database;
  SECRET: string;
};

export const exportRoutes = new Hono<{ Bindings: Bindings }>();

exportRoutes.get("/estimates", async (c) => {
  // Require admin or sponsor auth
  const cookie = c.req.header("Cookie") ?? "";
  const match = cookie.match(/nzc_session=([^;]+)/);
  if (!match) return c.json({ error: "Unauthorized" }, 401);
  const session = parseSessionCookie(match[1], c.env.SECRET);
  if (!session || (session.role !== "admin" && session.role !== "sponsor")) {
    return c.json({ error: "Forbidden" }, 403);
  }

  const db = c.env.DB;
  const format = c.req.query("format") ?? "json";
  const estimates = await getAllEstimates(db);

  if (format === "csv") {
    const csv = estimatesToCSV(estimates);
    return new Response(csv, {
      headers: { "content-type": "text/csv; charset=utf-8" },
    });
  }

  return c.json({ estimates });
});
