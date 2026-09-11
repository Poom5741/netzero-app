/**
 * RP-01 to RP-04 — Results display and backfill chat flow.
 *
 * Composes messages showing:
 * - Carbon credit estimate (tCO₂eq)
 * - Photo progress (X/4)
 * - Pending tasks
 * - Backfill prompts
 */

export interface ResultsMessageInput {
  farmerName: string;
  plotName: string;
  totalOffset: number;
  sfW: number;
  photoProgress: { approved: number; total: number };
  backfillCount: number;
  pendingPhotos: number;
}

export interface TodoMessageInput {
  pendingPhotos: number;
  retakePhotos: number;
  backfillSeasons: number;
}

/**
 * Compose the results summary message shown to farmers.
 * Matches the design system's dashboard modal (RP-01).
 */
export function composeResultsMessage(input: ResultsMessageInput): string {
  const lines: string[] = [];

  lines.push(`แดชบอร์ดของฉัน`);
  lines.push(`${input.plotName} · ${input.farmerName}`);
  lines.push("");
  lines.push("คาร์บอนที่ลดได้ (ประมาณการ)");
  lines.push(`${input.totalOffset.toFixed(2)} tCO₂eq`);

  if (input.sfW < 0.6) {
    lines.push("ถ้าส่งภาพครบ 4 รอบจะได้เต็มค่านี้");
  } else {
    lines.push(`ภาพไม่ครบ ระบบคำนวณต่ำลง (SF_w = ${input.sfW})`);
  }

  lines.push("");
  lines.push("ภาพหลักฐานครอปนี้");
  lines.push(`${input.photoProgress.approved}/${input.photoProgress.total} ภาพ`);

  if (input.pendingPhotos > 0) {
    lines.push("");
    lines.push(`ยังเหลืออีก ${input.pendingPhotos} ภาพที่ต้องถ่าย`);
  }

  if (input.backfillCount > 0) {
    lines.push("");
    lines.push(`ข้อมูลย้อนหลังที่ยังไม่กรอก: ${input.backfillCount} ฤดู`);
    lines.push("กรอกข้อมูลย้อนหลังเพื่อคำนวณคาร์บอนเครดิตย้อนหลัง");
  }

  return lines.join("\n");
}

/**
 * Compose the TODO list message showing pending tasks.
 * Matches the design system's TODO panel (RP-03).
 */
export function composeTodoMessage(input: TodoMessageInput): string {
  const total = input.pendingPhotos + input.retakePhotos + input.backfillSeasons;

  if (total === 0) {
    return "ไม่มีงานค้างครับ 🎉 ทุกอย่างเรียบร้อยแล้ว";
  }

  const lines: string[] = [];
  lines.push("งานค้างของคุณ");
  lines.push(`เหลือ ${total} เรื่องที่ต้องทำครับ`);
  lines.push("");

  if (input.retakePhotos > 0) {
    lines.push(`📷 ภาพที่ต้องถ่ายใหม่: ${input.retakePhotos} รายการ`);
  }
  if (input.pendingPhotos > 0) {
    lines.push(`📷 ภาพที่ยังไม่ส่ง: ${input.pendingPhotos} ภาพ`);
  }
  if (input.backfillSeasons > 0) {
    lines.push(`📋 ฤดูย้อนหลังที่ยังไม่กรอก: ${input.backfillSeasons} ฤดู`);
  }

  return lines.join("\n");
}
