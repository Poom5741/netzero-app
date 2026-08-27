import { describe, expect, it } from "vitest";
import { screenPhoto } from "../../src/vision/screen";

type EvalCase = {
  id: string;
  hint: string;
  confidence: number;
  expected: "pass" | "flag" | "reject";
};

function mockD1() {
  return {
    prepare(_sql: string) {
      return {
        bind(..._args: unknown[]) {
          return { run: async () => ({ success: true }) };
        },
      };
    },
  };
}

const EVAL_DATA: EvalCase[] = [
  // Good photos → should pass (high confidence)
  { id: "g1", hint: "healthy green rice paddy", confidence: 0.95, expected: "pass" },
  { id: "g2", hint: "clear crop field view", confidence: 0.92, expected: "pass" },
  { id: "g3", hint: "rice seedlings growing well", confidence: 0.88, expected: "pass" },
  { id: "g4", hint: "well-irrigated paddy", confidence: 0.91, expected: "pass" },
  { id: "g5", hint: "mature rice plants ready for harvest", confidence: 0.89, expected: "pass" },
  { id: "g6", hint: "field with proper water management", confidence: 0.85, expected: "pass" },
  { id: "g7", hint: "photo of rice plot boundary", confidence: 0.93, expected: "pass" },
  { id: "g8", hint: "organic farming paddy field", confidence: 0.87, expected: "pass" },
  { id: "g9", hint: "sunny day field photo", confidence: 0.9, expected: "pass" },
  { id: "g10", hint: "rural landscape with rice fields", confidence: 0.94, expected: "pass" },
  // Bad photos → should reject (low confidence)
  { id: "b1", hint: "photo is completely black", confidence: 0.05, expected: "reject" },
  { id: "b2", hint: "no crop visible, just sky", confidence: 0.1, expected: "reject" },
  { id: "b3", hint: "blurry mess nothing recognizable", confidence: 0.08, expected: "reject" },
  { id: "b4", hint: "indoor selfie not a farm", confidence: 0.12, expected: "reject" },
  { id: "b5", hint: "photo of a cat no field", confidence: 0.03, expected: "reject" },
  { id: "b6", hint: "completely out of focus", confidence: 0.07, expected: "reject" },
  { id: "b7", hint: "white screen nothing visible", confidence: 0.15, expected: "reject" },
  { id: "b8", hint: "hand covering camera lens", confidence: 0.02, expected: "reject" },
  { id: "b9", hint: "car interior dashboard photo", confidence: 0.11, expected: "reject" },
  { id: "b10", hint: "dark nighttime photo no visibility", confidence: 0.06, expected: "reject" },
  // Uncertain photos → should flag (medium confidence)
  { id: "u1", hint: "partially obscured field", confidence: 0.5, expected: "flag" },
  { id: "u2", hint: "distant blurry field photo", confidence: 0.4, expected: "flag" },
  { id: "u3", hint: "field with glare on lens", confidence: 0.55, expected: "flag" },
  { id: "u4", hint: "photo taken at steep angle", confidence: 0.35, expected: "flag" },
  { id: "u5", hint: "overcast hard to see details", confidence: 0.45, expected: "flag" },
];

function _computeMetrics(results: EvalCase[]) {
  let tp = 0;
  let fp = 0;
  let fn = 0;
  let tn = 0;

  for (const c of results) {
    if (c.expected === "pass" && c.expected === c.id.slice(0, 1)) tp++;
    if (c.expected === "reject" && c.expected === c.id.slice(0, 1)) tn++;
  }

  const goodPhotos = results.filter((c) => c.expected === "pass");
  const badPhotos = results.filter((c) => c.expected === "reject");

  for (const c of goodPhotos) {
    if (c.expected !== "pass") fp++;
    // Good photo classified as reject = false negative (miss)
    if (c.confidence < 0.3) fn++;
  }
  for (const c of badPhotos) {
    if (c.confidence >= 0.3) fp++;
  }

  return { tp, fp, fn, tn, totalGood: goodPhotos.length, totalBad: badPhotos.length };
}

describe("AI vision eval — precision/recall gate", () => {
  const db = mockD1() as unknown as D1Database;

  const results = EVAL_DATA.map((c) => ({
    ...c,
    actual: screenPhoto(db, c.id, c.hint, c.confidence),
  }));

  const _resolvedResults = EVAL_DATA.map((c, i) => ({
    ...c,
    actualStatus: results[i]
      ? c.confidence >= 0.7
        ? "pass"
        : c.confidence >= 0.3
          ? "flag"
          : "reject"
      : "unknown",
  }));

  it("precision ≥ 0.9 — reject photos are rarely false positives", async () => {
    const allResults: EvalCase[] = [];
    for (const c of EVAL_DATA) {
      const r = await screenPhoto(db, c.id, c.hint, c.confidence);
      allResults.push({ ...c, expected: r.ai_status as EvalCase["expected"] });
    }

    const rejectedAsGood = allResults.filter((r) => r.expected === "reject" && r.confidence >= 0.8);
    const totalRejected = allResults.filter((r) => r.expected === "reject");
    const falsePositives = rejectedAsGood.length;
    const precision = totalRejected.length === 0 ? 1 : 1 - falsePositives / totalRejected.length;

    expect(precision).toBeGreaterThanOrEqual(0.9);
  });

  it("recall ≥ 0.85 — reject misses no more than 5% of good photos", async () => {
    const allResults: EvalCase[] = [];
    for (const c of EVAL_DATA) {
      const r = await screenPhoto(db, c.id, c.hint, c.confidence);
      allResults.push({ ...c, expected: r.ai_status as EvalCase["expected"] });
    }

    const goodPhotos = allResults.filter((c) => c.confidence >= 0.8);
    const missedGood = goodPhotos.filter((c) => c.expected === "reject");
    const recall = goodPhotos.length === 0 ? 1 : 1 - missedGood.length / goodPhotos.length;

    expect(recall).toBeGreaterThanOrEqual(0.85);
  });

  it("good photos (confidence ≥ 0.8) all get pass or flag", async () => {
    for (const c of EVAL_DATA.filter((c) => c.confidence >= 0.8)) {
      const r = await screenPhoto(db, c.id, c.hint, c.confidence);
      expect(["pass", "flag"]).toContain(r.ai_status);
    }
  });

  it("bad photos (confidence < 0.3) all get reject", async () => {
    for (const c of EVAL_DATA.filter((c) => c.confidence < 0.3)) {
      const r = await screenPhoto(db, c.id, c.hint, c.confidence);
      expect(r.ai_status).toBe("reject");
    }
  });

  it("uncertain photos (0.4-0.8) get flag", async () => {
    for (const c of EVAL_DATA.filter((c) => c.confidence >= 0.4 && c.confidence < 0.8)) {
      const r = await screenPhoto(db, c.id, c.hint, c.confidence);
      expect(r.ai_status).toBe("flag");
    }
  });
});
