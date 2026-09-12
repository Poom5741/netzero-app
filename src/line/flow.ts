/**
 * LINE Bot Flow — State Machine
 *
 * States (15 + 3 legacy):
 *   welcome → consent → phone → identity_confirm → conditions → registration
 *   → documents → pending_review → activation → season_setup → calendar
 *   ↔ chat ↔ confirm_draft
 *   photo_report ↔ calendar
 *   results ↔ calendar
 *
 * Each state has explicit allowed inputs and transitions.
 */

import { replyMessage, pushMessage } from "./reply";
import { chatWithAi } from "../chat/ai";
import { confirmDraft, rejectDraft } from "../chat/state";
import {
  composeRegistrationWelcome,
  composePdpaConsent,
  composeIdentityConfirmation,
  composeActivationSuccess,
} from "./flow-registration";
import {
  composePhotoReminder,
  composePhotoAccepted,
  composePhotoRejected,
} from "./flow-photo-reporting";
import { composeResultsMessage, composeTodoMessage } from "./flow-results";
import {
  buildWelcomeBubble,
  buildConsentBubble,
  buildIdentityConfirmBubble,
  buildConditionsBubble,
  buildRegistrationLinkBubble,
  buildCalendarBubble,
  buildDashboardBubble,
  textMessage,
} from "./flex-builders";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ConversationState =
  | "welcome"          // OB-01: Show welcome message
  | "consent"          // OB-02: PDPA consent
  | "phone"            // OB-03: Phone number input
  | "identity_confirm" // OB-04: Confirm identity match
  | "conditions"       // OB-05: Project conditions
  | "registration"     // OB-06: LIFF registration form link
  | "documents"        // OB-07: Document upload
  | "pending_review"   // OB-08: Waiting for staff review
  | "activation"       // OB-09: Account activated
  | "season_setup"     // OB-10: Set sow date
  | "calendar"         // OB-11: Show 9-step calendar
  | "chat"             // Normal AI conversation
  | "confirm_draft"    // Confirm/reject a draft
  | "photo_report"     // PJ-00 to PJ-13: Photo reporting
  | "results"          // RP-01 to RP-04: View results
  // Legacy states (kept for backward-compat with existing DB records)
  | "select_plot"
  | "identified"
  | "pending";

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
  liffId?: string; // LIFF app ID for deep-links
};

type FlowResult = {
  newState: ConversationState;
  selectedPlotId?: string | null;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Safe push that catches errors and logs to console.
 */
async function safePush(
  ctx: FlowContext,
  messages: Array<{ type: string; text?: string; altText?: string; contents?: unknown; quickReply?: unknown }>,
): Promise<void> {
  try {
    const r = await pushMessage(ctx.token, ctx.userId, messages);
    console.log(`[PUSH] status=${r.status} body=${r.body.substring(0, 100)}`);
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error(`[PUSH_ERR] ${errMsg}`);
  }
}

/** Build the standard 9-step calendar data for bubble display. */
function calendarSteps(): Array<{
  stepCode: string;
  stepName: string;
  dueDay: number;
  status: string;
  requiresPhoto: boolean;
}> {
  return [
    { stepCode: "SG-01", stepName: "เตรียมแปลง", dueDay: 0, status: "pending", requiresPhoto: false },
    { stepCode: "SG-02", stepName: "หว่านข้าว", dueDay: 0, status: "pending", requiresPhoto: false },
    { stepCode: "SG-03", stepName: "ใส่ปุ๋ยครั้งที่ 1", dueDay: 0, status: "pending", requiresPhoto: false },
    { stepCode: "SG-04", stepName: "WET-1", dueDay: 0, status: "pending", requiresPhoto: true },
    { stepCode: "SG-05", stepName: "DRY-1", dueDay: 0, status: "pending", requiresPhoto: true },
    { stepCode: "SG-06", stepName: "ใส่ปุ๋ยครั้งที่ 2", dueDay: 0, status: "pending", requiresPhoto: false },
    { stepCode: "SG-07", stepName: "WET-2", dueDay: 0, status: "pending", requiresPhoto: true },
    { stepCode: "SG-08", stepName: "DRY-2", dueDay: 0, status: "pending", requiresPhoto: true },
    { stepCode: "SG-09", stepName: "เก็บเกี่ยว", dueDay: 0, status: "pending", requiresPhoto: false },
  ];
}

// ---------------------------------------------------------------------------
// Main dispatch (push mode)
// ---------------------------------------------------------------------------

/**
 * Handle a message based on the farmer's current conversation state.
 */
export async function handleFlow(ctx: FlowContext): Promise<void> {
  const { state } = ctx;
  let result: FlowResult;

  switch (state) {
    // --- Registration flow (OB-01 to OB-11) ---
    case "welcome":
      result = await handleWelcome(ctx);
      break;
    case "consent":
      result = await handleConsent(ctx);
      break;
    case "phone":
      result = await handlePhone(ctx);
      break;
    case "identity_confirm":
      result = await handleIdentityConfirm(ctx);
      break;
    case "conditions":
      result = await handleConditions(ctx);
      break;
    case "registration":
      result = await handleRegistration(ctx);
      break;
    case "documents":
      result = await handleDocuments(ctx);
      break;
    case "pending_review":
      result = await handlePendingReview(ctx);
      break;
    case "activation":
      result = await handleActivation(ctx);
      break;
    case "season_setup":
      result = await handleSeasonSetup(ctx);
      break;
    case "calendar":
      result = await handleCalendar(ctx);
      break;

    // --- Existing states ---
    case "select_plot":
      result = await handleSelectPlot(ctx);
      break;
    case "confirm_draft":
      result = await handleConfirmDraft(ctx);
      break;

    // --- Operational flows ---
    case "photo_report":
      result = await handlePhotoReport(ctx);
      break;
    case "results":
      result = await handleResults(ctx);
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

// ===========================================================================
// Registration flow state handlers (push mode)
// ===========================================================================

/**
 * OB-01: WELCOME STATE — Show welcome message on first follow.
 *
 * - "start_registration" / "ลงทะเบียน" / "ผูกบัญชี" -> show consent, go to consent
 * - Otherwise -> show welcome bubble, stay in welcome
 */
async function handleWelcome(ctx: FlowContext): Promise<FlowResult> {
  const lower = ctx.text.toLowerCase().trim();

  if (
    lower === "start_registration" ||
    lower.includes("ลงทะเบียน") ||
    lower.includes("ผูกบัญชี")
  ) {
    // Send consent as plain text first (flex may fail validation)
    await safePush(ctx, [{ type: "text", text: composePdpaConsent() }]);
    return { newState: "consent" };
  }

  // Show the welcome bubble
  const liffUrl = ctx.liffId ? `https://liff.line.me/${ctx.liffId}` : "";
  await safePush(ctx, [
    { type: "text", text: composeRegistrationWelcome() },
    buildWelcomeBubble(liffUrl || "no-liff"),
  ]);
  return { newState: "welcome" };
}

/**
 * OB-02: CONSENT STATE — PDPA consent acceptance.
 *
 * - "consent_accept" / "ยอมรับ" -> confirmation text + ask for phone, go to phone
 * - "consent_reject" / "ไม่ยินยอม" -> ask to accept, stay in consent
 * - Otherwise -> re-show consent bubble, stay in consent
 */
async function handleConsent(ctx: FlowContext): Promise<FlowResult> {
  const lower = ctx.text.toLowerCase().trim();

  if (
    lower === "consent_accept" ||
    lower === "ยอมรับ" ||
    lower === "accept" ||
    lower === "ตกลง" ||
    lower === "同意"
  ) {
    await safePush(ctx, [
      textMessage("✅ ยอมรับเงื่อนไขเรียบร้อยแล้วค่ะ"),
      textMessage("กรุณาพิมพ์เบอร์โทรศัพท์ของท่านเพื่อผูกบัญชี (เช่น 0812345678)"),
    ]);
    return { newState: "phone" };
  }

  if (
    lower === "consent_reject" ||
    lower === "ไม่ยินยอม" ||
    lower === "ไม่"
  ) {
    await safePush(ctx, [
      textMessage("กรุณายอมรับเพื่อใช้งานค่ะ"),
    ]);
    return { newState: "consent" };
  }

  // Re-show consent
  await safePush(ctx, [
    { type: "text", text: composePdpaConsent() },
    buildConsentBubble(),
  ]);
  return { newState: "consent" };
}

/**
 * OB-03: PHONE STATE — Waiting for phone number to link account.
 *
 * Validates 10-digit Thai phone, looks up farmer in DB.
 * - Found -> identity_confirm bubble, go to identity_confirm
 * - Not found -> error, stay in phone
 * - Invalid format -> error, stay in phone
 */
async function handlePhone(ctx: FlowContext): Promise<FlowResult> {
  const phone = ctx.text.replace(/[-\s]/g, "");

  // Validate Thai phone format: starts with 0, followed by 9 digits
  if (!/^0\d{9}$/.test(phone)) {
    await safePush(ctx, [
      textMessage("เบอร์โทรศัพท์ไม่ถูกต้อง\nกรุณาพิมพ์เบอร์โทรศัพท์ 10 หลักที่ขึ้นต้นด้วย 0 (เช่น 0812345678)"),
    ]);
    return { newState: "phone" };
  }

  // Look up farmer by phone
  const farmer = await ctx.db
    .prepare("SELECT id, full_name, province, district FROM farmers WHERE phone = ?")
    .bind(phone)
    .first<{ id: string; full_name: string; province: string; district: string }>();

  if (!farmer) {
    await safePush(ctx, [
      textMessage("ไม่พบข้อมูลเกษตรกรในระบบ\nกรุณาติดต่อเจ้าหน้าที่โครงการค่ะ"),
    ]);
    return { newState: "phone" };
  }

  // Check if already linked to another account
  const existingLink = await ctx.db
    .prepare("SELECT id FROM line_links WHERE farmer_id = ? AND line_user_id != ?")
    .bind(farmer.id, ctx.userId)
    .first<{ id: string }>();

  if (existingLink) {
    await safePush(ctx, [
      textMessage("เบอร์นี้ผูกกับบัญชี LINE อื่นอยู่แล้ว\nกรุณาติดต่อเจ้าหน้าที่ค่ะ"),
    ]);
    return { newState: "phone" };
  }

  // Update link with farmer info
  await ctx.db
    .prepare("UPDATE line_links SET farmer_id = ?, status = 'pending', conversation_state = 'identity_confirm' WHERE id = ?")
    .bind(farmer.id, ctx.linkId)
    .run();

  await safePush(ctx, [
    buildIdentityConfirmBubble(
      farmer.full_name,
      farmer.district || "—",
      farmer.province || "—",
    ),
  ]);
  return { newState: "identity_confirm" };
}

/**
 * OB-04: IDENTITY_CONFIRM STATE — Confirm identity match.
 *
 * - "identity_confirm" / "ใช่" -> conditions bubble, go to conditions
 * - "identity_reject" / "ไม่ใช่" -> back to phone
 * - Otherwise -> re-show identity confirm, stay in identity_confirm
 */
async function handleIdentityConfirm(ctx: FlowContext): Promise<FlowResult> {
  const lower = ctx.text.toLowerCase().trim();

  if (
    lower === "identity_confirm" ||
    lower === "ใช่" ||
    lower === "ครับ" ||
    lower === "ค่ะ" ||
    lower === "yes"
  ) {
    await safePush(ctx, [buildConditionsBubble()]);
    return { newState: "conditions" };
  }

  if (
    lower === "identity_reject" ||
    lower === "ไม่ใช่" ||
    lower === "ไม่"
  ) {
    await safePush(ctx, [
      textMessage("กรุณาพิมพ์เบอร์โทรศัพท์ใหม่อีกครั้งค่ะ"),
    ]);
    return { newState: "phone" };
  }

  // Re-show identity confirm prompt
  await safePush(ctx, [
    textMessage('ใช่ท่านหรือไม่ครับ\nพิมพ์ "ใช่" หรือ "ไม่ใช่"'),
  ]);
  return { newState: "identity_confirm" };
}

/**
 * OB-05: CONDITIONS STATE — Project conditions.
 *
 * - "conditions_accept" / "ยอมรับ" -> registration link bubble, go to registration
 * - Otherwise -> re-show conditions, stay in conditions
 */
async function handleConditions(ctx: FlowContext): Promise<FlowResult> {
  const lower = ctx.text.toLowerCase().trim();

  if (
    lower === "conditions_accept" ||
    lower === "ยอมรับ" ||
    lower === "accept" ||
    lower === "ตกลง"
  ) {
    const liffUrl = ctx.liffId
      ? `https://liff.line.me/${ctx.liffId}`
      : "";

    if (liffUrl) {
      await safePush(ctx, [buildRegistrationLinkBubble(liffUrl)]);
    } else {
      await safePush(ctx, [textMessage("กรุณาเปิดฟอร์มลงทะเบียนผ่านเมนูค่ะ")]);
    }
    return { newState: "registration" };
  }

  // Re-show conditions
  await safePush(ctx, [buildConditionsBubble()]);
  return { newState: "conditions" };
}

/**
 * OB-06: REGISTRATION STATE — LIFF registration form link.
 *
 * - User completes form via LIFF -> documents prompt, go to documents
 * - Any other text -> remind to fill form, stay in registration
 */
async function handleRegistration(ctx: FlowContext): Promise<FlowResult> {
  const lower = ctx.text.toLowerCase().trim();

  // Registration form completion signals
  if (
    lower === "registration_complete" ||
    lower.includes("กรอกเสร็จ") ||
    lower.includes("ลงทะเบียนเสร็จ")
  ) {
    await safePush(ctx, [
      textMessage("✅ ลงทะเบียนเรียบร้อยแล้วค่ะ"),
      textMessage("ขั้นต่อไป กรุณาอัปโหลดเอกสารสิทธิ์ (สำเนาบัตรประชาชน / สำเนาเอกสารสิทธิ์ที่ดิน)"),
      textMessage('พิมพ์ "อัปโหลด" เมื่อพร้อมอัปโหลดเอกสาร'),
    ]);
    return { newState: "documents" };
  }

  // Remind to fill form
  const reminders = [textMessage("กรุณาเปิดฟอร์มลงทะเบียนและกรอกข้อมูลให้เรียบร้อยค่ะ")];
  if (ctx.liffId) {
    reminders.push(buildRegistrationLinkBubble(`https://liff.line.me/${ctx.liffId}`));
  }
  await safePush(ctx, reminders);
  return { newState: "registration" };
}

/**
 * OB-07: DOCUMENTS STATE — Document upload.
 *
 * - User uploads documents -> pending review message, go to pending_review
 * - Any text -> remind to upload, stay in documents
 */
async function handleDocuments(ctx: FlowContext): Promise<FlowResult> {
  const lower = ctx.text.toLowerCase().trim();

  // Document upload completion signals
  if (
    lower === "documents_complete" ||
    lower.includes("อัปโหลด") ||
    lower.includes("อัพโหลด") ||
    lower.includes("ส่งเอกสาร")
  ) {
    await safePush(ctx, [
      textMessage("✅ ได้รับเอกสารแล้วค่ะ"),
      textMessage("⏳ บัญชีอยู่ระหว่างรอการตรวจสอบจากเจ้าหน้าที่"),
      textMessage("กรุณารอการยืนยันค่ะ ใช้เวลาประมาณ 1-3 วันทำการ"),
    ]);
    return { newState: "pending_review" };
  }

  // Remind to upload
  await safePush(ctx, [
    textMessage("กรุณาอัปโหลดเอกสารสิทธิ์ (สำเนาบัตรประชาชน / สำเนาเอกสารสิทธิ์ที่ดิน)"),
    textMessage('พิมพ์ "อัปโหลด" เมื่ออัปโหลดเอกสารเสร็จแล้ว'),
  ]);
  return { newState: "documents" };
}

/**
 * OB-08: PENDING_REVIEW STATE — Waiting for staff review.
 *
 * Always shows the waiting message. User cannot proceed until activated.
 */
async function handlePendingReview(ctx: FlowContext): Promise<FlowResult> {
  await safePush(ctx, [
    textMessage("⏳ บัญชีอยู่ระหว่างรอการยืนยัน"),
    textMessage("เจ้าหน้าที่กำลังตรวจสอบเอกสารของท่านค่ะ"),
    textMessage("กรุณารอการยืนยันค่ะ ใช้เวลาประมาณ 1-3 วันทำการ"),
  ]);
  return { newState: "pending_review" };
}

/**
 * OB-09: ACTIVATION STATE — Account activated.
 *
 * Show activation success and ask for sow date, transition to season_setup.
 */
async function handleActivation(ctx: FlowContext): Promise<FlowResult> {
  const farmer = await ctx.db
    .prepare("SELECT full_name, farmer_code FROM farmers WHERE id = ?")
    .bind(ctx.farmerId)
    .first<{ full_name: string; farmer_code: string }>();

  const plot = await ctx.db
    .prepare("SELECT plot_code, area_rai FROM plots WHERE farmer_id = ? ORDER BY created_at DESC LIMIT 1")
    .bind(ctx.farmerId)
    .first<{ plot_code: string; area_rai: number }>();

  const activationText = composeActivationSuccess({
    farmerCode: farmer?.farmer_code || "—",
    plotName: plot?.plot_code || "—",
    areaRai: plot?.area_rai ?? 0,
  });

  await safePush(ctx, [
    textMessage(activationText),
    textMessage('ขั้นต่อไป กรุณาระบุวันหว่านข้าว (เช่น 15/06/2568) หรือพิมพ์ "ข้าม" เพื่อข้าม'),
  ]);
  return { newState: "season_setup" };
}

/**
 * OB-10: SEASON_SETUP STATE — Set sow date.
 *
 * - Date input -> create season, show calendar bubble, go to calendar
 * - "ข้าม" -> skip, go to calendar
 * - Otherwise -> re-prompt, stay in season_setup
 */
async function handleSeasonSetup(ctx: FlowContext): Promise<FlowResult> {
  const lower = ctx.text.toLowerCase().trim();

  if (lower === "ข้าม" || lower === "skip") {
    await safePush(ctx, [
      textMessage("ข้ามการตั้งวันหว่านค่ะ"),
      buildCalendarBubble(calendarSteps(), ctx.liffId || "no-liff"),
    ]);
    return { newState: "calendar" };
  }

  // Try to parse a date (DD/MM/YYYY or YYYY-MM-DD)
  const dateMatch = ctx.text.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (dateMatch) {
    const [, day, month, year] = dateMatch;
    const sowDate = `${day}/${month}/${year}`;

    // Create season record (best-effort)
    try {
      const plot = await ctx.db
        .prepare("SELECT id FROM plots WHERE farmer_id = ? ORDER BY created_at DESC LIMIT 1")
        .bind(ctx.farmerId)
        .first<{ id: string }>();

      if (plot) {
        await ctx.db
          .prepare(
            `INSERT INTO seasons (id, plot_id, sow_date, created_at)
             VALUES (?, ?, ?, datetime('now'))`,
          )
          .bind(crypto.randomUUID(), plot.id, sowDate)
          .run();
      }
    } catch (seasonErr) {
      console.error("Failed to create season:", seasonErr);
    }

    await safePush(ctx, [
      textMessage(`✅ บันทึกวันหว่าน: ${sowDate}`),
      buildCalendarBubble(calendarSteps(), ctx.liffId || "no-liff"),
    ]);
    return { newState: "calendar" };
  }

  // Invalid input — re-prompt
  await safePush(ctx, [
    textMessage('กรุณาระบุวันหว่านในรูปแบบ DD/MM/YYYY (เช่น 15/06/2568) หรือพิมพ์ "ข้าม"'),
  ]);
  return { newState: "season_setup" };
}

/**
 * OB-11: CALENDAR STATE — Show 9-step season calendar.
 *
 * - "ถ่ายรูป" -> go to photo_report
 * - "ดูผล" -> go to results
 * - Otherwise -> show calendar bubble, stay in calendar
 */
async function handleCalendar(ctx: FlowContext): Promise<FlowResult> {
  const lower = ctx.text.toLowerCase().trim();

  if (lower.includes("ถ่ายรูป") || lower.includes("ถ่าย")) {
    return { newState: "photo_report" };
  }

  if (lower.includes("ดูผล") || lower.includes("ผลลัพธ์")) {
    return { newState: "results" };
  }

  // Show calendar
  await safePush(ctx, [
    buildCalendarBubble(calendarSteps(), ctx.liffId || "no-liff"),
  ]);
  return { newState: "calendar" };
}

// ===========================================================================
// Existing state handlers (preserved)
// ===========================================================================

/**
 * SELECT_PLOT STATE — Farmer chooses which plot to work on.
 * Expected input: Plot number (1, 2, 3...) or plot code
 */
async function handleSelectPlot(ctx: FlowContext): Promise<FlowResult> {
  const plots = await ctx.db
    .prepare("SELECT id, plot_code, area_rai FROM plots WHERE farmer_id = ? ORDER BY plot_code")
    .bind(ctx.farmerId)
    .all<{ id: string; plot_code: string; area_rai: number }>();

  if (!plots.results || plots.results.length === 0) {
    await safePush(ctx, [
      textMessage("ไม่พบแปลงนาในระบบ\nกรุณาติดต่อเจ้าหน้าที่ค่ะ"),
    ]);
    return { newState: "select_plot" };
  }

  if (plots.results.length === 1) {
    const plot = plots.results[0]!;
    await safePush(ctx, [
      textMessage(`✅ เลือกแปลง ${plot.plot_code} (${plot.area_rai} ไร่)\n\nพร้อมเริ่มทำงานได้เลยค่ะ\nพิมพ์ข้อมูลปุ๋ย หรือถามคำถามได้เลย`),
    ]);
    return { newState: "chat", selectedPlotId: plot.id };
  }

  // Multiple plots — show list
  const plotList = plots.results
    .map((p, i) => `${i + 1}. ${p.plot_code} (${p.area_rai} ไร่)`)
    .join("\n");

  const input = ctx.text.trim();
  const num = parseInt(input, 10);

  if (num >= 1 && num <= plots.results.length) {
    const plot = plots.results[num - 1]!;
    await safePush(ctx, [
      textMessage(`✅ เลือกแปลง ${plot.plot_code} (${plot.area_rai} ไร่)\n\nพร้อมเริ่มทำงานได้เลยค่ะ\nพิมพ์ข้อมูลปุ๋ย หรือถามคำถามได้เลย`),
    ]);
    return { newState: "chat", selectedPlotId: plot.id };
  }

  // Show plot list
  await safePush(ctx, [
    textMessage(`📋 แปลงนาของท่าน:\n\n${plotList}\n\nพิมพ์หมายเลขเพื่อเลือกแปลง`),
  ]);
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
            textMessage(`✅ บันทึกข้อมูลปุ๋ยเรียบร้อยแล้วค่ะ\n\nสูตร: ${d.formula}\nอัตรา: ${d.rate_kg_per_rai} กก./ไร่\nไนโตรเจน: ${nitrogenKg.toFixed(2)} กก./ไร่`),
          ]);
        } else {
          await safePush(ctx, [
            textMessage("❌ ไม่สามารถบันทึกได้ กรุณาลองใหม่"),
          ]);
        }
      } else {
        await safePush(ctx, [
          textMessage("✅ บันทึกข้อมูลเรียบร้อยแล้วค่ะ"),
        ]);
      }
    } else {
      await safePush(ctx, [
        textMessage("ไม่มีข้อมูลที่ต้องยืนยันค่ะ"),
      ]);
    }

    return { newState: "chat" };
  }

  if (["ยกเลิก", "cancel", "ไม่", "ลบ"].includes(lower)) {
    const rejected = await rejectDraft(ctx.db, ctx.farmerId);
    await safePush(ctx, [
      textMessage(rejected ? "🗑️ ยกเลิกเรียบร้อยแล้วค่ะ" : "ไม่มีข้อมูลที่ต้องยกเลิกค่ะ"),
    ]);
    return { newState: "chat" };
  }

  // Invalid input — prompt again
  await safePush(ctx, [
    textMessage("พิมพ์ 'ยืนยัน' เพื่อบันทึก หรือ 'ยกเลิก' เพื่อลบ"),
  ]);
  return { newState: "confirm_draft" };
}

// ===========================================================================
// Operational flow state handlers (push mode)
// ===========================================================================

/**
 * PHOTO_REPORT STATE — PJ-00 to PJ-13: Photo reporting.
 *
 * - "ถ่ายรูป" / camera input -> send photo reminder with LIFF camera link
 * - "ดูปฏิทิน" -> go to calendar
 * - "ดูผล" -> go to results
 * - Otherwise -> show photo status, stay in photo_report
 */
async function handlePhotoReport(ctx: FlowContext): Promise<FlowResult> {
  const lower = ctx.text.toLowerCase().trim();

  if (lower.includes("ถ่ายรูป") || lower.includes("ถ่าย")) {
    const cameraUrl = ctx.liffId
      ? `https://liff.line.me/${ctx.liffId}/camera`
      : "https://liff.line.me/";

    const reminderText = composePhotoReminder({
      roundLabel: "WET-1",
      stepCode: "SG-04",
      plotName: "แปลงของท่าน",
      dayAfterSow: 0,
      deadline: "—",
      daysLeft: 0,
      isWet: true,
      photosSubmitted: 0,
      totalPhotos: 4,
    });

    await safePush(ctx, [
      textMessage(reminderText),
      textMessage(`📸 เปิดกล้องถ่ายรูปได้ที่ลิงก์นี้:\n${cameraUrl}`),
    ]);
    return { newState: "photo_report" };
  }

  if (lower.includes("ดูปฏิทิน") || lower.includes("ปฏิทิน")) {
    return { newState: "calendar" };
  }

  if (lower.includes("ดูผล") || lower.includes("ผลลัพธ์")) {
    return { newState: "results" };
  }

  // Show photo status
  await safePush(ctx, [
    textMessage('📸 สถานะการถ่ายรูป\n\nถ่ายภาพหลักฐานตามรอบที่กำหนด\nพิมพ์ "ถ่ายรูป" เพื่อเปิดกล้อง'),
  ]);
  return { newState: "photo_report" };
}

/**
 * RESULTS STATE — RP-01 to RP-04: View results.
 *
 * - "ดูผล" -> show dashboard bubble
 * - "งานค้าง" -> show todo message
 * - "ดูปฏิทิน" -> go to calendar
 * - Otherwise -> show dashboard, stay in results
 */
async function handleResults(ctx: FlowContext): Promise<FlowResult> {
  const lower = ctx.text.toLowerCase().trim();

  if (lower.includes("ดูปฏิทิน") || lower.includes("ปฏิทิน")) {
    return { newState: "calendar" };
  }

  if (lower.includes("งานค้าง") || lower.includes("todo")) {
    const todoText = composeTodoMessage({
      pendingPhotos: 2,
      retakePhotos: 0,
      backfillSeasons: 0,
    });
    await safePush(ctx, [textMessage(todoText)]);
    return { newState: "results" };
  }

  // Default: show dashboard
  await safePush(ctx, [
    buildDashboardBubble({
      farmerName: "—",
      plotName: "แปลงของท่าน",
      totalOffset: 0,
      sfW: 0,
      approvedPhotos: 0,
      totalPhotos: 4,
      pendingTasks: 4,
    }),
  ]);
  return { newState: "results" };
}

/**
 * Handle plot selection (shared between pending->verified and select_plot states).
 */
async function handlePlotSelection(ctx: FlowContext): Promise<FlowResult> {
  const plots = await ctx.db
    .prepare("SELECT id, plot_code, area_rai FROM plots WHERE farmer_id = ? ORDER BY plot_code")
    .bind(ctx.farmerId)
    .all<{ id: string; plot_code: string; area_rai: number }>();

  if (!plots.results || plots.results.length === 0) {
    await safePush(ctx, [
      textMessage("✅ ยืนยันบัญชีเรียบร้อยแล้วค่ะ\n\nแต่ยังไม่มีแปลงนาในระบบ\nกรุณาติดต่อเจ้าหน้าที่ค่ะ"),
    ]);
    return { newState: "select_plot" };
  }

  if (plots.results.length === 1) {
    const plot = plots.results[0]!;
    await safePush(ctx, [
      textMessage(`✅ ยืนยันบัญชีเรียบร้อยแล้วค่ะ\n\nเลือกแปลง ${plot.plot_code} (${plot.area_rai} ไร่)\n\nพร้อมเริ่มทำงานได้เลยค่ะ\nพิมพ์ข้อมูลปุ๋ย หรือถามคำถามได้เลย`),
    ]);
    return { newState: "chat", selectedPlotId: plot.id };
  }

  const plotList = plots.results
    .map((p, i) => `${i + 1}. ${p.plot_code} (${p.area_rai} ไร่)`)
    .join("\n");

  await safePush(ctx, [
    textMessage(`✅ ยืนยันบัญชีเรียบร้อยแล้วค่ะ\n\n📋 แปลงนาของท่าน:\n${plotList}\n\nพิมพ์หมายเลขเพื่อเลือกแปลง`),
  ]);
  return { newState: "select_plot" };
}

/**
 * CHAT STATE — Normal AI conversation.
 * Handles quick replies, AI calls, and draft creation.
 */
async function handleChat(ctx: FlowContext): Promise<FlowResult> {
  const lower = ctx.text.toLowerCase().trim();

  // Keyword routing to new states
  if (lower.includes("ลงทะเบียน") || lower.includes("ผูกบัญชี")) {
    await safePush(ctx, [buildConsentBubble()]);
    return { newState: "consent" };
  }

  if (lower.includes("ถ่ายรูป") || lower.includes("ถ่าย")) {
    return { newState: "photo_report" };
  }

  if (lower.includes("ดูผล") || lower.includes("ผลลัพธ์")) {
    return { newState: "results" };
  }

  if (lower.includes("ดูปฏิทิน") || lower.includes("ปฏิทิน")) {
    return { newState: "calendar" };
  }

  // Handle plot switching
  if (lower.includes("เลือกแปลง") || lower.includes("เปลี่ยนแปลง")) {
    return handleSelectPlot(ctx);
  }

  // Quick replies — instant response, no AI
  const quickReplies: Record<string, string> = {
    "สวัสดี": "สวัสดีครับ! ยินดีช่วยเหลือคุณ 🌱\nพิมพ์ข้อมูลปุ๋ย หรือถามคำถามได้เลยครับ",
    "ช่วย": "📋 วิธีใช้งาน:\n• พิมพ์ข้อมูลปุ๋ย (เช่น ใส่ปุ๋ย 46-0-0 12 กก./ไร่)\n• พิมพ์ 'ถ่ายรูป' เพื่อเปิดกล้อง\n• พิมพ์ 'ดูผล' เพื่อดูแดชบอร์ด\n• ถามคำถามได้เลยครับ",
  };

  const matchedQuick = Object.entries(quickReplies).find(([kw]) => lower.includes(kw));
  if (matchedQuick) {
    await safePush(ctx, [
      textMessage(matchedQuick[1]),
    ]);
    return { newState: "chat" };
  }

  // "บันทึก" stays in chat (data entry mode)
  if (lower.includes("บันทึก")) {
    await safePush(ctx, [
      textMessage("📝 บันทึกข้อมูลแปลงนา\n\nพิมพ์ข้อมูลปุ๋ยหรือข้อมูลการเพาะปลูกได้เลยค่ะ"),
    ]);
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
    ]);

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
        textMessage(`${aiResponse.text}\n\nพิมพ์ "ยืนยัน" เพื่อบันทึก หรือ "ยกเลิก" เพื่อลบ`),
      ]);
      return { newState: "confirm_draft" };
    }

    // Regular reply
    await safePush(ctx, [
      textMessage(aiResponse.text || "ได้รับข้อความแล้วค่ะ"),
    ]);

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
      textMessage("ขออภัยค่ะ ระบบประมวลผลชั่วคราว กรุณาลองใหม่อีกครั้ง"),
    ]);
    return { newState: "chat" };
  }
}

// ===========================================================================
// API Mode (for LIFF) — returns reply text instead of pushing
// ===========================================================================

export type FlowApiResult = {
  reply: string;
  newState: ConversationState;
  selectedPlotId?: string | null;
};

/**
 * Handle flow for API mode — returns reply text instead of pushing.
 * Used by LIFF chat app. All new states return plain text (no flex).
 */
export async function handleFlowApi(ctx: FlowContext): Promise<FlowApiResult> {
  const { state } = ctx;

  switch (state) {
    case "welcome": return handleWelcomeApi(ctx);
    case "consent": return handleConsentApi(ctx);
    case "phone": return handlePhoneApi(ctx);
    case "identity_confirm": return handleIdentityConfirmApi(ctx);
    case "conditions": return handleConditionsApi(ctx);
    case "registration": return handleRegistrationApi(ctx);
    case "documents": return handleDocumentsApi(ctx);
    case "pending_review": return handlePendingReviewApi(ctx);
    case "activation": return handleActivationApi(ctx);
    case "season_setup": return handleSeasonSetupApi(ctx);
    case "calendar": return handleCalendarApi(ctx);
    case "photo_report": return handlePhotoReportApi(ctx);
    case "results": return handleResultsApi(ctx);
    // Legacy states
    case "identified": return handleIdentifiedApi(ctx);
    case "pending": return handlePendingApi(ctx);
    case "select_plot": return handleSelectPlotApi(ctx);
    case "confirm_draft": return handleConfirmDraftApi(ctx);
    case "chat":
    default: return handleChatApi(ctx);
  }
}

// --- OB-01 to OB-11 API handlers ---

async function handleWelcomeApi(ctx: FlowContext): Promise<FlowApiResult> {
  const lower = ctx.text.toLowerCase().trim();
  if (
    lower === "start_registration" ||
    lower.includes("ลงทะเบียน") ||
    lower.includes("ผูกบัญชี")
  ) {
    return { reply: composePdpaConsent(), newState: "consent" };
  }
  return { reply: composeRegistrationWelcome(), newState: "welcome" };
}

async function handleConsentApi(ctx: FlowContext): Promise<FlowApiResult> {
  const lower = ctx.text.toLowerCase().trim();
  if (
    lower === "consent_accept" ||
    lower === "ยอมรับ" ||
    lower === "accept" ||
    lower === "ตกลง"
  ) {
    return {
      reply: "✅ ยอมรับเงื่อนไขเรียบร้อยแล้วค่ะ\n\nกรุณาพิมพ์เบอร์โทรศัพท์ของท่านเพื่อผูกบัญชี (เช่น 0812345678)",
      newState: "phone",
    };
  }
  if (lower === "consent_reject" || lower === "ไม่ยินยอม" || lower === "ไม่") {
    return { reply: "กรุณายอมรับเพื่อใช้งานค่ะ", newState: "consent" };
  }
  return { reply: composePdpaConsent(), newState: "consent" };
}

async function handlePhoneApi(ctx: FlowContext): Promise<FlowApiResult> {
  const phone = ctx.text.replace(/[-\s]/g, "");
  if (!/^0\d{9}$/.test(phone)) {
    return {
      reply: "เบอร์โทรศัพท์ไม่ถูกต้อง\nกรุณาพิมพ์เบอร์โทรศัพท์ 10 หลักที่ขึ้นต้นด้วย 0 (เช่น 0812345678)",
      newState: "phone",
    };
  }

  const farmer = await ctx.db
    .prepare("SELECT id, full_name, province, district FROM farmers WHERE phone = ?")
    .bind(phone)
    .first<{ id: string; full_name: string; province: string; district: string }>();
  if (!farmer) {
    return {
      reply: "ไม่พบข้อมูลเกษตรกรในระบบ\nกรุณาติดต่อเจ้าหน้าที่โครงการค่ะ",
      newState: "phone",
    };
  }

  const existingLink = await ctx.db
    .prepare("SELECT id FROM line_links WHERE farmer_id = ? AND line_user_id != ?")
    .bind(farmer.id, ctx.userId)
    .first<{ id: string }>();
  if (existingLink) {
    return {
      reply: "เบอร์นี้ผูกกับบัญชี LINE อื่นอยู่แล้ว\nกรุณาติดต่อเจ้าหน้าที่ค่ะ",
      newState: "phone",
    };
  }

  await ctx.db
    .prepare("UPDATE line_links SET farmer_id = ?, status = 'pending', conversation_state = 'identity_confirm' WHERE id = ?")
    .bind(farmer.id, ctx.linkId)
    .run();

  return {
    reply: composeIdentityConfirmation({
      farmerName: farmer.full_name,
      province: farmer.province || "—",
      district: farmer.district || "—",
    }),
    newState: "identity_confirm",
  };
}

async function handleIdentityConfirmApi(ctx: FlowContext): Promise<FlowApiResult> {
  const lower = ctx.text.toLowerCase().trim();
  if (
    lower === "identity_confirm" ||
    lower === "ใช่" ||
    lower === "ครับ" ||
    lower === "ค่ะ" ||
    lower === "yes"
  ) {
    return {
      reply: "เงื่อนไขโครงการ\n\n1. เกษตรกรต้องทำนา wet-dry rotation ตามที่โครงการกำหนด\n2. ส่งภาพถ่ายหลักฐานตามรอบที่กำหนด (4 ภาพ/ฤดู)\n3. ให้ข้อมูลเท็จจริงและรับผิดชอบต่อข้อมูลที่กรอก\n\nพิมพ์ \"ยอมรับ\" เพื่อดำเนินการต่อ",
      newState: "conditions",
    };
  }
  if (lower === "identity_reject" || lower === "ไม่ใช่" || lower === "ไม่") {
    return { reply: "กรุณาพิมพ์เบอร์โทรศัพท์ใหม่อีกครั้งค่ะ", newState: "phone" };
  }
  return {
    reply: composeIdentityConfirmation({ farmerName: "—", province: "—", district: "—" }),
    newState: "identity_confirm",
  };
}

async function handleConditionsApi(ctx: FlowContext): Promise<FlowApiResult> {
  const lower = ctx.text.toLowerCase().trim();
  if (
    lower === "conditions_accept" ||
    lower === "ยอมรับ" ||
    lower === "accept" ||
    lower === "ตกลง"
  ) {
    const liffUrl = ctx.liffId ? `https://liff.line.me/${ctx.liffId}` : "(กรุณาเปิดฟอร์มลงทะเบียน)";
    return {
      reply: `ลงทะเบียน — กรอกฟอร์มลงทะเบียนให้เรียบร้อยค่ะ\n\nเปิดฟอร์ม: ${liffUrl}`,
      newState: "registration",
    };
  }
  return {
    reply: "เงื่อนไขโครงการ\n\n1. เกษตรกรต้องทำนา wet-dry rotation\n2. ส่งภาพถ่ายหลักฐาน (4 ภาพ/ฤดู)\n3. ให้ข้อมูลเท็จจริง\n\nพิมพ์ \"ยอมรับ\" เพื่อดำเนินการต่อ",
    newState: "conditions",
  };
}

async function handleRegistrationApi(ctx: FlowContext): Promise<FlowApiResult> {
  const lower = ctx.text.toLowerCase().trim();
  if (
    lower === "registration_complete" ||
    lower.includes("กรอกเสร็จ") ||
    lower.includes("ลงทะเบียนเสร็จ")
  ) {
    return {
      reply: "✅ ลงทะเบียนเรียบร้อยแล้วค่ะ\n\nขั้นต่อไป กรุณาอัปโหลดเอกสารสิทธิ์ (สำเนาบัตรประชาชน / สำเนาเอกสารสิทธิ์ที่ดิน)\nพิมพ์ \"อัปโหลด\" เมื่อพร้อม",
      newState: "documents",
    };
  }
  const liffUrl = ctx.liffId ? `https://liff.line.me/${ctx.liffId}` : "";
  return {
    reply: `กรุณาเปิดฟอร์มลงทะเบียนและกรอกข้อมูลให้เรียบร้อยค่ะ${liffUrl ? `\n\nเปิดฟอร์ม: ${liffUrl}` : ""}`,
    newState: "registration",
  };
}

async function handleDocumentsApi(ctx: FlowContext): Promise<FlowApiResult> {
  const lower = ctx.text.toLowerCase().trim();
  if (
    lower === "documents_complete" ||
    lower.includes("อัปโหลด") ||
    lower.includes("อัพโหลด") ||
    lower.includes("ส่งเอกสาร")
  ) {
    return {
      reply: "✅ ได้รับเอกสารแล้วค่ะ\n\n⏳ บัญชีอยู่ระหว่างรอการตรวจสอบจากเจ้าหน้าที่\nกรุณารอการยืนยันค่ะ ใช้เวลาประมาณ 1-3 วันทำการ",
      newState: "pending_review",
    };
  }
  return {
    reply: "กรุณาอัปโหลดเอกสารสิทธิ์ (สำเนาบัตรประชาชน / สำเนาเอกสารสิทธิ์ที่ดิน)\nพิมพ์ \"อัปโหลด\" เมื่ออัปโหลดเอกสารเสร็จแล้ว",
    newState: "documents",
  };
}

async function handlePendingReviewApi(ctx: FlowContext): Promise<FlowApiResult> {
  return {
    reply: "⏳ บัญชีอยู่ระหว่างรอการยืนยัน\nเจ้าหน้าที่กำลังตรวจสอบเอกสารของท่านค่ะ\nกรุณารอการยืนยันค่ะ ใช้เวลาประมาณ 1-3 วันทำการ",
    newState: "pending_review",
  };
}

async function handleActivationApi(ctx: FlowContext): Promise<FlowApiResult> {
  const farmer = await ctx.db
    .prepare("SELECT full_name, farmer_code FROM farmers WHERE id = ?")
    .bind(ctx.farmerId)
    .first<{ full_name: string; farmer_code: string }>();

  const plot = await ctx.db
    .prepare("SELECT plot_code, area_rai FROM plots WHERE farmer_id = ? ORDER BY created_at DESC LIMIT 1")
    .bind(ctx.farmerId)
    .first<{ plot_code: string; area_rai: number }>();

  const activationText = composeActivationSuccess({
    farmerCode: farmer?.farmer_code || "—",
    plotName: plot?.plot_code || "—",
    areaRai: plot?.area_rai ?? 0,
  });

  return {
    reply: `${activationText}\n\nขั้นต่อไป กรุณาระบุวันหว่านข้าว (เช่น 15/06/2568) หรือพิมพ์ \"ข้าม\" เพื่อข้าม`,
    newState: "season_setup",
  };
}

async function handleSeasonSetupApi(ctx: FlowContext): Promise<FlowApiResult> {
  const lower = ctx.text.toLowerCase().trim();
  if (lower === "ข้าม" || lower === "skip") {
    return { reply: "ข้ามการตั้งวันหว่านค่ะ\n\nเปิดปฏิทินแล้วค่ะ", newState: "calendar" };
  }

  const dateMatch = ctx.text.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (dateMatch) {
    const [, day, month, year] = dateMatch;
    const sowDate = `${day}/${month}/${year}`;

    try {
      const plot = await ctx.db
        .prepare("SELECT id FROM plots WHERE farmer_id = ? ORDER BY created_at DESC LIMIT 1")
        .bind(ctx.farmerId)
        .first<{ id: string }>();
      if (plot) {
        await ctx.db
          .prepare(`INSERT INTO seasons (id, plot_id, sow_date, created_at) VALUES (?, ?, ?, datetime('now'))`)
          .bind(crypto.randomUUID(), plot.id, sowDate)
          .run();
      }
    } catch (err) {
      console.error("Failed to create season:", err);
    }

    return {
      reply: `✅ บันทึกวันหว่าน: ${sowDate}\n\nเปิดปฏิทินแล้วค่ะ`,
      newState: "calendar",
    };
  }

  return {
    reply: 'กรุณาระบุวันหว่านในรูปแบบ DD/MM/YYYY (เช่น 15/06/2568) หรือพิมพ์ "ข้าม"',
    newState: "season_setup",
  };
}

async function handleCalendarApi(ctx: FlowContext): Promise<FlowApiResult> {
  const lower = ctx.text.toLowerCase().trim();
  if (lower.includes("ถ่ายรูป") || lower.includes("ถ่าย")) {
    return { reply: "📸 ถ่ายรูปหลักฐานได้เลยค่ะ\nเปิดกล้องจากเมนูด้านล่าง", newState: "photo_report" };
  }
  if (lower.includes("ดูผล") || lower.includes("ผลลัพธ์")) {
    return {
      reply: "แดชบอร์ดของฉัน\n\nกรุณาพิมพ์ \"งานค้าง\" เพื่อดูรายการค้าง หรือ \"ดูปฏิทิน\" เพื่อกลับ",
      newState: "results",
    };
  }
  return {
    reply: "ปฏิทินฤดูปัจจุบัน\n\nSG-01 เตรียมแปลง\nSG-02 หว่านข้าว\nSG-03 ใส่ปุ๋ยครั้งที่ 1\nSG-04 WET-1\nSG-05 DRY-1\nSG-06 ใส่ปุ๋ยครั้งที่ 2\nSG-07 WET-2\nSG-08 DRY-2\nSG-09 เก็บเกี่ยว\n\nพิมพ์ \"ถ่ายรูป\" หรือ \"ดูผล\"",
    newState: "calendar",
  };
}

async function handlePhotoReportApi(ctx: FlowContext): Promise<FlowApiResult> {
  const lower = ctx.text.toLowerCase().trim();
  if (lower.includes("ถ่ายรูป") || lower.includes("ถ่าย")) {
    const cameraUrl = ctx.liffId ? `https://liff.line.me/${ctx.liffId}/camera` : "https://liff.line.me/";
    return {
      reply: `📸 เปิดกล้องถ่ายรูปได้ที่ลิงก์นี้:\n${cameraUrl}`,
      newState: "photo_report",
    };
  }
  if (lower.includes("ดูปฏิทิน") || lower.includes("ปฏิทิน")) {
    return { reply: "ปฏิทินฤดูปัจจุบัน", newState: "calendar" };
  }
  if (lower.includes("ดูผล") || lower.includes("ผลลัพธ์")) {
    return { reply: "แดชบอร์ดของฉัน", newState: "results" };
  }
  return {
    reply: '📸 สถานะการถ่ายรูป\n\nถ่ายภาพหลักฐานตามรอบที่กำหนด\nพิมพ์ "ถ่ายรูป" เพื่อเปิดกล้อง',
    newState: "photo_report",
  };
}

async function handleResultsApi(ctx: FlowContext): Promise<FlowApiResult> {
  const lower = ctx.text.toLowerCase().trim();
  if (lower.includes("ดูปฏิทิน") || lower.includes("ปฏิทิน")) {
    return { reply: "ปฏิทินฤดูปัจจุบัน", newState: "calendar" };
  }
  if (lower.includes("งานค้าง") || lower.includes("todo")) {
    const todoText = composeTodoMessage({ pendingPhotos: 2, retakePhotos: 0, backfillSeasons: 0 });
    return { reply: todoText, newState: "results" };
  }
  const resultsText = composeResultsMessage({
    farmerName: "—",
    plotName: "แปลงของท่าน",
    totalOffset: 0,
    sfW: 0,
    photoProgress: { approved: 0, total: 4 },
    backfillCount: 0,
    pendingPhotos: 4,
  });
  return { reply: resultsText, newState: "results" };
}

// --- Legacy API handlers (identified, pending, select_plot) ---

async function handlePlotSelectionApi(ctx: FlowContext): Promise<FlowApiResult> {
  const plots = await ctx.db
    .prepare("SELECT id, plot_code, area_rai FROM plots WHERE farmer_id = ? ORDER BY plot_code")
    .bind(ctx.farmerId)
    .all<{ id: string; plot_code: string; area_rai: number }>();

  if (!plots.results || plots.results.length === 0) {
    return {
      reply: "ยังไม่มีแปลงนาในระบบ\nกรุณาพิมพ์ 'ลงทะเบียนแปลง' เพื่อเพิ่มแปลงนาใหม่ค่ะ",
      newState: "select_plot",
    };
  }

  if (plots.results.length === 1) {
    const plot = plots.results[0]!;
    return {
      reply: `เลือกแปลง ${plot.plot_code} (${plot.area_rai} ไร่)\n\nพร้อมเริ่มทำงานได้เลยค่ะ`,
      newState: "chat",
      selectedPlotId: plot.id,
    };
  }

  const plotList = plots.results
    .map((p, i) => `${i + 1}. ${p.plot_code} (${p.area_rai} ไร่)`)
    .join("\n");

  return {
    reply: `📋 แปลงนาของท่าน:\n${plotList}\n\nพิมพ์หมายเลขเพื่อเลือกแปลง`,
    newState: "select_plot",
  };
}

async function handleIdentifiedApi(ctx: FlowContext): Promise<FlowApiResult> {
  const lower = ctx.text.toLowerCase().trim();

  if (lower.includes("บันทึก") || lower.includes("ข้อมูลแปลง")) {
    return { reply: "📝 บันทึกข้อมูลแปลงนา\n\nไปที่หน้าสรุปข้อมูลเพื่อเริ่มบันทึก:\n/summary\n\nหรือพิมพ์คำถามอื่น ๆ ได้เลยค่ะ", newState: "identified" };
  }

  if (lower.includes("ถ่ายรูป") || lower.includes("ถ่าย")) {
    return { reply: "📸 ถ่ายรูปหลักฐาน\n\nไปที่หน้าถ่ายรูปเพื่อเปิดกล้อง:\n/upload\n\nรูปที่ถ่ายจะมีพิกัด GPS และเวลาอัตโนมัติค่ะ", newState: "photo_report" };
  }

  if (lower.includes("ดูสถานะ") || lower.includes("สถานะ")) {
    const seasonInput = await ctx.db
      .prepare("SELECT season_id FROM season_inputs WHERE plot_id = (SELECT id FROM plots WHERE farmer_id = ? ORDER BY created_at DESC LIMIT 1) ORDER BY created_at DESC LIMIT 1")
      .bind(ctx.farmerId)
      .first<{ season_id: string }>();

    const seasonInfo = seasonInput?.season_id
      ? `ฤดูปัจจุบัน: ${seasonInput.season_id}`
      : "ยังไม่มีข้อมูลฤดูปัจจุบัน";

    return { reply: `📊 สถานะบัญชี\n\n${seasonInfo}\nสถานะการยืนยัน: รอดำเนินการ\n\nท่านสามารถเริ่มบันทึกข้อมูลหรือถ่ายรูปได้เลยค่ะ`, newState: "identified" };
  }

  if (lower.includes("ดูผล") || lower.includes("ผลลัพธ์")) {
    return { reply: "แดชบอร์ดของฉัน", newState: "results" };
  }

  if (lower.includes("ดูปฏิทิน") || lower.includes("ปฏิทิน")) {
    return { reply: "ปฏิทินฤดูปัจจุบัน", newState: "calendar" };
  }

  // Free-text -> transition to active (chat) state
  return handleChatApi({ ...ctx, state: "chat" });
}

async function handlePendingApi(ctx: FlowContext): Promise<FlowApiResult> {
  const link = await ctx.db.prepare("SELECT status FROM line_links WHERE id = ?").bind(ctx.linkId).first<{ status: string }>();
  if (link?.status === "verified") {
    return handlePlotSelectionApi(ctx);
  }
  return { reply: "⏳ บัญชีของท่านอยู่ระหว่างรอการยืนยัน\nกรุณารอการยืนยันจากเจ้าหน้าที่ค่ะ", newState: "pending" };
}

async function handleSelectPlotApi(ctx: FlowContext): Promise<FlowApiResult> {
  const plots = await ctx.db
    .prepare("SELECT id, plot_code, area_rai FROM plots WHERE farmer_id = ? ORDER BY plot_code")
    .bind(ctx.farmerId)
    .all<{ id: string; plot_code: string; area_rai: number }>();

  if (!plots.results || plots.results.length === 0) {
    return { reply: "ไม่พบแปลงนาในระบบ\nกรุณาติดต่อเจ้าหน้าที่ค่ะ", newState: "select_plot" };
  }

  if (plots.results.length === 1) {
    const plot = plots.results[0]!;
    await ctx.db.prepare("UPDATE line_links SET selected_plot_id = ?, conversation_state = 'chat' WHERE id = ?").bind(plot.id, ctx.linkId).run();
    return { reply: `✅ เลือกแปลง ${plot.plot_code} (${plot.area_rai} ไร่)\n\nพร้อมเริ่มทำงานได้เลยค่ะ`, newState: "chat", selectedPlotId: plot.id };
  }

  const num = parseInt(ctx.text.trim(), 10);
  if (num >= 1 && num <= plots.results.length) {
    const plot = plots.results[num - 1]!;
    await ctx.db.prepare("UPDATE line_links SET selected_plot_id = ?, conversation_state = 'chat' WHERE id = ?").bind(plot.id, ctx.linkId).run();
    return { reply: `✅ เลือกแปลง ${plot.plot_code} (${plot.area_rai} ไร่)\n\nพร้อมเริ่มทำงานได้เลยค่ะ`, newState: "chat", selectedPlotId: plot.id };
  }

  const plotList = plots.results.map((p, i) => `${i + 1}. ${p.plot_code} (${p.area_rai} ไร่)`).join("\n");
  return { reply: `📋 แปลงนาของท่าน:\n\n${plotList}\n\nพิมพ์หมายเลขเพื่อเลือกแปลง`, newState: "select_plot" };
}

async function handleConfirmDraftApi(ctx: FlowContext): Promise<FlowApiResult> {
  const lower = ctx.text.toLowerCase().trim();

  if (["ยืนยัน", "confirm", "ok", "ได้", "ครับ", "ค่ะ"].includes(lower)) {
    const confirmed = await confirmDraft(ctx.db, ctx.farmerId);
    if (confirmed) {
      const { category, data } = confirmed;
      if (category === "fertilizer") {
        const d = data as { step?: string; formula?: string; rate_kg_per_rai?: number; is_urea?: boolean };
        const plot = await ctx.db.prepare("SELECT id FROM plots WHERE farmer_id = ? ORDER BY created_at DESC LIMIT 1").bind(ctx.farmerId).first<{ id: string }>();
        if (plot && d.formula && d.rate_kg_per_rai) {
          const nitrogenKg = d.is_urea ? d.rate_kg_per_rai * 0.46 : d.rate_kg_per_rai * 0.16;
          await ctx.db.prepare(`INSERT INTO fertilizer_entries (id, plot_id, season_id, step, formula, rate_kg_per_rai, percent_n, nitrogen_kg_per_rai, is_urea, confirmed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`).bind(crypto.randomUUID(), ctx.selectedPlotId || plot.id, "2568-napi", d.step || "base", d.formula, d.rate_kg_per_rai, d.is_urea ? 46 : 16, nitrogenKg, d.is_urea ? 1 : 0).run();
          return { reply: `✅ บันทึกข้อมูลปุ๋ยเรียบร้อยแล้วค่ะ\n\nสูตร: ${d.formula}\nอัตรา: ${d.rate_kg_per_rai} กก./ไร่\nไนโตรเจน: ${nitrogenKg.toFixed(2)} กก./ไร่`, newState: "chat" };
        }
        return { reply: "❌ ไม่สามารถบันทึกได้ กรุณาลองใหม่", newState: "chat" };
      }
      return { reply: "✅ บันทึกข้อมูลเรียบร้อยแล้วค่ะ", newState: "chat" };
    }
    return { reply: "ไม่มีข้อมูลที่ต้องยืนยันค่ะ", newState: "chat" };
  }

  if (["ยกเลิก", "cancel", "ไม่", "ลบ"].includes(lower)) {
    const rejected = await rejectDraft(ctx.db, ctx.farmerId);
    return { reply: rejected ? "🗑️ ยกเลิกเรียบร้อยแล้วค่ะ" : "ไม่มีข้อมูลที่ต้องยกเลิกค่ะ", newState: "chat" };
  }

  return { reply: "พิมพ์ 'ยืนยัน' เพื่อบันทึก หรือ 'ยกเลิก' เพื่อลบ", newState: "confirm_draft" };
}

async function handleChatApi(ctx: FlowContext): Promise<FlowApiResult> {
  const lower = ctx.text.toLowerCase().trim();

  // Keyword routing to new states
  if (lower.includes("ลงทะเบียน") || lower.includes("ผูกบัญชี")) {
    return { reply: composePdpaConsent(), newState: "consent" };
  }
  if (lower.includes("ถ่ายรูป") || lower.includes("ถ่าย")) {
    return { reply: "📸 ถ่ายรูปหลักฐานได้เลยค่ะ\nเปิดกล้องจากเมนูด้านล่าง", newState: "photo_report" };
  }
  if (lower.includes("ดูผล") || lower.includes("ผลลัพธ์")) {
    return { reply: "แดชบอร์ดของฉัน", newState: "results" };
  }
  if (lower.includes("ดูปฏิทิน") || lower.includes("ปฏิทิน")) {
    return { reply: "ปฏิทินฤดูปัจจุบัน", newState: "calendar" };
  }

  // Quick replies
  if (lower.includes("เลือกแปลง") || lower.includes("เปลี่ยนแปลง")) {
    return handleSelectPlotApi(ctx);
  }

  const quickReplies: Record<string, string> = {
    "สวัสดี": "สวัสดีครับ! ยินดีช่วยเหลือคุณ 🌱\nพิมพ์ข้อมูลปุ๋ย หรือถามคำถามได้เลยครับ",
    "ช่วย": "📋 วิธีใช้งาน:\n• พิมพ์ข้อมูลปุ๋ย (เช่น ใส่ปุ๋ย 46-0-0 12 กก./ไร่)\n• พิมพ์ 'ถ่ายรูป' เพื่อเปิดกล้อง\n• พิมพ์ 'ดูผล' เพื่อดูแดชบอร์ด\n• ถามคำถามได้เลยครับ",
  };

  const matched = Object.entries(quickReplies).find(([kw]) => lower.includes(kw));
  if (matched) return { reply: matched[1], newState: "chat" };

  // "บันทึก" stays in chat
  if (lower.includes("บันทึก")) {
    return { reply: "📝 บันทึกข้อมูลแปลงนา\n\nพิมพ์ข้อมูลปุ๋ยหรือข้อมูลการเพาะปลูกได้เลยค่ะ", newState: "chat" };
  }

  // AI conversation
  try {
    const [farmer, plot, seasonInput] = await Promise.all([
      ctx.db.prepare("SELECT full_name FROM farmers WHERE id = ?").bind(ctx.farmerId).first<{ full_name: string }>(),
      ctx.selectedPlotId
        ? ctx.db.prepare("SELECT plot_code FROM plots WHERE id = ?").bind(ctx.selectedPlotId).first<{ plot_code: string }>()
        : ctx.db.prepare("SELECT plot_code FROM plots WHERE farmer_id = ? ORDER BY created_at DESC LIMIT 1").bind(ctx.farmerId).first<{ plot_code: string }>(),
      ctx.db.prepare("SELECT season_id FROM season_inputs WHERE plot_id = (SELECT id FROM plots WHERE farmer_id = ? ORDER BY created_at DESC LIMIT 1) ORDER BY created_at DESC LIMIT 1").bind(ctx.farmerId).first<{ season_id: string }>(),
    ]);

    const aiResponse = await chatWithAi(ctx.apiKey, ctx.text, {
      farmerName: farmer?.full_name,
      plotCode: plot?.plot_code,
      seasonId: seasonInput?.season_id,
      linkedFarmer: true,
    });

    if (aiResponse.type === "draft") {
      const { savePendingDraft } = await import("../chat/state");
      await savePendingDraft(ctx.db, ctx.farmerId, {
        category: aiResponse.category,
        data: aiResponse.data,
        text: aiResponse.text,
      });
      await ctx.db.prepare(`INSERT INTO farmer_messages (id, farmer_id, plot_id, raw_text, draft_json, message_type, confirmed) VALUES (?, ?, ?, ?, ?, 'chat', 0)`).bind(crypto.randomUUID(), ctx.farmerId, ctx.selectedPlotId, ctx.text, JSON.stringify(aiResponse)).run();
      return { reply: `${aiResponse.text}\n\nพิมพ์ "ยืนยัน" เพื่อบันทึก หรือ "ยกเลิก" เพื่อลบ`, newState: "confirm_draft" };
    }

    await ctx.db.prepare(`INSERT INTO farmer_messages (id, farmer_id, plot_id, raw_text, draft_json, message_type, confirmed) VALUES (?, ?, ?, ?, ?, 'chat', 0)`).bind(crypto.randomUUID(), ctx.farmerId, ctx.selectedPlotId, ctx.text, JSON.stringify(aiResponse)).run();
    return { reply: aiResponse.text || "ได้รับข้อความแล้วค่ะ", newState: "chat" };
  } catch (err) {
    console.error("AI error:", err);
    return { reply: "ขออภัยค่ะ ระบบประมวลผลชั่วคราว กรุณาลองใหม่อีกครั้ง", newState: "chat" };
  }
}
