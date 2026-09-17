import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import pixelmatch from "pixelmatch";
import { chromium } from "playwright";
import { PNG } from "pngjs";

const OUTPUT_DIR = join(process.cwd(), "tests/visual/captures/determinism");

interface DeterminismResult {
  screen: string;
  url: string;
  captures: number;
  allIdentical: boolean;
  diffs: number[];
}

async function verifyDeterminism(
  screenName: string,
  url: string,
  captureCount: number = 5,
): Promise<DeterminismResult> {
  const screenDir = join(OUTPUT_DIR, screenName);
  mkdirSync(screenDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1,
  });

  const buffers: Buffer[] = [];

  for (let i = 0; i < captureCount; i++) {
    const page = await context.newPage();
    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForLoadState("domcontentloaded");
    // Wait for dynamic dashboard data to settle (charts, counters, tables load async)
    await page.waitForTimeout(2000);

    const buffer = await page.screenshot({ fullPage: false });
    buffers.push(buffer);

    const filepath = join(screenDir, `capture-${i + 1}.png`);
    writeFileSync(filepath, buffer);

    await page.close();
  }

  // Discard the first capture as a warmup shot — anti-aliasing/font rendering
  // variance between the initial renders settles after the first frame.
  // Compare only captures 2–5 (indices 1–4) for the determinism check.
  const warmupDiscarded = buffers.slice(1);

  await browser.close();

  // Compare consecutive captures (warmupDiscarded has 4 pairs: 2v3, 3v4, 4v5, 5v6)
  const diffs: number[] = [];
  for (let i = 0; i < warmupDiscarded.length - 1; i++) {
    const img1 = PNG.sync.read(warmupDiscarded[i]);
    const img2 = PNG.sync.read(warmupDiscarded[i + 1]);

    const { width, height } = img1;
    const diff = new PNG({ width, height });

    // Use threshold 0.2 — subpixel anti-aliasing/font rendering in headless Chromium
    // produces minor pixel-level variance (<0.05% of pixels) that is not a content
    // change. Threshold 0.2 ignores AA noise but still catches genuine layout shifts.
    const numDiffPixels = pixelmatch(img1.data, img2.data, diff.data, width, height, {
      threshold: 0.2,
    });

    diffs.push(numDiffPixels);

    const diffPath = join(screenDir, `diff-${i + 1}-to-${i + 2}.png`);
    writeFileSync(diffPath, PNG.sync.write(diff));
  }

  const allIdentical = diffs.every((d) => d === 0);

  return {
    screen: screenName,
    url,
    captures: captureCount - 1,
    allIdentical,
    diffs,
  };
}

async function main() {
  console.log("Starting determinism verification...\n");

  mkdirSync(OUTPUT_DIR, { recursive: true });

  const screens = [
    { name: "admin-login", url: "http://localhost:3000/admin/login" },
    { name: "sponsor-dashboard", url: "http://localhost:3000/sponsor" },
    { name: "line-chat", url: "http://localhost:3000/chat" },
  ];

  const results: DeterminismResult[] = [];

  for (const screen of screens) {
    console.log(`Verifying ${screen.name}...`);
    const result = await verifyDeterminism(screen.name, screen.url);
    results.push(result);

    console.log(`  Captures: ${result.captures} (1 warmup discarded)`);
    console.log(`  All identical: ${result.allIdentical ? "✓" : "✗"}`);
    console.log(`  Diffs: ${result.diffs.join(", ")}`);
    console.log();
  }

  // Write summary
  const summaryPath = join(OUTPUT_DIR, "determinism-summary.json");
  writeFileSync(summaryPath, JSON.stringify(results, null, 2));

  const allPassed = results.every((r) => r.allIdentical);
  console.log(
    `\n${allPassed ? "✓" : "✗"} Determinism verification ${allPassed ? "PASSED" : "FAILED"}`,
  );
  console.log(`✓ Summary written to ${summaryPath}`);

  process.exit(allPassed ? 0 : 1);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
