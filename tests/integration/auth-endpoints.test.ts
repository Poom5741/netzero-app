import { describe, expect, it } from "vitest";
import { createTestApp, makeSessionCookie, seedUser } from "../helpers/integration";
import { hashPassword } from "../../src/auth/password";

describe("auth: /me endpoint", () => {
  it("returns 401 without a session cookie", async () => {
    const { app } = await createTestApp();
    const res = await app.request("/me");
    expect(res.status).toBe(401);
    const body = await res.json() as { email: string; role: string; error?: string };
    expect(body.error).toBe("Unauthorized");
  });

  it("returns 401 with an invalid session cookie", async () => {
    const { app } = await createTestApp();
    const res = await app.request("/me", {
      headers: { Cookie: "nzc_session=garbage.value" },
    });
    expect(res.status).toBe(401);
  });

  it("returns email and role for valid admin session", async () => {
    const { app } = await createTestApp();
    const cookie = await makeSessionCookie("admin");
    const res = await app.request("/me", {
      headers: { Cookie: cookie },
    });
    expect(res.status).toBe(200);
    const body = await res.json() as { email: string; role: string; error?: string };
    expect(body.email).toBe("admin@test.com");
    expect(body.role).toBe("admin");
  });

  it("returns email and role for valid sponsor session", async () => {
    const { app } = await createTestApp();
    const cookie = await makeSessionCookie("sponsor");
    const res = await app.request("/me", {
      headers: { Cookie: cookie },
    });
    expect(res.status).toBe(200);
    const body = await res.json() as { email: string; role: string; error?: string };
    expect(body.email).toBe("sponsor@test.com");
    expect(body.role).toBe("sponsor");
  });
});

describe("auth: sponsor route role check", () => {
  it("returns 401 for unauthenticated request to /sponsor", async () => {
    const { app } = await createTestApp();
    const res = await app.request("/sponsor");
    expect(res.status).toBe(401);
  });

  it("returns 200 for admin role on /sponsor", async () => {
    const { app } = await createTestApp();
    const cookie = await makeSessionCookie("admin");
    const res = await app.request("/sponsor", {
      headers: { Cookie: cookie },
    });
    // 200 because admin is allowed on sponsor routes
    expect(res.status).toBe(200);
  });

  it("returns 200 for sponsor role on /sponsor", async () => {
    const { app } = await createTestApp();
    const cookie = await makeSessionCookie("sponsor");
    const res = await app.request("/sponsor", {
      headers: { Cookie: cookie },
    });
    expect(res.status).toBe(200);
  });

  it("returns 401 for invalid cookie on /sponsor", async () => {
    const { app } = await createTestApp();
    const res = await app.request("/sponsor", {
      headers: { Cookie: "nzc_session=bad.sig" },
    });
    expect(res.status).toBe(401);
  });
});

describe("auth: POST /login", () => {
  it("returns 400 for missing credentials", async () => {
    const { app } = await createTestApp();
    const res = await app.request("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
  });

  it("returns 401 for wrong password", async () => {
    const { app, db } = await createTestApp();
    const hash = await hashPassword("correct-password");
    await seedUser(db, { id: "u1", email: "test@test.com", password_hash: hash, role: "admin" });

    const res = await app.request("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@test.com", password: "wrong" }),
    });
    expect(res.status).toBe(401);
  });

  it("returns session cookie and role on successful login", async () => {
    const { app, db } = await createTestApp();
    const hash = await hashPassword("mypass");
    await seedUser(db, { id: "u2", email: "admin@x.com", password_hash: hash, role: "admin" });

    const res = await app.request("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@x.com", password: "mypass" }),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as { email: string; role: string; error?: string };
    expect(body.email).toBe("admin@x.com");
    expect(body.role).toBe("admin");
    const setCookie = res.headers.get("Set-Cookie") ?? "";
    expect(setCookie).toContain("nzc_session=");
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain("Max-Age=");
  });
});

describe("auth: POST /logout", () => {
  it("clears the session cookie", async () => {
    const { app } = await createTestApp();
    const res = await app.request("/logout", { method: "POST" });
    expect(res.status).toBe(200);
    const setCookie = res.headers.get("Set-Cookie") ?? "";
    expect(setCookie).toContain("Max-Age=0");
  });
});
