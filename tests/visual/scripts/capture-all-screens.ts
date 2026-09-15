import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { ALL_SCREENS } from '../reference-harness/screens';

const OUTPUT_DIR = join(process.cwd(), 'tests/visual/captures/reference');
const PROVENANCE_DIR = join(OUTPUT_DIR, 'provenance');

async function captureAllScreens() {
  console.log('Starting capture of all screens...\n');

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
    url: string;
    path: string;
    provenancePath: string;
    timestamp: string;
  }> = [];

  for (const screen of ALL_SCREENS) {
    console.log(`Capturing ${screen.name}...`);
    const page = await context.newPage();

    try {
      await page.goto(screen.url, { waitUntil: 'networkidle' });
      await page.waitForLoadState('domcontentloaded');

      const filename = `${screen.name}.png`;
      const filepath = join(OUTPUT_DIR, filename);

      await page.screenshot({
        path: filepath,
        fullPage: false,
      });

      const provenance = {
        screenName: screen.name,
        url: screen.url,
        description: screen.description,
        viewport: { width: 1280, height: 720 },
        deviceScaleFactor: 1,
        timestamp: new Date().toISOString(),
        filepath,
      };

      const provenancePath = join(PROVENANCE_DIR, `${screen.name}.json`);
      writeFileSync(provenancePath, JSON.stringify(provenance, null, 2));

      results.push({
        screen: screen.name,
        url: screen.url,
        path: filepath,
        provenancePath,
        timestamp: provenance.timestamp,
      });

      console.log(`  ✓ Captured ${screen.name}`);
    } catch (error) {
      console.error(`  ✗ Failed to capture ${screen.name}:`, error);
    } finally {
      await page.close();
    }
  }

  await browser.close();

  // Write summary
  const summaryPath = join(OUTPUT_DIR, 'capture-summary.json');
  writeFileSync(summaryPath, JSON.stringify(results, null, 2));

  console.log(`\n✓ Captured ${results.length} screens`);
  console.log(`✓ Summary written to ${summaryPath}`);
}

captureAllScreens().catch(console.error);
