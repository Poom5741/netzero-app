import { Hono } from "hono";
import { requireRole } from "../auth/middleware";
import {
  getPlotDetail,
  getPlotsByProvinceScoped,
  getSponsorSummary,
  getSponsorFarmers,
  getSponsorAreas,
  getCertificates,
  getGhgSourceBreakdown,
  getSeasonCredits,
} from "../sponsor/dashboard";
import type { SessionData } from "../auth/session";

type Bindings = {
  DB: D1Database;
  SECRET: string;
};

export const sponsorRoutes = new Hono<{ Bindings: Bindings }>();

// All sponsor routes require sponsor role
sponsorRoutes.use("*", async (c, next) => {
  const middleware = requireRole("sponsor", c.env.SECRET);
  return middleware(c, next);
});

/** Helper: extract areas for the current sponsor from the DB. Returns 403 Response when sponsor has no areas. */
async function getAreasForRequest(c: { env: { DB: D1Database }; get: (key: string) => unknown }): Promise<string[] | Response> {
  const session = c.get("session" as never) as SessionData | undefined;
  if (!session) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  const areas = await getSponsorAreas(c.env.DB, session.userId);
  if (!areas || areas.length === 0) {
    return new Response(JSON.stringify({ error: "Forbidden — sponsor has no assigned areas" }), { status: 403, headers: { "Content-Type": "application/json" } });
  }
  return areas;
}

// ─── Authenticated sponsor profile ───
sponsorRoutes.get("/me", async (c) => {
  const session = c.get("session" as never) as SessionData | undefined;
  if (!session) return c.json({ error: "Unauthorized" }, 401);
  const db = c.env.DB;
  const areas = await getSponsorAreas(db, session.userId);
  const user = await db
    .prepare("SELECT id, email, name, role FROM users WHERE id = ?")
    .bind(session.userId)
    .first<{ id: string; email: string; name: string | null; role: string }>();
  if (!user) return c.json({ error: "User not found" }, 404);
  return c.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role }, areas });
});

// ─── Plots grouped by province (area-scoped) ───
sponsorRoutes.get("/", async (c) => {
  const db = c.env.DB;
  const areas = await getAreasForRequest(c);
  if (areas instanceof Response) return areas;
  const provinces = await getPlotsByProvinceScoped(db, areas);
  return c.json({ provinces });
});

// ─── Summary KPIs (area-scoped) ───
sponsorRoutes.get("/summary", async (c) => {
  const db = c.env.DB;
  const areas = await getAreasForRequest(c);
  if (areas instanceof Response) return areas;
  const summary = await getSponsorSummary(db, areas);
  return c.json(summary);
});

// ─── Farmers list (area-scoped) ───
sponsorRoutes.get("/farmers", async (c) => {
  const db = c.env.DB;
  const areas = await getAreasForRequest(c);
  if (areas instanceof Response) return areas;
  const farmers = await getSponsorFarmers(db, areas);
  return c.json({ farmers });
});

// ─── GHG source breakdown (area-scoped) ───
sponsorRoutes.get("/ghg-sources", async (c) => {
  const db = c.env.DB;
  const areas = await getAreasForRequest(c);
  if (areas instanceof Response) return areas;
  const sources = await getGhgSourceBreakdown(db, areas);
  return c.json({ sources });
});

// ─── Season credit chart data (area-scoped) ───
sponsorRoutes.get("/season-credits", async (c) => {
  const db = c.env.DB;
  const areas = await getAreasForRequest(c);
  if (areas instanceof Response) return areas;
  const credits = await getSeasonCredits(db, areas);
  return c.json({ credits });
});

// ─── TVER certificates (area-scoped) ───
sponsorRoutes.get("/certificates", async (c) => {
  const db = c.env.DB;
  const areas = await getAreasForRequest(c);
  if (areas instanceof Response) return areas;
  const certificates = await getCertificates(db, areas);
  return c.json({ certificates });
});

// ─── Report download (EX-2042) ───
sponsorRoutes.get("/reports/:id/download", async (c) => {
  const reportId = c.req.param("id");
  // Only EX-2042 is available for sponsors
  if (reportId !== "EX-2042") {
    return c.json({ error: "Report not found or not available for sponsors" }, 404);
  }
  const db = c.env.DB;
  const areas = await getAreasForRequest(c);
  if (areas instanceof Response) return areas;
  // Build a CSV report scoped to sponsor's areas
  const summary = await getSponsorSummary(db, areas);
  const csv = [
    "รายงาน EX-2042 — สรุปคาร์บอนเครดิต",
    `วันที่สร้าง,${new Date().toISOString().slice(0, 10)}`,
    "",
    "สรุปภาพรวม",
    `คาร์บอนที่ลดทั้งหมด (tCO2e),${summary.totalCO2Tons}`,
    `จำนวนแปลง,${summary.totalPlots}`,
    `จำนวนเกษตรกร,${summary.totalFarmers}`,
    `พื้นที่ทั้งหมด (ไร่),${summary.totalAreaRai}`,
    `ครัวเรือนที่ได้รับประโยชน์,${summary.totalHouseholds}`,
    `มูลค่าโดยประมาณ (USD),${summary.paymentEstimateUSD}`,
    "",
    "สัดส่วนวิธีการ",
    `AWD,${summary.methodologyBreakdown.awd}%`,
    `Biochar,${summary.methodologyBreakdown.biochar}%`,
    `Fertilization,${summary.methodologyBreakdown.fertilization}%`,
  ].join("\n");

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="EX-2042-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
});

// ─── Plot detail (must be after static routes to avoid param collision) ───
sponsorRoutes.get("/:plotId", async (c) => {
  const db = c.env.DB;
  const plotId = c.req.param("plotId");
  const detail = await getPlotDetail(db, plotId);
  if (!detail) {
    return c.json({ error: "Plot not found" }, 404);
  }

  // C1 fix: verify the plot's farmer province is in the sponsor's assigned areas
  const areas = await getAreasForRequest(c);
  if (areas instanceof Response) return areas;
  if (!areas.includes(detail.province)) {
    return c.json({ error: "Forbidden" }, 403);
  }

  return c.json(detail);
});
