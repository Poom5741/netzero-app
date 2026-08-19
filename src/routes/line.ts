import { Hono } from "hono";

type Bindings = {
  DB: D1Database;
  R2: R2Bucket;
  ENVIRONMENT: string;
  LINE_CHANNEL_ACCESS_TOKEN: string;
  LINE_CHANNEL_SECRET: string;
};

async function computeHmac(secret: string, body: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export const lineRoutes = new Hono<{ Bindings: Bindings }>();

lineRoutes.get("/webhook/debug", (c) => {
  const secret = c.env.LINE_CHANNEL_SECRET;
  return c.json({ hasSecret: !!secret, secretLen: secret?.length || 0 });
});

// Test HMAC computation endpoint
lineRoutes.post("/webhook/test-hmac", async (c) => {
  try {
    const secret = c.env.LINE_CHANNEL_SECRET;
    const body = await c.req.text();
    const computed = await computeHmac(secret, body);
    return c.json({ computed, bodyLen: body.length });
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});

lineRoutes.post("/webhook/line", async (c) => {
  try {
    const secret = c.env.LINE_CHANNEL_SECRET;
    if (!secret) return c.json({ error: "no secret" }, 500);

    const sig = c.req.header("X-Line-Signature");
    const rawBody = await c.req.text();
    const expected = await computeHmac(secret, rawBody);

    console.log(`sig=${sig} expected=${expected} match=${sig === expected}`);

    if (!sig) return c.json({ error: "Missing signature" }, 401);
    if (sig !== expected) return c.json({ error: "Invalid signature" }, 401);

    const data = JSON.parse(rawBody) as { events?: Array<{
      type: string;
      replyToken: string;
      source: { userId: string; type: string };
      timestamp: number;
      mode: string;
    }> };

    return c.json({ processed: (data.events ?? []).length });
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});
