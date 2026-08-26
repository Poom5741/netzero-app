/**
 * Classifier interface — the single contract every vision strategy implements.
 * Image bytes in → structured result out.
 * Fail-safe: malformed/unexpected responses → low confidence (flagged for human).
 */

export type WaterState = "flooded" | "dry" | "not-applicable";

export interface ClassifyResult {
  valid: boolean;
  water_state: WaterState;
  confidence: number; // 0..1
  reason: string;
}

const VALID_WATER_STATES = new Set<WaterState>(["flooded", "dry", "not-applicable"]);

/**
 * Parse a raw JSON response from a vision model into a ClassifyResult.
 * Any parsing failure, missing field, or unexpected value fails safe to
 * confidence=0 (flagged for human review).
 */
export function parseClassifierResponse(raw: string): ClassifyResult {
  const failSafe: ClassifyResult = {
    valid: false,
    water_state: "not-applicable",
    confidence: 0,
    reason: "malformed classifier response — fail-safe",
  };

  if (!raw || typeof raw !== "string") return failSafe;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return failSafe;
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return failSafe;

  const obj = parsed as Record<string, unknown>;

  // Validate required fields
  if (typeof obj.valid !== "boolean") return failSafe;
  if (typeof obj.water_state !== "string") return failSafe;
  if (!VALID_WATER_STATES.has(obj.water_state as WaterState)) return failSafe;
  if (typeof obj.confidence !== "number") return failSafe;
  if (obj.confidence < 0 || obj.confidence > 1) return failSafe;
  if (typeof obj.reason !== "string") return failSafe;

  return {
    valid: obj.valid,
    water_state: obj.water_state as WaterState,
    confidence: obj.confidence,
    reason: obj.reason,
  };
}
