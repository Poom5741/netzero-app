/**
 * LIFF Browser Tests (US3, T044-T055)
 *
 * Verifies that LIFF pages render correctly at the deployed frontend.
 * Checks HTTP status, page titles, and expected Thai text content.
 *
 * Run: bun test tests/integration/liff-browser.test.ts
 * Env: LIFF_BASE_URL (default: https://netzero-frontend.pages.dev)
 */
import { describe, expect, it } from "vitest";

const BASE_URL = process.env.LIFF_BASE_URL ?? "https://netzero-frontend.pages.dev";

interface PageCheck {
  path: string;
  expectedTitle: string;
  expectedThaiText: string[];
}

const LIFF_PAGES: PageCheck[] = [
  {
    path: "/chat",
    expectedTitle: "แชท — NetZeroCarbon",
    expectedThaiText: ["กำลังเชื่อมต่อ"],
  },
  {
    path: "/summary",
    expectedTitle: "สรุปฤดูกาล — NetZeroCarbon",
    expectedThaiText: ["NetZeroCarbon"],
  },
  {
    path: "/upload",
    expectedTitle: "อัปโหลดรูป — NetZeroCarbon",
    expectedThaiText: ["NetZeroCarbon"],
  },
];

async function fetchPage(path: string): Promise<{ status: number; html: string }> {
  const res = await fetch(`${BASE_URL}${path}`);
  const html = await res.text();
  return { status: res.status, html };
}

function extractTitle(html: string): string {
  const match = html.match(/<title>([^<]*)<\/title>/);
  return match ? match[1] : "";
}

describe("LIFF pages render correctly", () => {
  it("index page loads with correct title", async () => {
    const { status, html } = await fetchPage("/");
    expect(status).toBe(200);
    expect(extractTitle(html)).toBe("NetZeroCarbon");
  });

  for (const page of LIFF_PAGES) {
    it(`${page.path} returns 200 and has correct title`, async () => {
      const { status, html } = await fetchPage(page.path);
      expect(status).toBe(200);
      expect(extractTitle(html)).toBe(page.expectedTitle);
    });

    it(`${page.path} contains expected Thai text`, async () => {
      const { html } = await fetchPage(page.path);
      for (const text of page.expectedThaiText) {
        expect(html).toContain(text);
      }
    });

    it(`${page.path} is not a 404 page`, async () => {
      const { status, html } = await fetchPage(page.path);
      expect(status).not.toBe(404);
      expect(extractTitle(html)).not.toMatch(/^404/);
    });
  }
});

describe("LIFF pages have correct HTML structure", () => {
  for (const page of LIFF_PAGES) {
    it(`${page.path} has lang="th" on html element`, async () => {
      const { html } = await fetchPage(page.path);
      expect(html).toContain('lang="th"');
    });

    it(`${page.path} includes viewport meta tag`, async () => {
      const { html } = await fetchPage(page.path);
      expect(html).toContain("viewport");
    });
  }
});
