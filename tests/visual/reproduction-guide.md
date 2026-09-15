# Reproduction Guide

This guide explains how to reproduce visual captures and comparisons for the NetZero Carbon design parity project.

## Prerequisites

- Node.js 20+ and bun installed
- Dependencies installed: `bun install`
- Chrome/Chromium browser (for Playwright)

## Quick Start

### 1. Capture a Single Screen

```bash
# Capture admin login at default viewport
bun tests/visual/scripts/capture-single.ts --screen=admin-login --state=default

# Capture at specific viewport
bun tests/visual/scripts/capture-single.ts --screen=admin-overview --state=default --viewport=1440x900

# Capture LIFF screen at mobile viewport
bun tests/visual/scripts/capture-single.ts --screen=line-oa-welcome --state=default --viewport=390x844 --dpr=3
```

Output:
- Screenshot: `tests/visual/captures/reference/{screen}-{state}-{viewport}.png`
- Provenance: `tests/visual/captures/provenance/{screen}-{state}-{viewport}.json`

### 2. Capture All Screens at All Viewports

```bash
bun tests/visual/scripts/capture-all-viewports.ts --all
```

This captures all screens at 5 viewports each per FR-004:
- 1280x720 (desktop primary)
- 1440x900 (desktop overflow)
- 390x844 (LIFF primary)
- 360x844 (LIFF narrow overflow)
- 430x844 (LIFF wide overflow)

Total: 120 captures

### 3. Verify Determinism

```bash
# Capture the same screen 5 times and verify pixel-identical output
bun tests/visual/scripts/verify-determinism.ts --screen=admin-login --state=default
```

Expected: All 5 captures should be identical (0 diff pixels).

### 4. Measure Noise

```bash
# Measure per-region noise for a screen
bun tests/visual/scripts/measure-noise.ts --screen=admin-login --state=default --viewport=1280x720
```

Output: `tests/visual/noise/profiles/{screen}-{state}-{viewport}.json`

This creates a noise profile with per-region tolerance values based on actual capture variance.

### 5. Compare Images

```bash
# Compare two images using a noise profile
bun tests/visual/scripts/compare-pair.ts \
  --ref=tests/visual/captures/reference/admin-login-default-1280x720.png \
  --impl=path/to/implementation.png \
  --tolerances=tests/visual/noise/profiles/admin-login-default-1280x720.json \
  --output=admin-login-comparison
```

Output:
- Diff image: `tests/visual/comparison/diff/{output}.png`
- Overlay image: `tests/visual/comparison/overlay/{output}.png`
- Result JSON: `tests/visual/comparison/results/{output}.json`

### 6. Validate Noise Profiles

```bash
bun tests/visual/scripts/validate-tolerances.ts
```

Checks that all noise profiles have:
- At least 4 regions
- captureCount = 5
- tolerance >= maxDiffPixels for each region

### 7. Generate Coverage Manifest

```bash
bun tests/visual/scripts/generate-coverage.ts
```

Output: `tests/visual/coverage-manifest.md`

Shows which screens have been captured and which are missing.

## Troubleshooting

### Font Loading Issues

If screenshots show incorrect fonts:
- Ensure Google Fonts are accessible (check network connection)
- Increase font timeout: `--font-timeout=10000`
- Check provenance JSON for `fontState: "timeout"`

### Non-Deterministic Captures

If `verify-determinism.ts` reports differences:
- Check for animations or transitions in the screen
- Ensure no dynamic content (timestamps, random values)
- Verify `prefers-reduced-motion: reduce` is applied
- Check for external resource loading delays

### Comparison Failures

If `compare-pair.ts` reports failures:
- Verify both images have identical dimensions
- Check that noise profile matches the viewport/DPR
- Review diff image to identify changed regions
- Adjust tolerance if noise measurement was too conservative

### Missing Screens

If `generate-coverage.ts` shows missing screens:
- Check `tests/visual/reference-harness/screens/` for screen definitions
- Verify screen name and state match exactly
- Run `capture-all-viewports.ts --all` to capture all screens

## File Locations

| Type | Path |
|------|------|
| Scripts | `tests/visual/scripts/*.ts` |
| Reference captures | `tests/visual/captures/reference/` |
| Provenance records | `tests/visual/captures/provenance/` |
| Comparison diffs | `tests/visual/comparison/diff/` |
| Comparison overlays | `tests/visual/comparison/overlay/` |
| Comparison results | `tests/visual/comparison/results/` |
| Noise profiles | `tests/visual/noise/profiles/` |
| Coverage manifest | `tests/visual/coverage-manifest.md` |
| Blockers report | `tests/visual/blockers.md` |

## Next Steps

After completing captures:
1. Review `coverage-manifest.md` for missing screens
2. Review `blockers.md` for documented issues
3. Run visual regression tests: `bun test tests/visual/spec-comparison.spec.ts`
4. Proceed with design parity implementation (issues #144-#148)
