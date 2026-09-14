import { Hono } from "hono";
import { describe, expect, it } from "vitest";
import { requireRole } from "../../src/auth/middleware";
import { createSessionCookie } from "../../src/auth/session";

const SECRET = "test-secret";

function appWithRole(requiredRole: string) {
  const app = new Hono();
  app.use("*", requireRole(requiredRole, SECRET));
  app.get("/protected", (c) => {
    const sess = (c as unknown as { var: { session?: Record<string, unknown> } }).var.session;
    return c.json({ ok: true, role: sess?.role });
  });
  return app;
}

function cookieHeader(session: string) {
  const raw = session.split(";")[0]?.split("=").slice(1).join("=") ?? "";
  return { Cookie: `nzc_session=${raw}` };
}

describe("requireRole middleware", () => {
  it("allows request with matching role", async () => {
    const app = appWithRole("admin");
    const cookie = await createSessionCookie(
      { userId: "u1", role: "admin", email: "a@test.com" },
      SECRET,
    );
    const res = await app.request("/protected", { headers: cookieHeader(cookie) });
    expect(res.status).toBe(200);
    const body = await res.json<{ ok: boolean; role: string }>();
    expect(body.ok).toBe(true);
    expect(body.role).toBe("admin");
  });

  it("blocks request with wrong role", async () => {
    const app = appWithRole("admin");
    const cookie = await createSessionCookie(
      { userId: "u1", role: "sponsor", email: "s@test.com" },
      SECRET,
    );
    const res = await app.request("/protected", { headers: cookieHeader(cookie) });
    expect(res.status).toBe(403);
  });

  it("blocks request with no session cookie", async () => {
    const app = appWithRole("admin");
    const res = await app.request("/protected");
    expect(res.status).toBe(401);
  });

  it("blocks request with tampered cookie", async () => {
    const app = appWithRole("admin");
    const cookie = await createSessionCookie(
      { userId: "u1", role: "admin", email: "a@test.com" },
      SECRET,
    );
    const raw = cookie.split(";")[0]?.split("=").slice(1).join(".");
    const tampered = `nzc_session=${raw}.extra`;
    const res = await app.request("/protected", { headers: { Cookie: tampered } });
    expect(res.status).toBe(401);
  });

  it("stores session data in context", async () => {
    const app = appWithRole("admin");
    const cookie = await createSessionCookie(
      { userId: "u1", role: "admin", email: "a@test.com" },
      SECRET,
    );
    const res = await app.request("/protected", { headers: cookieHeader(cookie) });
    const body = await res.json<{ ok: boolean; role: string }>();
    expect(body.ok).toBe(true);
  });

  // H4: multi-role array support
  it("allows any role in the allowed array", async () => {
    const app = new Hono();
    app.use("*", requireRole(["admin", "sponsor", "field_agent"], SECRET));
    app.get("/protected", (c) => c.json({ ok: true }));

    const adminCookie = await createSessionCookie(
      { userId: "u1", role: "admin", email: "a@test.com" },
      SECRET,
    );
    const sponsorCookie = await createSessionCookie(
      { userId: "u2", role: "sponsor", email: "s@test.com" },
      SECRET,
    );
    const agentCookie = await createSessionCookie(
      { userId: "u3", role: "field_agent", email: "f@test.com" },
      SECRET,
    );

    const res1 = await app.request("/protected", { headers: cookieHeader(adminCookie) });
    const res2 = await app.request("/protected", { headers: cookieHeader(sponsorCookie) });
    const res3 = await app.request("/protected", { headers: cookieHeader(agentCookie) });

    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);
    expect(res3.status).toBe(200);
  });

  it("blocks role not in the allowed array", async () => {
    const app = new Hono();
    app.use("*", requireRole(["admin", "sponsor"], SECRET));
    app.get("/protected", (c) => c.json({ ok: true }));

    const auditorCookie = await createSessionCookie(
      { userId: "u1", role: "auditor", email: "aud@test.com" },
      SECRET,
    );
    const res = await app.request("/protected", { headers: cookieHeader(auditorCookie) });
    expect(res.status).toBe(403);
  });

  it("single string role still works (backward-compat)", async () => {
    const app = appWithRole("admin");
    const cookie = await createSessionCookie(
      { userId: "u1", role: "admin", email: "a@test.com" },
      SECRET,
    );
    const res = await app.request("/protected", { headers: cookieHeader(cookie) });
    expect(res.status).toBe(200);
  });
});
