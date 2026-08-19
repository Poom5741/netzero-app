import { Hono } from "hono";
import { exportRoutes } from "./routes/export";
import { healthRoutes } from "./routes/health";
import { photoRoutes } from "./routes/photo";
import { sponsorRoutes } from "./routes/sponsor";

type Bindings = {
  DB: D1Database;
  R2: R2Bucket;
  ENVIRONMENT: string;
  LINE_CHANNEL_ACCESS_TOKEN: string;
  LINE_CHANNEL_SECRET: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Health check
app.route("/", healthRoutes);

// Photo upload
app.route("/", photoRoutes);

// LINE webhook — direct handler to avoid routing conflicts
app.post("/webhook/line", async (c) => {
  try {
    const secret = c.env.LINE_CHANNEL_SECRET;
    if (!secret) return c.json({ error: "LINE_CHANNEL_SECRET not configured" }, 500);

    const sig = c.req.header("X-Line-Signature");
    const rawBody = await c.req.text();

    // Compute HMAC using Web Crypto API
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const hmacSig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(rawBody));
    const expected = Array.from(new Uint8Array(hmacSig))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    console.log(JSON.stringify({
      received: sig?.substring(0, 16) + "...",
      expected: expected.substring(0, 16) + "...",
      match: sig === expected,
      bodyLen: rawBody.length,
    }));

    if (!sig) return c.json({ error: "Missing signature" }, 401);
    if (sig !== expected) return c.json({ error: "Invalid signature" }, 401);

    const data = JSON.parse(rawBody) as { events?: Array<{
      type: string;
      replyToken: string;
      source: { userId: string; type: string };
      timestamp: number;
    }> };

    return c.json({ processed: (data.events ?? []).length });
  } catch (err) {
    console.error("LINE webhook error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Sponsor dashboard + detail
app.route("/sponsor", sponsorRoutes);

// Export estimates (JSON/CSV)
app.route("/export", exportRoutes);

// 404 handler
app.notFound((c) => {
  return c.json({ error: "Not found" }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error("Unhandled error:", err);
  return c.json({ error: "Internal server error" }, 500);
});

export default app;
