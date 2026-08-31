import { Hono } from "hono";
import { describe, expect, it } from "vitest";
import { createSessionCookie } from "../../src/auth/session";
import { hashPassword } from "../../src/auth/password";
import { authRoutes } from "../../src/routes/auth";

const SECRET = "test-auth-secret";

function makeApp() {
  const app = new Hono();
  app.route("/", authRoutes);
  return app;
}

function mockDB(user: { id: string; email: string; password_hash: string; role: string } | null) {
  return {
    prepare: () => ({
      bind: () => ({
        first: async () => user,
      }),
    }),
  } as never;
}

describe("POST /login", () => {
  it("returns 400 for missing credentials", async () => {
    const app = makeApp();
    const res = await app.request("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    }, { SECRET, DB: mockDB(null) } as never);
    expect(res.status).toBe(400);
  });

  it("returns 401 for unknown user", async () => {
    const app = makeApp();
    const res = await app.request("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "nobody@test.com", password: "x" }),
    }, { SECRET, DB: mockDB(null) } as never);
    expect(res.status).toBe(401);
  });

  it("returns JSON with email and role on success", async () => {
    const hash = await hashPassword("pass123");
    const app = makeApp();
    const res = await app.request("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@test.com", password: "pass123" }),
    }, { SECRET, DB: mockDB({ id: "u1", email: "admin@test.com", password_hash: hash, role: "admin" }) } as never);
    expect(res.status).toBe(200);
    const body = await res.json<{ email: string; role: string }>();
    expect(body.email).toBe("admin@test.com");
    expect(body.role).toBe("admin");
    const setCookie = res.headers.get("Set-Cookie") ?? "";
    expect(setCookie).toContain("nzc_session=");
    expect(setCookie).toContain("HttpOnly");
  });
});

describe("GET /me", () => {
  it("returns 401 without cookie", async () => {
    const app = makeApp();
    const res = await app.request("/me", {}, { SECRET } as never);
    expect(res.status).toBe(401);
  });

  it("returns session data with valid cookie", async () => {
    const app = makeApp();
    const cookie = await createSessionCookie(
      { userId: "u1", role: "admin", email: "admin@test.com" },
      SECRET,
    );
    const raw = cookie.split(";")[0]?.split("=").slice(1).join("=") ?? "";
    const res = await app.request("/me", { headers: { Cookie: `nzc_session=${raw}` } }, { SECRET } as never);
    expect(res.status).toBe(200);
    const body = await res.json<{ email: string; role: string }>();
    expect(body.email).toBe("admin@test.com");
    expect(body.role).toBe("admin");
  });
});

describe("POST /logout", () => {
  it("clears the session cookie", async () => {
    const app = makeApp();
    const res = await app.request("/logout", { method: "POST" });
    expect(res.status).toBe(200);
    const setCookie = res.headers.get("Set-Cookie") ?? "";
    expect(setCookie).toContain("nzc_session=;");
    expect(setCookie).toContain("Max-Age=0");
  });
});
