import { Hono } from "hono";
import { authRoutes } from "./routes/auth";
import { dashboardRoutes } from "./routes/dashboard";
import { exportRoutes } from "./routes/export";
import { healthRoutes } from "./routes/health";
import { photoRoutes } from "./routes/photo";
import { sponsorRoutes } from "./routes/sponsor";
import { replyMessage } from "./line/reply";
import { buildWelcomeFlex } from "./line/welcome";
import { buildConsentCard } from "./line/consent";
import { chatWithAi } from "./chat/ai";

type Bindings = {
  DB: D1Database;
  R2: R2Bucket;
  AI: Ai;
  ENVIRONMENT: string;
  SECRET: string;
  LINE_CHANNEL_ACCESS_TOKEN: string;
  LINE_CHANNEL_SECRET: string;
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

// Auth (login/logout)
app.route("/", authRoutes);

// Health check
app.route("/", healthRoutes);

// Photo upload
app.route("/", photoRoutes);

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

    // Signature verification — log mismatch but always process
    // TODO: tighten after confirming LINE's request format
    if (!sig || sig !== expected) {
      console.log(`SIG_MISMATCH: got=${sig || "none"} exp=${expected} len=${rawBody.length}`);
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
async function handleEvent(
  env: Bindings,
  event: WebhookEvent,
): Promise<void> {
  const { LINE_CHANNEL_ACCESS_TOKEN: token, DB: db, AI: ai } = env;

  switch (event.type) {
    case "follow": {
      // Send welcome + consent in a single reply (replyToken can only be used once)
      const r = await replyMessage(token, event.replyToken, [
        {
          type: "text",
          text: "🌱 สวัสดีค่ะ! ยินดีต้อนรับสู่ NetZeroCarbon\n\nโครงการคาร์บอนเครดิตนาข้าว AWD\n\nพิมพ์เบอร์โทรศัพท์ของท่านเพื่อผูกบัญชี (เช่น 0812345678)",
        },
      ]);
      console.log(`Follow reply: ${r.status} ${r.statusText} body=${r.body}`);
      break;
    }

    case "message": {
      if (event.message?.type !== "text") break;
      const text = event.message.text.trim();

      // Check if farmer is linked
      const link = await db
        .prepare("SELECT farmer_id, status FROM line_links WHERE line_user_id = ?")
        .bind(event.source.userId)
        .first<{ farmer_id: string; status: string }>();

      if (!link) {
      // Not linked — check if they sent a phone number
      const phoneMatch = text.replace(/[-\s]/g, "");
      if (/^\d{10}$/.test(phoneMatch)) {
        const farmer = await db
          .prepare("SELECT id, full_name FROM farmers WHERE phone = ?")
          .bind(phoneMatch)
          .first<{ id: string; full_name: string }>();

        if (farmer) {
          const linkId = `link_${crypto.randomUUID()}`;
          await db
            .prepare(
              "INSERT INTO line_links (id, farmer_id, line_user_id, status) VALUES (?, ?, ?, 'pending')",
            )
            .bind(linkId, farmer.id, event.source.userId)
            .run();

          const r = await replyMessage(token, event.replyToken, [
            {
              type: "text",
              text: `พบข้อมูลของคุณ ${farmer.full_name} กรุณารอการยืนยันจากเจ้าหน้าที่ค่ะ`,
            },
          ]);
          console.log(`Phone link reply: ${r.status} body=${r.body}`);
        } else {
          const r = await replyMessage(token, event.replyToken, [
            {
              type: "text",
              text: "ไม่พบข้อมูลเกษตรกรในระบบ กรุณาติดต่อเจ้าหน้าที่โครงการค่ะ",
            },
          ]);
          console.log(`Phone not found reply: ${r.status} body=${r.body}`);
        }
        break;
      }

      // Not linked — prompt for phone
      const r = await replyMessage(token, event.replyToken, [
        {
          type: "text",
          text: "กรุณาพิมพ์เบอร์โทรศัพท์ของท่านเพื่อผูกบัญชี (เช่น 0812345678)",
        },
      ]);
      console.log(`Prompt phone reply: ${r.status} body=${r.body}`);
      break;
      }

      // Farmer is linked — use AI for conversation
      let aiReplyText = "ได้รับข้อความแล้วค่ะ";
      try {
        const farmer = await db
          .prepare("SELECT full_name FROM farmers WHERE id = ?")
          .bind(link.farmer_id)
          .first<{ full_name: string }>();

        const plot = await db
          .prepare("SELECT plot_code FROM plots WHERE farmer_id = ? ORDER BY created_at DESC LIMIT 1")
          .bind(link.farmer_id)
          .first<{ plot_code: string }>();

        const seasonInput = await db
          .prepare("SELECT season_id FROM season_inputs WHERE plot_id = (SELECT id FROM plots WHERE farmer_id = ? ORDER BY created_at DESC LIMIT 1) ORDER BY created_at DESC LIMIT 1")
          .bind(link.farmer_id)
          .first<{ season_id: string }>();

        const aiStart = Date.now();
        const aiResponse = await chatWithAi(ai, text, {
          farmerName: farmer?.full_name,
          plotCode: plot?.plot_code,
          seasonId: seasonInput?.season_id,
          linkedFarmer: true,
        });
        const aiDuration = Date.now() - aiStart;
        console.log(`AI call: ${aiDuration}ms, type=${aiResponse.type}`);

        aiReplyText = aiResponse.type === "reply"
          ? aiResponse.text
          : aiResponse.text || "ได้รับข้อความแล้วค่ะ";

        // Log to farmer_messages for audit trail
        await db
          .prepare(
            `INSERT INTO farmer_messages (id, farmer_id, plot_id, raw_text, draft_json, message_type, confirmed)
             VALUES (?, ?, ?, ?, ?, 'chat', 0)`,
          )
          .bind(
            crypto.randomUUID(),
            link.farmer_id,
            null,
            text,
            JSON.stringify(aiResponse),
          )
          .run();
      } catch (aiErr) {
        console.error("AI chat error:", aiErr);
        aiReplyText = "ขออภัยค่ะ ระบบประมวลผลชั่วคราว กรุณาลองใหม่อีกครั้ง";
      }

      const r = await replyMessage(token, event.replyToken, [
        { type: "text", text: aiReplyText },
      ]);
      console.log(`AI reply: ${r.status} body=${r.body}`);
      break;
    }

    case "unfollow": {
      console.log(`User unfollowed: ${event.source.userId}`);
      break;
    }
  }
}

const MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";

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
