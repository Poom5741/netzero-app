#!/usr/bin/env bun
/**
 * Generate coverage manifest showing which screens have been captured.
 * Reads provenance JSON metadata to determine capture status.
 */

import { resolve } from "node:path";
import { writeFileSync, readdirSync, existsSync, readFileSync } from "node:fs";
import { ALL_SCREENS } from "../reference-harness/screens";

const PROVENANCE_DIR = resolve("tests/visual/captures/provenance");
const MANIFEST_PATH = resolve("tests/visual/coverage-manifest.md");

interface ProvenanceMetadata {
  screenName: string;
  stateName: string;
  viewport: { width: number; height: number };
  deviceScaleFactor: number;
  artifactId?: string;
}

function main() {
  console.log("📋 Generating coverage manifest...\n");

  // Read all provenance files and build a map of captured screens
  const provenanceFiles = existsSync(PROVENANCE_DIR) ? readdirSync(PROVENANCE_DIR) : [];
  const capturedScreens = new Map<string, ProvenanceMetadata[]>();

  for (const file of provenanceFiles) {
    if (file.endsWith(".json")) {
      try {
        const content = readFileSync(resolve(PROVENANCE_DIR, file), "utf-8");
        const metadata: ProvenanceMetadata = JSON.parse(content);

        if (metadata.screenName) {
          if (!capturedScreens.has(metadata.screenName)) {
            capturedScreens.set(metadata.screenName, []);
          }
          capturedScreens.get(metadata.screenName)!.push(metadata);
        }
      } catch (err) {
        console.warn(`   Failed to parse ${file}:`, err);
      }
    }
  }

  // Build manifest
  const lines: string[] = [
    "# Coverage Manifest",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    `Total screens in inventory: ${ALL_SCREENS.length}`,
    `Captured: ${capturedScreens.size}`,
    `Missing: ${ALL_SCREENS.length - capturedScreens.size}`,
    "",
    "## Status",
    "",
    "| Surface | Screen | States | Viewports | Status | Provenance |",
    "|---------|--------|--------|-----------|--------|------------|",
  ];

  let capturedCount = 0;
  let missingCount = 0;

  for (const config of ALL_SCREENS) {
    const surface = config.name.startsWith("line-oa")
      ? "LINE OA"
      : config.name.startsWith("admin")
        ? "Admin"
        : "Sponsor";

    const captures = capturedScreens.get(config.name);

    if (captures && captures.length > 0) {
      capturedCount++;
      const uniqueStates = new Set(captures.map((c) => c.stateName));
      const uniqueViewports = new Set(captures.map((c) => `${c.viewport.width}x${c.viewport.height}@${c.deviceScaleFactor}x`));
      const stateCount = uniqueStates.size;
      const viewportCount = uniqueViewports.size;
      const status = viewportCount >= 5 ? "✅ Complete" : `⚠️ Partial (${viewportCount}/5)`;
      const provenance = `[${captures.length} files](captures/provenance/)`;

      lines.push(`| ${surface} | ${config.name} | ${stateCount} | ${viewportCount} | ${status} | ${provenance} |`);
    } else {
      missingCount++;
      lines.push(`| ${surface} | ${config.name} | 0 | 0 | ❌ Missing | — |`);
    }
  }

  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push(`- **Complete** (5 viewports): ${capturedCount}`);
  lines.push(`- **Partial** (1-4 viewports): ${capturedScreens.size - capturedCount}`);
  lines.push(`- **Missing**: ${missingCount}`);
  lines.push("");
  lines.push("## Next Steps");
  lines.push("");
  lines.push("- Run `capture-all-viewports.ts --all` to capture all screens at all viewports");
  lines.push("- Run `measure-noise.ts --screen=<name>` to generate noise profiles for captured screens");
  lines.push("- Run `validate-tolerances.ts` to verify noise profile invariants");
  lines.push("");

  writeFileSync(MANIFEST_PATH, lines.join("\n"));

  console.log(`✅ Manifest written: ${MANIFEST_PATH}`);
  console.log(`   Complete: ${capturedCount}`);
  console.log(`   Partial: ${capturedScreens.size - capturedCount}`);
  console.log(`   Missing: ${missingCount}`);
}

main();
