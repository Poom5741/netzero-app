# Contract: Comparison API

**Feature**: 005-reference-captures-comparison
**Module**: `tests/visual/lib/compare.ts`

## Purpose

Image-file comparison pipeline that rejects dimension mismatches, produces diff/overlay files for every pair, and evaluates per-region tolerance. Replaces the misleading assertions in the existing `spec-comparison.spec.ts`.

## Functions

### `compareImages(options: CompareOptions): Promise<ComparisonResult>`

Compares a reference image against an implementation image.

**Parameters**:

```typescript
interface CompareOptions {
  /** Path to reference image (PNG) */
  referencePath: string;
  /** Path to implementation image (PNG) */
  implementationPath: string;
  /** Per-region tolerance values (from noise profile) */
  tolerances: RegionTolerance[];
  /** Output directory for diff/overlay images */
  outputDir: string;
  /** Comparison identifier (used in output filenames) */
  comparisonId: string;
}

interface RegionTolerance {
  name: string;
  /** Pixel bounds for region extraction */
  bounds: { x: number; y: number; width: number; height: number };
  /** Maximum allowed non-matching pixels */
  tolerance: number;
}

interface ComparisonResult {
  referencePath: string;
  implementationPath: string;
  dimensionsMatch: boolean;
  dimensionMismatchError: string | null;
  overallPass: boolean;
  regions: RegionComparison[];
  diffImagePath: string | null;
  overlayImagePath: string | null;
  timestamp: string;
}

interface RegionComparison {
  regionName: string;
  diffPixels: number;
  tolerance: number;
  pass: boolean;
  diffPercentage: number;
}
```

**Behavior**:
1. Load both images via canvas
2. Compare dimensions — if mismatch, set `dimensionsMatch=false`, populate `dimensionMismatchError`, return immediately (no diff/overlay produced)
3. If dimensions match, run pixelmatch to produce full diff image
4. Save diff image to `{outputDir}/diff/{comparisonId}.png`
5. Generate overlay image (side-by-side or blended) → `{outputDir}/overlay/{comparisonId}.png`
6. For each region, extract region sub-images from both source and diff, count non-matching pixels
7. Evaluate each region against its tolerance
8. `overallPass` = all regions pass
9. Write comparison result JSON to `{outputDir}/results/{comparisonId}.json`

**Key rule**: Diff and overlay images are ALWAYS produced when dimensions match — not only on failure. This enables visual inspection of passing comparisons.

---

### `rejectDimensionMismatch(refDims, implDims): DimensionMismatchError`

Explicit rejection for dimension-mismatched pairs.

**Parameters**:
- `refDims`: { width: number, height: number }
- `implDims`: { width: number, height: number }

**Returns**: Error with message: "Dimension mismatch: reference is {W}x{H}, implementation is {W}x{H}. Cannot compare."

---

### `generateOverlay(refImage, implImage, mode): Buffer`

Produces an overlay image combining reference and implementation.

**Parameters**:
- `refImage`: canvas Image (reference)
- `implImage`: canvas Image (implementation)
- `mode`: "side-by-side" | "blended" | "checkerboard"

**Returns**: PNG buffer of the overlay image.

**Default mode**: "side-by-side" — reference on left, implementation on right, 2px divider.

---

### `loadTolerances(profilePath: string): RegionTolerance[]`

Loads per-region tolerance values from a noise profile JSON file.

**Parameters**:
- `profilePath`: path to noise profile JSON

**Returns**: Array of RegionTolerance objects ready for `compareImages`.

---

### `detectIntentionalChange(options: ChangeDetectionTest): Promise<boolean>`

Proves the comparison can detect a known intentional change. Used as a self-test.

**Parameters**:

```typescript
interface ChangeDetectionTest {
  /** Path to original reference image */
  originalPath: string;
  /** Path to intentionally-modified image */
  modifiedPath: string;
  /** Per-region tolerances */
  tolerances: RegionTolerance[];
  /** Output directory */
  outputDir: string;
}
```

**Behavior**: Runs `compareImages` on the pair. Returns `true` if `overallPass=false` (change was detected). Returns `false` if comparison passed (change was NOT detected — indicates tolerance is too loose or comparison is broken).

**Usage**: Called during setup to validate that tolerances are not hiding real differences.

## Invariants

- Dimension mismatch → immediate rejection, no diff/overlay files
- Dimension match → diff and overlay files ALWAYS produced
- Per-region tolerance from noise measurement, never hardcoded
- Tolerance values are never relaxed to accommodate a failure
- Comparison result JSON always written, even on dimension mismatch
