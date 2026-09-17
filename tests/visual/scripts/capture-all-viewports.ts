import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { captureReference } from "../lib/capture";
import { FIXTURE_META } from "../reference-harness/fixtures";
import { serveHarness } from "../reference-harness/harness";
import { ALL_SCREENS } from "../reference-harness/screens";

const VIEWPORTS = [
  { name: "1280x720", width: 1280, height: 720, deviceScaleFactor: 1 },
  { name: "1440x900", width: 1440, height: 900, deviceScaleFactor: 1 },
  { name: "390x844", width: 390, height: 844, deviceScaleFactor: 3 },
  { name: "360x844", width: 360, height: 844, deviceScaleFactor: 3 },
  { name: "430x844", width: 430, height: 844, deviceScaleFactor: 3 },
];

const OUTPUT_DIR = resolve("tests/visual/captures");
const HARNESS_PORT = 9877;

// Parse --screen argument
const screenArg = process.argv.find((a) => a.startsWith("--screen="))?.split("=")[1];

async function captureAllViewports() {
  console.log("Starting multi-viewport capture...\n");

  mkdirSync(join(OUTPUT_DIR, "multi-viewport"), { recursive: true });

  // Start harness server
  const { server, baseUrl } = serveHarness(HARNESS_PORT);

  const results: Array<{
    screen: string;
    viewport: string;
    path: string;
    dimensions: { width: number; height: number };
  }> = [];

  // Filter to requested screen, or all screens if no filter specified
  const screensToCapture = screenArg
    ? ALL_SCREENS.filter((s) => s.name === screenArg)
    : ALL_SCREENS;

  if (screensToCapture.length === 0) {
    console.error(`No screens found matching: ${screenArg}`);
    console.error("Available screens:", ALL_SCREENS.map((s) => s.name).join(", "));
    server.close();
    process.exit(1);
  }

  for (const screen of screensToCapture) {
    console.log(`Capturing ${screen.name}...`);

    // Determine surface from screen name
    const surface = screen.name.startsWith("line-")
      ? "line-oa"
      : screen.name.startsWith("admin")
        ? "admin"
        : "sponsor";

    // Build harness URL: /screen/{surface}/{screenName}/{stateName}
    const harnessUrl = `${baseUrl}/screen/${surface}/${screen.name}/default`;

    for (const viewport of VIEWPORTS) {
      try {
        const result = await captureReference({
          source: harnessUrl,
          screenName: screen.name,
          stateName: "default",
          artifactId: screen.artifactId,
          viewport: { width: viewport.width, height: viewport.height },
          deviceScaleFactor: viewport.deviceScaleFactor,
          fixtureId: FIXTURE_META.fixtureId,
          outputDir: OUTPUT_DIR,
        });

        results.push({
          screen: screen.name,
          viewport: viewport.name,
          path: result.imagePath,
          dimensions: { width: viewport.width, height: viewport.height },
        });

        console.log(`  ✓ ${viewport.name}`);
      } catch (error) {
        console.error(`  ✗ ${viewport.name}:`, error);
      }
    }
  }

  server.close();

  // Write summary
  const summaryPath = join(OUTPUT_DIR, "multi-viewport", "multi-viewport-summary.json");
  writeFileSync(summaryPath, JSON.stringify(results, null, 2));

  console.log(
    `\n✓ Captured ${results.length} screenshots across ${screensToCapture.length} screens and ${VIEWPORTS.length} viewports`,
  );
  console.log(`✓ Summary written to ${summaryPath}`);
}

captureAllViewports().catch(console.error);
