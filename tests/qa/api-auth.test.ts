/**
 * api_assertions gate (super-speckit.yml) — sponsor API auth contract.
 * Public seam: GET /sponsor/summary, /sponsor/farmers, /sponsor/reports/EX-2042/download.
 * No cookie → 401; sponsor session → 200 with area-scoped payload;
 * non-sponsor role → 403. Uses the real route wiring (requireRole + session gate).
 */
import { Hono } from "hono";
import { describe, expect, it } from "vitest";
import { createSessionCookie } from "../../src/auth/session";
import { sponsorRoutes } from "../../src/routes/sponsor";

const SECRET = "test-secret-api-auth-gate";

/** Same SQL-substring D1 mock pattern as tests/unit/sponsor-summary.test.ts. */
function mockD1(responses: Record<string, Record<string, unknown>[]>) {
  return {
    prepare(sql: string) {
      return {
        bind(..._args: unknown[]) {
          const matchKey = Object.keys(responses).find((k) => sql.includes(k));
          const rows = (matchKey ? responses[matchKey] : []) as Record<string, unknown>[];
          return {
            all: async () => ({ results: rows }),
            first: async () => rows[0] ?? null,
          };
        },
      };
    },
  };
}

// Insertion order matters (first substring match wins): specific queries first.
const DB = mockD1({
  "SELECT areas FROM users": [{ areas: '["สุพรรณบุรี"]' }],
  "COALESCE(SUM(p.area_rai)": [{ total_rai: 4.5 }],
  "COUNT(DISTINCT p.id)": [{ total_plots: 1 }],
  "FROM farmers f JOIN plots p ON p.farmer_id = f.id": [{ total_farmers: 1 }],
  "SUM(coalesce": [{ total_co2: 0 }],
  water_management: [],
}) as unknown as D1Database;

function bindings() {
  return { DB, R2: {}, ENVIRONMENT: "test", SECRET };
}

function app() {
  const a = new Hono();
  a.route("/sponsor", sponsorRoutes);
  return a;
}

async function sponsorCookie(role = "sponsor"): Promise<string> {
  const cookie = await createSessionCookie(
    { userId: "sp-1", role, email: "sponsor@netzero.local" },
    SECRET,
    true,
    3600,
    "None",
  );
  return cookie.split(";")[0];
}

describe("sponsor API auth contract (api_assertions gate)", () => {
  it.each([
    "/sponsor/summary",
    "/sponsor/farmers",
    "/sponsor/reports/EX-2042/download",
  ])("returns 401 without a session cookie: %s", async (path) => {
    const res = await app().request(path, {}, bindings() as never);
    expect(res.status).toBe(401);
  });

  it.each([
    "/sponsor/summary",
    "/sponsor/farmers",
    "/sponsor/reports/EX-2042/download",
  ])("returns 403 for a non-sponsor role: %s", async (path) => {
    const cookie = await sponsorCookie("farmer");
    const res = await app().request(path, { headers: { Cookie: cookie } }, bindings() as never);
    expect(res.status).toBe(403);
  });

  it("returns 200 area-scoped summary with a sponsor session", async () => {
    const cookie = await sponsorCookie();
    const res = await app()
      .request("/sponsor/summary", { headers: { Cookie: cookie } }, bindings() as never)
      .then((r) => r);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { totalFarmers: number; totalAreaRai: number };
    expect(body.totalFarmers).toBe(1);
    expect(body.totalAreaRai).toBe(4.5);
  });

  it("streams the EX-2042 CSV with a sponsor session (first line contract)", async () => {
    const cookie = await sponsorCookie();
    const res = await app()
      .request("/sponsor/reports/EX-2042/download", { headers: { Cookie: cookie } }, bindings() as never)
      .then((r) => r);
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text.split("\n")[0]).toBe("รายงาน EX-2042 — สรุปคาร์บอนเครดิต");
  });
});
