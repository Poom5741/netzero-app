import { describe, expect, it } from "vitest";
import { parseClassifierResponse, type ClassifyResult } from "../../src/vision/classifier";

describe("classifier interface — fail-safe parsing", () => {
  it("parses well-formed JSON into ClassifyResult", () => {
    const raw = JSON.stringify({
      valid: true,
      water_state: "flooded",
      confidence: 0.92,
      reason: "เห็นน้ำขังชัดเจน",
    });
    const result = parseClassifierResponse(raw);
    expect(result.valid).toBe(true);
    expect(result.water_state).toBe("flooded");
    expect(result.confidence).toBe(0.92);
    expect(result.reason).toBe("เห็นน้ำขังชัดเจน");
  });

  it("parses dry water state", () => {
    const raw = JSON.stringify({
      valid: true,
      water_state: "dry",
      confidence: 0.88,
      reason: "ดินแห้ง",
    });
    const result = parseClassifierResponse(raw);
    expect(result.water_state).toBe("dry");
  });

  it("parses invalid photo with not-applicable water state", () => {
    const raw = JSON.stringify({
      valid: false,
      water_state: "not-applicable",
      confidence: 0.95,
      reason: "ไม่พบท่อวัด",
    });
    const result = parseClassifierResponse(raw);
    expect(result.valid).toBe(false);
    expect(result.water_state).toBe("not-applicable");
  });

  it("malformed JSON fails safe to low confidence", () => {
    const result = parseClassifierResponse("not json at all");
    expect(result.confidence).toBe(0);
    expect(result.valid).toBe(false);
    expect(result.water_state).toBe("not-applicable");
  });

  it("missing fields fail safe to low confidence", () => {
    const raw = JSON.stringify({ valid: true });
    const result = parseClassifierResponse(raw);
    expect(result.confidence).toBe(0);
    expect(result.valid).toBe(false);
  });

  it("unexpected water_state label fails safe", () => {
    const raw = JSON.stringify({
      valid: true,
      water_state: "banana",
      confidence: 0.9,
      reason: "test",
    });
    const result = parseClassifierResponse(raw);
    expect(result.confidence).toBe(0);
    expect(result.valid).toBe(false);
  });

  it("confidence out of range fails safe", () => {
    const raw = JSON.stringify({
      valid: true,
      water_state: "flooded",
      confidence: 1.5,
      reason: "test",
    });
    const result = parseClassifierResponse(raw);
    expect(result.confidence).toBe(0);
    expect(result.valid).toBe(false);
  });

  it("empty string fails safe", () => {
    const result = parseClassifierResponse("");
    expect(result.confidence).toBe(0);
    expect(result.valid).toBe(false);
  });

  it("null-like input fails safe", () => {
    const result = parseClassifierResponse("null");
    expect(result.confidence).toBe(0);
    expect(result.valid).toBe(false);
  });

  it("array instead of object fails safe", () => {
    const result = parseClassifierResponse("[1,2,3]");
    expect(result.confidence).toBe(0);
    expect(result.valid).toBe(false);
  });
});
