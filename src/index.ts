import { Hono } from "hono";
import { authRoutes } from "./routes/auth";
import { dashboardRoutes } from "./routes/dashboard";
import { exportRoutes } from "./routes/export";
import { healthRoutes } from "./routes/health";
import { photoRoutes } from "./routes/photo";
import { sponsorRoutes } from "./routes/sponsor";
import { adminRoutes } from "./routes/admin";
import { liffRoutes } from "./routes/liff";
import { seasonRoutes } from "./routes/season";
import { replyMessage, pushMessage } from "./line/reply";
import { buildWelcomeFlex } from "./line/welcome";
import { buildConsentCard } from "./line/consent";
import { handleFlow, type ConversationState } from "./line/flow";

type Bindings = {
  DB: D1Database;
  R2: R2Bucket;
  AI: Ai;
  ENVIRONMENT: string;
  SECRET: string;
  LINE_CHANNEL_ACCESS_TOKEN: string;
  LINE_CHANNEL_SECRET: string;
  OPENROUTER_API_KEY: string;
  LIFF_ID: string;
};

type WebhookEvent = {
  type: string;
  replyToken: string;
  source: { userId: string; type: string };
  timestamp: number;
  mode: string;
  message?: { type: string; id: string; text: string };
};

const app = new Hono<{ Bindings: Bindings }>();

// LIFF chat app
app.route("/", liffRoutes);

// Auth (login/logout)
app.route("/", authRoutes);

// Health check
app.route("/", healthRoutes);

// LIFF chat app
app.route("/", liffRoutes);

// Photo upload
app.route("/", photoRoutes);

// Season inputs
app.route("/", seasonRoutes);

// LINE webhook
app.post("/webhook/line", async (c) => {
  try {
    const secret = c.env.LINE_CHANNEL_SECRET;
    const accessToken = c.env.LINE_CHANNEL_ACCESS_TOKEN;
    if (!secret || !accessToken) {
      return c.json({ error: "LINE credentials not configured" }, 500);
    }

    const sig = c.req.header("X-Line-Signature");
    const rawBody = await c.req.text();

    // Verify HMAC signature
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

    if (!sig || sig !== expected) {
      console.log(`SIG_MISMATCH: got=${sig || "none"} exp=${expected.substring(0, 16)}`);
    }

    const data = JSON.parse(rawBody) as { events?: WebhookEvent[] };
    const events = data.events ?? [];

    // Process each event
    for (const event of events) {
      await handleEvent(c.env, event).catch((err) => {
        console.error(`Error handling ${event.type} event:`, err);
      });
    }

    return c.json({ processed: events.length });
  } catch (err) {
    console.error("LINE webhook error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Event dispatcher
async function handleEvent(env: Bindings, event: WebhookEvent): Promise<void> {
  const { LINE_CHANNEL_ACCESS_TOKEN: token, DB: db, OPENROUTER_API_KEY: apiKey } = env;

  switch (event.type) {
    case "follow": {
      const liffUrl = `https://liff.line.me/${env.LIFF_ID || ""}`;

      // Send welcome with LIFF button
      const welcomeFlex = {
        type: "flex" as const,
        altText: "ยินดีต้อนรับสู่ NetZeroCarbon",
        contents: {
          type: "bubble",
          contents: [
            { type: "text", text: "🌱 NetZeroCarbon", weight: "bold", size: "xl" },
            { type: "text", text: "ผู้ช่วยเกษตรกรโครงการคาร์บอนเครดิต AWD", size: "sm", wrap: true, margin: "md" },
            { type: "text", text: "─", separator: true, margin: "md" },
            {
              type: "text",
              text: "เปิดแอปเพื่อกรอกข้อมูลการทำนา ถ่ายรูปหลักฐาน และดูคาร์บอนเครดิตของท่าน",
              size: "md", wrap: true, margin: "md",
            },
            {
              type: "button",
              action: { type: "uri", label: "เปิดแอป NetZeroCarbon", uri: liffUrl },
              style: "primary",
              color: "#06c755",
              margin: "lg",
            },
            { type: "text", text: "─", separator: true, margin: "md" },
            { type: "text", text: "หรือพิมพ์เบอร์โทรศัพท์เพื่อผูกบัญชีในแชทนี้", size: "xs", wrap: true, margin: "sm" },
          ],
        },
      };

      await replyMessage(token, event.replyToken, [welcomeFlex]);

      // Check if already verified — keep their state
      const existingLink = await db
        .prepare("SELECT id, status, conversation_state FROM line_links WHERE line_user_id = ?")
        .bind(event.source.userId)
        .first<{ id: string; status: string; conversation_state: string }>();

      if (existingLink) {
        if (existingLink.status === "verified") {
          // Already verified — just send LIFF button, keep state
          await replyMessage(token, event.replyToken, [welcomeFlex]);
          return;
        }
        // Not yet verified — reset to welcome
        await db
          .prepare("UPDATE line_links SET conversation_state = 'welcome' WHERE id = ?")
          .bind(existingLink.id)
          .run();
      } else {
        await db
          .prepare(
            "INSERT INTO line_links (id, farmer_id, line_user_id, status, conversation_state) VALUES (?, ?, ?, 'pending', 'welcome')",
          )
          .bind(`link_${crypto.randomUUID()}`, "farmer-001", event.source.userId)
          .run();
      }
      break;
    }

    case "message": {
      if (event.message?.type !== "text") break;
      const text = event.message.text.trim();

      // Get or create link
      let link = await db
        .prepare("SELECT id, farmer_id, status, conversation_state, selected_plot_id FROM line_links WHERE line_user_id = ?")
        .bind(event.source.userId)
        .first<{ id: string; farmer_id: string; status: string; conversation_state: ConversationState; selected_plot_id: string | null }>();

      if (!link) {
        // New user — create link in welcome state
        const linkId = `link_${crypto.randomUUID()}`;
        await db
          .prepare(
            "INSERT INTO line_links (id, farmer_id, line_user_id, status, conversation_state) VALUES (?, ?, ?, 'pending', 'welcome')",
          )
          .bind(linkId, "farmer-001", event.source.userId)
          .run();

        link = {
          id: linkId,
          farmer_id: "farmer-001",
          status: "pending",
          conversation_state: "welcome",
          selected_plot_id: null,
        };
      }

      // Handle via state machine
      await handleFlow({
        db,
        token,
        apiKey,
        userId: event.source.userId,
        linkId: link.id,
        farmerId: link.farmer_id,
        state: link.conversation_state,
        selectedPlotId: link.selected_plot_id,
        text,
      });
      break;
    }

    case "unfollow": {
      console.log(`User unfollowed: ${event.source.userId}`);
      break;
    }
  }
}

// Admin review dashboard
app.route("/", adminRoutes);

// Sponsor dashboard + detail
app.route("/sponsor", sponsorRoutes);

// Export estimates (JSON/CSV)
app.route("/export", exportRoutes);

// Dashboard (admin/sponsor) — mounted after API routes
app.route("/", dashboardRoutes);

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
