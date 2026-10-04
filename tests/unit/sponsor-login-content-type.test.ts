import { Hono } from "hono";
import { describe, expect, it } from "vitest";
import { hashPassword } from "../../src/auth/password";
import { sponsorRoutes } from "../../src/routes/sponsor";

// F1: POST /sponsor/login had duplicate handlers — the first called
// c.req.formData() unconditionally, so the 017 sponsor portal's JSON
// login hit an unhandled 500. One handler must dispatch on content-type.

const SECRET = "test-secret";

type Bindings = {
  DB: D1Database;
  SECRET: string;
};

function mockD1(userRow: Record<string, unknown> | null) {
  return {
    prepare(_sql: string) {
      return {
        bind(..._args: unknown[]) {
          return {
            all: async () => ({ results: userRow ? [userRow] : [] }),
            first: async () => userRow,
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

const SPONSOR = {
  id: "u1",
  email: "sponsor@netzero.com",
  role: "sponsor",
  otp_secret: null,
  areas: JSON.stringify(["CPA-001"]),
};

describe("POST /sponsor/login content-type dispatch (F1)", () => {
  it("accepts JSON body (017 portal) and sets session cookie — no 500", async () => {
    const hash = await hashPassword("correct-horse");
    const app = buildApp(mockD1({ ...SPONSOR, password_hash: hash }));
    const res = await app.request("/sponsor/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "sponsor@netzero.com", password: "correct-horse" }),
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { success?: boolean };
    expect(body.success).toBe(true);
    expect(res.headers.get("Set-Cookie")).toContain("nzc_session=");
  });

  it("accepts form-encoded body (legacy portal) and 302s to /sponsor", async () => {
    const hash = await hashPassword("correct-horse");
    const app = buildApp(mockD1({ ...SPONSOR, password_hash: hash }));
    const res = await app.request("/sponsor/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "email=sponsor%40netzero.com&password=correct-horse",
    });
    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe("/sponsor");
    expect(res.headers.get("Set-Cookie")).toContain("nzc_session=");
  });

  it("returns 401 JSON for bad JSON credentials", async () => {
    const hash = await hashPassword("correct-horse");
    const app = buildApp(mockD1({ ...SPONSOR, password_hash: hash }));
    const res = await app.request("/sponsor/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "sponsor@netzero.com", password: "wrong" }),
    });
    expect(res.status).toBe(401);
    const body = (await res.json()) as { error?: string };
    expect(body.error).toBe("Invalid credentials");
  });
});
