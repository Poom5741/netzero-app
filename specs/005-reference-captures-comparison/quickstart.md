# Quickstart: Reference Captures and Visual Comparison

**Feature**: 005-reference-captures-comparison

## Prerequisites

- Node.js 20+ installed
- `npm install` completed (pixelmatch, canvas, playwright already in package.json)
- #142 inventory manifest completed (source artifact IDs available)
- Extracted source trees present in `visual-qa-screenshots/{admin,line-oa,sponsor}-extracted/`

## Validation Scenarios

### V1: Single Reference Capture

Prove that a single screen can be captured deterministically with full provenance.

```bash
# Run the capture script for one screen
npx tsx tests/visual/scripts/capture-single.ts \
  --screen admin-login \
  --state default \
  --viewport 1280x720 \
  --dpr 1

# Expected output:
# tests/visual/captures/reference/admin-login-default-1280x720.png
# tests/visual/captures/provenance/admin-login-default-1280x720.json
```

**Verify**:
1. PNG exists and has exact dimensions 1280×720
2. JSON provenance contains all required fields (artifactId, screenName, viewport, fontState, captureTimestamp, sourceHash)
3. No Claude wrapper frame visible in the image
4. Thai text renders correctly (not boxes or missing glyphs)

---

### V2: Capture Determinism

Prove that repeating a capture produces pixel-identical output.

```bash
# Capture the same screen twice
npx tsx tests/visual/scripts/capture-single.ts --screen admin-login --state default --viewport 1280x720 --dpr 1 --output capture-1.png
npx tsx tests/visual/scripts/capture-single.ts --screen admin-login --state default --viewport 1280x720 --dpr 1 --output capture-2.png

# Compare the two captures
npx tsx tests/visual/scripts/compare-pair.ts \
  --ref capture-1.png \
  --impl capture-2.png \
  --tolerance 0 \
  --output determinism-check
```

**Verify**:
1. Comparison result shows `overallPass: true` with 0 diff pixels
2. Diff image is blank (all black or all transparent)
3. No non-matching pixels in any region

---

### V3: Noise Measurement

Prove that per-region noise tolerance is derived from actual measurements.

```bash
# Measure noise for a screen
npx tsx tests/visual/scripts/measure-noise.ts \
  --screen admin-overview \
  --viewport 1280x720 \
  --dpr 1 \
  --captures 5

# Expected output:
# tests/visual/noise/profiles/admin-overview-1280x720.json
```

**Verify**:
1. JSON contains 4+ regions (header, sidebar, content, footer)
2. Each region has `maxDiffPixels`, `avgDiffPixels`, and `tolerance` values
3. `tolerance` = `maxDiffPixels` + 1 for each region
4. Values are small (< 50 pixels per region for a stable screen)

---

### V4: Comparison Detects Intentional Change

Prove that the comparison pipeline detects a known layout change.

```bash
# Capture reference
npx tsx tests/visual/scripts/capture-single.ts --screen admin-login --state default --viewport 1280x720 --output ref.png

# Create a modified version (shift an element 10px right via CSS injection)
npx tsx tests/visual/scripts/capture-single.ts --screen admin-login --state default --viewport 1280x720 --css-inject "button { transform: translateX(10px); }" --output modified.png

# Run comparison
npx tsx tests/visual/scripts/compare-pair.ts \
  --ref ref.png \
  --impl modified.png \
  --tolerances tests/visual/noise/profiles/admin-login-1280x720.json \
  --output change-detection
```

**Verify**:
1. `overallPass: false` — change was detected
2. Diff image highlights the shifted region
3. The affected region shows `pass: false` with diffPixels > tolerance
4. Diff and overlay images exist on disk

---

### V5: Dimension Mismatch Rejection

Prove that mismatched-dimension images are rejected without producing diff files.

```bash
# Create two images of different sizes
npx tsx tests/visual/scripts/capture-single.ts --screen admin-login --viewport 1280x720 --output large.png
npx tsx tests/visual/scripts/capture-single.ts --screen admin-login --viewport 390x844 --output small.png

# Run comparison
npx tsx tests/visual/scripts/compare-pair.ts \
  --ref large.png \
  --impl small.png \
  --output dimension-check
```

**Verify**:
1. Result shows `dimensionsMatch: false`
2. `dimensionMismatchError` contains both dimension sets
3. No diff or overlay images produced
4. Result JSON still written with the mismatch error

---

### V6: All-Viewport Capture

Prove that a screen can be captured at all 5 required viewports.

```bash
npx tsx tests/visual/scripts/capture-all-viewports.ts \
  --screen admin-overview \
  --state default

# Expected output: 5 PNGs + 5 provenance JSONs
# admin-overview-default-1280x720.png
# admin-overview-default-1440x900.png
# admin-overview-default-390x844.png
# admin-overview-default-360x844.png
# admin-overview-default-430x844.png
```

**Verify**:
1. All 5 PNGs exist with exact requested dimensions
2. All 5 provenance JSONs exist with correct viewport metadata
3. No content clipping or unintended scrollbars in any viewport
4. Thai text renders correctly at all sizes

---

### V7: Coverage Manifest Completeness

Prove that the coverage manifest accounts for all screens in the #142 inventory.

```bash
# Generate coverage manifest
npx tsx tests/visual/scripts/generate-coverage.ts

# Check manifest
cat tests/visual/coverage-manifest.md
```

**Verify**:
1. Every screen/state from #142 inventory appears in the manifest
2. Each entry has a status (✅ complete, ❌ blocked-missing-source, ⚠️ blocked-not-implemented)
3. Blocked entries have explicit blocker reasons
4. Complete entries have provenance links

## Running All Validations

```bash
# Run all quickstart validations
npx tsx tests/visual/scripts/run-quickstart.ts

# Expected: all 7 validations pass
```

## Troubleshooting

**Fonts not rendering**: Ensure Google Fonts `<link>` is present in harness HTML. Check `fontState` in provenance — if "timeout", increase `--font-timeout`.

**Non-deterministic captures**: Check for animations or dynamic content. Ensure `prefers-reduced-motion` emulation is active. Verify no timestamps or random values in fixture data.

**Comparison always fails**: Noise tolerance may be too tight. Re-run noise measurement. Check that reference and implementation use identical viewport/DPR.

**Diff images not produced**: Verify dimensions match. Check output directory permissions.
