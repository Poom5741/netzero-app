import { Hono } from "hono";
import { createWebhookHandler } from "../line/webhook";

type Bindings = {
  DB: D1Database;
  R2: R2Bucket;
  ENVIRONMENT: string;
  LINE_CHANNEL_ACCESS_TOKEN: string;
  LINE_CHANNEL_SECRET: string;
};

export const lineRoutes = new Hono<{ Bindings: Bindings }>();

lineRoutes.post("/webhook/line", async (c) => {
  const secret = c.env.LINE_CHANNEL_SECRET;
  if (!secret) return c.json({ error: "LINE_CHANNEL_SECRET not configured" }, 500);
  const handler = createWebhookHandler(secret);
  return handler(c);
});
