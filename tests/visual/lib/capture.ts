import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";
import {
  type CaptureProvenance,
  computeSourceHash,
  generateProvenance,
  writeProvenance,
} from "./provenance";

export class CaptureTimeoutError extends Error {
  fontState = "timeout" as const;
  constructor(public timeout: number) {
    super(`Font wait timed out after ${timeout}ms`);
    this.name = "CaptureTimeoutError";
  }
}

export interface CaptureOptions {
  source: string;
  screenName: string;
  stateName: string;
  artifactId: string;
  sourceModule?: string;
  viewport: { width: number; height: number };
  deviceScaleFactor: number;
  fixtureId: string;
  outputDir: string;
  fontTimeout?: number;
  captureKind?: "source-reference" | "implementation";
}

export interface CaptureResult {
  imagePath: string;
  provenance: CaptureProvenance;
  fontReady: boolean;
  assetStatus: "ready" | "missing" | "blocked";
}

export const CLAUDE_SOURCE_TOKENS = {
  sidebarWidth: 232,
  sidebarColor: "#061E5C",
  primaryColor: "#028E91",
  fontFamily: 'Fira Sans, "Noto Sans Thai", "Fira Mono"',
};

export const DEFAULT_VIEWPORTS = [
  { width: 1280, height: 720, deviceScaleFactor: 1 },
  { width: 1440, height: 900, deviceScaleFactor: 1 },
  { width: 390, height: 844, deviceScaleFactor: 3 },
  { width: 360, height: 844, deviceScaleFactor: 3 },
  { width: 430, height: 844, deviceScaleFactor: 3 },
];

/**
 * Check asset readiness by inspecting the rendered page for missing fonts/images.
 * Returns "ready" if assets loaded, "missing" if assets are absent, "blocked" if rendering failed.
 */
export async function checkAssetReadiness(page: any): Promise<"ready" | "missing" | "blocked"> {
  try {
    const missingAssets = await page.evaluate(() => {
      const missing: string[] = [];

      // Check for broken images
      const images = document.querySelectorAll("img");
      images.forEach((img: HTMLImageElement) => {
        if (img.complete && img.naturalWidth === 0) {
          missing.push(`image:${img.src || img.alt || "unknown"}`);
        }
      });

      // Check for required Claude source fonts
      const requiredFonts = ["Fira Sans", "Noto Sans Thai", "Material Symbols Outlined"];
      const fontsAvailable = requiredFonts.every((font) => {
        return document.fonts.check(`16px "${font}"`);
      });

      if (!fontsAvailable) {
        missing.push("fonts:Claude source fonts not loaded");
      }

      return missing;
    });

    return missingAssets.length === 0 ? "ready" : "missing";
  } catch {
    return "blocked";
  }
}

export async function captureReference(options: CaptureOptions): Promise<CaptureResult> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: options.viewport,
    deviceScaleFactor: options.deviceScaleFactor,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  try {
    await page.goto(options.source, { waitUntil: "networkidle" });
    let fontReady = true;
    try {
      await page.waitForFunction(
        () => document.fonts.ready.then(() => document.fonts.status === "loaded"),
        { timeout: options.fontTimeout ?? 5000 },
      );
    } catch {
      fontReady = false;
    }

    // Check asset readiness after fonts load
    const assetStatus = await checkAssetReadiness(page);

    const html = await page.content();
    const captureKind = options.captureKind ?? "implementation";
    const outputDirKind = captureKind === "source-reference" ? "reference" : "implementation";
    const output = join(
      options.outputDir,
      outputDirKind,
      `${options.screenName}-${options.stateName}-${options.viewport.width}x${options.viewport.height}.png`,
    );
    mkdirSync(join(options.outputDir, outputDirKind), { recursive: true });
    await page.screenshot({ path: output, fullPage: false });
    const provenance = generateProvenance({
      ...options,
      fontState: fontReady ? "ready" : "timeout",
      sourceHash: await computeSourceHash(html),
    });
    writeProvenance(provenance, options.outputDir);
    return { imagePath: output, provenance, fontReady, assetStatus };
  } finally {
    await context.close();
    await browser.close();
  }
}

export async function captureAllViewports(
  options: Omit<CaptureOptions, "viewport" | "deviceScaleFactor"> & {
    viewports?: typeof DEFAULT_VIEWPORTS;
  },
): Promise<CaptureResult[]> {
  const results: CaptureResult[] = [];
  for (const viewport of options.viewports ?? DEFAULT_VIEWPORTS)
    results.push(
      await captureReference({
        ...options,
        viewport: { width: viewport.width, height: viewport.height },
        deviceScaleFactor: viewport.deviceScaleFactor,
      }),
    );
  return results;
}
