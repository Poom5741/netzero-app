import { Hono } from "hono";
import { describe, expect, it } from "vitest";
import { sponsorRoutes } from "../../src/routes/sponsor";
import { createSessionCookie } from "../../src/auth/session";

const SECRET = "test-secret";

type Bindings = {
  DB: D1Database;
  SECRET: string;
};

function mockD1Prepare(
  rows: Record<string, unknown>[],
  tallies: Record<string, unknown>[] = [],
  provenance: Record<string, unknown>[] = [],
  areas: string[] | null = null,
) {
  return {
    prepare(sql: string) {
      return {
        bind(..._args: unknown[]) {
          return {
            all: async () => {
              // Match by SQL pattern
              if (sql.includes("water_state") && sql.includes("photo_evidence")) {
                return { results: tallies };
              }
              if (sql.includes("pre_verified") && sql.includes("photo_evidence")) {
                return { results: provenance };
              }
              return { results: rows };
            },
            first: async () => {
              if (sql.includes("SELECT areas FROM users")) {
                return areas !== null ? { areas: JSON.stringify(areas) } : { areas: null };
              }
              return rows[0] ?? null;
            },
          };
        },
      };
    },
  };
}

function buildApp(db: D1Database) {
  const app = new Hono<{ Bindings: Bindings }>();
  app.use("*", async (c, next) => {
    c.env = { DB: db, SECRET } as { DB: D1Database; SECRET: string };
    await next();
  });
  app.route("/sponsor", sponsorRoutes);
  return app;
}

async function sponsorCookie() {
  const cookie = await createSessionCookie(
    { userId: "u1", role: "sponsor", email: "sponsor@test.com" },
    SECRET,
  );
  const raw = cookie.split(";")[0]?.split("=").slice(1).join("=") ?? "";
  return { Cookie: `nzc_session=${raw}` };
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

const WATER_STATE_TALLIES = [
  { water_state: "flooded", count: 3 },
  { water_state: "dry", count: 2 },
];

const PROVENANCE_COUNTS = [
  { provenance_type: "machine", count: 4 },
  { provenance_type: "human", count: 2 },
];

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
  water_state_tallies: {
    flooded: number;
    dry: number;
  };
  provenance_counts: {
    machine: number;
    human: number;
  };
};

describe("GET /sponsor/:plotId", () => {
  it("returns plot detail with live math fields", async () => {
    const db = mockD1Prepare([PLOT_DETAIL_ROW], WATER_STATE_TALLIES, PROVENANCE_COUNTS, ["Chiang Mai"]) as unknown as D1Database;
    const app = buildApp(db);
    const res = await app.request("/sponsor/plot-1", { headers: await sponsorCookie() });
    const body = await res.json<DetailBody>();

    expect(res.status).toBe(200);
    expect(body.plot_id).toBe("plot-1");
    expect(body.sf_w).toBe(0.55);
    expect(body.nitrogen_total_kg_per_rai).toBe(12);
    expect(body.total_offset_tco2e).toBe(5.2);
  });

  it("shows estimate — not yet verified label", async () => {
    const db = mockD1Prepare([PLOT_DETAIL_ROW], WATER_STATE_TALLIES, PROVENANCE_COUNTS, ["Chiang Mai"]) as unknown as D1Database;
    const app = buildApp(db);
    const res = await app.request("/sponsor/plot-1", { headers: await sponsorCookie() });
    const body = await res.json<DetailBody>();

    expect(body.verification_label).toBe("estimate — not yet verified");
  });

  it("returns plot metadata: code, area, farmer, province", async () => {
    const db = mockD1Prepare([PLOT_DETAIL_ROW], WATER_STATE_TALLIES, PROVENANCE_COUNTS, ["Chiang Mai"]) as unknown as D1Database;
    const app = buildApp(db);
    const res = await app.request("/sponsor/plot-1", { headers: await sponsorCookie() });
    const body = await res.json<DetailBody>();

    expect(body.plot_code).toBe("P-001");
    expect(body.area_rai).toBe(10);
    expect(body.farmer_name).toBe("Somchai");
    expect(body.province).toBe("Chiang Mai");
  });

  it("returns water management from season inputs", async () => {
    const db = mockD1Prepare([PLOT_DETAIL_ROW], WATER_STATE_TALLIES, PROVENANCE_COUNTS, ["Chiang Mai"]) as unknown as D1Database;
    const app = buildApp(db);
    const res = await app.request("/sponsor/plot-1", { headers: await sponsorCookie() });
    const body = await res.json<DetailBody>();

    expect(body.water_management).toBe("alternate wetting and drying");
  });

  it("returns water-state tallies per plot-season", async () => {
    const db = mockD1Prepare([PLOT_DETAIL_ROW], WATER_STATE_TALLIES, PROVENANCE_COUNTS, ["Chiang Mai"]) as unknown as D1Database;
    const app = buildApp(db);
    const res = await app.request("/sponsor/plot-1", { headers: await sponsorCookie() });
    const body = await res.json<DetailBody>();

    expect(body.water_state_tallies).toEqual({
      flooded: 3,
      dry: 2,
    });
  });

  it("returns provenance counts (machine vs human stamps)", async () => {
    const db = mockD1Prepare([PLOT_DETAIL_ROW], WATER_STATE_TALLIES, PROVENANCE_COUNTS, ["Chiang Mai"]) as unknown as D1Database;
    const app = buildApp(db);
    const res = await app.request("/sponsor/plot-1", { headers: await sponsorCookie() });
    const body = await res.json<DetailBody>();

    expect(body.provenance_counts).toEqual({
      machine: 4,
      human: 2,
    });
  });

  it("returns 404 when plot not found", async () => {
    const db = mockD1Prepare([]) as unknown as D1Database;
    const app = buildApp(db);
    const res = await app.request("/sponsor/nonexistent", { headers: await sponsorCookie() });

    expect(res.status).toBe(404);
  });

  it("returns 401 without session cookie", async () => {
    const db = mockD1Prepare([PLOT_DETAIL_ROW]) as unknown as D1Database;
    const app = buildApp(db);
    const res = await app.request("/sponsor/plot-1");

    expect(res.status).toBe(401);
  });

  it("returns 403 when plot province is not in sponsor areas", async () => {
    // Mock that returns areas for the sponsor and plot detail with a different province
    const db = {
      prepare(sql: string) {
        return {
          bind(..._args: unknown[]) {
            return {
              all: async () => {
                if (sql.includes("water_state") && sql.includes("photo_evidence")) {
                  return { results: WATER_STATE_TALLIES };
                }
                if (sql.includes("pre_verified") && sql.includes("photo_evidence")) {
                  return { results: PROVENANCE_COUNTS };
                }
                // Plot detail returns "Chiang Mai" which is NOT in the sponsor's areas
                return { results: [PLOT_DETAIL_ROW] };
              },
              first: async () => {
                if (sql.includes("SELECT areas FROM users")) {
                  return { areas: '["สุพรรณบุรี"]' };
                }
                return null;
              },
            };
          },
        };
      },
    };
    const app = buildApp(db as unknown as D1Database);
    const res = await app.request("/sponsor/plot-1", { headers: await sponsorCookie() });

    expect(res.status).toBe(403);
    const body = await res.json<{ error: string }>();
    expect(body.error).toBe("Forbidden");
  });

  it("returns 200 when plot province is in sponsor areas", async () => {
    // Mock that returns areas matching the plot's province
    const db = {
      prepare(sql: string) {
        return {
          bind(..._args: unknown[]) {
            return {
              all: async () => {
                if (sql.includes("water_state") && sql.includes("photo_evidence")) {
                  return { results: WATER_STATE_TALLIES };
                }
                if (sql.includes("pre_verified") && sql.includes("photo_evidence")) {
                  return { results: PROVENANCE_COUNTS };
                }
                return { results: [PLOT_DETAIL_ROW] };
              },
              first: async () => {
                if (sql.includes("SELECT areas FROM users")) {
                  return { areas: '["Chiang Mai"]' };
                }
                return null;
              },
            };
          },
        };
      },
    };
    const app = buildApp(db as unknown as D1Database);
    const res = await app.request("/sponsor/plot-1", { headers: await sponsorCookie() });

    expect(res.status).toBe(200);
  });

  it("returns 403 when sponsor has no areas", async () => {
    // Mock that returns null areas — sponsor must have assigned areas
    const db = {
      prepare(sql: string) {
        return {
          bind(..._args: unknown[]) {
            return {
              all: async () => {
                if (sql.includes("water_state") && sql.includes("photo_evidence")) {
                  return { results: WATER_STATE_TALLIES };
                }
                if (sql.includes("pre_verified") && sql.includes("photo_evidence")) {
                  return { results: PROVENANCE_COUNTS };
                }
                return { results: [PLOT_DETAIL_ROW] };
              },
              first: async () => {
                if (sql.includes("SELECT areas FROM users")) {
                  return { areas: null };
                }
                return null;
              },
            };
          },
        };
      },
    };
    const app = buildApp(db as unknown as D1Database);
    const res = await app.request("/sponsor/plot-1", { headers: await sponsorCookie() });

    expect(res.status).toBe(403);
  });
});
