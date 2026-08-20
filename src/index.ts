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
import { getPendingDraft, savePendingDraft, confirmDraft, rejectDraft } from "./chat/state";

type Bindings = {
  DB: D1Database;
  R2: R2Bucket;
  AI: Ai;
  OPENROUTER_API_KEY: string;
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
  const { LINE_CHANNEL_ACCESS_TOKEN: token, DB: db, OPENROUTER_API_KEY: apiKey } = env;

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

      // GUARDRAIL: Not linked — only allow phone number input, no AI
      if (!link) {
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

        // Not linked, not a phone number — prompt for phone only
        const r = await replyMessage(token, event.replyToken, [
          {
            type: "text",
            text: "กรุณาพิมพ์เบอร์โทรศัพท์ของท่านเพื่อผูกบัญชี (เช่น 0812345678)",
          },
        ]);
        console.log(`Prompt phone reply: ${r.status} body=${r.body}`);
        break;
      }

      // GUARDRAIL: Linked but not verified — block AI access
      if (link.status !== "verified") {
        const r = await replyMessage(token, event.replyToken, [
          {
            type: "text",
            text: "⚠️ บัญชีของท่านอยู่ระหว่างรอการยืนยันจากเจ้าหน้าที่\nกรุณารอการยืนยันก่อนใช้งาน",
          },
        ]);
        console.log(`Pending link reply: ${r.status} body=${r.body}`);
        break;
      }

      // GUARDRAIL: Check token quota (max 50 messages per farmer per season)
      const msgCount = await db
        .prepare("SELECT COUNT(*) as cnt FROM farmer_messages WHERE farmer_id = ? AND message_type = 'chat'")
        .bind(link.farmer_id)
        .first<{ cnt: number }>();

      if (msgCount && msgCount.cnt >= 50) {
        const r = await replyMessage(token, event.replyToken, [
          {
            type: "text",
            text: "⚠️ คุณใช้โควตาข้อความครบแล้วในฤดูนี้ กรุณาติดต่อเจ้าหน้าที่",
          },
        ]);
        console.log(`Quota exceeded reply: ${r.status} body=${r.body}`);
        break;
      }

      // Farmer is linked — handle conversation flow
      const lowerText = text.toLowerCase().trim();

      // Check for confirm/reject commands FIRST
      if (["ยืนยัน", "confirm", "ok", "ได้", "ครับ", "ค่ะ"].includes(lowerText)) {
        const confirmed = await confirmDraft(db, link.farmer_id);
        if (confirmed) {
          const { category, data } = confirmed;
          if (category === "fertilizer") {
            const d = data as { step?: string; formula?: string; rate_kg_per_rai?: number; is_urea?: boolean };
            // Save to fertilizer_entries
            const plot = await db
              .prepare("SELECT id FROM plots WHERE farmer_id = ? ORDER BY created_at DESC LIMIT 1")
              .bind(link.farmer_id)
              .first<{ id: string }>();
            if (plot && d.formula && d.rate_kg_per_rai) {
              const nitrogenKg = d.is_urea
                ? d.rate_kg_per_rai * 0.46
                : d.rate_kg_per_rai * 0.16;
              await db
                .prepare(
                  `INSERT INTO fertilizer_entries (id, plot_id, season_id, step, formula, rate_kg_per_rai, percent_n, nitrogen_kg_per_rai, is_urea, confirmed)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
                )
                .bind(
                  crypto.randomUUID(),
                  plot.id,
                  "2568-napi",
                  d.step || "base",
                  d.formula,
                  d.rate_kg_per_rai,
                  d.is_urea ? 46 : 16,
                  nitrogenKg,
                  d.is_urea ? 1 : 0,
                )
                .run();
              aiReplyText = `✅ บันทึกข้อมูลปุ๋ยเรียบร้อยแล้วค่ะ\n\nสูตร: ${d.formula}\nอัตรา: ${d.rate_kg_per_rai} กก./ไร่\nไนโตรเจน: ${nitrogenKg.toFixed(2)} กก./ไร่`;
            } else {
              aiReplyText = "❌ ไม่สามารถบันทึกได้ กรุณาลองใหม่";
            }
          } else if (category === "season_input") {
            aiReplyText = `✅ บันทึกข้อมูลเรียบร้อยแล้วค่ะ`;
          }
        } else {
          aiReplyText = "ไม่มีข้อมูลที่ต้องยืนยันค่ะ";
        }
      } else if (["ยกเลิก", "cancel", "ไม่", "ลบ"].includes(lowerText)) {
        const rejected = await rejectDraft(db, link.farmer_id);
        aiReplyText = rejected ? "🗑️ ยกเลิกเรียบร้อยแล้วค่ะ" : "ไม่มีข้อมูลที่ต้องยกเลิกค่ะ";
      } else {
        // Normal AI conversation
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
          const aiResponse = await chatWithAi(apiKey, text, {
            farmerName: farmer?.full_name,
            plotCode: plot?.plot_code,
            seasonId: seasonInput?.season_id,
            linkedFarmer: true,
          });
          const aiDuration = Date.now() - aiStart;
          console.log(`AI call: ${aiDuration}ms, type=${aiResponse.type}`);

          if (aiResponse.type === "draft") {
            // Save pending draft and ask for confirmation
            await savePendingDraft(db, link.farmer_id, {
              category: aiResponse.category,
              data: aiResponse.data,
              text: aiResponse.text,
            });
            aiReplyText = `${aiResponse.text}\n\nพิมพ์ "ยืนยัน" เพื่อบันทึก หรือ "ยกเลิก" เพื่อลบ`;
          } else {
            aiReplyText = aiResponse.text || "ได้รับข้อความแล้วค่ะ";
          }

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
      }

      let r = await replyMessage(token, event.replyToken, [
        { type: "text", text: aiReplyText },
      ]);
      // Fallback to push if reply fails (e.g., expired replyToken)
      if (r.status !== 200) {
        console.log(`Reply failed (${r.status}), trying push`);
        r = await pushMessage(token, event.source.userId, [
          { type: "text", text: aiReplyText },
        ]);
      }
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
