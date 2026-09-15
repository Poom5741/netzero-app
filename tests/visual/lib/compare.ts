import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

export interface RegionTolerance {
  name: string;
  bounds: { x: number; y: number; width: number; height: number };
  tolerance: number;
}

export interface RegionComparison {
  regionName: string;
  diffPixels: number;
  tolerance: number;
  pass: boolean;
  diffPercentage: number;
}

export interface ComparisonResult {
  match: boolean;
  dimensionsMatch: boolean;
  dimensionMismatchError: string | null;
  overallPass: boolean;
  regions: RegionComparison[];
  diffPixels: number;
  totalPixels: number;
  diffPercentage: number;
  diffImagePath: string | null;
  overlayImagePath: string | null;
}

export interface CompareOptions {
  referencePath: string;
  implementationPath: string;
  tolerances: RegionTolerance[];
  outputDir: string;
  comparisonId: string;
}

export async function compareImages(options: CompareOptions): Promise<ComparisonResult> {
  const ref = PNG.sync.read(readFileSync(options.referencePath));
  const impl = PNG.sync.read(readFileSync(options.implementationPath));
  const mismatch = ref.width !== impl.width || ref.height !== impl.height;
  const resultPath = join(options.outputDir, "results", `${options.comparisonId}.json`);
  mkdirSync(dirname(resultPath), { recursive: true });

  if (mismatch) {
    const result: ComparisonResult = {
      match: false,
      dimensionsMatch: false,
      dimensionMismatchError: `Dimension mismatch: reference is ${ref.width}x${ref.height}, implementation is ${impl.width}x${impl.height}. Cannot compare.`,
      overallPass: false,
      regions: [],
      diffPixels: 0,
      totalPixels: ref.width * ref.height,
      diffPercentage: 100,
      diffImagePath: null,
      overlayImagePath: null,
    };
    writeFileSync(resultPath, JSON.stringify(result, null, 2));
    return result;
  }

  const diff = new PNG({ width: ref.width, height: ref.height });
  const diffPixels = pixelmatch(ref.data, impl.data, diff.data, ref.width, ref.height, { threshold: 0.1 });
  const totalPixels = ref.width * ref.height;
  const diffPercentage = totalPixels ? (diffPixels / totalPixels) * 100 : 0;
  const diffPath = join(options.outputDir, "diff", `${options.comparisonId}.png`);
  const overlayPath = join(options.outputDir, "overlay", `${options.comparisonId}.png`);
  mkdirSync(dirname(diffPath), { recursive: true });
  mkdirSync(dirname(overlayPath), { recursive: true });
  writeFileSync(diffPath, PNG.sync.write(diff));

  const overlay = new PNG({ width: ref.width * 2 + 2, height: ref.height });
  PNG.bitblt(ref, overlay, 0, 0, ref.width, ref.height, 0, 0);
  PNG.bitblt(impl, overlay, 0, 0, impl.width, impl.height, ref.width + 2, 0);
  writeFileSync(overlayPath, PNG.sync.write(overlay));

  const regions = options.tolerances.map((region) => {
    const x = Math.floor(region.bounds.x * ref.width);
    const y = Math.floor(region.bounds.y * ref.height);
    const width = Math.floor(region.bounds.width * ref.width);
    const height = Math.floor(region.bounds.height * ref.height);
    const regionDiff = new PNG({ width, height });
    const regionRef = new PNG({ width, height });
    const regionImpl = new PNG({ width, height });
    PNG.bitblt(ref, regionRef, x, y, width, height, 0, 0);
    PNG.bitblt(impl, regionImpl, x, y, width, height, 0, 0);
    const count = pixelmatch(regionRef.data, regionImpl.data, regionDiff.data, width, height, { threshold: 0.1 });
    return { regionName: region.name, diffPixels: count, tolerance: region.tolerance, pass: count <= region.tolerance, diffPercentage: width * height ? (count / (width * height)) * 100 : 0 };
  });

  const result: ComparisonResult = {
    match: diffPixels === 0,
    dimensionsMatch: true,
    dimensionMismatchError: null,
    overallPass: regions.every((region) => region.pass),
    regions,
    diffPixels,
    totalPixels,
    diffPercentage,
    diffImagePath: diffPath,
    overlayImagePath: overlayPath,
  };
  writeFileSync(resultPath, JSON.stringify(result, null, 2));
  return result;
}

export function loadTolerances(path: string): RegionTolerance[] {
  const profile = JSON.parse(readFileSync(path, "utf8"));
  return profile.regions;
}

export function rejectDimensionMismatch(ref: { width: number; height: number }, impl: { width: number; height: number }): Error {
  return new Error(`Dimension mismatch: reference is ${ref.width}x${ref.height}, implementation is ${impl.width}x${impl.height}. Cannot compare.`);
}
