/**
 * Real bake-off runner — tests all 10 strategies on actual dataset
 * No simulated data. Real images and real classifiers.
 */
import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { buildStrategies } from './strategies.js';

const DATASET_DIR = 'drive-download-20260825T163118Z-1-001/ภาพการรายงานท่อ';

const DIRS = [
  { dir: 'NZC - ขังน้ำ', truth: 'flooded' as const },
  { dir: 'NZC - ปล่อยแห้ง', truth: 'dry' as const },
  { dir: 'NZC - ภาพไม่ถูกต้อง', truth: 'invalid' as const },
];

// Load all images from dataset
function loadDataset() {
  const images = [];
  for (const { dir, truth } of DIRS) {
    const fullPath = join(DATASET_DIR, dir);
    const files = readdirSync(fullPath).filter(f => f.endsWith('.jpg') || f.endsWith('.jpeg'));
    for (const file of files) {
      const bytes = readFileSync(join(fullPath, file));
      images.push({
        id: `${truth}/${file}`,
        truth_class: truth,
        bytes: new Uint8Array(bytes),
      });
    }
  }
  return images;
}

// Run a single strategy on the dataset
async function runStrategy(strategy: any, images: any[]) {
  console.log(`\nRunning strategy: ${strategy.name}`);
  console.log(`  ${strategy.description}`);

  const results = [];
  let totalLatency = 0;
  let totalCost = 0;

  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    const startTime = Date.now();

    try {
      const result = await strategy.binding.classify(image);
      const latency = Date.now() - startTime;

      results.push({
        id: image.id,
        truth: image.truth_class,
        predicted: result,
        correct: (
          result.valid === (image.truth_class !== 'invalid') &&
          (image.truth_class === 'invalid' || result.water_state === image.truth_class)
        )
      });

      totalLatency += latency;
      totalCost += strategy.binding.costPerCall;

      if ((i + 1) % 10 === 0) {
        console.log(`  Progress: ${i + 1}/${images.length}`);
      }

      // Rate limit for VLM strategies
      if (strategy.binding.costPerCall > 0 || strategy.name.includes('vlm') || strategy.name.includes('moondream') || strategy.name.includes('llama') || strategy.name.includes('qwen') || strategy.name.includes('consensus')) {
        await new Promise(r => setTimeout(r, 1000));
      }
    } catch (err: any) {
      console.error(`  Error classifying ${image.id}: ${err.message}`);
      results.push({
        id: image.id,
        truth: image.truth_class,
        predicted: { valid: false, water_state: 'not-applicable', confidence: 0, reason: 'error' },
        correct: false
      });
      totalLatency += Date.now() - startTime;
    }
  }

  return { results, totalLatency, totalCost };
}

// Compute metrics for a strategy
function computeMetrics(results: any[]) {
  const goodPhotos = results.filter(r => r.truth !== 'invalid');
  const badPhotos = results.filter(r => r.truth === 'invalid');

  const autoPassed = goodPhotos.filter(r => r.predicted.valid && r.predicted.confidence >= 0.85);
  const autoPassRate = goodPhotos.length > 0 ? autoPassed.length / goodPhotos.length : 0;

  const badSlips = badPhotos.filter(r => r.predicted.valid);
  const badSlipRate = badPhotos.length > 0 ? badSlips.length / badPhotos.length : 0;

  // Confusion matrix
  const floodedCorrect = results.filter(r => r.truth === 'flooded' && r.predicted.water_state === 'flooded').length;
  const floodedTotal = results.filter(r => r.truth === 'flooded').length;
  const dryCorrect = results.filter(r => r.truth === 'dry' && r.predicted.water_state === 'dry').length;
  const dryTotal = results.filter(r => r.truth === 'dry').length;
  const invalidCorrect = results.filter(r => r.truth === 'invalid' && !r.predicted.valid).length;
  const invalidTotal = results.filter(r => r.truth === 'invalid').length;

  // D17 pass bar: ≤2% bad-slip AND ≥70% auto-pass
  const passed = badSlipRate <= 0.02 && autoPassRate >= 0.7;

  return {
    floodedAccuracy: floodedTotal > 0 ? floodedCorrect / floodedTotal : 0,
    dryAccuracy: dryTotal > 0 ? dryCorrect / dryTotal : 0,
    invalidAccuracy: invalidTotal > 0 ? invalidCorrect / invalidTotal : 0,
    autoPassRate,
    badSlipRate,
    passed,
    floodedCorrect,
    floodedTotal,
    dryCorrect,
    dryTotal,
    invalidCorrect,
    invalidTotal,
  };
}

// Main bake-off
async function main() {
  console.log('Loading dataset...');
  const images = loadDataset();
  console.log(`Loaded ${images.length} images:`);
  console.log(`  Flooded: ${images.filter(i => i.truth_class === 'flooded').length}`);
  console.log(`  Dry: ${images.filter(i => i.truth_class === 'dry').length}`);
  console.log(`  Invalid: ${images.filter(i => i.truth_class === 'invalid').length}`);

  // Split: 70% train, 30% hold-out (stratified)
  const flooded = images.filter(i => i.truth_class === 'flooded');
  const dry = images.filter(i => i.truth_class === 'dry');
  const invalid = images.filter(i => i.truth_class === 'invalid');

  const holdout = [
    ...flooded.slice(0, Math.floor(flooded.length * 0.3)),
    ...dry.slice(0, Math.floor(dry.length * 0.3)),
    ...invalid.slice(0, Math.floor(invalid.length * 0.3) || 1),
  ];

  console.log(`\nHold-out set: ${holdout.length} images`);
  console.log(`  Flooded: ${holdout.filter(i => i.truth_class === 'flooded').length}`);
  console.log(`  Dry: ${holdout.filter(i => i.truth_class === 'dry').length}`);
  console.log(`  Invalid: ${holdout.filter(i => i.truth_class === 'invalid').length}`);

  // Build all strategies
  const strategies = buildStrategies();
  console.log(`\nTesting ${strategies.length} strategies...`);

  // Run each strategy
  const leaderboard = [];

  for (const strategy of strategies) {
    const { results, totalLatency, totalCost } = await runStrategy(strategy, holdout);
    const metrics = computeMetrics(results);

    leaderboard.push({
      name: strategy.name,
      description: strategy.description,
      metrics,
      totalLatencyMs: totalLatency,
      totalCostUsd: totalCost,
      avgLatencyMs: totalLatency / holdout.length,
      results,
    });

    console.log(`\n  Results for ${strategy.name}:`);
    console.log(`    Flooded: ${metrics.floodedCorrect}/${metrics.floodedTotal} (${(metrics.floodedAccuracy * 100).toFixed(1)}%)`);
    console.log(`    Dry: ${metrics.dryCorrect}/${metrics.dryTotal} (${(metrics.dryAccuracy * 100).toFixed(1)}%)`);
    console.log(`    Invalid: ${metrics.invalidCorrect}/${metrics.invalidTotal} (${(metrics.invalidAccuracy * 100).toFixed(1)}%)`);
    console.log(`    Auto-pass: ${(metrics.autoPassRate * 100).toFixed(1)}% (need ≥70%)`);
    console.log(`    Bad-slip: ${(metrics.badSlipRate * 100).toFixed(1)}% (need ≤2%)`);
    console.log(`    D17 Verdict: ${metrics.passed ? '✅ PASS' : '❌ FAIL'}`);
  }

  // Sort leaderboard by auto-pass rate (descending), then bad-slip rate (ascending)
  leaderboard.sort((a, b) => {
    if (b.metrics.autoPassRate !== a.metrics.autoPassRate) {
      return b.metrics.autoPassRate - a.metrics.autoPassRate;
    }
    return a.metrics.badSlipRate - b.metrics.badSlipRate;
  });

  // Print final leaderboard
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  FINAL LEADERBOARD');
  console.log('═══════════════════════════════════════════════════════\n');

  leaderboard.forEach((entry, idx) => {
    console.log(`${idx + 1}. ${entry.name}`);
    console.log(`   ${entry.description}`);
    console.log(`   Flooded: ${(entry.metrics.floodedAccuracy * 100).toFixed(1)}% | Dry: ${(entry.metrics.dryAccuracy * 100).toFixed(1)}% | Invalid: ${(entry.metrics.invalidAccuracy * 100).toFixed(1)}%`);
    console.log(`   Auto-pass: ${(entry.metrics.autoPassRate * 100).toFixed(1)}% | Bad-slip: ${(entry.metrics.badSlipRate * 100).toFixed(1)}%`);
    console.log(`   Avg latency: ${entry.avgLatencyMs.toFixed(0)}ms | Cost: $${entry.totalCostUsd.toFixed(4)}`);
    console.log(`   D17: ${entry.metrics.passed ? '✅ PASS' : '❌ FAIL'}\n`);
  });

  // Find winner
  const passingStrategies = leaderboard.filter(e => e.metrics.passed);
  console.log('═══════════════════════════════════════════════════════');
  console.log('  DECISION');
  console.log('═══════════════════════════════════════════════════════\n');

  if (passingStrategies.length === 0) {
    console.log('❌ NO WINNER — No strategy clears the D17 safety bar.');
    console.log('\nClosest contender:');
    const closest = leaderboard[0];
    console.log(`  ${closest.name}`);
    console.log(`  Auto-pass: ${(closest.metrics.autoPassRate * 100).toFixed(1)}% (need ≥70%)`);
    console.log(`  Bad-slip: ${(closest.metrics.badSlipRate * 100).toFixed(1)}% (need ≤2%)`);
  } else {
    const winner = passingStrategies[0];
    console.log(`✅ WINNER: ${winner.name}`);
    console.log(`   ${winner.description}`);
    console.log(`   Auto-pass: ${(winner.metrics.autoPassRate * 100).toFixed(1)}%`);
    console.log(`   Bad-slip: ${(winner.metrics.badSlipRate * 100).toFixed(1)}%`);
    console.log(`   Avg latency: ${winner.avgLatencyMs.toFixed(0)}ms`);
    console.log(`   Cost per image: $${(winner.totalCostUsd / holdout.length).toFixed(6)}`);
  }

  // Save detailed results
  const output = {
    timestamp: new Date().toISOString(),
    dataset: {
      total: images.length,
      flooded: images.filter(i => i.truth_class === 'flooded').length,
      dry: images.filter(i => i.truth_class === 'dry').length,
      invalid: images.filter(i => i.truth_class === 'invalid').length,
    },
    holdout: {
      total: holdout.length,
      flooded: holdout.filter(i => i.truth_class === 'flooded').length,
      dry: holdout.filter(i => i.truth_class === 'dry').length,
      invalid: holdout.filter(i => i.truth_class === 'invalid').length,
    },
    leaderboard: leaderboard.map(e => ({
      name: e.name,
      description: e.description,
      metrics: e.metrics,
      avgLatencyMs: e.avgLatencyMs,
      totalCostUsd: e.totalCostUsd,
    })),
    winner: passingStrategies.length > 0 ? passingStrategies[0].name : null,
  };

  writeFileSync('bakeoff-leaderboard.json', JSON.stringify(output, null, 2));
  console.log('\nDetailed results saved to bakeoff-leaderboard.json');
}

main().catch(console.error);
