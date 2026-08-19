import { Hono } from "hono";

type Bindings = {
  DB: D1Database;
  R2: R2Bucket;
  ENVIRONMENT: string;
  LINE_CHANNEL_ACCESS_TOKEN: string;
  LINE_CHANNEL_SECRET: string;
};

async function verifySignature(body: string, signature: string, secret: string): Promise<boolean> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  const expected = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return expected === signature;
}

export const lineRoutes = new Hono<{ Bindings: Bindings }>();

lineRoutes.post("/webhook/line", async (c) => {
  try {
    const secret = c.env.LINE_CHANNEL_SECRET;
    if (!secret) return c.json({ error: "LINE_CHANNEL_SECRET not configured" }, 500);

    const sig = c.req.header("X-Line-Signature");
    const rawBody = await c.req.text();

    console.log("LINE webhook", { hasSig: !!sig, bodyLen: rawBody.length });

    if (!sig) return c.json({ error: "Missing signature" }, 401);

    if (!(await verifySignature(rawBody, sig, secret))) {
      console.log("Signature mismatch");
      return c.json({ error: "Invalid signature" }, 401);
    }

    const data = JSON.parse(rawBody) as { events?: Array<{
      type: string;
      replyToken: string;
      source: { userId: string; type: string };
      timestamp: number;
      mode: string;
    }> };

    const events = data.events ?? [];
    console.log(`Processed ${events.length} event(s)`);

    return c.json({ processed: events.length });
  } catch (err) {
    console.error("Webhook error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});
