import { Hono } from "hono";
import { describe, expect, it } from "vitest";
import { exportRoutes } from "../../src/routes/export";

type Bindings = {
  DB: D1Database;
};

function mockD1(rows: Record<string, unknown>[]) {
  return {
    prepare(_sql: string) {
      return {
        bind(..._args: unknown[]) {
          return { all: async () => ({ results: rows }) };
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
  app.route("/export", exportRoutes);
  return app;
}

const ESTIMATE_ROW = {
  plot_id: "plot-1",
  plot_code: "P-001",
  area_rai: 10,
  farmer_name: "Somchai",
  province: "Chiang Mai",
  season_id: "s2024",
  version: 1,
  status: "draft",
  total_offset_tco2e: 5.2,
  sf_w: 0.55,
  sf_p: 1.0,
  sf_o: 0.85,
  nitrogen_total_kg_per_rai: 12,
  baseline_ch4: 4.2,
  project_ch4: 2.31,
  baseline_n2o: 0.073,
  project_n2o: 0.055,
  baseline_co2: 0.066,
  project_co2: 0.04,
  burning_emissions: 0.413,
  verification_label: "estimate — not yet verified",
};

describe("GET /export/estimates", () => {
  it("returns JSON with all estimate fields", async () => {
    const db = mockD1([ESTIMATE_ROW]) as unknown as D1Database;
    const app = buildApp(db);
    const res = await app.request("/export/estimates?format=json");
    const body = (await res.json()) as { estimates: Record<string, unknown>[] };

    expect(res.status).toBe(200);
    expect(body.estimates).toHaveLength(1);
    const est = body.estimates[0];
    expect(est?.plot_code).toBe("P-001");
    expect(est?.total_offset_tco2e).toBe(5.2);
    expect(est?.sf_w).toBe(0.55);
    expect(est?.nitrogen_total_kg_per_rai).toBe(12);
    expect(est?.verification_label).toBe("estimate — not yet verified");
  });

  it("returns CSV with headers", async () => {
    const db = mockD1([ESTIMATE_ROW]) as unknown as D1Database;
    const app = buildApp(db);
    const res = await app.request("/export/estimates?format=csv");
    const text = await res.text();

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/csv");
    const lines = text.trim().split("\n");
    const headers = lines[0]?.split(",");
    expect(headers).toContain("plot_code");
    expect(headers).toContain("total_offset_tco2e");
    expect(headers).toContain("sf_w");
    expect(headers).toContain("nitrogen_total_kg_per_rai");
    expect(lines.length).toBe(2);
  });

  it("CSV data matches on-screen values from sponsor detail", async () => {
    const db = mockD1([ESTIMATE_ROW]) as unknown as D1Database;
    const app = buildApp(db);
    const csvRes = await app.request("/export/estimates?format=csv");
    const text = await csvRes.text();
    const lines = text.trim().split("\n");
    const dataRow = lines[1]?.split(",");

    expect(dataRow).toBeDefined();
    const headers = lines[0]?.split(",") ?? [];
    const offsetIdx = headers.indexOf("total_offset_tco2e");
    expect(Number(dataRow?.[offsetIdx])).toBe(5.2);
  });

  it("JSON data matches on-screen values", async () => {
    const db = mockD1([ESTIMATE_ROW]) as unknown as D1Database;
    const app = buildApp(db);
    const jsonRes = await app.request("/export/estimates?format=json");
    const body = (await jsonRes.json()) as { estimates: Record<string, unknown>[] };
    const est = body.estimates[0];

    expect(est?.baseline_ch4).toBe(4.2);
    expect(est?.project_ch4).toBe(2.31);
    expect(est?.status).toBe("draft");
  });
});
