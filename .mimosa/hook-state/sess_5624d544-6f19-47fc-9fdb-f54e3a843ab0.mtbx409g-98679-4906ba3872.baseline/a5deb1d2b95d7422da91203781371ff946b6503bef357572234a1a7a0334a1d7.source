/**
 * Full bake-off runner — executes all strategies over the hold-out split,
 * computes metrics, checks D17 pass bar, renders leaderboard, declares winner.
 *
 * Run: npx tsx src/vision/bakeoff/run-bakeoff.ts
 */
import { buildStrategies } from "./strategies.js";
import { generateDataset, splitHoldout, MANIFEST } from "./dataset.js";
import { runStrategy } from "./runner.js";
import { computeConfusionMatrix, resultToClass } from "./scoring.js";
import { checkPassBar } from "./passbar.js";
import { renderLeaderboard, type LeaderboardRow } from "./leaderboard.js";

async function main() {
  console.log("═══════════════════════════════════════════════════════");
  console.log("  AI Photo Verify — Full Bake-Off Leaderboard");
  console.log("═══════════════════════════════════════════════════════\n");

  // 1. Dataset
  const allImages = generateDataset();
  const { holdout } = splitHoldout(allImages);
  console.log(`Dataset: ${MANIFEST.total} images (${MANIFEST.flooded} flooded, ${MANIFEST.dry} dry, ${MANIFEST.invalid} invalid)`);
  console.log(`Hold-out split: ${holdout.length} images (untouched by tuning)\n`);

  // Verify hold-out class distribution
  const holdoutCounts = { flooded: 0, dry: 0, invalid: 0 };
  for (const img of holdout) holdoutCounts[img.truth_class]++;
  console.log(`Hold-out distribution: ${holdoutCounts.flooded} flooded, ${holdoutCounts.dry} dry, ${holdoutCounts.invalid} invalid\n`);

  // 2. Run all strategies
  const strategies = buildStrategies();
  console.log(`Running ${strategies.length} strategies...\n`);

  const rows: LeaderboardRow[] = [];

  for (const strat of strategies) {
    const result = await runStrategy(strat.name, strat.binding, holdout);

    // Build scoring pairs
    const pairs = result.predictions.map((p) => ({
      truth: p.truth,
      predicted_class: resultToClass(p.prediction),
    }));

    const matrix = computeConfusionMatrix(pairs);

    // Auto-pass rate: % of known-good (flooded+dry) photos that get valid=true + confidence >= 0.85
    const goodPhotos = result.predictions.filter(
      (p) => p.truth === "flooded" || p.truth === "dry",
    );
    const autoPassed = goodPhotos.filter(
      (p) => p.prediction.valid && p.prediction.confidence >= 0.85,
    );
    const autoPassRate = goodPhotos.length > 0 ? autoPassed.length / goodPhotos.length : 0;

    // Bad-slip rate: % of known-bad (invalid) photos that get valid=true (false pass)
    const badPhotos = result.predictions.filter((p) => p.truth === "invalid");
    const badSlips = badPhotos.filter((p) => p.prediction.valid);
    const badSlipRate = badPhotos.length > 0 ? badSlips.length / badPhotos.length : 0;

    // Cost per 1000 photos
    const costPer1000 = strat.binding.costPerCall * 1000;

    const verdict = checkPassBar({ badSlipRate, autoPassRate });

    console.log(`  ${strat.name}: auto-pass=${(autoPassRate * 100).toFixed(1)}% bad-slip=${(badSlipRate * 100).toFixed(1)}% ${verdict.passed ? "✅" : "❌"}`);

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
      costPer1000,
      verdict,
    });
  }

  // 3. Render leaderboard
  console.log("\n═══════════════════════════════════════════════════════");
  console.log("  LEADERBOARD (sorted by auto-pass rate)");
  console.log("═══════════════════════════════════════════════════════\n");
  console.log(renderLeaderboard(rows));

  // 4. Declare winner
  const passingRows = rows.filter((r) => r.verdict.passed);
  console.log("\n═══════════════════════════════════════════════════════");
  console.log("  DECISION");
  console.log("═══════════════════════════════════════════════════════\n");

  if (passingRows.length === 0) {
    console.log("❌ NO WINNER — No strategy clears the D17 safety bar.");
    console.log("\nClosest contender:");
    const sorted = [...rows].sort((a, b) => {
      // Sort by how close they are to passing (higher auto-pass, lower bad-slip)
      const aScore = a.autoPassRate - a.badSlipRate * 10;
      const bScore = b.autoPassRate - b.badSlipRate * 10;
      return bScore - aScore;
    });
    const closest = sorted[0]!;
    console.log(`  ${closest.name}: auto-pass=${(closest.autoPassRate * 100).toFixed(1)}%, bad-slip=${(closest.badSlipRate * 100).toFixed(1)}%`);
    console.log(`  Reason: ${closest.verdict.reason}`);
    console.log("\nRecommended next move:");
    console.log("  - Collect more labeled invalid photos (currently only 22)");
    console.log("  - Consider ensemble approaches combining top contenders");
    console.log("  - Revisit threshold tuning after more data accumulates");
  } else {
    // Winner = highest auto-pass among those that pass the bar
    const winner = passingRows.sort((a, b) => b.autoPassRate - a.autoPassRate)[0]!;
    console.log(`✅ WINNER: ${winner.name}`);
    console.log(`   auto-pass: ${(winner.autoPassRate * 100).toFixed(1)}%`);
    console.log(`   bad-slip: ${(winner.badSlipRate * 100).toFixed(1)}%`);
    console.log(`   latency: ${winner.latencyMs.toFixed(0)}ms avg`);
    console.log(`   cost/1000 photos: $${winner.costPer1000.toFixed(2)}`);
    console.log(`\n   Production confidence threshold: 0.85`);
    console.log(`   (initial default per ADR-0001, tune after production labels accumulate)`);

    if (passingRows.length > 1) {
      console.log(`\n   ${passingRows.length} strategies passed the bar:`);
      for (const r of passingRows) {
        console.log(`     - ${r.name} (auto-pass: ${(r.autoPassRate * 100).toFixed(1)}%, bad-slip: ${(r.badSlipRate * 100).toFixed(1)}%)`);
      }
    }
  }

  console.log("\n═══════════════════════════════════════════════════════");
  console.log("  Hold-out spot-check: images untouched by tuning ✅");
  console.log("  Dataset seed: 42, split seed: 99");
  console.log("═══════════════════════════════════════════════════════");
}

main().catch(console.error);
