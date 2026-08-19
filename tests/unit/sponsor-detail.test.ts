import { Hono } from "hono";
import { describe, expect, it } from "vitest";
import { sponsorRoutes } from "../../src/routes/sponsor";

type Bindings = {
  DB: D1Database;
};

function mockD1Prepare(rows: Record<string, unknown>[]) {
  return {
    prepare(_sql: string) {
      return {
        bind(..._args: unknown[]) {
          return {
            all: async () => ({ results: rows }),
            first: async () => rows[0] ?? null,
          };
        },
      };
    },
  };
}

function buildApp(db: D1Database) {
  const app = new Hono<{ Bindings: Bindings }>();
  app.use("*", async (c, next) => {
    c.env = { DB: db } as { DB: D1Database };
    await next();
  });
  app.route("/sponsor", sponsorRoutes);
  return app;
}

const PLOT_DETAIL_ROW = {
  plot_id: "plot-1",
  plot_code: "P-001",
  area_rai: 10,
  farmer_name: "Somchai",
  province: "Chiang Mai",
  district: "Mueang",
  season_id: "s2024",
  water_management: "alternate wetting and drying",
  estimate_status: "draft",
  total_offset_tco2e: 5.2,
  sf_w: 0.55,
  sf_p: 1.0,
  sf_o: 0.85,
  nitrogen_total_kg_per_rai: 12,
};

type DetailBody = {
  plot_id: string;
  plot_code: string;
  area_rai: number;
  farmer_name: string;
  province: string;
  verification_label: string;
  water_management: string;
  sf_w: number;
  nitrogen_total_kg_per_rai: number;
  total_offset_tco2e: number;
};

describe("GET /sponsor/:plotId", () => {
  it("returns plot detail with live math fields", async () => {
    const db = mockD1Prepare([PLOT_DETAIL_ROW]) as unknown as D1Database;
    const app = buildApp(db);
    const res = await app.request("/sponsor/plot-1");
    const body = await res.json<DetailBody>();

    expect(res.status).toBe(200);
    expect(body.plot_id).toBe("plot-1");
    expect(body.sf_w).toBe(0.55);
    expect(body.nitrogen_total_kg_per_rai).toBe(12);
    expect(body.total_offset_tco2e).toBe(5.2);
  });

  it("shows estimate — not yet verified label", async () => {
    const db = mockD1Prepare([PLOT_DETAIL_ROW]) as unknown as D1Database;
    const app = buildApp(db);
    const res = await app.request("/sponsor/plot-1");
    const body = await res.json<DetailBody>();

    expect(body.verification_label).toBe("estimate — not yet verified");
  });

  it("returns plot metadata: code, area, farmer, province", async () => {
    const db = mockD1Prepare([PLOT_DETAIL_ROW]) as unknown as D1Database;
    const app = buildApp(db);
    const res = await app.request("/sponsor/plot-1");
    const body = await res.json<DetailBody>();

    expect(body.plot_code).toBe("P-001");
    expect(body.area_rai).toBe(10);
    expect(body.farmer_name).toBe("Somchai");
    expect(body.province).toBe("Chiang Mai");
  });

  it("returns water management from season inputs", async () => {
    const db = mockD1Prepare([PLOT_DETAIL_ROW]) as unknown as D1Database;
    const app = buildApp(db);
    const res = await app.request("/sponsor/plot-1");
    const body = await res.json<DetailBody>();

    expect(body.water_management).toBe("alternate wetting and drying");
  });

  it("returns 404 when plot not found", async () => {
    const db = mockD1Prepare([]) as unknown as D1Database;
    const app = buildApp(db);
    const res = await app.request("/sponsor/nonexistent");

    expect(res.status).toBe(404);
  });
});
