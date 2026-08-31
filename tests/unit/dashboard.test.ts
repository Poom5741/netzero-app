import { Hono } from "hono";
import { describe, expect, it } from "vitest";
import { createSessionCookie } from "../../src/auth/session";
import { dashboardRoutes } from "../../src/routes/dashboard";

const SECRET = "test-dashboard-secret";

function makeApp() {
  const app = new Hono();
  app.route("/", dashboardRoutes);
  return app;
}

async function cookieHeader(role: "admin" | "sponsor") {
  const cookie = await createSessionCookie({ userId: "u1", role, email: `${role}@test.com` }, SECRET);
  const raw = cookie.split(";")[0]?.split("=").slice(1).join("=") ?? "";
  return { Cookie: `nzc_session=${raw}` };
}

describe("GET /admin", () => {
  it("returns 200 with admin dashboard HTML for admin session", async () => {
    const app = makeApp();
    const res = await app.request("/admin", { headers: await cookieHeader("admin") }, {
      SECRET,
    } as never);
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain("Admin Dashboard");
  });

  it("blocks unauthenticated requests", async () => {
    const app = makeApp();
    const res = await app.request("/admin", {}, { SECRET } as never);
    expect(res.status).toBe(401);
  });

  it("blocks non-admin users", async () => {
    const app = makeApp();
    const res = await app.request("/admin", { headers: await cookieHeader("sponsor") }, {
      SECRET,
    } as never);
    expect(res.status).toBe(403);
  });
});

describe("GET /sponsor (dashboard HTML)", () => {
  it("returns 200 with sponsor dashboard HTML for sponsor session", async () => {
    const app = makeApp();
    const res = await app.request("/sponsor", { headers: await cookieHeader("sponsor") }, {
      SECRET,
    } as never);
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain("Sponsor Dashboard");
  });

  it("blocks unauthenticated requests", async () => {
    const app = makeApp();
    const res = await app.request("/sponsor", {}, { SECRET } as never);
    expect(res.status).toBe(401);
  });

  it("blocks non-sponsor users", async () => {
    const app = makeApp();
    const res = await app.request("/sponsor", { headers: await cookieHeader("admin") }, {
      SECRET,
    } as never);
    expect(res.status).toBe(403);
  });
});
