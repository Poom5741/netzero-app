/**
 * LINE Bot Flow — State Machine
 *
 * States: welcome → phone → pending → select_plot → chat ↔ confirm_draft
 *
 * Each state has explicit allowed inputs and transitions.
 */

import { replyMessage, pushMessage } from "./reply";
import { buildConsentCard } from "./consent";
import { chatWithAi } from "../chat/ai";
import { confirmDraft, rejectDraft } from "../chat/state";

export type ConversationState =
  | "welcome"
  | "phone"
  | "pending"
  | "select_plot"
  | "chat"
  | "confirm_draft";

type FlowContext = {
  db: D1Database;
  token: string;
  apiKey: string;
  userId: string;
  linkId: string;
  farmerId: string;
  state: ConversationState;
  selectedPlotId: string | null;
  text: string;
};

type FlowResult = {
  newState: ConversationState;
  selectedPlotId?: string | null;
};

/**
 * Safe push that catches errors and logs to D1.
 */
async function safePush(
  ctx: FlowContext,
  messages: Array<{ type: string; text?: string; altText?: string; contents?: unknown }>,
): Promise<void> {
  try {
    const r = await pushMessage(ctx.token, ctx.userId, messages);
    console.log(`[PUSH] status=${r.status} body=${r.body.substring(0, 100)}`);
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error(`[PUSH_ERR] ${errMsg}`);
  }
}

/**
 * Handle a message based on the farmer's current conversation state.
 */
export async function handleFlow(ctx: FlowContext): Promise<void> {
  const { state } = ctx;
  let result: FlowResult;

  switch (state) {
    case "welcome":
      result = await handleWelcome(ctx);
      break;
    case "phone":
      result = await handlePhone(ctx);
      break;
    case "pending":
      result = await handlePending(ctx);
      break;
    case "select_plot":
      result = await handleSelectPlot(ctx);
      break;
    case "confirm_draft":
      result = await handleConfirmDraft(ctx);
      break;
    case "chat":
    default:
      result = await handleChat(ctx);
      break;
  }

  // Update state in DB
  await ctx.db
    .prepare("UPDATE line_links SET conversation_state = ?, selected_plot_id = COALESCE(?, selected_plot_id) WHERE id = ?")
    .bind(result.newState, result.selectedPlotId ?? null, ctx.linkId)
    .run();
}

/**
 * WELCOME STATE — Farmer just followed, show consent card.
 * Expected input: "ยอมรับ" or similar consent keywords
 */
async function handleWelcome(ctx: FlowContext): Promise<FlowResult> {
  const lower = ctx.text.toLowerCase().trim();

  if (["ยอมรับ", "accept", "ตกลง", "同意", "ok"].includes(lower)) {
    await safePush(ctx, [
      { type: "text", text: "✅ ยอมรับเงื่อนไขเรียบร้อยแล้วค่ะ\n\nกรุณาพิมพ์เบอร์โทรศัพท์ของท่านเพื่อผูกบัญชี (เช่น 0812345678)" },
    ], ctx.db, ctx.farmerId);
    return { newState: "phone" };
  }

  // Show consent card again
  const consentMsg = buildConsentCard();
  await safePush(ctx, [
    { type: "text", text: "กรุณายอมรับเงื่อนไขก่อนใช้งาน\nพิมพ์ 'ยอมรับ' เพื่อยอมรับเงื่อนไขทั้งหมด" },
    consentMsg,
  ], ctx.db, ctx.farmerId);
  return { newState: "welcome" };
}

/**
 * PHONE STATE — Waiting for phone number to link account.
 * Expected input: 10-digit phone number
 */
async function handlePhone(ctx: FlowContext): Promise<FlowResult> {
  const phone = ctx.text.replace(/[-\s]/g, "");

  if (!/^\d{10}$/.test(phone)) {
    await safePush(ctx, [
      { type: "text", text: "กรุณาพิมพ์เบอร์โทรศัพท์ 10 หลัก (เช่น 0812345678)" },
    ], ctx.db, ctx.farmerId);
    return { newState: "phone" };
  }

  // Look up farmer by phone
  const farmer = await ctx.db
    .prepare("SELECT id, full_name FROM farmers WHERE phone = ?")
    .bind(phone)
    .first<{ id: string; full_name: string }>();

  if (!farmer) {
    await safePush(ctx, [
      { type: "text", text: "ไม่พบข้อมูลเกษตรกรในระบบ\nกรุณาติดต่อเจ้าหน้าที่โครงการค่ะ" },
    ], ctx.db, ctx.farmerId);
    return { newState: "phone" };
  }

  // Check if already linked to another account
  const existingLink = await ctx.db
    .prepare("SELECT id FROM line_links WHERE farmer_id = ? AND line_user_id != ?")
    .bind(farmer.id, ctx.userId)
    .first<{ id: string }>();

  if (existingLink) {
    await safePush(ctx, [
      { type: "text", text: "เบอร์นี้ผูกกับบัญชี LINE อื่นอยู่แล้ว\nกรุณาติดต่อเจ้าหน้าที่ค่ะ" },
    ], ctx.db, ctx.farmerId);
    return { newState: "phone" };
  }

  // Update link with farmer info
  await ctx.db
    .prepare("UPDATE line_links SET farmer_id = ?, status = 'pending', conversation_state = 'pending' WHERE id = ?")
    .bind(farmer.id, ctx.linkId)
    .run();

  await safePush(ctx, [
    { type: "text", text: `พบข้อมูลของคุณ ${farmer.full_name}\n\n⏳ กรุณารอการยืนยันจากเจ้าหน้าที่ค่ะ\nเมื่อยืนยันแล้วจะสามารถใช้งานได้ทันที` },
  ], ctx.db, ctx.farmerId);
  return { newState: "pending" };
}

/**
 * PENDING STATE — Waiting for admin verification.
 * No action allowed until verified.
 */
async function handlePending(ctx: FlowContext): Promise<FlowResult> {
  // Re-check verification status
  const link = await ctx.db
    .prepare("SELECT status FROM line_links WHERE id = ?")
    .bind(ctx.linkId)
    .first<{ status: string }>();

  if (link?.status === "verified") {
    // Verified! Move to plot selection
    return handlePlotSelection(ctx);
  }

  await safePush(ctx, [
    { type: "text", text: "⏳ บัญชีของท่านอยู่ระหว่างรอการยืนยัน\nกรุณารอการยืนยันจากเจ้าหน้าที่ค่ะ" },
  ], ctx.db, ctx.farmerId);
  return { newState: "pending" };
}

/**
 * SELECT_PLOT STATE — Farmer chooses which plot to work on.
 * Expected input: Plot number (1, 2, 3...) or plot code
 */
async function handleSelectPlot(ctx: FlowContext): Promise<FlowResult> {
  // Get farmer's plots
  const plots = await ctx.db
    .prepare("SELECT id, plot_code, area_rai FROM plots WHERE farmer_id = ? ORDER BY plot_code")
    .bind(ctx.farmerId)
    .all<{ id: string; plot_code: string; area_rai: number }>();

  if (!plots.results || plots.results.length === 0) {
    await safePush(ctx, [
      { type: "text", text: "ไม่พบแปลงนาในระบบ\nกรุณาติดต่อเจ้าหน้าที่ค่ะ" },
    ], ctx.db, ctx.farmerId);
    return { newState: "select_plot" };
  }

  if (plots.results.length === 1) {
    // Only one plot — auto-select
    const plot = plots.results[0];
    await safePush(ctx, [
      { type: "text", text: `✅ เลือกแปลง ${plot.plot_code} (${plot.area_rai} ไร่)\n\nพร้อมเริ่มทำงานได้เลยค่ะ\nพิมพ์ข้อมูลปุ๋ย หรือถามคำถามได้เลย` },
    ], ctx.db, ctx.farmerId);
    return { newState: "chat", selectedPlotId: plot.id };
  }

  // Multiple plots — show list
  const plotList = plots.results
    .map((p, i) => `${i + 1}. ${p.plot_code} (${p.area_rai} ไร่)`)
    .join("\n");

  const input = ctx.text.trim();
  const num = parseInt(input, 10);

  if (num >= 1 && num <= plots.results.length) {
    const plot = plots.results[num - 1];
    await safePush(ctx, [
      { type: "text", text: `✅ เลือกแปลง ${plot.plot_code} (${plot.area_rai} ไร่)\n\nพร้อมเริ่มทำงานได้เลยค่ะ\nพิมพ์ข้อมูลปุ๋ย หรือถามคำถามได้เลย` },
    ], ctx.db, ctx.farmerId);
    return { newState: "chat", selectedPlotId: plot.id };
  }

  // Show plot list
  await safePush(ctx, [
    { type: "text", text: `📋 แปลงนาของท่าน:\n\n${plotList}\n\nพิมพ์หมายเลขเพื่อเลือกแปลง` },
  ], ctx.db, ctx.farmerId);
  return { newState: "select_plot" };
}

/**
 * CONFIRM_DRAFT STATE — Farmer confirms or rejects a draft.
 * Expected input: "ยืนยัน" / "ยกเลิก"
 */
async function handleConfirmDraft(ctx: FlowContext): Promise<FlowResult> {
  const lower = ctx.text.toLowerCase().trim();

  if (["ยืนยัน", "confirm", "ok", "ได้", "ครับ", "ค่ะ"].includes(lower)) {
    const confirmed = await confirmDraft(ctx.db, ctx.farmerId);

    if (confirmed) {
      const { category, data } = confirmed;

      if (category === "fertilizer") {
        const d = data as { step?: string; formula?: string; rate_kg_per_rai?: number; is_urea?: boolean };
        const plot = await ctx.db
          .prepare("SELECT id FROM plots WHERE farmer_id = ? ORDER BY created_at DESC LIMIT 1")
          .bind(ctx.farmerId)
          .first<{ id: string }>();

        if (plot && d.formula && d.rate_kg_per_rai) {
          const nitrogenKg = d.is_urea
            ? d.rate_kg_per_rai * 0.46
            : d.rate_kg_per_rai * 0.16;
          await ctx.db
            .prepare(
              `INSERT INTO fertilizer_entries (id, plot_id, season_id, step, formula, rate_kg_per_rai, percent_n, nitrogen_kg_per_rai, is_urea, confirmed)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
            )
            .bind(
              crypto.randomUUID(),
              ctx.selectedPlotId || plot.id,
              "2568-napi",
              d.step || "base",
              d.formula,
              d.rate_kg_per_rai,
              d.is_urea ? 46 : 16,
              nitrogenKg,
              d.is_urea ? 1 : 0,
            )
            .run();

          await safePush(ctx, [
            { type: "text", text: `✅ บันทึกข้อมูลปุ๋ยเรียบร้อยแล้วค่ะ\n\nสูตร: ${d.formula}\nอัตรา: ${d.rate_kg_per_rai} กก./ไร่\nไนโตรเจน: ${nitrogenKg.toFixed(2)} กก./ไร่` },
          ], ctx.db, ctx.farmerId);
        } else {
          await safePush(ctx, [
            { type: "text", text: "❌ ไม่สามารถบันทึกได้ กรุณาลองใหม่" },
          ], ctx.db, ctx.farmerId);
        }
      } else {
        await safePush(ctx, [
          { type: "text", text: "✅ บันทึกข้อมูลเรียบร้อยแล้วค่ะ" },
        ], ctx.db, ctx.farmerId);
      }
    } else {
      await safePush(ctx, [
        { type: "text", text: "ไม่มีข้อมูลที่ต้องยืนยันค่ะ" },
      ], ctx.db, ctx.farmerId);
    }

    return { newState: "chat" };
  }

  if (["ยกเลิก", "cancel", "ไม่", "ลบ"].includes(lower)) {
    const rejected = await rejectDraft(ctx.db, ctx.farmerId);
    await safePush(ctx, [
      { type: "text", text: rejected ? "🗑️ ยกเลิกเรียบร้อยแล้วค่ะ" : "ไม่มีข้อมูลที่ต้องยกเลิกค่ะ" },
    ], ctx.db, ctx.farmerId);
    return { newState: "chat" };
  }

  // Invalid input — prompt again
  await safePush(ctx, [
    { type: "text", text: "พิมพ์ 'ยืนยัน' เพื่อบันทึก หรือ 'ยกเลิก' เพื่อลบ" },
  ], ctx.db, ctx.farmerId);
  return { newState: "confirm_draft" };
}

/**
 * CHAT STATE — Normal AI conversation.
 * Handles quick replies, AI calls, and draft creation.
 */
async function handleChat(ctx: FlowContext): Promise<FlowResult> {
  const lower = ctx.text.toLowerCase().trim();

  // Quick replies — instant response, no AI
  const quickReplies: Record<string, string> = {
    "สวัสดี": "สวัสดีครับ! ยินดีช่วยเหลือคุณ 🌱\nพิมพ์ข้อมูลปุ๋ย หรือถามคำถามได้เลยครับ",
    "ช่วย": "📋 วิธีใช้งาน:\n• พิมพ์ข้อมูลปุ๋ย (เช่น ใส่ปุ๋ย 46-0-0 12 กก./ไร่)\n• พิมพ์ 'ถ่ายรูป' เพื่อเปิดกล้อง\n• ถามคำถามได้เลยครับ",
    "ถ่ายรูป": "📸 เปิดกล้องถ่ายรูปได้ที่ลิงก์นี้:\nhttps://liff.line.me/",
    "เลือกแปลง": "", // Will be handled below
    "เปลี่ยนแปลง": "", // Will be handled below
  };

  // Handle plot switching
  if (lower.includes("เลือกแปลง") || lower.includes("เปลี่ยนแปลง")) {
    return handleSelectPlot(ctx);
  }

  const matchedQuick = Object.entries(quickReplies).find(([kw]) =>
    kw !== "เลือกแปลง" && kw !== "เปลี่ยนแปลง" && lower.includes(kw),
  );
  if (matchedQuick) {
    await safePush(ctx, [
      { type: "text", text: matchedQuick[1] },
    ], ctx.db, ctx.farmerId);
    return { newState: "chat" };
  }

  // AI conversation
  try {
    // Parallel DB queries for context
    const [farmer, plot, seasonInput] = await Promise.all([
      ctx.db.prepare("SELECT full_name FROM farmers WHERE id = ?").bind(ctx.farmerId).first<{ full_name: string }>(),
      ctx.selectedPlotId
        ? ctx.db.prepare("SELECT plot_code FROM plots WHERE id = ?").bind(ctx.selectedPlotId).first<{ plot_code: string }>()
        : ctx.db.prepare("SELECT plot_code FROM plots WHERE farmer_id = ? ORDER BY created_at DESC LIMIT 1").bind(ctx.farmerId).first<{ plot_code: string }>(),
      ctx.db.prepare("SELECT season_id FROM season_inputs WHERE plot_id = (SELECT id FROM plots WHERE farmer_id = ? ORDER BY created_at DESC LIMIT 1) ORDER BY created_at DESC LIMIT 1").bind(ctx.farmerId).first<{ season_id: string }>(),
    ], ctx.db, ctx.farmerId);

    const aiStart = Date.now();
    const aiResponse = await chatWithAi(ctx.apiKey, ctx.text, {
      farmerName: farmer?.full_name,
      plotCode: plot?.plot_code,
      seasonId: seasonInput?.season_id,
      linkedFarmer: true,
    });
    console.log(`AI call: ${Date.now() - aiStart}ms, type=${aiResponse.type}`);

    if (aiResponse.type === "draft") {
      // Save draft and ask for confirmation
      const { savePendingDraft } = await import("../chat/state");
      await savePendingDraft(ctx.db, ctx.farmerId, {
        category: aiResponse.category,
        data: aiResponse.data,
        text: aiResponse.text,
      });
      await safePush(ctx, [
        { type: "text", text: `${aiResponse.text}\n\nพิมพ์ "ยืนยัน" เพื่อบันทึก หรือ "ยกเลิก" เพื่อลบ` },
      ], ctx.db, ctx.farmerId);
      return { newState: "confirm_draft" };
    }

    // Regular reply
    await safePush(ctx, [
      { type: "text", text: aiResponse.text || "ได้รับข้อความแล้วค่ะ" },
    ], ctx.db, ctx.farmerId);

    // Log to farmer_messages
    await ctx.db
      .prepare(
        `INSERT INTO farmer_messages (id, farmer_id, plot_id, raw_text, draft_json, message_type, confirmed)
         VALUES (?, ?, ?, ?, ?, 'chat', 0)`,
      )
      .bind(
        crypto.randomUUID(),
        ctx.farmerId,
        ctx.selectedPlotId,
        ctx.text,
        JSON.stringify(aiResponse),
      )
      .run();

    return { newState: "chat" };
  } catch (aiErr) {
    console.error("AI chat error:", aiErr);
    await safePush(ctx, [
      { type: "text", text: "ขออภัยค่ะ ระบบประมวลผลชั่วคราว กรุณาลองใหม่อีกครั้ง" },
    ], ctx.db, ctx.farmerId);
    return { newState: "chat" };
  }
}

/**
 * Handle plot selection (shared between pending→verified and select_plot states).
 */
async function handlePlotSelection(ctx: FlowContext): Promise<FlowResult> {
  const plots = await ctx.db
    .prepare("SELECT id, plot_code, area_rai FROM plots WHERE farmer_id = ? ORDER BY plot_code")
    .bind(ctx.farmerId)
    .all<{ id: string; plot_code: string; area_rai: number }>();

  if (!plots.results || plots.results.length === 0) {
    await safePush(ctx, [
      { type: "text", text: "✅ ยืนยันบัญชีเรียบร้อยแล้วค่ะ\n\nแต่ยังไม่มีแปลงนาในระบบ\nกรุณาติดต่อเจ้าหน้าที่ค่ะ" },
    ], ctx.db, ctx.farmerId);
    return { newState: "select_plot" };
  }

  if (plots.results.length === 1) {
    const plot = plots.results[0];
    await safePush(ctx, [
      { type: "text", text: `✅ ยืนยันบัญชีเรียบร้อยแล้วค่ะ\n\nเลือกแปลง ${plot.plot_code} (${plot.area_rai} ไร่)\n\nพร้อมเริ่มทำงานได้เลยค่ะ\nพิมพ์ข้อมูลปุ๋ย หรือถามคำถามได้เลย` },
    ], ctx.db, ctx.farmerId);
    return { newState: "chat", selectedPlotId: plot.id };
  }

  const plotList = plots.results
    .map((p, i) => `${i + 1}. ${p.plot_code} (${p.area_rai} ไร่)`)
    .join("\n");

  await safePush(ctx, [
    { type: "text", text: `✅ ยืนยันบัญชีเรียบร้อยแล้วค่ะ\n\n📋 แปลงนาของท่าน:\n${plotList}\n\nพิมพ์หมายเลขเพื่อเลือกแปลง` },
  ], ctx.db, ctx.farmerId);
  return { newState: "select_plot" };
}
