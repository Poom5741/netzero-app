/**
 * LIFF Farmer Dashboard API — carbon credits, photo progress, pending tasks.
 *
 * Matches the design system's dashboard modal (RP-01).
 */

export interface DashboardInput {
  farmerName: string;
  plotCode: string;
  plotName: string;
  areaRai: number;
  totalOffset: number;
  sfW: number;
  photoProgress: { approved: number; total: number };
  pendingPhotos: number;
  backfillCount: number;
}

/**
 * Compose the farmer dashboard message.
 */
export function composeDashboardMessage(input: DashboardInput): string {
  const lines: string[] = [];

  lines.push(`แดชบอร์ดของฉัน`);
  lines.push(`${input.plotCode} · ${input.plotName} · ${input.farmerName}`);
  lines.push("");
  lines.push("คาร์บอนที่ลดได้ (ประมาณการ)");
  lines.push(`${input.totalOffset.toFixed(2)} tCO₂eq`);

  if (input.sfW < 0.6) {
    lines.push("ถ้าส่งภาพครบ 4 รอบจะได้เต็มค่านี้");
  } else {
    lines.push(`ภาพไม่ครบ ระบบคำนวณต่ำลง (SF_w = ${input.sfW})`);
  }

  lines.push("");
  lines.push("เนื้อที่");
  lines.push(`${input.areaRai} ไร่`);
  lines.push("");
  lines.push("ภาพหลักฐานครอปนี้");
  lines.push(
    `${input.photoProgress.approved}/${input.photoProgress.total} ภาพ — เปียก 2 แห้ง 2 สลับกัน`,
  );

  const totalTasks = input.pendingPhotos + input.backfillCount;
  lines.push("");
  lines.push("ขั้นต่อไป");

  if (totalTasks === 0) {
    lines.push("ครบทุกรายการแล้วครับ 🎉");
  } else {
    if (input.pendingPhotos > 0) {
      lines.push(`📷 ถ่ายภาพอีก ${input.pendingPhotos} ภาพ`);
    }
    if (input.backfillCount > 0) {
      lines.push(`📋 กรอกข้อมูลย้อนหลัง ${input.backfillCount} ฤดู`);
    }
  }

  return lines.join("\n");
}
