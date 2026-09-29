/**
 * OB-01 to OB-11 — Registration chat flow.
 *
 * Handles the complete farmer onboarding sequence:
 * OB-01: Welcome message
 * OB-02: PDPA consent
 * OB-03: Phone sharing
 * OB-04: Identity matching
 * OB-05: Project conditions (3 items)
 * OB-06: Registration form (LIFF)
 * OB-07: Document upload
 * OB-08: Pending review
 * OB-09: Account activation
 * OB-10: Season setup (sowing date)
 * OB-11: First calendar display
 */

export interface RegistrationStep {
  code: string;
  name: string;
  description: string;
  /**
   * The code the artifact's script uses for the same step. The two schemes
   * diverged and OB-10/OB-11 collide (artifact: application received / farmer
   * code; legacy: sow date / calendar), so specs and logs must be able to say
   * which scheme they mean. See specs/016-flow-parity/node-design-spec.md §3.
   */
  legacyCode?: string;
}

/**
 * Registration steps in artifact script numbering (OB-01…OB-13, LF-01).
 * `legacyCode` preserves the old identifier for existing logs.
 */
export const REGISTRATION_STEPS: RegistrationStep[] = [
  { code: "OB-01", name: "ยินดีต้อนรับ", description: "Welcome message" },
  { code: "OB-15", name: "PDPA", description: "Personal data consent", legacyCode: "OB-02" },
  { code: "OB-02", name: "แชร์เบอร์", description: "Phone number sharing", legacyCode: "OB-03" },
  { code: "OB-03", name: "ยืนยันตัวตน", description: "Identity matching", legacyCode: "OB-04" },
  { code: "OB-05", name: "เงื่อนไข", description: "Project conditions (3 items)" },
  { code: "OB-12", name: "ฟอร์มสมัคร", description: "Registration form prompt", legacyCode: "OB-06" },
  {
    code: "LF-01",
    name: "ฟอร์มสมัคร (LIFF)",
    description: "Registration form (LIFF)",
    legacyCode: "OB-06",
  },
  { code: "OB-13", name: "เอกสารสิทธิ์", description: "Document upload", legacyCode: "OB-07" },
  { code: "OB-10", name: "รอตรวจสอบ", description: "Pending review", legacyCode: "OB-08" },
  { code: "OB-11", name: "เปิดใช้งาน", description: "Account activation", legacyCode: "OB-09" },
];

/**
 * Compose the welcome message (OB-01).
 */
export function composeRegistrationWelcome(): string {
  const lines: string[] = [];
  lines.push("ยินดีต้อนรับ");
  lines.push("");
  lines.push("โครงการทำนาลดโลกร้อน (เปียกสลับแห้ง)");
  lines.push("");
  lines.push("สวัสดีครับ 🌾 นี่คือ LINE ของ NetZeroCarbon");
  lines.push(
    "ใช้ส่งภาพและกรอกข้อมูลแปลงนา เพื่อคิดคาร์บอนเครดิตให้พี่น้องเกษตรกรครับ ใช้เวลาตอนสมัครประมาณ 10 นาที หลังจากนั้นเดือนละไม่กี่ครั้ง",
  );
  return lines.join("\n");
}

/**
 * Compose the PDPA consent message (OB-02).
 */
export function composePdpaConsent(): string {
  const lines: string[] = [];
  lines.push("CS-01 · PDPA");
  lines.push("ความยินยอมเก็บและใช้ข้อมูลส่วนบุคคล");
  lines.push("");
  lines.push("ก่อนจะถามอะไรต่อ ขออนุญาตเรื่องข้อมูลส่วนตัวก่อนนะครับ");
  lines.push("");
  lines.push("เก็บอะไร");
  lines.push("ชื่อ · เพศ · เบอร์โทร · ที่อยู่ · เลขบัตร ปชช.");
  lines.push("");
  lines.push("เก็บเพิ่มภายหลัง");
  lines.push("ตำแหน่งแปลง · ภาพถ่ายแปลงนา");
  lines.push("");
  lines.push("ใช้ทำอะไร");
  lines.push("ขึ้นทะเบียนและดำเนินโครงการคาร์บอนเครดิต");
  lines.push("");
  lines.push("ถอนความยินยอม");
  lines.push("ทำได้ทุกเมื่อ แจ้งผู้ประสานงาน");
  return lines.join("\n");
}

/**
 * Compose identity confirmation message (OB-04).
 */
export function composeIdentityConfirmation(input: {
  farmerName: string;
  province: string;
  district: string;
}): string {
  const lines: string[] = [];
  lines.push("ยืนยันตัวตน");
  lines.push("พบเบอร์นี้ในทะเบียนแล้ว");
  lines.push("");
  lines.push(input.farmerName);
  lines.push(`อ.${input.district} จ.${input.province}`);
  lines.push("");
  lines.push("ใช่ท่านหรือไม่ครับ");
  return lines.join("\n");
}

/**
 * Compose activation success message (OB-09).
 */
export function composeActivationSuccess(input: {
  farmerCode: string;
  plotName: string;
  areaRai: number;
}): string {
  const lines: string[] = [];
  lines.push("บัญชีของคุณเปิดใช้งานแล้ว 🎉");
  lines.push("");
  lines.push(`รหัสเกษตรกร ${input.farmerCode}`);
  lines.push("ผู้ประสานงานยืนยันตัวตนเรียบร้อย");
  lines.push("");
  lines.push("แปลง");
  lines.push(`${input.plotName} · ${input.areaRai} ไร่`);
  lines.push("");
  lines.push("ขั้นต่อไป");
  lines.push("แจ้งวันหว่านเพื่อเปิดฤดู");
  return lines.join("\n");
}
