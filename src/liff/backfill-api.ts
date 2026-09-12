/**
 * LIFF Backfill API — historical season data entry (up to 3 years).
 *
 * Farmers who joined mid-season can enter past season data
 * for more accurate carbon credit calculations.
 */

export interface BackfillPromptInput {
  plotName: string;
  missingSeasons: number;
  availableYears: string[];
}

export interface BackfillEntryInput {
  plot_id: string;
  season_name: string;
  sow_date: string;
  water_management: string;
  yield_kg_per_rai?: number;
  straw_management?: string;
  fuel_liters_per_rai?: number;
  electricity_kwh_per_rai?: number;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Compose the backfill prompt message.
 * Matches the design system's backfill flow.
 */
export function composeBackfillPrompt(input: BackfillPromptInput): string {
  if (input.missingSeasons === 0) {
    return `ข้อมูลย้อนหลังของ ${input.plotName} ครบทุกฤดูแล้วครับ 🎉`;
  }

  const lines: string[] = [];

  lines.push(`ข้อมูลย้อนหลังของ ${input.plotName}`);
  lines.push("");
  lines.push(`ยังเหลืออีก ${input.missingSeasons} ฤดูที่ยังไม่ได้กรอก`);
  lines.push("");
  lines.push("ฤดูที่กรอกได้:");
  for (const year of input.availableYears) {
    lines.push(`- นาปี ${year}`);
  }
  lines.push("");
  lines.push("ข้อมูลที่ต้องกรอก:");
  lines.push("• วันหว่าน");
  lines.push("• การจัดการน้ำ (เปียกสลับแห้ง / น้ำขังตลอด)");
  lines.push("• ผลผลิต (กก./ไร่) ถ้าทราบ");
  lines.push("• การจัดการฟาง (ฝังกลบ / เผา / อื่นๆ)");

  return lines.join("\n");
}

/**
 * Validate a backfill entry submission.
 */
export function validateBackfillEntry(input: BackfillEntryInput): ValidationResult {
  if (!input.sow_date?.trim()) {
    return { valid: false, error: "sow_date is required" };
  }
  if (!input.water_management?.trim()) {
    return { valid: false, error: "water_management is required" };
  }
  return { valid: true };
}
