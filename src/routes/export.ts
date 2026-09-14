import { Hono } from "hono";
import { parseSessionCookie } from "../auth/session";
import { estimatesToCSV, getAllEstimates } from "../export/estimates";
import { getSponsorAreas } from "../sponsor/dashboard";

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
  const session = await parseSessionCookie(match[1], c.env.SECRET);
  if (!session || (session.role !== "admin" && session.role !== "sponsor")) {
    return c.json({ error: "Forbidden" }, 403);
  }

  const db = c.env.DB;
  const format = c.req.query("format") ?? "json";

  // T072 — role-based field filtering per AD-FAR-03, AD-ROLE-02:
  // - Admins: full data (all provinces, all fields)
  // - Sponsors: CPA-only data (no PII like farmer_name/phone), scoped to their areas
  // The EstimateExportRow type already excludes PII fields; sponsor scoping is enforced below.
  let areas: string[] | null = null;
  if (session.role === "sponsor") {
    areas = await getSponsorAreas(db, session.userId);
    if (!areas || areas.length === 0) {
      return c.json({ error: "Forbidden — no supported areas configured" }, 403);
    }
  }

  const estimates = await getAllEstimates(db, areas, {
    province: c.req.query("province") || undefined,
    season: c.req.query("season") || undefined,
  });

  if (format === "csv") {
    const csv = estimatesToCSV(estimates);
    return new Response(csv, {
      headers: { "content-type": "text/csv; charset=utf-8" },
    });
  }

  return c.json({ estimates });
});
