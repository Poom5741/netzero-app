import { Hono } from "hono";
import { beforeEach, describe, expect, it } from "vitest";
import { createSignature, verifySignature } from "../../src/line/crypto";
import type { LineWebhookEvent } from "../../src/line/webhook";
import { createWebhookHandler } from "../../src/line/webhook";

const CHANNEL_SECRET = "test-secret-key-for-webhook";

describe("Line crypto", () => {
  it("creates valid HMAC-SHA256 signature", async () => {
    const body = '{"events":[]}';
    const sig = await createSignature(body, CHANNEL_SECRET);
    expect(sig).toMatch(/^[a-f0-9]{64}$/);
  });

  it("verifySignature accepts valid signature", async () => {
    const body = '{"events":[{"type":"follow"}]}';
    const sig = await createSignature(body, CHANNEL_SECRET);
    expect(await verifySignature(body, sig, CHANNEL_SECRET)).toBe(true);
  });

  it("verifySignature rejects invalid signature", async () => {
    const body = '{"events":[{"type":"follow"}]}';
    expect(await verifySignature(body, "bad-signature", CHANNEL_SECRET)).toBe(false);
  });

  it("verifySignature rejects tampered body", async () => {
    const body = '{"events":[{"type":"follow"}]}';
    const sig = await createSignature(body, CHANNEL_SECRET);
    expect(await verifySignature(`${body} `, sig, CHANNEL_SECRET)).toBe(false);
  });
});

describe("Webhook POST /line/webhook", () => {
  let app: Hono;

  beforeEach(() => {
    app = new Hono();
    app.post("/line/webhook", createWebhookHandler(CHANNEL_SECRET));
  });

  it("rejects request without X-Line-Signature header", async () => {
    const body = JSON.stringify({ events: [] });
    const res = await app.request("/line/webhook", {
      method: "POST",
      body,
      headers: { "Content-Type": "application/json" },
    });
    expect(res.status).toBe(401);
  });

  it("rejects request with invalid signature", async () => {
    const body = JSON.stringify({ events: [] });
    const res = await app.request("/line/webhook", {
      method: "POST",
      body,
      headers: {
        "Content-Type": "application/json",
        "X-Line-Signature": "invalid-sig",
      },
    });
    expect(res.status).toBe(401);
  });

  it("accepts valid signature with empty events", async () => {
    const body = JSON.stringify({ events: [] });
    const sig = await createSignature(body, CHANNEL_SECRET);
    const res = await app.request("/line/webhook", {
      method: "POST",
      body,
      headers: {
        "Content-Type": "application/json",
        "X-Line-Signature": sig,
      },
    });
    expect(res.status).toBe(200);
  });

  it("blocks replay of duplicate nonce", async () => {
    const event: LineWebhookEvent = {
      type: "follow",
      replyToken: "reply-1",
      source: { userId: "U123", type: "user" },
      timestamp: Date.now(),
      mode: "active",
    };
    const body = JSON.stringify({ events: [event] });
    const sig = await createSignature(body, CHANNEL_SECRET);

    const res1 = await app.request("/line/webhook", {
      method: "POST",
      body,
      headers: {
        "Content-Type": "application/json",
        "X-Line-Signature": sig,
      },
    });
    expect(res1.status).toBe(200);

    const res2 = await app.request("/line/webhook", {
      method: "POST",
      body,
      headers: {
        "Content-Type": "application/json",
        "X-Line-Signature": sig,
      },
    });
    expect(res2.status).toBe(200);
    const body2 = await res2.json<{ processed: number }>();
    expect(body2.processed).toBe(0);
  });

  it("echoes follow events", async () => {
    const event: LineWebhookEvent = {
      type: "follow",
      replyToken: "reply-1",
      source: { userId: "U123", type: "user" },
      timestamp: Date.now(),
      mode: "active",
    };
    const body = JSON.stringify({ events: [event] });
    const sig = await createSignature(body, CHANNEL_SECRET);

    const res = await app.request("/line/webhook", {
      method: "POST",
      body,
      headers: {
        "Content-Type": "application/json",
        "X-Line-Signature": sig,
      },
    });
    expect(res.status).toBe(200);
    const result = await res.json<{ processed: number }>();
    expect(result.processed).toBe(1);
  });
});
