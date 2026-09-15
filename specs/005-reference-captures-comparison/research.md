# Research: Reference Captures and Visual Comparison

**Feature**: 005-reference-captures-comparison
**Date**: 2026-09-15

## R1: Deterministic Browser Capture Strategy

**Decision**: Use Playwright's built-in `page.screenshot()` with explicit viewport/DPR control via `browser.newContext({ viewport, deviceScaleFactor })`. Wait for `networkidle` + `document.fonts.ready` before capture. Disable animations via `prefers-reduced-motion` media emulation.

**Rationale**: Playwright is already installed and configured. `deviceScaleFactor` gives exact DPR control. Font-wait eliminates text-rendering non-determinism. Animation suppression removes timing-dependent pixel variance.

**Alternatives considered**:
- browser-use:control-browser for capture — mandated for *manual* QA but overkill for deterministic batch capture; Playwright's programmatic API gives exact viewport/DPR control needed for pixel-repeatability
- Puppeteer — would add a second browser dependency; Playwright already present

## R2: Pixel Comparison Approach

**Decision**: Use existing pixelmatch v7 + canvas v3 for image diffing. Wrap in a comparison function that: (1) rejects dimension mismatches before pixel comparison, (2) produces diff image + overlay image for every pair, (3) accepts per-region tolerance thresholds.

**Rationale**: Both libraries already installed. pixelmatch produces per-pixel diff output suitable for region analysis. canvas provides image read/write without external dependencies.

**Alternatives considered**:
- SSIM (structural similarity) — better for perceptual comparison but adds a dependency and complexity; pixelmatch is sufficient for layout/color change detection
- Resemble.js — browser-oriented, less suitable for Node.js batch processing

## R3: Per-Region Noise Measurement

**Decision**: Capture the same screen 5 times at identical settings. For each capture pair, compute pixelmatch diff. Divide image into named regions (header, sidebar, content, footer). Compute max non-matching pixel count per region across all pairs. Set tolerance = max observed + 1 (one-pixel safety margin).

**Rationale**: Direct measurement captures actual environment noise (font rendering, anti-aliasing, sub-pixel positioning). Per-region accounts for text-heavy vs empty areas. 5 captures balances statistical confidence with execution time.

**Alternatives considered**:
- 10 captures — diminishing returns; 5 captures captures >95% of variance
- Single global threshold — fails for mixed text/image screens where text regions have higher noise
- Zero tolerance — too strict; anti-aliased text edges vary by <5 pixels across captures on macOS

## R4: Reference Harness Architecture

**Decision**: Standalone HTML pages per surface (LINE OA, Admin, Sponsor) that inline the extracted source styles and render with synthetic fixture data. Each page is self-contained — loads its own CSS, fonts (via `<link>`), and fixture JSON. No dependency on the running Next.js app.

**Rationale**: Isolation from the app ensures reference renders are stable regardless of app state. Self-contained pages can be served by Playwright's static file server or opened directly. Matches the issue requirement for "isolated reference-only harness."

**Alternatives considered**:
- Render references inside the running app — couples reference stability to app state; violates isolation requirement
- iframe embedding of original Claude artifacts — artifacts are no longer hosted; extracted source is the only stable reference

## R5: Fixture Data Design

**Decision**: TypeScript fixture modules exporting deterministic data objects. Fixed dates (2026-01-15 season start, 2026-09-15 "today"). Fixed timezone (Asia/Bangkok). 5-10 records per entity (farmers, plots, seasons, admin users, sponsor accounts). CPA codes for sponsor scope. No real farmer PII.

**Rationale**: Deterministic values ensure repeatable renders. Fixed dates prevent "today" from shifting between captures. 5-10 records matches production density per clarification decision. CPA codes satisfy constitution Principle VI.

**Alternatives considered**:
- Random data with fixed seed — harder to reason about; explicit values are auditable
- Real data snapshots — violates privacy (Principle VI) and creates stale-data drift

## R6: Provenance Record Format

**Decision**: JSON file per capture containing: `artifactId`, `screenName`, `stateName`, `viewport` ({width, height}), `deviceScaleFactor`, `fixtureId`, `fontState` ("ready" | "timeout"), `captureTimestamp` (ISO 8601), `sourceHash` (SHA-256 of source HTML), `captureTool` ("playwright"), `noiseToleranceProfile` (reference to noise profile ID).

**Rationale**: JSON is machine-readable for automated validation and human-readable for debugging. One file per capture enables granular provenance tracking. SHA-256 of source detects unintended source changes.

**Alternatives considered**:
- Single manifest JSON — harder to update incrementally; per-file enables append-only growth
- YAML — less tooling support in the existing stack

## R7: Coverage Manifest Format

**Decision**: Markdown table in `tests/visual/coverage-manifest.md` with columns: Screen/State, Source Artifact ID, Reference Capture (✅/❌/⚠️), Viewport Coverage (5/5), Blocker Reason (if any), Provenance Link. Grouped by surface (LINE OA, Admin, Sponsor).

**Rationale**: Markdown renders in GitHub and local viewers. Table format enables quick visual scan of coverage gaps. Blocker reasons are explicit per FR-014.

**Alternatives considered**:
- JSON manifest — machine-readable but not human-scannable for quick status checks
- Database — overkill for a static inventory document
