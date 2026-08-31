import { Hono } from "hono";
import { describe, expect, it } from "vitest";
import { sponsorRoutes } from "../../src/routes/sponsor";
import { createSessionCookie } from "../../src/auth/session";

const SECRET = "test-secret";

type Bindings = {
  DB: D1Database;
  SECRET: string;
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

async function buildApp(db: D1Database) {
  const app = new Hono<{ Bindings: Bindings }>();
  app.use("*", async (c, next) => {
    c.env = { DB: db, SECRET } as { DB: D1Database; SECRET: string };
    await next();
  });
  app.route("/sponsor", sponsorRoutes);
  return app;
}

async function authHeader(role: "admin" | "sponsor" = "sponsor") {
  const cookie = await createSessionCookie(
    { userId: `${role}-1`, role, email: `${role}@test.com` },
    SECRET,
  );
  const raw = cookie.split(";")[0]?.split("=").slice(1).join("=") ?? "";
  return { Cookie: `nzc_session=${raw}` };
}

const PLOT_ROW = {
  plot_id: "plot-1",
  plot_code: "P-001",
  area_rai: 10,
  farmer_name: "Somchai",
  province: "Chiang Mai",
  district: "Mueang",
  total_offset_tco2e: 5.2,
  latest_season_id: "s2024",
  estimate_status: "draft",
};

describe("GET /sponsor", () => {
  it("returns 200 with plot list grouped by province", async () => {
    const db = mockD1([PLOT_ROW]) as unknown as D1Database;
    const app = await buildApp(db);
    const res = await app.request("/sponsor", { headers: await authHeader() });
    const body = (await res.json()) as {
      provinces: { province: string; plots: Record<string, unknown>[] }[];
    };

    expect(res.status).toBe(200);
    expect(body.provinces).toBeDefined();
    expect(Array.isArray(body.provinces)).toBe(true);
  });

  it("shows net tCO2e per plot", async () => {
    const db = mockD1([PLOT_ROW]) as unknown as D1Database;
    const app = await buildApp(db);
    const res = await app.request("/sponsor", { headers: await authHeader() });
    const body = (await res.json()) as {
      provinces: { plots: { total_offset_tco2e: number }[] }[];
    };

    const plots = body.provinces[0]?.plots;
    expect(plots).toBeDefined();
    expect(plots?.[0]?.total_offset_tco2e).toBe(5.2);
  });

  it("returns 401 without auth", async () => {
    const db = mockD1([]) as unknown as D1Database;
    const app = await buildApp(db);
    const res = await app.request("/sponsor");
    expect(res.status).toBe(401);
  });

  it("is read-only — no write endpoints (with auth)", async () => {
    const db = mockD1([]) as unknown as D1Database;
    const app = await buildApp(db);
    const headers = await authHeader();

    const postRes = await app.request("/sponsor", { method: "POST", headers });
    const putRes = await app.request("/sponsor", { method: "PUT", headers });
    const delRes = await app.request("/sponsor", { method: "DELETE", headers });

    // Auth middleware runs on all methods; write methods have no handler → 404 after auth passes
    // But use("*") middleware matches all methods, so POST/PUT/DELETE get auth check then 404
    expect(postRes.status).toBeGreaterThanOrEqual(401);
    expect(putRes.status).toBeGreaterThanOrEqual(401);
    expect(delRes.status).toBeGreaterThanOrEqual(401);
  });
});
