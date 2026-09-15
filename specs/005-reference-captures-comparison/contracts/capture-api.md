# Contract: Capture API

**Feature**: 005-reference-captures-comparison
**Module**: `tests/visual/lib/capture.ts`

## Purpose

Deterministic browser-based screenshot capture with font-wait, viewport control, and provenance generation. All reference captures flow through this module.

## Functions

### `captureReference(options: CaptureOptions): Promise<CaptureResult>`

Captures a single reference screenshot of a harness page at a specified viewport.

**Parameters**:

```typescript
interface CaptureOptions {
  /** Harness page URL or file path */
  source: string;
  /** Screen identifier (e.g., "admin-overview") */
  screenName: string;
  /** State identifier (e.g., "default", "loading", "error") */
  stateName: string;
  /** Source artifact ID from #142 inventory */
  artifactId: string;
  /** Viewport dimensions */
  viewport: { width: number; height: number };
  /** Device pixel ratio (1 | 2 | 3) */
  deviceScaleFactor: number;
  /** Fixture data set identifier */
  fixtureId: string;
  /** Output directory for screenshot */
  outputDir: string;
  /** Font wait timeout in ms (default: 5000) */
  fontTimeout?: number;
}

interface CaptureResult {
  /** Path to saved PNG */
  imagePath: string;
  /** Provenance record */
  provenance: CaptureProvenance;
  /** Whether fonts loaded before timeout */
  fontReady: boolean;
}
```

**Behavior**:
1. Launch headless Chromium with specified viewport and DPR
2. Navigate to source URL/path
3. Wait for `networkidle` state
4. Wait for `document.fonts.ready` (up to fontTimeout)
5. Emulate `prefers-reduced-motion: reduce`
6. Compute SHA-256 of rendered HTML
7. Take screenshot
8. Write provenance JSON to `{outputDir}/provenance/{screenName}-{stateName}-{width}x{height}.json`
9. Close browser context

**Errors**:
- Throws `CaptureTimeoutError` if font wait exceeds timeout (fontState="timeout" recorded in provenance)
- Throws `NavigationError` if page fails to load

---

### `captureAllViewports(options: CaptureAllViewportsOptions): Promise<CaptureResult[]>`

Captures a screen at all 5 required viewports in sequence.

**Parameters**:

```typescript
interface CaptureAllViewportsOptions extends Omit<CaptureOptions, 'viewport' | 'deviceScaleFactor'> {
  /** Override default viewport set */
  viewports?: Array<{ width: number; height: number; deviceScaleFactor: number }>;
}
```

**Default viewports**:
| Name | Width | Height | DPR |
|------|-------|--------|-----|
| desktop-primary | 1280 | 720 | 1 |
| desktop-overflow | 1440 | 900 | 1 |
| liff-primary | 390 | 844 | 3 |
| liff-narrow | 360 | 844 | 3 |
| liff-wide | 430 | 844 | 3 |

**Behavior**: Calls `captureReference` for each viewport. Returns array of results.

---

### `measureNoise(options: NoiseMeasurementOptions): Promise<NoiseProfile>`

Captures the same screen 5 times and computes per-region pixel variance.

**Parameters**:

```typescript
interface NoiseMeasurementOptions {
  /** Harness page URL or file path */
  source: string;
  /** Screen identifier */
  screenName: string;
  /** Viewport to measure */
  viewport: { width: number; height: number };
  /** Device pixel ratio */
  deviceScaleFactor: number;
  /** Number of captures (default: 5) */
  captureCount?: number;
  /** Region definitions */
  regions: RegionDefinition[];
  /** Output directory for noise profile */
  outputDir: string;
}

interface RegionDefinition {
  name: string;
  /** Percentage-based bounds (0-1) relative to viewport */
  bounds: { x: number; y: number; width: number; height: number };
}
```

**Behavior**:
1. Capture screen `captureCount` times at identical settings
2. For each consecutive pair, run pixelmatch diff
3. For each region, extract the region sub-image from each diff
4. Compute max and avg non-matching pixels per region
5. Set tolerance = max + 1
6. Write noise profile JSON to `{outputDir}/noise/profiles/{screenName}-{width}x{height}.json`

**Returns**: NoiseProfile with per-region tolerance values.

## Invariants

- Every capture produces a provenance JSON file
- Font state is always recorded ("ready" or "timeout")
- Noise tolerance is never less than measured max diff
- Same input always produces same output (deterministic)
