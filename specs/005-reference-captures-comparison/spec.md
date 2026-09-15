# Feature Specification: Establish Clean Reference Captures and Honest Visual Comparison

**Feature Branch**: `005-reference-captures-comparison`

**Created**: 2026-09-15

**Status**: Draft

**Input**: User description: "GitHub Issue #143 — Part of #141, blocked by #142. Use the design-source inventory to render accessible client artifact content without the Claude wrapper, duplicated frame or broken assets. Restore saved source in an isolated reference-only harness with preserved styles and documented asset dependencies. Capture every manifest state with deterministic synthetic data, fixed dates, timezone and fonts. Compare at 1280×720 desktop and 390×844 LIFF (primary), plus 1440×900 desktop and 360/430-wide LIFF overflow checks. Replace misleading claims in tests/visual/spec-comparison.spec.ts with an image-file comparison path that rejects dimension mismatch, emits completed diff/overlay files, and proves intentional layout/color changes are detected. Set per-region tolerance after measuring repeat-capture noise. Acceptance: valid references, provenance, reproducible comparison instructions, intentional-change detection, and explicit missing-source/device blockers."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Render Clean Reference Screens (Priority: P1)

A design reviewer opens any screen or state from the client artifact sources (LINE OA, Admin, Sponsor) in an isolated reference harness and sees the content exactly as the artifact intended — without the Claude wrapper frame, without duplicated frames, and without broken image or font assets. Every screen/state from the #142 inventory manifest is reachable.

**Why this priority**: Without clean, trustworthy reference renders, no downstream comparison or design-parity work is possible. This is the foundation for issues #144–#148.

**Independent Test**: Open each manifest-listed screen/state in the reference harness at 1280×720 and confirm the content renders completely with no wrapper chrome, no clipped regions, and no missing-asset placeholders. Verify that all Thai text, icons, and layout elements are present and legible.

**Acceptance Scenarios**:

1. **Given** the reference harness is running and the #142 inventory manifest lists a screen, **When** the reviewer navigates to that screen, **Then** the content renders without any Claude artifact wrapper, duplicated frame borders, or broken asset icons.
2. **Given** a screen requires specific data to render (e.g., farmer list, credit chart), **When** the harness loads it, **Then** deterministic synthetic fixture data is displayed with fixed dates, fixed timezone (Asia/Bangkok), and stable font rendering.
3. **Given** a source asset (image, font, icon) is missing from the extracted tree, **When** the harness attempts to render the screen, **Then** a visible, documented placeholder appears indicating the specific missing asset — the system never silently infers or substitutes an asset.

---

### User Story 2 — Reproducible Multi-Viewport Capture (Priority: P1)

A design reviewer captures a screenshot of any reference screen at a specified viewport and device pixel ratio, and the capture is deterministic — repeating the same capture under the same conditions produces a pixel-identical result. Primary viewports are 1280×720 (desktop) and 390×844 (LIFF). Secondary overflow-check viewports are 1440×900 (desktop wide) and 360-wide and 430-wide (LIFF narrow/wide).

**Why this priority**: Repeatable captures are required for honest before/after comparison. Non-deterministic captures make pixel-diff thresholds meaningless.

**Independent Test**: Capture the same screen twice at the same viewport and confirm the images are pixel-identical (zero diff). Then capture at each of the five viewports and confirm all five images are produced with correct dimensions.

**Acceptance Scenarios**:

1. **Given** a reference screen is rendered at 1280×720, **When** captured twice in succession, **Then** the two output images are pixel-identical (zero non-matching pixels).
2. **Given** a reference screen, **When** captured at each of the five viewports (1280×720, 1440×900, 390×844, 360×844, 430×844), **Then** each output image has the exact requested dimensions and contains the complete screen content without unintended clipping or scrollbars.
3. **Given** a capture is requested before fonts have finished loading, **When** the capture executes, **Then** it waits for font readiness before producing the image, ensuring text rendering is stable.

---

### User Story 3 — Honest Image-File Comparison (Priority: P1)

A developer runs the visual comparison test and receives a real pixel-level diff between a reference capture and an implementation screenshot. The comparison rejects images with mismatched dimensions, produces a completed diff image and an overlay image, and uses per-region tolerance values derived from measured repeat-capture noise — not arbitrary thresholds. The comparison proves it can detect intentional layout and color changes.

**Why this priority**: The existing `tests/visual/spec-comparison.spec.ts` has a comparison helper that is never called and targets `/chat` (not the real LINE OA surface). Replacing this with a working comparison path is essential for all downstream design-parity work (#144–#148).

**Independent Test**: Introduce a known intentional change (e.g., shift a button 10px, change a background color) and confirm the comparison detects it, produces a non-empty diff, and reports the changed region. Then confirm that an unchanged pair produces a passing result within the measured noise tolerance.

**Acceptance Scenarios**:

1. **Given** two images of different dimensions, **When** the comparison runs, **Then** it rejects the pair with a clear dimension-mismatch error and does not produce a diff image.
2. **Given** two images of the same dimensions with an intentional layout change, **When** the comparison runs, **Then** the diff image highlights the changed region, the overlay shows both images side-by-side or blended, and the test reports failure with the specific region and pixel count.
3. **Given** two captures of the same screen under identical conditions, **When** the comparison runs, **Then** the diff is within the measured per-region noise tolerance and the test passes.
4. **Given** the comparison test runs, **When** it completes, **Then** completed diff and overlay files exist on disk for every comparison attempted — not just failures.

---

### User Story 4 — Per-Region Noise Measurement and Tolerance (Priority: P2)

A developer measures the repeat-capture noise for each screen region (header, sidebar, content area, footer) by capturing the same reference screen multiple times and computing the pixel variance per region. The resulting per-region tolerance values are recorded and used as comparison thresholds. Tolerances are never relaxed to hide a mismatch.

**Why this priority**: A single global threshold either misses real changes in low-noise regions or produces false positives in high-noise regions (e.g., anti-aliased text edges). Per-region tolerance makes comparisons honest and actionable.

**Independent Test**: Run the noise measurement on a stable reference screen and confirm that each region has a recorded tolerance value. Confirm that the comparison test uses these values rather than a hardcoded global threshold.

**Acceptance Scenarios**:

1. **Given** a reference screen rendered in the harness, **When** captured five times at identical settings, **Then** the per-region pixel variance is computed and recorded for at minimum: header, main content, sidebar, and footer regions.
2. **Given** per-region tolerance values are recorded, **When** a comparison test runs, **Then** each region's diff is evaluated against its own tolerance, not a single global value.
3. **Given** a comparison fails for a region, **When** the developer inspects the result, **Then** the report shows the region name, the measured diff count, the tolerance threshold, and the tolerance was not adjusted to accommodate the failure.

---

### User Story 5 — Provenance and Reproducibility Documentation (Priority: P2)

A developer reading the comparison output can trace every reference image back to its source artifact ID, screen/state identifier, viewport, DPR, fixture data set, font state, and capture timestamp. The documentation includes step-by-step instructions for reproducing any capture from scratch.

**Why this priority**: Without provenance, a reference image is unverifiable. Without reproducibility instructions, no other developer or agent can validate or re-run comparisons.

**Independent Test**: Pick any reference image in the output directory and confirm that its provenance record contains all required fields. Follow the reproduction instructions and confirm the resulting capture matches the original within noise tolerance.

**Acceptance Scenarios**:

1. **Given** a reference capture exists, **When** its provenance record is inspected, **Then** it contains: source artifact ID, screen/state name, viewport dimensions, device pixel ratio, fixture data identifier, font-load state, and capture timestamp.
2. **Given** the reproduction instructions document, **When** a developer follows them from a clean environment, **Then** the resulting capture is pixel-identical to the original within measured noise tolerance.
3. **Given** a source artifact is missing or a device/viewport cannot be captured, **When** the provenance is reviewed, **Then** the missing source or device is explicitly listed as a blocker — not silently omitted.

---

### Edge Cases

- What happens when a source artifact from the #142 inventory references an asset (image, font, icon) that was not extracted or is corrupted? → The harness renders a documented placeholder naming the specific missing asset and records the state as "blocked — missing source" in the manifest.
- What happens when a screen requires real backend data (e.g., verified carbon credits) to render? → The harness uses deterministic synthetic fixtures only; it never fakes OTP codes, verified credits, successful exports, or real farmer data.
- What happens when the browser-use control-browser skill is unavailable? → Independent source-rendering and comparison work proceeds; the specific browser-capture verification is reported as a blocker with the exact missing capability.
- What happens when repeat-capture noise is zero for all regions? → Per-region tolerance is set to zero; any non-matching pixel in comparison is a failure.
- What happens when an implementation screenshot has different dimensions than the reference? → The comparison rejects the pair immediately with a dimension-mismatch error; no diff is produced.
- What happens when a screen has not yet been implemented in the codebase? → The comparison records the state as "blocked — not implemented" and does not produce a misleading pass or fail.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide an isolated reference-only harness that renders client artifact content (LINE OA, Admin, Sponsor) without the Claude wrapper frame, duplicated frames, or broken assets.
- **FR-002**: The harness MUST preserve all styles from the extracted source trees and document every external asset dependency (fonts, images, icons) with explicit missing-asset indicators.
- **FR-003**: The harness MUST render every screen and state listed in the #142 inventory manifest using deterministic synthetic fixture data with fixed dates, fixed timezone (Asia/Bangkok), and stable font rendering.
- **FR-004**: The system MUST capture screenshots at five viewports: 1280×720 (desktop primary), 1440×900 (desktop overflow), 390×844 (LIFF primary), 360×844 (LIFF narrow overflow), and 430×844 (LIFF wide overflow).
- **FR-005**: Captures MUST be deterministic — repeating a capture under identical conditions MUST produce pixel-identical output.
- **FR-006**: The system MUST wait for font readiness before producing any capture.
- **FR-007**: The visual comparison MUST reject image pairs with mismatched dimensions and report a clear dimension-mismatch error.
- **FR-008**: The visual comparison MUST produce a completed diff image file and a completed overlay image file for every comparison attempted, not only for failures.
- **FR-009**: The visual comparison MUST use per-region tolerance values derived from measured repeat-capture noise, not a single hardcoded global threshold.
- **FR-010**: The visual comparison MUST prove intentional-change detection — a known layout or color change MUST be detected and reported with the specific changed region.
- **FR-011**: Per-region tolerance values MUST NOT be relaxed to accommodate or hide a mismatch.
- **FR-012**: Every reference image MUST have a provenance record containing: source artifact ID, screen/state name, viewport dimensions, device pixel ratio, fixture data identifier, font-load state, and capture timestamp.
- **FR-013**: The system MUST provide step-by-step reproduction instructions for every reference capture.
- **FR-014**: Missing source artifacts and unavailable devices/viewports MUST be explicitly listed as blockers — never silently omitted or inferred.
- **FR-015**: The existing `tests/visual/spec-comparison.spec.ts` MUST be replaced with the new image-file comparison path; the current misleading claims (unused comparison helper, `/chat` as LINE OA surface) MUST be removed.
- **FR-016**: The system MUST never fabricate OTP codes, verified carbon credits, successful data exports, or real farmer data to achieve a visual match.
- **FR-017**: Automated batch capture for deterministic reference screenshots MAY use Playwright directly for viewport/DPR control. Manual QA and interactive browser verification MUST use the repository-required browser-use:control-browser skill. Playwright MCP tools (`mcp__plugin_playwright_playwright__*`) MUST NOT be substituted for browser-use in manual QA workflows. If browser-use is unavailable for manual verification, the specific blocker is reported.
- **FR-018**: The system MUST generate a coverage manifest document listing every screen and state from the #142 inventory with its capture status (complete, blocked-missing-source, or blocked-not-implemented) and provenance pointers.
- **FR-019**: Anti-aliased text regions MUST be included in noise measurement rather than excluded; per-region tolerance values MUST account for minor rendering variance in these areas.

### Key Entities

- **Reference Capture**: A deterministic screenshot of a rendered source screen at a specific viewport, with full provenance metadata.
- **Comparison Result**: The output of comparing two images: pass/fail per region, diff image, overlay image, pixel counts, and tolerance values used.
- **Noise Profile**: Per-region pixel variance measurements from repeat captures of a stable reference, used to set comparison tolerances.
- **Provenance Record**: Metadata document linking a reference capture to its source artifact, viewport, fixture data, and capture conditions.
- **Fixture Data Set**: Deterministic synthetic data (farmers, plots, seasons, credits) with fixed dates and timezone, used to render screens reproducibly.
- **Blocker Record**: An explicit declaration that a source artifact is missing or a device/viewport is unavailable, preventing reference capture for a specific screen/state.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of screens and states listed in the #142 inventory manifest have either a valid reference capture with provenance or an explicit blocker record. A coverage manifest document accounts for every entry — each has a status (complete, blocked-missing-source, blocked-not-implemented) and provenance pointer or explicit blocker reason.
- **SC-002**: Repeat-capture determinism is proven — five consecutive captures of the same screen at the same viewport produce pixel-identical output (zero non-matching pixels).
- **SC-003**: The visual comparison correctly detects 100% of intentional changes introduced as test cases (minimum: one layout shift, one color change, one content addition) while passing unchanged pairs within measured noise.
- **SC-004**: Every comparison run produces completed diff and overlay image files on disk for all attempted pairs, verifiable by file existence check.
- **SC-005**: Per-region noise tolerance values are recorded for at least four regions (header, sidebar, content, footer) per primary viewport, derived from actual measurements — not hardcoded.
- **SC-006**: A developer unfamiliar with the project can reproduce any reference capture by following the documented instructions and achieve a pixel-identical result within measured noise tolerance.
- **SC-007**: Zero silent inferences — every missing asset, unavailable source, or blocked device is explicitly documented with its specific impact on manifest coverage.
- **SC-008**: The misleading claims in the existing `tests/visual/spec-comparison.spec.ts` are fully replaced — no remaining references to the unused comparison helper or `/chat` as the LINE OA surface.

## Clarifications

### Session 2026-09-15

- Q: How many records per entity type should the deterministic synthetic fixtures contain? → A: Moderate density (5-10 records per entity type) to match typical production views and catch most layout edge cases.

## Assumptions

- The #142 inventory manifest (blocked dependency) will be completed before this feature begins implementation, providing the authoritative list of screens, states, and source artifact references.
- The extracted source trees in `visual-qa-screenshots/{line-oa,admin,sponsor}-extracted/` contain sufficient style and layout information to render faithful reference screens, modulo any assets explicitly flagged as missing by #142.
- Deterministic synthetic fixture data can be constructed from the project's existing data model (farmer, deed, plot, season, consent, photo) without requiring real backend data or credentials. Each entity type will contain 5-10 records to match production density.
- The browser-use:control-browser skill will be available in the implementation environment; if not, the subset of work that does not require browser capture can still be completed.
- The existing Playwright test infrastructure can be adapted for the new image-file comparison path, or replaced entirely if the current structure is too misleading to salvage.
- Native LINE chrome (message bubbles, rich menu rendering) is out of scope for the reference harness; only controllable Flex message and LIFF content is compared.
- Font rendering differences across operating systems are a known source of capture variance; the harness should use consistent font loading and the noise measurement accounts for minor anti-aliasing differences.
- A coverage manifest document will be generated listing every screen/state with its capture status (complete, blocked-missing-source, blocked-not-implemented) and provenance pointers.
- Anti-aliased text regions will be included in noise measurement rather than excluded; per-region tolerance will account for minor rendering variance in these areas.

## Technical and Compliance Constraints

- Browser work MUST use the repository-required `browser-use:control-browser` skill through its documented MCP. Playwright MCP tools (`mcp__plugin_playwright_playwright__*`) MUST NOT be substituted.
- The reference harness MUST NOT modify existing application routes, APIs, authentication, role boundaries, or carbon calculations.
- Per the constitution (Principle V): carbon estimates MUST remain distinct from verified credits; fixture data MUST NOT present synthetic values as verified.
- Per the constitution (Principle VI): sponsor-facing views MUST use CPA codes and assigned-area scope in fixture data.
- Per the constitution (Principle VIII): Material Symbols MUST load through Google Fonts `<link>`, not `next/font/google`.
- One bounded commit per logical change; no merge or deploy as part of this handoff.
