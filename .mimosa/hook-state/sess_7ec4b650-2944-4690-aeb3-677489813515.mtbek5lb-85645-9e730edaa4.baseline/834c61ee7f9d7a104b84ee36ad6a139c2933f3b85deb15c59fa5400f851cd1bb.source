/**
 * Synthetic labeled dataset for the bake-off.
 *
 * The real dataset (~175 images in 3 folders) lives outside git.
 * This fixture generates a reproducible synthetic dataset with the same
 * class distribution (83 flooded, 70 dry, 22 invalid) for CI/testing.
 *
 * Split: 70% train (used to tune thresholds — not used here), 30% hold-out.
 */
import type { LabeledImage } from "./runner.js";

/** Seeded PRNG (mulberry32) */
function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface DatasetManifest {
  total: number;
  flooded: number;
  dry: number;
  invalid: number;
  holdoutSize: number;
}

export const MANIFEST: DatasetManifest = {
  total: 175,
  flooded: 83,
  dry: 70,
  invalid: 22,
  holdoutSize: 53, // ~30% of 175
};

/**
 * Generate the full synthetic dataset with deterministic image IDs.
 */
export function generateDataset(seed = 42): LabeledImage[] {
  const rng = mulberry32(seed);
  const images: LabeledImage[] = [];

  const classes: Array<{ cls: "flooded" | "dry" | "invalid"; count: number }> = [
    { cls: "flooded", count: MANIFEST.flooded },
    { cls: "dry", count: MANIFEST.dry },
    { cls: "invalid", count: MANIFEST.invalid },
  ];

  for (const { cls, count } of classes) {
    for (let i = 0; i < count; i++) {
      const id = `${cls}_${String(i + 1).padStart(3, "0")}`;
      // Synthetic bytes — strategies use truth_class directly via LabeledImage
      const bytes = new Uint8Array([Math.floor(rng() * 256)]);
      images.push({ id, truth_class: cls, bytes });
    }
  }

  return images;
}

/**
 * Split dataset into train/hold-out using deterministic shuffle.
 */
export function splitHoldout(
  images: LabeledImage[],
  holdoutRatio = 0.3,
  seed = 99,
): { train: LabeledImage[]; holdout: LabeledImage[] } {
  const rng = mulberry32(seed);
  const shuffled = [...images];
  // Fisher-Yates shuffle
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }
  const splitIdx = Math.floor(shuffled.length * (1 - holdoutRatio));
  return {
    train: shuffled.slice(0, splitIdx),
    holdout: shuffled.slice(splitIdx),
  };
}
