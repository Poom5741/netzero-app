import { Hono } from "hono";
import { describe, expect, it } from "vitest";
import { authRoutes } from "../../src/routes/auth";
import { createSessionCookie } from "../../src/auth/session";

/**
 * Tests for GET /session — real session check used by the frontend gate.
 * Valid nzc_session -> 200 {authenticated, role, email}; missing/tampered -> 401.
 */

const SECRET = "test-secret-for-session-route";

function bindings() {
  return { DB: {}, R2: {}, ENVIRONMENT: "test", SECRET };
}

describe("GET /session", () => {
  it("returns 401 without a cookie", async () => {
    const app = new Hono();
    app.route("/", authRoutes);
    const res = await app.request("/session", {}, bindings() as any);
    expect(res.status).toBe(401);
    const body = (await res.json()) as { authenticated: boolean };
    expect(body.authenticated).toBe(false);
  });

  it("returns 401 with a tampered cookie", async () => {
    const app = new Hono();
    app.route("/", authRoutes);
    const res = await app.request(
      "/session",
      { headers: { Cookie: "nzc_session=garbage.value" } },
      bindings() as any,
    );
    expect(res.status).toBe(401);
    const body = (await res.json()) as { authenticated: boolean };
    expect(body.authenticated).toBe(false);
  });

  it("returns 200 with role and email for a valid admin session", async () => {
    const app = new Hono();
    app.route("/", authRoutes);
    const cookie = await createSessionCookie(
      { userId: "u1", role: "admin", email: "admin@netzero.local" },
      SECRET,
      true,
      3600,
      "Lax",
    );
    const raw = cookie.split(";")[0]; // "nzc_session=..."
    expect(raw.startsWith("nzc_session=")).toBe(true);
    const res = await app.request(
      "/session",
      { headers: { Cookie: raw } },
      bindings() as any,
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { authenticated: boolean; role: string; email: string };
    expect(body.authenticated).toBe(true);
    expect(body.role).toBe("admin");
    expect(body.email).toBe("admin@netzero.local");
  });
});
