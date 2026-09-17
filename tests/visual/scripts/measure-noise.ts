#!/usr/bin/env bun

/**
 * Measure per-region noise by capturing a screen multiple times
 * and computing pixel variance per region.
 *
 * Uses the noise measurement library in lib/noise.ts.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { measureNoise } from "../lib/noise";
import { FIXTURE_META } from "../reference-harness/fixtures";
import { serveHarness } from "../reference-harness/harness";

const OUTPUT_DIR = resolve("tests/visual/captures");
const NOISE_DIR = resolve("tests/visual/noise/profiles");
const HARNESS_PORT = 9879;

const args = process.argv.slice(2);
const screenArg = args.find((a) => a.startsWith("--screen="))?.split("=")[1] ?? "admin-login";
const stateArg = args.find((a) => a.startsWith("--state="))?.split("=")[1] ?? "default";
const viewportArg = args.find((a) => a.startsWith("--viewport="))?.split("=")[1] ?? "1280x720";
const dprArg = Number.parseFloat(args.find((a) => a.startsWith("--dpr="))?.split("=")[1] ?? "1");
const captures = Number.parseInt(
  args.find((a) => a.startsWith("--captures="))?.split("=")[1] ?? "5",
  10,
);

const [widthStr, heightStr] = viewportArg.split("x");
const width = Number.parseInt(widthStr, 10);
const height = Number.parseInt(heightStr, 10);

async function main() {
  mkdirSync(NOISE_DIR, { recursive: true });
  const { server, baseUrl } = serveHarness(HARNESS_PORT);

  try {
    const surface = screenArg.startsWith("line-oa")
      ? "line-oa"
      : screenArg.startsWith("admin")
        ? "admin"
        : "sponsor";
    const sourceUrl = `${baseUrl}/screen/${surface}/${screenArg}/${stateArg}`;

    console.log(
      `📏 Measuring noise for ${surface}/${screenArg}/${stateArg} at ${viewportArg}@${dprArg}x`,
    );
    console.log(`   Capturing ${captures} times...\n`);

    const profile = await measureNoise({
      source: sourceUrl,
      screenName: screenArg,
      stateName: stateArg,
      artifactId: "noise-measurement",
      viewport: { width, height },
      deviceScaleFactor: dprArg,
      fixtureId: FIXTURE_META.fixtureId,
      outputDir: OUTPUT_DIR,
      captureCount: captures,
    });

    const profilePath = resolve(NOISE_DIR, `${screenArg}-${stateArg}-${viewportArg}.json`);
    writeFileSync(profilePath, JSON.stringify(profile, null, 2));

    console.log("\n📊 Noise Profile:");
    console.log(`   Screen: ${screenArg}/${stateArg}`);
    console.log(`   Viewport: ${viewportArg}@${dprArg}x`);
    console.log(`   Captures: ${captures}`);
    console.log("");

    for (const region of profile.regions) {
      console.log(
        `   ${region.name.padEnd(10)} max: ${String(region.maxDiffPixels).padStart(5)} px  avg: ${String(region.avgDiffPixels.toFixed(1)).padStart(6)} px  tolerance: ${region.tolerance}`,
      );
    }

    console.log(`\n✅ Profile saved: ${profilePath}`);
  } finally {
    server.close();
  }
}

main();
