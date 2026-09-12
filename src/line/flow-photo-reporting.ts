/**
 * PJ-00 to PJ-13 — Photo reporting chat flow.
 *
 * Handles the seasonal photo submission sequence:
 * - Calendar display (9 steps)
 * - Photo prompts for WET/DRY rounds
 * - Submission confirmation
 * - Staff review status
 * - Rejection with retake instructions
 */

export interface PhotoStep {
  code: string;
  stepCode: string;
  name: string;
  isWet: boolean;
}

export const PJ_STEPS: PhotoStep[] = [
  { code: "PJ-00", stepCode: "SG-01", name: "เตรียมแปลง", isWet: false },
  { code: "PJ-01", stepCode: "SG-02", name: "หว่านข้าว", isWet: false },
  { code: "PJ-02", stepCode: "SG-03", name: "ใส่ปุ๋ยครั้งที่ 1", isWet: false },
  { code: "PJ-03", stepCode: "SG-04", name: "ภาพรอบที่ 1 เปียก (WET-1)", isWet: true },
  { code: "PJ-04", stepCode: "SG-05", name: "ภาพรอบที่ 1 แห้ง (DRY-1)", isWet: false },
  { code: "PJ-05", stepCode: "SG-06", name: "ใส่ปุ๋ยครั้งที่ 2", isWet: false },
  { code: "PJ-06", stepCode: "SG-07", name: "ภาพรอบที่ 2 เปียก (WET-2)", isWet: true },
  { code: "PJ-07", stepCode: "SG-08", name: "ภาพรอบที่ 2 แห้ง (DRY-2)", isWet: false },
  { code: "PJ-08", stepCode: "SG-09", name: "เก็บเกี่ยว", isWet: false },
];

export interface PhotoReminderInput {
  roundLabel: string;
  stepCode: string;
  plotName: string;
  dayAfterSow: number;
  deadline: string;
  daysLeft: number;
  isWet: boolean;
  photosSubmitted: number;
  totalPhotos: number;
}

export interface PhotoAcceptedInput {
  roundLabel: string;
  photosAccepted: number;
  totalPhotos: number;
  nextRound: string | null;
}

export interface PhotoRejectedInput {
  roundLabel: string;
  reason: string;
  deadline: string;
  plotName: string;
}

/**
 * Compose the photo reminder message for a round.
 */
export function composePhotoReminder(input: PhotoReminderInput): string {
  const lines: string[] = [];

  lines.push(`${input.roundLabel} · ${input.stepCode}`);
  lines.push("");
  lines.push(`รอบที่ ${input.roundLabel.split("-")[0]} · ช่วง${input.isWet ? "เปียก" : "แห้ง"}`);
  lines.push("");
  lines.push("ถึงเวลารายงานแล้วครับ 🌾");
  lines.push(`${input.plotName} · วันที่ ${input.dayAfterSow} หลังหว่าน`);
  lines.push("");
  lines.push("ส่งได้ถึง");
  lines.push(`${input.deadline} · เหลือ ${input.daysLeft} วัน`);
  lines.push("");
  lines.push("สิ่งที่ต้องส่ง");

  if (input.isWet) {
    lines.push("ภาพท่อ PVC ตอนน้ำเต็มระดับผิวดิน");
  } else {
    lines.push("ภาพท่อ + ระดับน้ำต่ำกว่าผิวดิน (ซม.)");
  }

  lines.push("");
  lines.push("ครอปนี้ต้องส่งทั้งหมด");
  lines.push(`4 ภาพ — เปียก 2 แห้ง 2 สลับกัน`);
  lines.push("");
  lines.push(`ส่งแล้ว ${input.photosSubmitted}/${input.totalPhotos} ภาพ`);

  return lines.join("\n");
}

/**
 * Compose the photo accepted confirmation message.
 */
export function composePhotoAccepted(input: PhotoAcceptedInput): string {
  const lines: string[] = [];

  if (input.photosAccepted >= input.totalPhotos) {
    lines.push("ครบทั้ง 4 ภาพแล้วครับ 🎉");
    lines.push("");
    lines.push("ใช้ตัวปรับการจัดการน้ำ SF_w = 0.55 ได้เต็มค่า");
    lines.push("ถ้าส่งภาพครบ 4 รอบจะได้คาร์บอนเครดิตเต็มจำนวน");
  } else {
    lines.push(`รับภาพรอบที่ ${input.roundLabel} แล้วครับ ✅`);
    lines.push(`เหลืออีก ${input.totalPhotos - input.photosAccepted} ภาพในครอปนี้`);
    if (input.nextRound) {
      lines.push(`รอบถัดไปคือ ${input.nextRound}`);
    }
  }

  return lines.join("\n");
}

/**
 * Compose the photo rejected message with retake instructions.
 */
export function composePhotoRejected(input: PhotoRejectedInput): string {
  const lines: string[] = [];

  lines.push(`${input.roundLabel} · ตีกลับ`);
  lines.push("");
  lines.push("ภาพยังใช้ไม่ได้ครับ");
  lines.push(`"เหตุผล: ${input.reason}"`);
  lines.push("");
  lines.push(`ช่วยเอาน้ำเข้าแปลงแล้วถ่ายใหม่ภายในวันที่ ${input.deadline} นะครับ`);
  lines.push("");
  lines.push("รอบที่แจ้ง");
  lines.push(`รอบที่ ${input.roundLabel}`);
  lines.push("สิ่งที่เห็นในภาพ");
  lines.push(input.reason);
  lines.push("");
  lines.push(`${input.plotName}`);

  return lines.join("\n");
}
