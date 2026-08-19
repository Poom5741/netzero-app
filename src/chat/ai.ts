/**
 * AI Chat module — calls Workers AI (LLM) for farmer conversations.
 *
 * Level C: FAQ/guidance — answers questions, doesn't write to DB
 * Level A+B: Draft parser — extracts structured data from free text
 */

const MODEL = "@cf/qwen/qwen3.8-27b";

const SYSTEM_PROMPT = `คุณเป็นผู้ช่วยเกษตรกรในระบบ NetZeroCarbon สำหรับโครงการคาร์บอนเครดิตนาข้าว AWD (Alternate Wetting and Drying)

หน้าที่ของคุณ:
1. ช่วยเกษตรกรกรอกข้อมูลการทำนา (ปุ๋ย, น้ำ, ฟาง, น้ำมัน, ไฟฟ้า, ผลผลิต)
2. ตอบคำถามเกี่ยวกับโครงการ
3. แนะนำขั้นตอนการทำงาน

กฎ:
- ตอบเป็นภาษาไทยเท่านั้น สั้น กระชับ เข้าใจง่าย
- ใช้ภาษาที่เกษตรกรเข้าใจ (ไม่ใช่ศัพท์เทคนิค)
- ไม่สร้างข้อมูลเท็จ ถ้าไม่แน่ใจให้บอก

เมื่อเกษตรกรส่งข้อความ ให้วิเคราะห์และตอบในรูปแบบ JSON เท่านั้น:

ถ้าเป็นคำถาม/ทักทาย/ขอความช่วยเหลือ:
{"type":"reply","text":"ข้อความตอบ"}

ถ้าพบข้อมูลปุ๋ย (สูตร, อัตรา, ขั้นตอน):
{"type":"draft","category":"fertilizer","data":{"step":"base|tillering|panicle","formula":"เช่น 46-0-0","rate_kg_per_rai":ตัวเลข,"is_urea":true/false},"text":"สรุปข้อมูลที่พบ"}

ถ้าพบข้อมูลน้ำ/ฟาง/พลังงาน/ผลผลิต:
{"type":"draft","category":"season_input","data":{"field":"water_level_cm|straw_mgmt|fuel_liters|electricity_kwh|yield_kg_rai","value":ค่าที่พบ},"text":"สรุปข้อมูลที่พบ"}

ถ้าต้องการให้เกษตรกรถ่ายภาพ:
{"type":"reply","text":"ข้อความแนะนำให้ถ่ายภาพพร้อมเหตุผล"}

ข้อมูลระบบ:
- ขั้นตอนปุ๋ย: "base" = หว่าน/เตรียมดิน, "tillering" = แตกกอ, "panicle" = ช่อ/รวง
- สูตรปุ๋ยที่พบบ่อย: 46-0-0 (ยูเรีย), 16-16-8, 15-15-15, 27-14-0
- is_urea = true เมื่อสูตรคือ 46-0-0
- หน่วยอัตราปุ๋ย: กก./ไร่
- หน่วยน้ำ: ซม. (ระดับน้ำในท่อ)
- หน่วยผลผลิต: กก./ไร่`;

type AiReply = {
  type: "reply";
  text: string;
};

type AiDraft = {
  type: "draft";
  category: "fertilizer" | "season_input";
  data: Record<string, unknown>;
  text: string;
};

export type AiResponse = AiReply | AiDraft;

/**
 * Call Workers AI with the farmer's message and return a structured response.
 */
export async function chatWithAi(
  ai: Ai,
  userMessage: string,
  context: {
    farmerName?: string;
    plotCode?: string;
    seasonId?: string;
    linkedFarmer?: boolean;
  },
): Promise<AiResponse> {
  const contextParts: string[] = [];
  if (context.farmerName) contextParts.push(`ชื่อเกษตรกร: ${context.farmerName}`);
  if (context.plotCode) contextParts.push(`แปลงปัจจุบัน: ${context.plotCode}`);
  if (context.seasonId) contextParts.push(`ฤดู: ${context.seasonId}`);
  if (context.linkedFarmer === false) contextParts.push(`สถานะ: ยังไม่ได้ผูกบัญชี`);

  const userPrompt = contextParts.length > 0
    ? `[ข้อมูลผู้ใช้]\n${contextParts.join("\n")}\n\n[ข้อความจากเกษตรกร]\n${userMessage}`
    : userMessage;

  const response = await ai.run(MODEL, {
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    max_tokens: 512,
    temperature: 0.3,
  });

  const rawResponse = response?.response ?? "";

  // Workers AI may return an object or a JSON string — normalize to object
  let parsed: Record<string, unknown> | null = null;
  if (typeof rawResponse === "object" && rawResponse !== null) {
    parsed = rawResponse as Record<string, unknown>;
  } else if (typeof rawResponse === "string") {
    try {
      parsed = JSON.parse(rawResponse.trim());
    } catch {
      // Not JSON — treat as plain text
      return { type: "reply", text: rawResponse || "ขออภัยค่ะ ไม่สามารถประมวลผลได้ กรุณาลองใหม่อีกครั้ง" };
    }
  }

  if (parsed) {
    if (parsed.type === "reply") {
      const text = typeof parsed.text === "string"
        ? parsed.text
        : parsed.text?.text || JSON.stringify(parsed.text);
      return { type: "reply", text };
    }
    if (parsed.type === "draft" && parsed.category && parsed.data) {
      const text = typeof parsed.text === "string"
        ? parsed.text
        : parsed.text?.text || "";
      return {
        type: "draft",
        category: parsed.category as "fertilizer" | "season_input",
        data: parsed.data as Record<string, unknown>,
        text,
      };
    }
  }

  // Fallback
  return { type: "reply", text: "ขออภัยค่ะ ไม่สามารถประมวลผลได้ กรุณาลองใหม่อีกครั้ง" };
}
