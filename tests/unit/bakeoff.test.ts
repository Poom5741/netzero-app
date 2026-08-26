import { describe, expect, it } from "vitest";
import {
  type ClassifierBinding,
  type ClassifyResult,
  type LabeledImage,
  runStrategy,
  type StrategyResult,
} from "../../src/vision/bakeoff/runner";
import { computeConfusionMatrix, type ConfusionMatrix } from "../../src/vision/bakeoff/scoring";
import { checkPassBar, type PassBarVerdict } from "../../src/vision/bakeoff/passbar";
import {
  registerStrategy,
  listStrategies,
  clearRegistry,
} from "../../src/vision/bakeoff/registry";
import { renderLeaderboard, type LeaderboardRow } from "../../src/vision/bakeoff/leaderboard";

// ── Fixtures ────────────────────────────────────────────────────────

function makeLabeledImage(
  id: string,
  truthClass: "flooded" | "dry" | "invalid",
): LabeledImage {
  return { id, truth_class: truthClass, bytes: new Uint8Array([0]) };
}

function makeBinding(
  responses: Map<string, ClassifyResult>,
  latencyMs = 100,
  costPerCall = 0.001,
): ClassifierBinding {
  return {
    async classify(image: LabeledImage): Promise<ClassifyResult> {
      return (
        responses.get(image.id) ?? {
          valid: false,
          water_state: "not-applicable",
          confidence: 0,
          reason: "no response",
        }
      );
    },
    latencyMs,
    costPerCall,
  };
}

// ── Runner ──────────────────────────────────────────────────────────

describe("bake-off runner", () => {
  it("runs a strategy over labeled images and returns predictions", async () => {
    const images: LabeledImage[] = [
      makeLabeledImage("f1", "flooded"),
      makeLabeledImage("d1", "dry"),
      makeLabeledImage("i1", "invalid"),
    ];
    const responses = new Map<string, ClassifyResult>([
      ["f1", { valid: true, water_state: "flooded", confidence: 0.9, reason: "น้ำขัง" }],
      ["d1", { valid: true, water_state: "dry", confidence: 0.85, reason: "แห้ง" }],
      ["i1", { valid: false, water_state: "not-applicable", confidence: 0.95, reason: "ไม่พบท่อ" }],
    ]);
    const binding = makeBinding(responses);

    const result = await runStrategy("test-strat", binding, images);
    expect(result.predictions).toHaveLength(3);
    expect(result.predictions[0]!.prediction.water_state).toBe("flooded");
    expect(result.predictions[1]!.prediction.water_state).toBe("dry");
    expect(result.predictions[2]!.prediction.valid).toBe(false);
  });

  it("records latency and cost metrics", async () => {
    const images = [makeLabeledImage("f1", "flooded")];
    const responses = new Map([
      ["f1", { valid: true, water_state: "flooded", confidence: 0.9, reason: "ok" } as ClassifyResult],
    ]);
    const binding = makeBinding(responses, 200, 0.002);

    const result = await runStrategy("test", binding, images);
    expect(result.totalLatencyMs).toBe(200);
    expect(result.totalCostUsd).toBeCloseTo(0.002);
  });
});

// ── Scoring ─────────────────────────────────────────────────────────

describe("confusion matrix + scoring", () => {
  it("computes per-class confusion for 3-class problem", () => {
    const predictions = [
      { truth: "flooded" as const, predicted_class: "flooded" as const },
      { truth: "flooded" as const, predicted_class: "flooded" as const },
      { truth: "flooded" as const, predicted_class: "dry" as const },
      { truth: "dry" as const, predicted_class: "dry" as const },
      { truth: "dry" as const, predicted_class: "flooded" as const },
      { truth: "invalid" as const, predicted_class: "invalid" as const },
      { truth: "invalid" as const, predicted_class: "flooded" as const },
    ];

    const matrix = computeConfusionMatrix(predictions);
    expect(matrix.flooded.tp).toBe(2);
    expect(matrix.flooded.fp).toBe(2); // predicted flooded but truth=dry(1) + truth=invalid(1)
    expect(matrix.flooded.fn).toBe(1); // truth=flooded but predicted=dry
    expect(matrix.dry.tp).toBe(1);
    expect(matrix.dry.fp).toBe(1);
    expect(matrix.dry.fn).toBe(1);
    expect(matrix.invalid.tp).toBe(1);
    expect(matrix.invalid.fp).toBe(0); // nothing predicted as invalid that wasn't
    expect(matrix.invalid.fn).toBe(1); // truth=invalid but predicted=flooded
  });

  it("computes per-class precision and recall", () => {
    const predictions = [
      { truth: "flooded" as const, predicted_class: "flooded" as const },
      { truth: "flooded" as const, predicted_class: "flooded" as const },
      { truth: "flooded" as const, predicted_class: "dry" as const },
      { truth: "dry" as const, predicted_class: "dry" as const },
      { truth: "invalid" as const, predicted_class: "invalid" as const },
    ];
    const matrix = computeConfusionMatrix(predictions);
    // flooded: tp=2, fp=0, fn=1 → precision=1.0, recall=2/3
    expect(matrix.flooded.precision).toBe(1.0);
    expect(matrix.flooded.recall).toBeCloseTo(2 / 3);
  });

  it("handles empty predictions", () => {
    const matrix = computeConfusionMatrix([]);
    expect(matrix.flooded.tp).toBe(0);
    expect(matrix.dry.tp).toBe(0);
    expect(matrix.invalid.tp).toBe(0);
  });
});

// ── Pass bar (D17) ──────────────────────────────────────────────────

describe("D17 pass bar", () => {
  it("passes when bad-slip ≤ 2% AND auto-pass ≥ 70%", () => {
    const verdict = checkPassBar({
      badSlipRate: 0.01,
      autoPassRate: 0.75,
    });
    expect(verdict.passed).toBe(true);
  });

  it("fails when bad-slip > 2%", () => {
    const verdict = checkPassBar({
      badSlipRate: 0.05,
      autoPassRate: 0.8,
    });
    expect(verdict.passed).toBe(false);
    expect(verdict.reason).toContain("bad-slip");
  });

  it("fails when auto-pass < 70%", () => {
    const verdict = checkPassBar({
      badSlipRate: 0.01,
      autoPassRate: 0.5,
    });
    expect(verdict.passed).toBe(false);
    expect(verdict.reason).toContain("auto-pass");
  });

  it("fails when both conditions fail", () => {
    const verdict = checkPassBar({
      badSlipRate: 0.1,
      autoPassRate: 0.3,
    });
    expect(verdict.passed).toBe(false);
  });

  it("passes at exact boundary (2% bad-slip, 70% auto-pass)", () => {
    const verdict = checkPassBar({
      badSlipRate: 0.02,
      autoPassRate: 0.7,
    });
    expect(verdict.passed).toBe(true);
  });
});

// ── Registry ────────────────────────────────────────────────────────

describe("strategy registry", () => {
  it("registers and lists strategies", () => {
    clearRegistry();
    registerStrategy({
      name: "test-a",
      description: "Test strategy A",
      binding: makeBinding(new Map()),
    });
    registerStrategy({
      name: "test-b",
      description: "Test strategy B",
      binding: makeBinding(new Map()),
    });
    const list = listStrategies();
    expect(list).toHaveLength(2);
    expect(list.map((s) => s.name)).toEqual(["test-a", "test-b"]);
    clearRegistry();
  });

  it("rejects duplicate names", () => {
    clearRegistry();
    registerStrategy({ name: "dup", description: "first", binding: makeBinding(new Map()) });
    expect(() =>
      registerStrategy({ name: "dup", description: "second", binding: makeBinding(new Map()) }),
    ).toThrow("already registered");
    clearRegistry();
  });

  it("clears all strategies", () => {
    clearRegistry();
    registerStrategy({ name: "x", description: "", binding: makeBinding(new Map()) });
    clearRegistry();
    expect(listStrategies()).toHaveLength(0);
  });
});

// ── Leaderboard ─────────────────────────────────────────────────────

describe("leaderboard rendering", () => {
  it("renders one row per strategy sorted by auto-pass rate desc", () => {
    const rows: LeaderboardRow[] = [
      {
        name: "strat-a",
        description: "A",
        floodedPrecision: 0.9,
        floodedRecall: 0.85,
        dryPrecision: 0.88,
        dryRecall: 0.82,
        invalidPrecision: 0.95,
        invalidRecall: 0.9,
        autoPassRate: 0.75,
        badSlipRate: 0.01,
        latencyMs: 200,
        costPer1000: 2.0,
        verdict: { passed: true, reason: "" },
      },
      {
        name: "strat-b",
        description: "B",
        floodedPrecision: 0.8,
        floodedRecall: 0.7,
        dryPrecision: 0.75,
        dryRecall: 0.65,
        invalidPrecision: 0.85,
        invalidRecall: 0.8,
        autoPassRate: 0.6,
        badSlipRate: 0.03,
        latencyMs: 150,
        costPer1000: 1.5,
        verdict: { passed: false, reason: "bad-slip 3% > 2%" },
      },
    ];
    const table = renderLeaderboard(rows);
    expect(table).toContain("strat-a");
    expect(table).toContain("strat-b");
    // strat-a should come first (higher auto-pass)
    const idxA = table.indexOf("strat-a");
    const idxB = table.indexOf("strat-b");
    expect(idxA).toBeLessThan(idxB);
  });

  it("includes all required columns", () => {
    const rows: LeaderboardRow[] = [
      {
        name: "test",
        description: "Test",
        floodedPrecision: 0.9,
        floodedRecall: 0.85,
        dryPrecision: 0.88,
        dryRecall: 0.82,
        invalidPrecision: 0.95,
        invalidRecall: 0.9,
        autoPassRate: 0.75,
        badSlipRate: 0.01,
        latencyMs: 200,
        costPer1000: 2.0,
        verdict: { passed: true, reason: "" },
      },
    ];
    const table = renderLeaderboard(rows);
    expect(table).toContain("auto-pass");
    expect(table).toContain("bad-slip");
    expect(table).toContain("latency");
    expect(table).toContain("cost");
    expect(table).toContain("verdict");
  });
});
