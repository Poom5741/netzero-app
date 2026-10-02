import { describe, expect, it } from "vitest";
import app from "../../src/index";

/**
 * D3 regression tests: POST /webhook/line must verify LINE's
 * X-Line-Signature (Base64 HMAC-SHA256 of the raw body) on every delivery.
 * The pre-fix handler verified only when the header was present, so unsigned
 * requests were fully processed.
 */

const CHANNEL_SECRET = "test-webhook-secret";

async function signLine(body: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return btoa(String.fromCharCode(...new Uint8Array(mac)));
}

function bindings(overrides: Record<string, unknown> = {}) {
  return {
    DB: {
      prepare: () => {
        throw new Error("rejected requests must not touch the database");
      },
    },
    R2: {},
    AI: {},
    ENVIRONMENT: "test",
    SECRET: "",
    LINE_CHANNEL_ACCESS_TOKEN: "test-token",
    LINE_CHANNEL_SECRET: CHANNEL_SECRET,
    OPENROUTER_API_KEY: "",
    LIFF_ID: "",
    APP_URL: "",
    ...overrides,
  };
}

const EVENTS_BODY = JSON.stringify({ events: [] });

describe("POST /webhook/line signature enforcement (D3)", () => {
  it("rejects an unsigned delivery with 401", async () => {
    const res = await app.request(
      "/webhook/line",
      {
        method: "POST",
        body: EVENTS_BODY,
        headers: { "Content-Type": "application/json" },
      },
      bindings(),
    );

    expect(res.status).toBe(401);
    const body = await res.json<{ error: string }>();
    expect(body.error).toBe("Missing signature");
  });

  it("rejects a wrong signature with 401", async () => {
    const res = await app.request(
      "/webhook/line",
      {
        method: "POST",
        body: EVENTS_BODY,
        headers: {
          "Content-Type": "application/json",
          "X-Line-Signature": "bogus-signature",
        },
      },
      bindings(),
    );

    expect(res.status).toBe(401);
    const body = await res.json<{ error: string }>();
    expect(body.error).toBe("Invalid signature");
  });

  it("fails closed with 500 when LINE_CHANNEL_SECRET is unset", async () => {
    const sig = await signLine(EVENTS_BODY, CHANNEL_SECRET);
    const res = await app.request(
      "/webhook/line",
      {
        method: "POST",
        body: EVENTS_BODY,
        headers: { "Content-Type": "application/json", "X-Line-Signature": sig },
      },
      bindings({ LINE_CHANNEL_SECRET: "" }),
    );

    expect(res.status).toBe(500);
  });

  it("accepts a correctly signed delivery", async () => {
    const sig = await signLine(EVENTS_BODY, CHANNEL_SECRET);
    const res = await app.request(
      "/webhook/line",
      {
        method: "POST",
        body: EVENTS_BODY,
        headers: { "Content-Type": "application/json", "X-Line-Signature": sig },
      },
      bindings(),
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ processed: 0 });
  });
});
