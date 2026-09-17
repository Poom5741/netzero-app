#!/usr/bin/env bun
/**
 * Compare two images and report per-region results.
 */

import { resolve } from "node:path";
import { compareImages, loadTolerances, type RegionTolerance } from "../lib/compare";

const args = process.argv.slice(2);
const refArg = args.find((a) => a.startsWith("--ref="))?.split("=")[1];
const implArg = args.find((a) => a.startsWith("--impl="))?.split("=")[1];
const tolArg = args.find((a) => a.startsWith("--tolerances="))?.split("=")[1];
const toleranceArg = Number.parseFloat(
  args.find((a) => a.startsWith("--tolerance="))?.split("=")[1] ?? "0",
);
const outputArg =
  args.find((a) => a.startsWith("--output="))?.split("=")[1] ?? `comparison-${Date.now()}`;

if (!refArg || !implArg) {
  console.error("Usage: --ref=<path> --impl=<path> [--tolerances=<profile.json>] [--output=<id>]");
  process.exit(1);
}

async function main() {
  const tolerances: RegionTolerance[] = tolArg
    ? loadTolerances(resolve(tolArg))
    : [{ name: "full", bounds: { x: 0, y: 0, width: 1, height: 1 }, tolerance: toleranceArg }];

  console.log(`🔍 Comparing:`);
  console.log(`   Reference: ${refArg}`);
  console.log(`   Implementation: ${implArg}`);
  console.log(`   Tolerances: ${tolArg ?? "default (0)"}`);
  console.log("");

  const result = await compareImages({
    referencePath: resolve(refArg),
    implementationPath: resolve(implArg),
    tolerances,
    outputDir: resolve("tests/visual/comparison"),
    comparisonId: outputArg,
  });

  if (!result.dimensionsMatch) {
    console.error(`❌ ${result.dimensionMismatchError}`);
    process.exit(1);
  }

  console.log("📊 Results:");
  for (const region of result.regions) {
    const status = region.pass ? "✅" : "❌";
    console.log(
      `   ${status} ${region.regionName.padEnd(10)} diff: ${String(region.diffPixels).padStart(6)} px  tolerance: ${region.tolerance}  (${region.diffPercentage}%)`,
    );
  }

  console.log("");
  console.log(`   Diff: ${result.diffImagePath}`);
  console.log(`   Overlay: ${result.overlayImagePath}`);
  console.log(`   Result: tests/visual/comparison/results/${outputArg}.json`);
  console.log("");
  console.log(result.overallPass ? "✅ PASS" : "❌ FAIL");

  process.exit(result.overallPass ? 0 : 1);
}

main();
