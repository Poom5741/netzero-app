import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { ALL_SCREENS } from '../reference-harness/screens';

const VIEWPORTS = [
  { name: '1280x720', width: 1280, height: 720 },
  { name: '1440x900', width: 1440, height: 900 },
  { name: '390x844', width: 390, height: 844 },
  { name: '360x640', width: 360, height: 640 },
  { name: '430x932', width: 430, height: 932 },
];

const OUTPUT_DIR = join(process.cwd(), 'tests/visual/captures/multi-viewport');

// Parse --screen argument
const screenArg = process.argv.find((a) => a.startsWith('--screen='))?.split('=')[1];

async function captureAllViewports() {
  console.log('Starting multi-viewport capture...\n');

  mkdirSync(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
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
    console.error('Available screens:', ALL_SCREENS.map((s) => s.name).join(', '));
    await browser.close();
    process.exit(1);
  }

  for (const screen of screensToCapture) {
    console.log(`Capturing ${screen.name}...`);

    for (const viewport of VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        deviceScaleFactor: 1,
      });

      const page = await context.newPage();

      try {
        await page.goto(screen.url, { waitUntil: 'networkidle' });
        await page.waitForLoadState('domcontentloaded');

        const filename = `${screen.name}-${viewport.name}.png`;
        const filepath = join(OUTPUT_DIR, filename);

        await page.screenshot({
          path: filepath,
          fullPage: false,
        });

        results.push({
          screen: screen.name,
          viewport: viewport.name,
          path: filepath,
          dimensions: viewport,
        });

        console.log(`  ✓ ${viewport.name}`);
      } catch (error) {
        console.error(`  ✗ ${viewport.name}:`, error);
      } finally {
        await page.close();
        await context.close();
      }
    }
  }

  await browser.close();

  // Write summary
  const summaryPath = join(OUTPUT_DIR, 'multi-viewport-summary.json');
  writeFileSync(summaryPath, JSON.stringify(results, null, 2));

  console.log(`\n✓ Captured ${results.length} screenshots across ${ALL_SCREENS.length} screens and ${VIEWPORTS.length} viewports`);
  console.log(`✓ Summary written to ${summaryPath}`);
}

captureAllViewports().catch(console.error);
