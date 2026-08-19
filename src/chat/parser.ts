type DraftResult =
  | {
      type: "fertilizer";
      raw_text: string;
      confidence: number;
      data: {
        step: "base" | "tillering" | "panicle" | null;
        formula: string | null;
        rate_kg_per_rai: number | null;
        is_urea: boolean;
      };
    }
  | {
      type: "photo";
      raw_text: string;
      confidence: number;
      data: Record<string, never>;
    }
  | {
      type: "unknown";
      raw_text: string;
      confidence: number;
      data: Record<string, never>;
    };

const STEP_KEYWORDS: Array<[string, "base" | "tillering" | "panicle"]> = [
  ["ฐาน", "base"],
  ["หว่าน", "base"],
  ["แตกกอ", "tillering"],
  ["ช่อ", "panicle"],
  ["รวง", "panicle"],
  ["panicle", "panicle"],
  ["base", "base"],
  ["tillering", "tillering"],
];

function detectStep(text: string): "base" | "tillering" | "panicle" | null {
  for (const [kw, step] of STEP_KEYWORDS) {
    if (text.includes(kw)) return step;
  }
  return null;
}

function extractFormula(text: string): string | null {
  const match = text.match(/(\d{1,3}-\d{1,3}-\d{1,3})/);
  return match?.[1] ?? null;
}

function extractRate(text: string): number | null {
  const match = text.match(/(\d+(?:\.\d+)?)\s*(?:กก|kg)/i);
  return match?.[1] ? Number(match[1]) : null;
}

function isUreaFormula(formula: string | null): boolean {
  return formula === "46-0-0";
}

const FERTILIZER_PATTERNS = ["ปุ๋ย", "fertilizer", "สูตร"];
const PHOTO_PATTERNS = ["ถ่ายรูป", "รูปภาพ", "ถ่าย", "photo"];

export function parseDraft(text: string): DraftResult {
  const lower = text.toLowerCase();

  if (PHOTO_PATTERNS.some((p) => lower.includes(p))) {
    return { type: "photo", raw_text: text, confidence: 0.8, data: {} };
  }

  const isFertilizer = FERTILIZER_PATTERNS.some((p) => lower.includes(p));
  if (isFertilizer) {
    const formula = extractFormula(text);
    const rate = extractRate(text);
    const step = detectStep(text);
    return {
      type: "fertilizer",
      raw_text: text,
      confidence: formula ? 0.9 : 0.5,
      data: { step, formula, rate_kg_per_rai: rate, is_urea: isUreaFormula(formula) },
    };
  }

  return { type: "unknown", raw_text: text, confidence: 0.1, data: {} };
}
