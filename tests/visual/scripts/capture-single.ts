#!/usr/bin/env npx tsx

/**
 * Capture a single reference screenshot from the harness.
 *
 * Usage:
 *   npx tsx tests/visual/scripts/capture-single.ts \
 *     --screen admin-login \
 *     --state default \
 *     --viewport 1280x720 \
 *     --dpr 1
 */

import { resolve } from "node:path";
import { parseArgs } from "node:util";
import { captureReference } from "../lib/capture";
import { FIXTURE_META } from "../reference-harness/fixtures";
import { serveHarness } from "../reference-harness/harness";
import { getScreenConfig } from "../reference-harness/screens";

const OUTPUT_DIR = resolve("tests/visual/captures");
const HARNESS_PORT = 9876;

const { values } = parseArgs({
  options: {
    screen: { type: "string" },
    state: { type: "string", default: "default" },
    viewport: { type: "string", default: "1280x720" },
    dpr: { type: "string", default: "1" },
    output: { type: "string" },
  },
});

async function main() {
  const screenName = values.screen;
  const stateName = values.state ?? "default";
  const [widthStr, heightStr] = (values.viewport ?? "1280x720").split("x");
  const width = Number.parseInt(widthStr, 10);
  const height = Number.parseInt(heightStr, 10);
  const deviceScaleFactor = Number.parseFloat(values.dpr ?? "1");

  if (!screenName) {
    console.error("Error: --screen is required");
    process.exit(1);
  }

  // Determine surface from screen name prefix
  const surface = screenName.startsWith("line-oa")
    ? "line-oa"
    : screenName.startsWith("admin")
      ? "admin"
      : "sponsor";

  // Look up screen config
  const config = getScreenConfig(surface, screenName, stateName);
  const artifactId = config?.artifactId ?? "unknown";
  const sourceModule = config?.fixtureMapping ?? "unknown";
  const captureKind = config?.name.includes("reference") ? "source-reference" : "source-reference";

  // Start harness server
  const { server, baseUrl } = serveHarness(HARNESS_PORT);
  const sourceUrl = `${baseUrl}/screen/${surface}/${screenName}/${stateName}`;

  try {
    console.log(
      `Capturing ${surface}/${screenName}/${stateName} at ${width}x${height}@${deviceScaleFactor}x (artifact: ${artifactId})`,
    );

    const result = await captureReference({
      source: sourceUrl,
      screenName,
      stateName,
      artifactId,
      sourceModule,
      captureKind,
      viewport: { width, height },
      deviceScaleFactor,
      fixtureId: FIXTURE_META.fixtureId,
      outputDir: OUTPUT_DIR,
    });

    console.log(`✅ Captured: ${result.imagePath}`);
    console.log(
      `📋 Provenance: ${resolve(OUTPUT_DIR, "provenance", `${screenName}-${stateName}-${width}x${height}.json`)}`,
    );
    console.log(`🔤 Font state: ${result.fontReady ? "ready" : "timeout"}`);
    console.log(`📦 Asset status: ${result.assetStatus}`);
    console.log(`🎨 Capture kind: ${captureKind}`);

    // Validate dimensions
    const { loadImage } = await import("canvas");
    const img = await loadImage(result.imagePath);
    if (img.width !== width || img.height !== height) {
      console.error(
        `❌ Dimension mismatch: expected ${width}x${height}, got ${img.width}x${img.height}`,
      );
      process.exit(1);
    }
    console.log(`✅ Dimensions verified: ${img.width}x${img.height}`);
  } catch (err) {
    console.error("❌ Capture failed:", err);
    process.exit(1);
  } finally {
    server.close();
  }
}

main();
