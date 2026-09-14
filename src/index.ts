import { Hono } from "hono";
import { cors } from "hono/cors";
import { authRoutes } from "./routes/auth";
import { dashboardRoutes } from "./routes/dashboard";
import { exportRoutes } from "./routes/export";
import { healthRoutes } from "./routes/health";
import { photoRoutes } from "./routes/photo";
import { sponsorRoutes } from "./routes/sponsor";
import { adminRoutes } from "./routes/admin";
import { liffRoutes } from "./routes/liff";
import { seasonRoutes } from "./routes/season";
import { farmerRoutes } from "./routes/farmer";
import { replyMessage, pushMessage } from "./line/reply";
import { buildWelcomeFlex } from "./line/welcome";
import { buildConsentCard } from "./line/consent";
import { handleFlow, type ConversationState } from "./line/flow";

type Bindings = {
  DB: D1Database;
  R2: R2Bucket;
  AI: Ai;
  ENVIRONMENT: string;
  LINE_WEBHOOK_ENABLED?: string;
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
  postback?: { data: string; displayText?: string };
};

const app = new Hono<{ Bindings: Bindings }>();

// Allow the deployed LIFF frontend (and local dev on :3000) to call the API
app.use("*", cors({
  origin: ["https://netzero-frontend.poom-a1d.workers.dev", "https://netzero-frontend.pages.dev", "http://localhost:3000"],
  allowMethods: ["GET", "POST", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

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

// Require admin auth for season write endpoints
app.use("/api/season", async (c, next) => {
  if (c.req.method === "POST") {
    const cookie = c.req.header("Cookie") ?? "";
    const match = cookie.match(/nzc_session=([^;]+)/);
    if (!match) return c.json({ error: "Unauthorized" }, 401);
    const { parseSessionCookie } = await import("./auth/session");
    const session = await parseSessionCookie(match[1], c.env.SECRET);
    if (!session || session.role !== "admin") return c.json({ error: "Forbidden" }, 403);
  }
  await next();
});
app.use("/api/season/approve", async (c, next) => {
  if (c.req.method === "POST") {
    const cookie = c.req.header("Cookie") ?? "";
    const match = cookie.match(/nzc_session=([^;]+)/);
    if (!match) return c.json({ error: "Unauthorized" }, 401);
    const { parseSessionCookie } = await import("./auth/session");
    const session = await parseSessionCookie(match[1], c.env.SECRET);
    if (!session || session.role !== "admin") return c.json({ error: "Forbidden" }, 403);
  }
  await next();
});

// Season inputs
app.route("/", seasonRoutes);

// Farmer & Plot onboarding
app.route("/", farmerRoutes);

// LINE webhook — GET handler for verification (LINE sends GET to check endpoint)
app.get("/webhook/line", (c) => {
  return c.json({ status: "ok" }, 200);
});

// LINE webhook — POST handler for events and verification
app.post("/webhook/line", async (c) => {
  try {
    const rawBody = await c.req.text();
    const sig = c.req.header("X-Line-Signature");

    // Always accept the request (LINE verification + real events)
    // Verify signature if present
    if (sig) {
      const secret = c.env.LINE_CHANNEL_SECRET;
      if (secret) {
        const key = await crypto.subtle.importKey(
          "raw",
          new TextEncoder().encode(secret),
          { name: "HMAC", hash: "SHA-256" },
          false,
          ["sign"],
        );
        const hmacSig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(rawBody));
        // LINE's X-Line-Signature is Base64-encoded HMAC-SHA256 (not hex)
        const macBytes = new Uint8Array(hmacSig);
        let expected = "";
        for (const b of macBytes) expected += String.fromCharCode(b);
        expected = btoa(expected);

        if (sig !== expected) {
          console.log(`SIG_MISMATCH: got=${sig.substring(0, 20)}... expected=${expected.substring(0, 20)}...`);
          return c.json({ error: "Invalid signature" }, 401);
        }
      }
    }

    const accessToken = c.env.LINE_CHANNEL_ACCESS_TOKEN;
    if (!accessToken) {
      return c.json({ error: "LINE credentials not configured" }, 500);
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
          // Already verified — keep their state, no duplicate reply
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
          .bind(`link_${crypto.randomUUID()}`, "farmer-004", event.source.userId)
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
          .bind(linkId, "farmer-004", event.source.userId)
          .run();

        link = {
          id: linkId,
          farmer_id: "farmer-004",
          status: "pending",
          conversation_state: "welcome",
          selected_plot_id: null,
        };
      }

      // Handle via state machine
      try {
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
      } catch (flowErr) {
        const errMsg = flowErr instanceof Error ? flowErr.message : String(flowErr);
        console.error(`[FLOW_ERR] ${errMsg}`);
        // Try to send error message to user
        try {
          await pushMessage(token, event.source.userId, [{ type: "text", text: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้งค่ะ" }]);
        } catch (pushErr) {
          console.error(`[PUSH_ERR_FALLBACK] ${pushErr}`);
        }
      }
      break;
    }

    case "postback": {
      // Flex button taps send postback events with data payloads
      const postData = event.postback?.data;
      if (!postData) break;

      // Postback data format: "action=<keyword>" or a plain keyword.
      // Extract the action so it matches the state machine's exact-match keywords.
      const actionMatch = postData.match(/(?:^|&)action=([^&]+)/);
      const postbackText = actionMatch ? actionMatch[1] : postData;
      // Route through the same state machine — treat postback data as the user's text input
      let link = await db
        .prepare("SELECT id, farmer_id, status, conversation_state, selected_plot_id FROM line_links WHERE line_user_id = ?")
        .bind(event.source.userId)
        .first<{ id: string; farmer_id: string; status: string; conversation_state: ConversationState; selected_plot_id: string | null }>();

      if (!link) {
        // Postback from unknown user — create link in welcome state
        const linkId = `link_${crypto.randomUUID()}`;
        await db
          .prepare(
            "INSERT INTO line_links (id, farmer_id, line_user_id, status, conversation_state) VALUES (?, ?, ?, 'pending', 'welcome')",
          )
          .bind(linkId, "farmer-004", event.source.userId)
          .run();

        link = {
          id: linkId,
          farmer_id: "farmer-004",
          status: "pending",
          conversation_state: "welcome",
          selected_plot_id: null,
        };
      }

      await handleFlow({
        db,
        token,
        apiKey,
        userId: event.source.userId,
        linkId: link.id,
        farmerId: link.farmer_id,
        state: link.conversation_state,
        selectedPlotId: link.selected_plot_id,
        text: postbackText === "show_calendar" ? "ดูปฏิทิน" : postbackText,
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
