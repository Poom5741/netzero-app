import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const OUT = join(process.cwd(), 'tests/visual/captures/before');
mkdirSync(OUT, { recursive: true });

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });

  const pages = [
    { name: 'admin-login', url: 'http://localhost:3000/admin/login' },
    { name: 'admin-overview', url: 'http://localhost:3000/admin' },
    { name: 'sponsor-login', url: 'http://localhost:3000/sponsor/login' },
    { name: 'sponsor-overview', url: 'http://localhost:3000/sponsor' },
  ];

  for (const p of pages) {
    const page = await context.newPage();
    await page.goto(p.url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const buf = await page.screenshot({ fullPage: false });
    const path = join(OUT, p.name + '-1280x720.png');
    writeFileSync(path, buf);
    console.log('Captured:', path);
    await page.close();
  }

  await browser.close();
  console.log('Done');
}

main();
