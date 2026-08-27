import { describe, expect, it } from "vitest";
import { evaluateAutoVerify } from "../../src/vision/auto-verify";

describe("evaluateAutoVerify", () => {
  it("auto-verifies high confidence + high trust", () => {
    const result = evaluateAutoVerify({
      confidence: 0.9,
      trustScore: 0.8,
      valid: true,
    });
    expect(result.decision).toBe("auto_verify");
  });

  it("auto-rejects low confidence", () => {
    const result = evaluateAutoVerify({
      confidence: 0.3,
      trustScore: 0.5,
      valid: false,
    });
    expect(result.decision).toBe("auto_reject");
  });

  it("auto-rejects low trust with moderate confidence", () => {
    const result = evaluateAutoVerify({
      confidence: 0.5,
      trustScore: 0.2,
      valid: true,
    });
    expect(result.decision).toBe("auto_reject");
  });

  it("queues for admin with moderate confidence and trust", () => {
    const result = evaluateAutoVerify({
      confidence: 0.6,
      trustScore: 0.5,
      valid: true,
    });
    expect(result.decision).toBe("queue_for_admin");
  });

  it("queues for admin with high confidence but low trust", () => {
    const result = evaluateAutoVerify({
      confidence: 0.9,
      trustScore: 0.4,
      valid: true,
    });
    expect(result.decision).toBe("queue_for_admin");
  });
});
