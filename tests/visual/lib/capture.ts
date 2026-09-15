import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { computeSourceHash, generateProvenance, writeProvenance, type CaptureProvenance } from "./provenance";

export class CaptureTimeoutError extends Error {
  fontState = "timeout" as const;
  constructor(public timeout: number) { super(`Font wait timed out after ${timeout}ms`); this.name = "CaptureTimeoutError"; }
}

export interface CaptureOptions {
  source: string; screenName: string; stateName: string; artifactId: string;
  viewport: { width: number; height: number }; deviceScaleFactor: number;
  fixtureId: string; outputDir: string; fontTimeout?: number;
}

export interface CaptureResult { imagePath: string; provenance: CaptureProvenance; fontReady: boolean; }

export const DEFAULT_VIEWPORTS = [
  { width: 1280, height: 720, deviceScaleFactor: 1 },
  { width: 1440, height: 900, deviceScaleFactor: 1 },
  { width: 390, height: 844, deviceScaleFactor: 3 },
  { width: 360, height: 844, deviceScaleFactor: 3 },
  { width: 430, height: 844, deviceScaleFactor: 3 },
];

export async function captureReference(options: CaptureOptions): Promise<CaptureResult> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: options.viewport, deviceScaleFactor: options.deviceScaleFactor, reducedMotion: "reduce" });
  const page = await context.newPage();
  try {
    await page.goto(options.source, { waitUntil: "networkidle" });
    let fontReady = true;
    try { await page.waitForFunction(() => document.fonts.ready.then(() => document.fonts.status === "loaded"), { timeout: options.fontTimeout ?? 5000 }); } catch { fontReady = false; }
    const html = await page.content();
    const output = join(options.outputDir, "reference", `${options.screenName}-${options.stateName}-${options.viewport.width}x${options.viewport.height}.png`);
    mkdirSync(join(options.outputDir, "reference"), { recursive: true });
    await page.screenshot({ path: output, fullPage: false });
    const provenance = generateProvenance({ ...options, fontState: fontReady ? "ready" : "timeout", sourceHash: await computeSourceHash(html) });
    writeProvenance(provenance, options.outputDir);
    return { imagePath: output, provenance, fontReady };
  } finally { await context.close(); await browser.close(); }
}

export async function captureAllViewports(options: Omit<CaptureOptions, "viewport" | "deviceScaleFactor"> & { viewports?: typeof DEFAULT_VIEWPORTS }): Promise<CaptureResult[]> {
  const results: CaptureResult[] = [];
  for (const viewport of options.viewports ?? DEFAULT_VIEWPORTS) results.push(await captureReference({ ...options, viewport: { width: viewport.width, height: viewport.height }, deviceScaleFactor: viewport.deviceScaleFactor }));
  return results;
}
