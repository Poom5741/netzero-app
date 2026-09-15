/**
 * Task 11 — Tests for new sponsor route endpoints:
 * GET /sponsor/me, /sponsor/ghg-sources, /sponsor/season-credits,
 * /sponsor/certificates, /sponsor/reports/:id/download
 */
import { Hono } from "hono";
import { describe, expect, it } from "vitest";
import { createSessionCookie } from "../../src/auth/session";
import { sponsorRoutes } from "../../src/routes/sponsor";

const SECRET = "test-secret";

type Bindings = {
  DB: D1Database;
  SECRET: string;
};

function mockD1(responses: Record<string, unknown[]>) {
  return {
    prepare(sql: string) {
      return {
        bind(..._args: unknown[]) {
          return {
            all: async () => {
              for (const [key, rows] of Object.entries(responses)) {
                if (sql.includes(key)) return { results: rows };
              }
              return { results: [] };
            },
            first: async () => {
              for (const [key, rows] of Object.entries(responses)) {
                if (sql.includes(key)) return rows[0] ?? null;
              }
              return null;
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

describe("GET /sponsor/me", () => {
  it("returns user profile and areas", async () => {
    const db = mockD1({
      "SELECT areas FROM users": [{ areas: '["สุพรรณบุรี"]' }],
      "SELECT id, email, name, role FROM users": [
        { id: "u1", email: "sponsor@test.com", name: "ทดสอบ", role: "sponsor" },
      ],
    }) as unknown as D1Database;
    const app = buildApp(db);
    const res = await app.request("/sponsor/me", { headers: await sponsorCookie() });
    const body = await res.json<{
      user: { id: string; email: string; name: string; role: string };
      areas: string[] | null;
    }>();

    expect(res.status).toBe(200);
    expect(body.user.id).toBe("u1");
    expect(body.user.email).toBe("sponsor@test.com");
    expect(body.user.name).toBe("ทดสอบ");
    expect(body.areas).toEqual(["สุพรรณบุรี"]);
  });

  it("returns null areas when user has no areas", async () => {
    const db = mockD1({
      "SELECT areas FROM users": [{ areas: null }],
      "SELECT id, email, name, role FROM users": [
        { id: "u1", email: "sponsor@test.com", name: null, role: "sponsor" },
      ],
    }) as unknown as D1Database;
    const app = buildApp(db);
    const res = await app.request("/sponsor/me", { headers: await sponsorCookie() });
    const body = await res.json<{ user: { name: string | null }; areas: string[] | null }>();

    expect(res.status).toBe(200);
    expect(body.areas).toBeNull();
    expect(body.user.name).toBeNull();
  });

  it("returns 401 without session cookie", async () => {
    const db = mockD1({}) as unknown as D1Database;
    const app = buildApp(db);
    const res = await app.request("/sponsor/me");
    expect(res.status).toBe(401);
  });
});

describe("GET /sponsor/ghg-sources", () => {
  it("returns GHG source breakdown", async () => {
    const db = mockD1({
      baseline_ch4: [
        {
          baseline_ch4: 100,
          project_ch4: 65,
          baseline_n2o: 30,
          project_n2o: 22,
          baseline_co2: 50,
          project_co2: 45,
        },
      ],
      "SELECT areas FROM users": [{ areas: '["สุพรรณบุรี"]' }],
    }) as unknown as D1Database;
    const app = buildApp(db);
    const res = await app.request("/sponsor/ghg-sources", { headers: await sponsorCookie() });
    const body = await res.json<{
      sources: { source: string; baseline: number; project: number; reduction: number }[];
    }>();

    expect(res.status).toBe(200);
    expect(body.sources).toHaveLength(3);
    expect(body.sources[0]?.reduction).toBe(35);
  });

  it("returns 401 without session cookie", async () => {
    const db = mockD1({}) as unknown as D1Database;
    const app = buildApp(db);
    const res = await app.request("/sponsor/ghg-sources");
    expect(res.status).toBe(401);
  });
});

describe("GET /sponsor/season-credits", () => {
  it("returns season credit chart data", async () => {
    const db = mockD1({
      "ce.season_id": [
        { season_id: "s1", season_name: "ฤดูนา 2568", estimated_tco2e: 50, verified_tco2e: 40 },
      ],
      "SELECT areas FROM users": [{ areas: '["สุพรรณบุรี"]' }],
    }) as unknown as D1Database;
    const app = buildApp(db);
    const res = await app.request("/sponsor/season-credits", { headers: await sponsorCookie() });
    const body = await res.json<{
      credits: {
        season_id: string;
        season_name: string;
        estimated_tco2e: number;
        verified_tco2e: number;
      }[];
    }>();

    expect(res.status).toBe(200);
    expect(body.credits).toHaveLength(1);
    expect(body.credits[0]?.season_name).toBe("ฤดูนา 2568");
  });

  it("returns 401 without session cookie", async () => {
    const db = mockD1({}) as unknown as D1Database;
    const app = buildApp(db);
    const res = await app.request("/sponsor/season-credits");
    expect(res.status).toBe(401);
  });
});

describe("GET /sponsor/certificates", () => {
  it("returns certificate list", async () => {
    const db = mockD1({
      "cc.id": [
        {
          id: "c1",
          certificate_number: "TVER-001",
          season_id: "s1",
          volume_tco2e: 10.5,
          status: "verified",
          issued_at: "2026-01-15",
        },
      ],
      "SELECT areas FROM users": [{ areas: '["สุพรรณบุรี"]' }],
    }) as unknown as D1Database;
    const app = buildApp(db);
    const res = await app.request("/sponsor/certificates", { headers: await sponsorCookie() });
    const body = await res.json<{
      certificates: { certificate_number: string; status: string }[];
    }>();

    expect(res.status).toBe(200);
    expect(body.certificates).toHaveLength(1);
    expect(body.certificates[0]?.certificate_number).toBe("TVER-001");
    expect(body.certificates[0]?.status).toBe("verified");
  });

  it("returns 401 without session cookie", async () => {
    const db = mockD1({}) as unknown as D1Database;
    const app = buildApp(db);
    const res = await app.request("/sponsor/certificates");
    expect(res.status).toBe(401);
  });
});

describe("GET /sponsor/reports/:id/download", () => {
  it("returns CSV for EX-2042", async () => {
    const db = mockD1({
      "SUM(coalesce": [{ total_co2: 25 }],
      "COUNT(DISTINCT p.id)": [{ total_plots: 5 }],
      "COUNT(DISTINCT f.id)": [{ total_farmers: 4 }],
      "si.water_management": [],
      "COALESCE(SUM(p.area_rai)": [{ total_rai: 50 }],
      "COUNT(DISTINCT f.id) as total_hh": [{ total_hh: 4 }],
      "SELECT areas FROM users": [{ areas: '["สุพรรณบุรี"]' }],
    }) as unknown as D1Database;
    const app = buildApp(db);
    const res = await app.request("/sponsor/reports/EX-2042/download", {
      headers: await sponsorCookie(),
    });

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/csv");
    expect(res.headers.get("Content-Disposition")).toContain("EX-2042");
    const text = await res.text();
    expect(text).toContain("รายงาน EX-2042");
    expect(text).toContain("คาร์บอนที่ลดทั้งหมด");
  });

  it("returns 404 for non-EX-2042 report IDs", async () => {
    const db = mockD1({}) as unknown as D1Database;
    const app = buildApp(db);
    const res = await app.request("/sponsor/reports/OTHER-123/download", {
      headers: await sponsorCookie(),
    });
    expect(res.status).toBe(404);
  });

  it("returns 401 without session cookie", async () => {
    const db = mockD1({}) as unknown as D1Database;
    const app = buildApp(db);
    const res = await app.request("/sponsor/reports/EX-2042/download");
    expect(res.status).toBe(401);
  });
});

describe("Auth guard — non-sponsor role", () => {
  it("returns 403 when user has admin role", async () => {
    const adminCookie = await createSessionCookie(
      { userId: "a1", role: "admin", email: "admin@test.com" },
      SECRET,
    );
    const raw = adminCookie.split(";")[0]?.split("=").slice(1).join("=") ?? "";
    const db = mockD1({}) as unknown as D1Database;
    const app = buildApp(db);
    const res = await app.request("/sponsor/summary", {
      headers: { Cookie: `nzc_session=${raw}` },
    });
    expect(res.status).toBe(403);
  });

  it("returns 401 when session cookie is invalid", async () => {
    const db = mockD1({}) as unknown as D1Database;
    const app = buildApp(db);
    const res = await app.request("/sponsor/summary", {
      headers: { Cookie: "nzc_session=garbage.payload.signature" },
    });
    expect(res.status).toBe(401);
  });

  it("returns 401 when no cookie is present", async () => {
    const db = mockD1({}) as unknown as D1Database;
    const app = buildApp(db);
    const res = await app.request("/sponsor/summary");
    expect(res.status).toBe(401);
  });
});

describe("POST/PUT/DELETE — no write endpoints on sponsor", () => {
  it("returns 404 for POST /sponsor", async () => {
    const db = mockD1({}) as unknown as D1Database;
    const app = buildApp(db);
    const res = await app.request("/sponsor", { method: "POST", headers: await sponsorCookie() });
    expect(res.status).toBe(404);
  });

  it("returns 404 for PUT /sponsor", async () => {
    const db = mockD1({}) as unknown as D1Database;
    const app = buildApp(db);
    const res = await app.request("/sponsor", { method: "PUT", headers: await sponsorCookie() });
    expect(res.status).toBe(404);
  });

  it("returns 404 for DELETE /sponsor", async () => {
    const db = mockD1({}) as unknown as D1Database;
    const app = buildApp(db);
    const res = await app.request("/sponsor", { method: "DELETE", headers: await sponsorCookie() });
    expect(res.status).toBe(404);
  });
});
