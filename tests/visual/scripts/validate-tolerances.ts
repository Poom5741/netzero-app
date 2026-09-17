#!/usr/bin/env bun

/**
 * Validate noise profiles for invariant compliance.
 */

import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const NOISE_DIR = resolve("tests/visual/noise/profiles");

function main() {
  const files = readdirSync(NOISE_DIR).filter((f) => f.endsWith(".json"));

  if (files.length === 0) {
    console.log("No noise profiles found. Run measure-noise.ts first.");
    process.exit(0);
  }

  console.log(`🔍 Validating ${files.length} noise profile(s)...\n`);

  let allValid = true;

  for (const file of files) {
    const profilePath = resolve(NOISE_DIR, file);
    const profile = JSON.parse(readFileSync(profilePath, "utf-8"));

    console.log(`📄 ${file}`);

    // Check region count
    if (!profile.regions || profile.regions.length < 4) {
      console.error(`   ❌ Expected 4+ regions, found ${profile.regions?.length ?? 0}`);
      allValid = false;
      continue;
    }
    console.log(`   ✅ Regions: ${profile.regions.length}`);

    // Check capture count
    if (profile.captureCount !== 5) {
      console.error(`   ❌ Expected captureCount=5, found ${profile.captureCount}`);
      allValid = false;
    } else {
      console.log(`   ✅ Captures: ${profile.captureCount}`);
    }

    // Check tolerance invariants
    for (const region of profile.regions) {
      if (region.tolerance < region.maxDiffPixels) {
        console.error(
          `   ❌ ${region.name}: tolerance (${region.tolerance}) < maxDiffPixels (${region.maxDiffPixels})`,
        );
        allValid = false;
      } else {
        console.log(
          `   ✅ ${region.name}: tolerance=${region.tolerance} >= max=${region.maxDiffPixels}`,
        );
      }
    }

    console.log("");
  }

  if (allValid) {
    console.log("✅ All profiles valid");
  } else {
    console.error("❌ Some profiles have invariant violations");
    process.exit(1);
  }
}

main();
