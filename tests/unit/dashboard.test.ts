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
  const cookie = await createSessionCookie(
    { userId: "u1", role, email: `${role}@test.com` },
    SECRET,
  );
  const raw = cookie.split(";")[0]?.split("=").slice(1).join("=") ?? "";
  return { Cookie: `nzc_session=${raw}` };
}

describe("GET /admin", () => {
  it("redirects an admin session to the frontend admin console", async () => {
    const app = makeApp();
    const res = await app.request("/admin", { headers: await cookieHeader("admin") }, {
      SECRET,
    } as never);
    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe("https://netzero-frontend.poom-a1d.workers.dev/admin");
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

describe("GET /sponsor", () => {
  it("redirects a sponsor session to the frontend sponsor dashboard", async () => {
    const app = makeApp();
    const res = await app.request("/sponsor", { headers: await cookieHeader("sponsor") }, {
      SECRET,
    } as never);
    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe(
      "https://netzero-frontend.poom-a1d.workers.dev/sponsor",
    );
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
