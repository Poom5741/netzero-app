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
import { handleFaq } from "./chat/faq";
import { parseDraft } from "./chat/parser";

type Bindings = {
  DB: D1Database;
  R2: R2Bucket;
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

    if (!sig || sig !== expected) {
      return c.json({ error: "Invalid signature" }, 401);
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
  const { LINE_CHANNEL_ACCESS_TOKEN: token, DB: db } = env;

  switch (event.type) {
    case "follow": {
      // Send welcome Flex message
      const welcomeMsg = buildWelcomeFlex();
      await replyMessage(token, event.replyToken, [welcomeMsg]);

      // Send consent card after a short delay
      const consentMsg = buildConsentCard();
      await replyMessage(token, event.replyToken, [consentMsg]);
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
          // Look up farmer by phone
          const farmer = await db
            .prepare("SELECT id, full_name FROM farmers WHERE phone = ?")
            .bind(phoneMatch)
            .first<{ id: string; full_name: string }>();

          if (farmer) {
            // Create pending link
            const linkId = `link_${crypto.randomUUID()}`;
            await db
              .prepare(
                "INSERT INTO line_links (id, farmer_id, line_user_id, status) VALUES (?, ?, ?, 'pending')",
              )
              .bind(linkId, farmer.id, event.source.userId)
              .run();

            await replyMessage(token, event.replyToken, [
              {
                type: "text",
                text: `พบข้อมูลของคุณ ${farmer.full_name} กรุณารอการยืนยันจากเจ้าหน้าที่ค่ะ`,
              },
            ]);
          } else {
            await replyMessage(token, event.replyToken, [
              {
                type: "text",
                text: "ไม่พบข้อมูลเกษตรกรในระบบ กรุณาติดต่อเจ้าหน้าที่โครงการค่ะ",
              },
            ]);
          }
          break;
        }

        // Not linked, not a phone number — prompt for phone
        await replyMessage(token, event.replyToken, [
          {
            type: "text",
            text: "กรุณาพิมพ์เบอร์โทรศัพท์ของท่านเพื่อผูกบัญชี (เช่น 0812345678)",
          },
        ]);
        break;
      }

      // Farmer is linked — process the message
      // Try parsing as structured input (fertilizer, photo intent)
      const draft = parseDraft(text);

      if (draft.type === "fertilizer" && draft.confidence >= 0.5) {
        const { step, formula, rate_kg_per_rai, is_urea } = draft.data;
        const stepLabel = step === "base" ? "หว่าน" : step === "tillering" ? "แตกกอ" : "ช่อ";

        await replyMessage(token, event.replyToken, [
          {
            type: "text",
            text: `📋 พบข้อมูลปุ๋ย:\n- ขั้นตอน: ${stepLabel}\n- สูตร: ${formula || "ไม่ระบุ"}\n- อัตรา: ${rate_kg_per_rai ? `${rate_kg_per_rai} กก./ไร่` : "ไม่ระบุ"}${is_urea ? "\n⚠️ เป็นปุ๋ยยูเรีย" : ""}\n\nพิมพ์ 'ยืนยัน' เพื่อบันทึก หรือ 'ยกเลิก' เพื่อลบ`,
          },
        ]);
        break;
      }

      if (draft.type === "photo") {
        await replyMessage(token, event.replyToken, [
          {
            type: "text",
            text: "📸 ถ่ายรูปหลักฐานได้เลยค่ะ เปิดกล้องถ่ายรูปที่ลิงก์นี้: [เปิดกล้อง](https://liff.line.me/)",
          },
        ]);
        break;
      }

      // Fall through to FAQ
      const faqResult = await handleFaq(text);
      await replyMessage(token, event.replyToken, [
        { type: "text", text: faqResult.reply },
      ]);
      break;
    }

    case "unfollow": {
      // Mark link as inactive (optional cleanup)
      console.log(`User unfollowed: ${event.source.userId}`);
      break;
    }
  }
}

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
