type FaqResult = {
  reply: string;
  wroteToDb: boolean;
};

type FaqRule = {
  keywords: string[];
  reply: string;
};

const FAQ_RULES: FaqRule[] = [
  {
    keywords: ["สวัสดี", "หวัดดี", "hello", "hi"],
    reply: "สวัสดีค่ะ! ยินดีต้อนรับสู่ระบบ NetZeroCarbon 🌱 มีอะไรให้ช่วยไหมคะ?",
  },
  {
    keywords: ["ราคา", "ข้าว", "ขาย", "ราคาข้าว"],
    reply: "ราคาข้าวเปลือกขึ้นอยู่กับสายพันธุ์และตลาด สามารถตรวจสอบราคาได้ที่ https://www.thaismep.go.th",
  },
  {
    keywords: ["ฝน", "อากาศ", "พยากรณ์", "น้ำ"],
    reply: "ตรวจสอบพยากรณ์อากาศได้ที่ https://weather.tmd.go.th หรือแอป Thai Weather",
  },
  {
    keywords: ["ปุ๋ย", "ertilizer", "สูตร"],
    reply: "สำหรับสูตรปุ๋ย ควรใช้ตามคำแนะนำของกรมวิชาการเกษตร ติดต่อเกษตรอำเภอของท่านเพื่อรับคำแนะนำ",
  },
  {
    keywords: ["ช่วย", "help", "วิธีใช้"],
    reply: "พิมพ์คำถามได้เลยค่ะ เช่น ถามเรื่องราคาข้าว ปุ๋ย หรือสภาพอากาศ",
  },
];

function findMatchingRule(text: string): FaqRule | undefined {
  const lower = text.toLowerCase();
  return FAQ_RULES.find((rule) => rule.keywords.some((kw) => lower.includes(kw.toLowerCase())));
}

const DEFAULT_REPLY = "ขออภัยค่ะ ไม่เข้าใจคำถาม กรุณาลองใหม่อีกครั้ง หรือพิมพ์ 'ช่วย' เพื่อดูรายการคำถามที่ถามได้";

export async function handleFaq(text: string): Promise<FaqResult> {
  const rule = findMatchingRule(text);
  return {
    reply: rule?.reply ?? DEFAULT_REPLY,
    wroteToDb: false,
  };
}
