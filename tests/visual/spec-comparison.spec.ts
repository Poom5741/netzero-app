import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";
import { createCanvas } from "canvas";
import { compareImages, type RegionTolerance } from "./lib/compare";

/**
 * Honest Visual Comparison Tests
 *
 * These tests validate the image comparison pipeline:
 * 1. Dimension mismatch rejection
 * 2. Intentional change detection
 * 3. Diff/overlay file production
 * 4. Unchanged pair pass
 *
 * No more misleading text-only assertions or unused helpers.
 */

const TEST_OUTPUT_DIR = join(process.cwd(), "tests/visual/comparison");
const TEST_DIFF_DIR = join(TEST_OUTPUT_DIR, "diff");
const TEST_OVERLAY_DIR = join(TEST_OUTPUT_DIR, "overlay");
const TEST_RESULTS_DIR = join(TEST_OUTPUT_DIR, "results");

// Ensure output directories exist
for (const dir of [TEST_DIFF_DIR, TEST_OVERLAY_DIR, TEST_RESULTS_DIR]) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

/**
 * Helper: Create a test image with specific dimensions and content
 */
function createTestImage(width: number, height: number, color: string, text?: string): Buffer {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Fill background
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);

  // Add text if provided
  if (text) {
    ctx.fillStyle = "#000000";
    ctx.font = "20px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, width / 2, height / 2);
  }

  return canvas.toBuffer("image/png");
}

/**
 * Helper: Save buffer to temp file and return path
 */
function saveTempImage(buffer: Buffer, name: string): string {
  const path = join(TEST_OUTPUT_DIR, `temp-${name}.png`);
  writeFileSync(path, buffer);
  return path;
}

test.describe("Image Comparison Pipeline", () => {
  test("rejects dimension mismatch", async () => {
    // Create two images with different dimensions
    const img1 = createTestImage(800, 600, "#ff0000", "Image 1");
    const img2 = createTestImage(1024, 768, "#00ff00", "Image 2");

    const path1 = saveTempImage(img1, "dim-mismatch-1");
    const path2 = saveTempImage(img2, "dim-mismatch-2");

    // Compare with tolerances
    const tolerances: RegionTolerance[] = [
      { name: "full", bounds: { x: 0, y: 0, width: 1, height: 1 }, tolerance: 0 },
    ];

    const result = await compareImages({
      referencePath: path1,
      implementationPath: path2,
      tolerances,
      outputDir: TEST_OUTPUT_DIR,
      comparisonId: "dimension-mismatch-test",
    });

    // Verify dimension mismatch detected
    expect(result.dimensionsMatch).toBe(false);
    expect(result.dimensionMismatchError).toBeTruthy();
    expect(result.dimensionMismatchError).toContain("Dimension mismatch");

    // Verify no diff/overlay produced for mismatched dimensions
    expect(result.diffImagePath).toBeNull();
    expect(result.overlayImagePath).toBeNull();

    // Verify result JSON still written
    const resultPath = join(TEST_RESULTS_DIR, "dimension-mismatch-test.json");
    expect(existsSync(resultPath)).toBe(true);
  });

  test("detects intentional layout change", async () => {
    // Create two images with a visible change (different color = layout change)
    const img1 = createTestImage(800, 600, "#ff0000", "Original");
    const img2 = createTestImage(800, 600, "#0000ff", "Modified");

    const path1 = saveTempImage(img1, "layout-change-1");
    const path2 = saveTempImage(img2, "layout-change-2");

    // Compare with zero tolerance (any change should fail)
    const tolerances: RegionTolerance[] = [
      { name: "full", bounds: { x: 0, y: 0, width: 1, height: 1 }, tolerance: 0 },
    ];

    const result = await compareImages({
      referencePath: path1,
      implementationPath: path2,
      tolerances,
      outputDir: TEST_OUTPUT_DIR,
      comparisonId: "layout-change-test",
    });

    // Verify dimensions match
    expect(result.dimensionsMatch).toBe(true);
    expect(result.dimensionMismatchError).toBeNull();

    // Verify change detected (should fail with zero tolerance)
    expect(result.overallPass).toBe(false);

    // Verify regions show failure
    expect(result.regions.length).toBeGreaterThan(0);
    const failedRegions = result.regions.filter((r) => !r.pass);
    expect(failedRegions.length).toBeGreaterThan(0);

    // Verify diff and overlay produced
    expect(result.diffImagePath).toBeTruthy();
    expect(result.overlayImagePath).toBeTruthy();
    expect(existsSync(result.diffImagePath!)).toBe(true);
    expect(existsSync(result.overlayImagePath!)).toBe(true);
  });

  test("produces diff and overlay files for every comparison", async () => {
    // Create two identical images
    const img1 = createTestImage(800, 600, "#00ff00", "Test");
    const img2 = createTestImage(800, 600, "#00ff00", "Test");

    const path1 = saveTempImage(img1, "files-test-1");
    const path2 = saveTempImage(img2, "files-test-2");

    const tolerances: RegionTolerance[] = [
      { name: "full", bounds: { x: 0, y: 0, width: 1, height: 1 }, tolerance: 0 },
    ];

    const result = await compareImages({
      referencePath: path1,
      implementationPath: path2,
      tolerances,
      outputDir: TEST_OUTPUT_DIR,
      comparisonId: "files-production-test",
    });

    // Verify files produced even for passing comparison
    expect(result.diffImagePath).toBeTruthy();
    expect(result.overlayImagePath).toBeTruthy();
    expect(existsSync(result.diffImagePath!)).toBe(true);
    expect(existsSync(result.overlayImagePath!)).toBe(true);

    // Verify result JSON written
    const resultPath = join(TEST_RESULTS_DIR, "files-production-test.json");
    expect(existsSync(resultPath)).toBe(true);
  });

  test("passes unchanged pair with zero tolerance", async () => {
    // Create two identical images
    const img1 = createTestImage(800, 600, "#0000ff", "Identical");
    const img2 = createTestImage(800, 600, "#0000ff", "Identical");

    const path1 = saveTempImage(img1, "unchanged-1");
    const path2 = saveTempImage(img2, "unchanged-2");

    // Compare with zero tolerance
    const tolerances: RegionTolerance[] = [
      { name: "full", bounds: { x: 0, y: 0, width: 1, height: 1 }, tolerance: 0 },
    ];

    const result = await compareImages({
      referencePath: path1,
      implementationPath: path2,
      tolerances,
      outputDir: TEST_OUTPUT_DIR,
      comparisonId: "unchanged-pair-test",
    });

    // Verify dimensions match
    expect(result.dimensionsMatch).toBe(true);

    // Verify comparison passes
    expect(result.overallPass).toBe(true);

    // Verify all regions pass
    for (const region of result.regions) {
      expect(region.pass).toBe(true);
      expect(region.diffPixels).toBe(0);
    }
  });

  test("per-region tolerance evaluation works correctly", async () => {
    // Create images with change in specific region
    // Image 1: red background
    const img1 = createTestImage(800, 600, "#ff0000");
    // Image 2: red background with blue rectangle in top-left
    const canvas2 = createCanvas(800, 600);
    const ctx2 = canvas2.getContext("2d");
    ctx2.fillStyle = "#ff0000";
    ctx2.fillRect(0, 0, 800, 600);
    ctx2.fillStyle = "#0000ff";
    ctx2.fillRect(0, 0, 200, 150); // Top-left quadrant change
    const img2 = canvas2.toBuffer("image/png");

    const path1 = saveTempImage(img1, "region-test-1");
    const path2 = saveTempImage(img2, "region-test-2");

    // Define regions: top-left (changed) and rest (unchanged)
    const tolerances: RegionTolerance[] = [
      { name: "top-left", bounds: { x: 0, y: 0, width: 0.25, height: 0.25 }, tolerance: 0 },
      { name: "rest", bounds: { x: 0.25, y: 0, width: 0.75, height: 1 }, tolerance: 0 },
    ];

    const result = await compareImages({
      referencePath: path1,
      implementationPath: path2,
      tolerances,
      outputDir: TEST_OUTPUT_DIR,
      comparisonId: "region-tolerance-test",
    });

    // Verify both regions evaluated
    expect(result.regions.length).toBe(2);

    // Find top-left region (should fail)
    const topLeft = result.regions.find((r) => r.regionName === "top-left");
    expect(topLeft).toBeTruthy();
    expect(topLeft!.pass).toBe(false);
    expect(topLeft!.diffPixels).toBeGreaterThan(0);

    // Find rest region (should pass)
    const rest = result.regions.find((r) => r.regionName === "rest");
    expect(rest).toBeTruthy();
    expect(rest!.pass).toBe(true);
    expect(rest!.diffPixels).toBe(0);

    // Overall should fail because top-left failed
    expect(result.overallPass).toBe(false);
  });
});
