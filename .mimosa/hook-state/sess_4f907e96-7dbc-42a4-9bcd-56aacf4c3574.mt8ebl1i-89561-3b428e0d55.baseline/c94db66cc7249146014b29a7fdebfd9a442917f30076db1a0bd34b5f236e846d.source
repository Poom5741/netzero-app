import type { Context } from "hono";
import { verifySignature } from "./crypto";

export type LineWebhookEvent = {
  type: string;
  replyToken: string;
  source: { userId: string; type: string };
  timestamp: number;
  mode: string;
};

export function createWebhookHandler(secret: string) {
  const seen = new Set<string>();

  return async (c: Context) => {
    const sig = c.req.header("X-Line-Signature");
    if (!sig) return c.json({ error: "Missing signature" }, 401);

    const rawBody = await c.req.text();
    if (!verifySignature(rawBody, sig, secret)) {
      return c.json({ error: "Invalid signature" }, 401);
    }

    const data = JSON.parse(rawBody) as { events?: LineWebhookEvent[] };
    const events = data.events ?? [];

    let processed = 0;
    for (const event of events) {
      if (seen.has(event.replyToken)) continue;
      seen.add(event.replyToken);
      processed++;
    }

    return c.json({ processed });
  };
}
