import { Hono } from "hono";
import { describe, expect, it } from "vitest";
import { cfAccessGuard } from "../../src/middleware/cf-access";

function testApp(requireAccess = false) {
  const app = new Hono();
  app.use("*", cfAccessGuard(requireAccess));
  app.get("/protected", (c) => c.json({ ok: true }));
  return app;
}

describe("cfAccessGuard middleware", () => {
  it("passes with valid Cloudflare Access email", async () => {
    const app = testApp();
    const res = await app.request("/protected", {
      headers: { "Cf-Access-Authenticated-User-Email": "poom@charoenyost.com" },
    });
    expect(res.status).toBe(200);
  });

  it("falls through without Access header (requireAccess=false)", async () => {
    const app = testApp(false);
    const res = await app.request("/protected");
    expect(res.status).toBe(200);
  });

  it("rejects without Access header (requireAccess=true)", async () => {
    const app = testApp(true);
    const res = await app.request("/protected");
    expect(res.status).toBe(403);
  });

  it("rejects unknown email (requireAccess=true)", async () => {
    const app = testApp(true);
    const res = await app.request("/protected", {
      headers: { "Cf-Access-Authenticated-User-Email": "stranger@evil.com" },
    });
    expect(res.status).toBe(403);
  });
});
