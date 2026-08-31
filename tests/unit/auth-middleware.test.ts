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

async function cookieHeader(cookie: string) {
  const raw = cookie.split(";")[0]?.split("=").slice(1).join("=") ?? "";
  return { Cookie: `nzc_session=${raw}` };
}

describe("requireRole middleware", () => {
  it("allows request with matching role", async () => {
    const app = appWithRole("admin");
    const cookie = await createSessionCookie(
      { userId: "u1", role: "admin", email: "a@test.com" },
      SECRET,
    );
    const res = await app.request("/protected", { headers: await cookieHeader(cookie) });
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
    const res = await app.request("/protected", { headers: await cookieHeader(cookie) });
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
    const res = await app.request("/protected", { headers: await cookieHeader(cookie) });
    const body = await res.json<{ ok: boolean; role: string }>();
    expect(body.ok).toBe(true);
  });
});
