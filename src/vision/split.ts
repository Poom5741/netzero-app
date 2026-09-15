import type { BakeoffManifest, PipeLabel } from "./bakeoff";

export const SPLIT_SEED = 42;
export const TRAIN_RATIO = 0.7;

export function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface SplitRow {
  path: string;
  label: PipeLabel;
}
export interface SplitResult {
  train: SplitRow[];
  holdout: SplitRow[];
  seed: number;
  trainRatio: number;
}

export function makeSplit(manifest: BakeoffManifest): SplitResult {
  const rng = mulberry32(SPLIT_SEED);
  const train: SplitRow[] = [];
  const holdout: SplitRow[] = [];
  for (const label of ["flooded", "dry", "invalid"] as const) {
    const rows = manifest.images.filter((row) => row.label === label).map((row) => ({ ...row }));
    for (let i = rows.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rng() * (i + 1));
      [rows[i], rows[j]] = [rows[j]!, rows[i]!];
    }
    const cut = Math.floor(rows.length * TRAIN_RATIO);
    train.push(...rows.slice(0, cut));
    holdout.push(...rows.slice(cut));
  }
  return { train, holdout, seed: SPLIT_SEED, trainRatio: TRAIN_RATIO };
}
