import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";
import { FIXTURE_META } from "../reference-harness/fixtures";
import { ALL_SCREENS, getScreenConfig } from "../reference-harness/screens";

const OUTPUT_DIR = join(process.cwd(), "tests/visual/captures/reference");
const PROVENANCE_DIR = join(OUTPUT_DIR, "provenance");

async function captureAllScreens() {
  console.log("Starting capture of all screens...\n");

  // Ensure output directories exist
  mkdirSync(OUTPUT_DIR, { recursive: true });
  mkdirSync(PROVENANCE_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1,
  });

  const results: Array<{
    screen: string;
    label: string;
    url: string;
    path: string;
    provenancePath: string;
    artifactId: string;
    sourceModule: string;
    captureKind: string;
    timestamp: string;
    fontState: string;
    assetStatus: string;
  }> = [];

  for (const screen of ALL_SCREENS) {
    console.log(`Capturing ${screen.name}...`);
    const page = await context.newPage();

    // Determine surface from screen name
    const surface = screen.name.startsWith("line-oa")
      ? "line-oa"
      : screen.name.startsWith("admin")
        ? "admin"
        : "sponsor";

    const config = getScreenConfig(
      surface as "line-oa" | "admin" | "sponsor",
      screen.name,
      "default",
    );
    const artifactId = config?.artifactId ?? "unknown";
    const sourceModule = config?.fixtureMapping ?? "unknown";

    try {
      await page.goto(screen.url, { waitUntil: "networkidle" });
      await page.waitForLoadState("domcontentloaded");

      // Check font readiness
      const fontReady = await page
        .evaluate(() => {
          return document.fonts.status === "loaded";
        })
        .catch(() => false);

      const filename = `${screen.name}.png`;
      const filepath = join(OUTPUT_DIR, filename);

      await page.screenshot({
        path: filepath,
        fullPage: false,
      });

      const provenance = {
        screenName: screen.name,
        label: sourceModule,
        url: screen.url,
        description: screen.description,
        artifactId,
        sourceModule,
        captureKind: "source-reference" as const,
        viewport: { width: 1280, height: 720 },
        deviceScaleFactor: 1,
        fontState: fontReady ? "ready" : ("timeout" as const),
        assetStatus: fontReady ? ("ready" as const) : ("missing" as const),
        fixtureId: FIXTURE_META.fixtureId,
        timestamp: new Date().toISOString(),
        filepath,
      };

      const provenancePath = join(PROVENANCE_DIR, `${screen.name}.json`);
      writeFileSync(provenancePath, JSON.stringify(provenance, null, 2));

      results.push({
        screen: screen.name,
        label: sourceModule,
        url: screen.url,
        path: filepath,
        provenancePath,
        artifactId,
        sourceModule,
        captureKind: "source-reference",
        timestamp: provenance.timestamp,
        fontState: provenance.fontState,
        assetStatus: provenance.assetStatus,
      });

      console.log(`  ✓ Captured ${screen.name} (artifact: ${artifactId})`);
    } catch (error) {
      console.error(`  ✗ Failed to capture ${screen.name}:`, error);
    } finally {
      await page.close();
    }
  }

  await browser.close();

  // Write summary
  const summaryPath = join(OUTPUT_DIR, "capture-summary.json");
  writeFileSync(summaryPath, JSON.stringify(results, null, 2));

  console.log(`\n✓ Captured ${results.length} screens`);
  console.log(`✓ Summary written to ${summaryPath}`);
}

captureAllScreens().catch(console.error);
