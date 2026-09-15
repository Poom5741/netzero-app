import { captureReference } from "./capture";
import { compareImages } from "./compare";
import { DEFAULT_REGIONS, type RegionDefinition } from "./regions";
import type { RegionTolerance } from "./compare";

export interface NoiseMeasurementOptions {
  source: string;
  screenName: string;
  stateName: string;
  artifactId: string;
  viewport: { width: number; height: number };
  deviceScaleFactor: number;
  fixtureId: string;
  outputDir: string;
  captureCount?: number;
  regions?: RegionDefinition[];
}

export interface NoiseRegion {
  name: string;
  bounds: { x: number; y: number; width: number; height: number };
  maxDiffPixels: number;
  avgDiffPixels: number;
  tolerance: number;
  samples: number[];
}

export interface NoiseProfile {
  screenName: string;
  stateName: string;
  viewport: { width: number; height: number };
  deviceScaleFactor: number;
  captureCount: number;
  measurementDate: string;
  regions: NoiseRegion[];
}

export async function measureNoise(options: NoiseMeasurementOptions): Promise<NoiseProfile> {
  const captureCount = options.captureCount ?? 5;
  const regions = options.regions ?? DEFAULT_REGIONS;

  // Capture multiple times
  const paths: string[] = [];
  for (let i = 0; i < captureCount; i++) {
    const result = await captureReference({
      source: options.source,
      screenName: `${options.screenName}-noise-${i}`,
      stateName: options.stateName,
      artifactId: options.artifactId,
      viewport: options.viewport,
      deviceScaleFactor: options.deviceScaleFactor,
      fixtureId: options.fixtureId,
      outputDir: options.outputDir,
    });
    paths.push(result.imagePath);
  }

  // Compare consecutive pairs and accumulate per-region diffs
  const regionDiffs: Record<string, number[]> = {};
  for (const region of regions) {
    regionDiffs[region.name] = [];
  }

  for (let i = 0; i < paths.length - 1; i++) {
    const tolerances: RegionTolerance[] = regions.map((r) => ({
      name: r.name,
      bounds: r.bounds,
      tolerance: Number.MAX_SAFE_INTEGER, // Accept all diffs for measurement
    }));

    const result = await compareImages({
      referencePath: paths[i],
      implementationPath: paths[i + 1],
      tolerances,
      outputDir: options.outputDir,
      comparisonId: `noise-${options.screenName}-${i}`,
    });

    for (const region of result.regions) {
      regionDiffs[region.regionName].push(region.diffPixels);
    }
  }

  // Compute noise profile
  const profile: NoiseProfile = {
    screenName: options.screenName,
    stateName: options.stateName,
    viewport: options.viewport,
    deviceScaleFactor: options.deviceScaleFactor,
    captureCount,
    measurementDate: new Date().toISOString(),
    regions: regions.map((region) => {
      const diffs = regionDiffs[region.name];
      const maxDiff = Math.max(...diffs, 0);
      const avgDiff = diffs.length > 0 ? diffs.reduce((a, b) => a + b, 0) / diffs.length : 0;

      return {
        name: region.name,
        bounds: region.bounds,
        maxDiffPixels: maxDiff,
        avgDiffPixels: Math.round(avgDiff * 100) / 100,
        tolerance: maxDiff + 1, // Safety margin
        samples: diffs,
      };
    }),
  };

  return profile;
}
