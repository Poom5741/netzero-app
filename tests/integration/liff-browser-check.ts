#!/usr/bin/env bun
/**
 * LIFF Browser Check — Standalone Script (US3)
 *
 * Verifies LIFF pages load at the deployed frontend with correct titles and Thai text.
 * No test framework needed — just fetch and assert.
 *
 * Run: bun run tests/integration/liff-browser-check.ts
 * Env: LIFF_BASE_URL (default: https://netzero-frontend.pages.dev)
 */

const BASE_URL = process.env.LIFF_BASE_URL ?? "https://netzero-frontend.pages.dev";

interface Check {
  path: string;
  expectedTitle: string;
  expectedTexts: string[];
}

const pages: (Check & { checkLang?: boolean })[] = [
  { path: "/", expectedTitle: "NetZeroCarbon", expectedTexts: ["NetZeroCarbon"], checkLang: false },
  {
    path: "/chat",
    expectedTitle: "แชท — NetZeroCarbon",
    expectedTexts: ["กำลังเชื่อมต่อ", "NetZeroCarbon"],
    checkLang: true,
  },
  {
    path: "/summary",
    expectedTitle: "สรุปฤดูกาล — NetZeroCarbon",
    expectedTexts: ["NetZeroCarbon"],
    checkLang: true,
  },
  {
    path: "/upload",
    expectedTitle: "อัปโหลดรูป — NetZeroCarbon",
    expectedTexts: ["NetZeroCarbon"],
    checkLang: true,
  },
];

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    console.log(`  PASS  ${msg}`);
    passed++;
  } else {
    console.error(`  FAIL  ${msg}`);
    failed++;
  }
}

function extractTitle(html: string): string {
  const m = html.match(/<title>([^<]*)<\/title>/);
  return m ? m[1] : "";
}

console.log(`\nLIFF Browser Check — ${BASE_URL}\n`);

for (const page of pages) {
  const url = `${BASE_URL}${page.path}`;
  console.log(`Checking ${url}`);

  try {
    const res = await fetch(url);
    const html = await res.text();
    const title = extractTitle(html);

    assert(res.status === 200, `HTTP ${res.status} === 200`);
    assert(title === page.expectedTitle, `title "${title}" === "${page.expectedTitle}"`);
    assert(!title.startsWith("404"), "title does not start with 404");
    if (page.checkLang) {
      assert(html.includes('lang="th"'), 'has lang="th"');
    }

    for (const text of page.expectedTexts) {
      assert(html.includes(text), `contains "${text}"`);
    }
  } catch (e: unknown) {
    assert(false, `fetch failed: ${(e as Error).message}`);
  }
  console.log();
}

console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
