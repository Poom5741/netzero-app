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
}

export const REGISTRATION_STEPS: RegistrationStep[] = [
  { code: "OB-01", name: "ยินดีต้อนรับ", description: "Welcome message" },
  { code: "OB-02", name: "PDPA", description: "Personal data consent" },
  { code: "OB-03", name: "แชร์เบอร์", description: "Phone number sharing" },
  { code: "OB-04", name: "ยืนยันตัวตน", description: "Identity matching" },
  { code: "OB-05", name: "เงื่อนไข", description: "Project conditions (3 items)" },
  { code: "OB-06", name: "ฟอร์มสมัคร", description: "Registration form (LIFF)" },
  { code: "OB-07", name: "เอกสารสิทธิ์", description: "Document upload" },
  { code: "OB-08", name: "รอตรวจสอบ", description: "Pending review" },
  { code: "OB-09", name: "เปิดใช้งาน", description: "Account activation" },
  { code: "OB-10", name: "วันหว่าน", description: "Season setup" },
  { code: "OB-11", name: "ปฏิทิน", description: "First calendar display" },
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
  lines.push("ใช้ส่งภาพและกรอกข้อมูลแปลงนา เพื่อคิดคาร์บอนเครดิตให้พี่น้องเกษตรกรครับ ใช้เวลาตอนสมัครประมาณ 10 นาที หลังจากนั้นเดือนละไม่กี่ครั้ง");
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
