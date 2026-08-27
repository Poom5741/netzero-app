import { describe, expect, it } from "vitest";
import { generateDataset, splitHoldout, MANIFEST } from "../../src/vision/bakeoff/dataset";
import { buildStrategies } from "../../src/vision/bakeoff/strategies";
import { runStrategy } from "../../src/vision/bakeoff/runner";
import { computeConfusionMatrix, resultToClass } from "../../src/vision/bakeoff/scoring";
import { checkPassBar } from "../../src/vision/bakeoff/passbar";
import { renderLeaderboard, type LeaderboardRow } from "../../src/vision/bakeoff/leaderboard";

describe("bake-off integration — full pipeline", () => {
  it("generates dataset matching manifest counts", () => {
    const images = generateDataset();
    expect(images).toHaveLength(MANIFEST.total);
    const counts = { flooded: 0, dry: 0, invalid: 0 };
    for (const img of images) counts[img.truth_class]++;
    expect(counts.flooded).toBe(MANIFEST.flooded);
    expect(counts.dry).toBe(MANIFEST.dry);
    expect(counts.invalid).toBe(MANIFEST.invalid);
  });

  it("hold-out split is ~30% and preserves all classes", () => {
    const images = generateDataset();
    const { holdout } = splitHoldout(images);
    expect(holdout.length).toBeGreaterThan(40);
    expect(holdout.length).toBeLessThan(70);
    const classes = new Set(holdout.map((i) => i.truth_class));
    expect(classes.size).toBe(3);
  });

  it("runs all 10 strategies over hold-out without error", async () => {
    const images = generateDataset();
    const { holdout } = splitHoldout(images);
    const strategies = buildStrategies();
    expect(strategies).toHaveLength(10);

    for (const strat of strategies) {
      const result = await runStrategy(strat.name, strat.binding, holdout);
      expect(result.predictions).toHaveLength(holdout.length);
      expect(result.totalLatencyMs).toBeGreaterThan(0);
    }
  });

  it("computes valid leaderboard rows for all strategies", async () => {
    const images = generateDataset();
    const { holdout } = splitHoldout(images);
    const strategies = buildStrategies();
    const rows: LeaderboardRow[] = [];

    for (const strat of strategies) {
      const result = await runStrategy(strat.name, strat.binding, holdout);
      const pairs = result.predictions.map((p) => ({
        truth: p.truth,
        predicted_class: resultToClass(p.prediction),
      }));
      const matrix = computeConfusionMatrix(pairs);

      const goodPhotos = result.predictions.filter(
        (p) => p.truth === "flooded" || p.truth === "dry",
      );
      const autoPassed = goodPhotos.filter(
        (p) => p.prediction.valid && p.prediction.confidence >= 0.85,
      );
      const autoPassRate = goodPhotos.length > 0 ? autoPassed.length / goodPhotos.length : 0;

      const badPhotos = result.predictions.filter((p) => p.truth === "invalid");
      const badSlips = badPhotos.filter((p) => p.prediction.valid);
      const badSlipRate = badPhotos.length > 0 ? badSlips.length / badPhotos.length : 0;

      const verdict = checkPassBar({ badSlipRate, autoPassRate });

      rows.push({
        name: strat.name,
        description: strat.description,
        floodedPrecision: matrix.flooded.precision,
        floodedRecall: matrix.flooded.recall,
        dryPrecision: matrix.dry.precision,
        dryRecall: matrix.dry.recall,
        invalidPrecision: matrix.invalid.precision,
        invalidRecall: matrix.invalid.recall,
        autoPassRate,
        badSlipRate,
        latencyMs: result.totalLatencyMs / holdout.length,
        costPer1000: strat.binding.costPerCall * 1000,
        verdict,
      });
    }

    expect(rows).toHaveLength(10);
    // All auto-pass rates between 0 and 1
    for (const r of rows) {
      expect(r.autoPassRate).toBeGreaterThanOrEqual(0);
      expect(r.autoPassRate).toBeLessThanOrEqual(1);
      expect(r.badSlipRate).toBeGreaterThanOrEqual(0);
      expect(r.badSlipRate).toBeLessThanOrEqual(1);
    }

    // Leaderboard renders without error
    const table = renderLeaderboard(rows);
    expect(table).toContain("Strategy");
    expect(table).toContain("auto-pass");
    expect(table).toContain("bad-slip");
  });

  it("is deterministic — same seed produces same results", async () => {
    const images1 = generateDataset(42);
    const images2 = generateDataset(42);
    expect(images1).toHaveLength(images2.length);
    for (let i = 0; i < images1.length; i++) {
      expect(images1[i]!.id).toBe(images2[i]!.id);
      expect(images1[i]!.truth_class).toBe(images2[i]!.truth_class);
    }
  });

  it("declares no-winner when no strategy clears the bar", async () => {
    const images = generateDataset();
    const { holdout } = splitHoldout(images);
    const strategies = buildStrategies();

    let anyPassed = false;
    for (const strat of strategies) {
      const result = await runStrategy(strat.name, strat.binding, holdout);
      const goodPhotos = result.predictions.filter(
        (p) => p.truth === "flooded" || p.truth === "dry",
      );
      const autoPassed = goodPhotos.filter(
        (p) => p.prediction.valid && p.prediction.confidence >= 0.85,
      );
      const autoPassRate = goodPhotos.length > 0 ? autoPassed.length / goodPhotos.length : 0;
      const badPhotos = result.predictions.filter((p) => p.truth === "invalid");
      const badSlips = badPhotos.filter((p) => p.prediction.valid);
      const badSlipRate = badPhotos.length > 0 ? badSlips.length / badPhotos.length : 0;

      const verdict = checkPassBar({ badSlipRate, autoPassRate });
      if (verdict.passed) anyPassed = true;
    }

    // With simulated strategies at current accuracy levels, none should pass
    expect(anyPassed).toBe(false);
  });
});
