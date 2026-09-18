import { Hono } from "hono";
import { describe, expect, it } from "vitest";
import { liffRoutes } from "../../src/routes/liff";

/**
 * Tests for LIFF registration form route.
 * Verifies the /register endpoint returns the registration form HTML.
 */

function mockBindings() {
  return {
    DB: {
      prepare: () => ({
        bind: () => ({
          run: async () => ({ success: true }),
          first: async () => null,
          all: async () => ({ results: [] }),
        }),
      }),
    },
    R2: {},
    AI: {},
    ENVIRONMENT: "test",
    SECRET: "",
    LINE_CHANNEL_ACCESS_TOKEN: "",
    LINE_CHANNEL_SECRET: "",
    OPENROUTER_API_KEY: "",
    LIFF_ID: "",
  };
}

describe("LIFF Register Route", () => {
  it("GET /register returns 200 with registration form HTML", async () => {
    const app = new Hono();
    app.route("/", liffRoutes);

    const res = await app.request("/register", {}, mockBindings() as any);

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/html");

    const html = await res.text();
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("สมัครเข้าร่วมโครงการ");
    expect(html).toContain('id="full_name"');
    expect(html).toContain('id="gender"');
    expect(html).toContain('id="phone"');
    expect(html).toContain('id="national_id"');
    expect(html).toContain('id="addr_province"');
    expect(html).toContain('id="deed_no"');
    expect(html).toContain('id="deed_type"');
    expect(html).toContain('id="holding_status"');
    expect(html).toContain('id="area_rai"');
    expect(html).toContain("/liff/api/register");
  });

  it("Registration form includes LIFF SDK", async () => {
    const app = new Hono();
    app.route("/", liffRoutes);

    const res = await app.request("/register", {}, mockBindings() as any);
    const html = await res.text();

    expect(html).toContain("https://static.line-scdn.net/liff/edge/2/sdk.js");
    expect(html).toContain("liff.init");
  });

  it("Registration form submits to /liff/api/register", async () => {
    const app = new Hono();
    app.route("/", liffRoutes);

    const res = await app.request("/register", {}, mockBindings() as any);
    const html = await res.text();

    expect(html).toContain("/liff/api/register");
  });
});
