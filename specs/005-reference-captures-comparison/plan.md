# Implementation Plan: Establish Clean Reference Captures and Honest Visual Comparison

**Branch**: `005-reference-captures-comparison` | **Date**: 2026-09-15 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/005-reference-captures-comparison/spec.md`

## Summary

Build an isolated reference harness that renders client artifact content (LINE OA, Admin, Sponsor) without Claude wrapper frames, a deterministic multi-viewport capture system, and an honest image-file comparison pipeline that replaces the misleading existing `tests/visual/spec-comparison.spec.ts`. The harness uses deterministic synthetic fixtures (5-10 records per entity), fixed dates/timezone, and documented asset dependencies. Comparison uses per-region noise tolerance derived from repeat-capture measurements, produces diff/overlay files for every pair, and rejects dimension mismatches. All output includes full provenance metadata.

## Technical Context

**Language/Version**: TypeScript 5.x (frontend), Node.js 20+

**Primary Dependencies**: Playwright (browser capture, already installed), pixelmatch v7.2.0 (pixel diff, already installed), canvas v3.2.3 (image manipulation, already installed), browser-use:control-browser MCP (repository-mandated capture tool)

**Storage**: File system — reference images, diff/overlay outputs, provenance JSON records, coverage manifest markdown

**Testing**: Playwright test runner (existing `tests/visual/`), focused behavioral tests for comparison logic

**Target Platform**: macOS dev environment (capture host); reference renders in headless Chromium

**Project Type**: Web application (visual QA infrastructure — no user-facing feature changes)

**Performance Goals**: Deterministic capture cycle <30s per screen; comparison <5s per image pair

**Constraints**: No modification to existing app routes, APIs, auth, or carbon calculations; browser-use skill mandatory (no Playwright MCP substitution); Material Symbols via `<link>` not `next/font/google`

**Scale/Scope**: ~50-80 screen/state combinations from #142 inventory; 5 viewports each; 4+ noise regions per viewport

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Phone-Is-Identity | ✅ Pass | No identity changes; fixture data uses synthetic phone numbers |
| II. Production-First Testing | ✅ Pass | Reference captures validate against deployed visual spec; comparison runs against running app |
| III. YAGNI Extremist | ✅ Pass | Uses existing pixelmatch/canvas/Playwright deps; no new abstractions without two implementations |
| IV. LINE-Native UX | ✅ Pass | Native LINE chrome explicitly separated; only Flex/LIFF content compared |
| V. Evidence-Driven Carbon Accounting | ✅ Pass | Fixture data clearly synthetic; never presents as verified credits |
| VI. Privacy and Least Privilege | ✅ Pass | No real farmer data; synthetic fixtures only |
| VII. Auditability and Safe Decisions | ✅ Pass | Provenance records provide full audit trail for every capture |
| VIII. Design Consistency | ✅ Pass | Material Symbols via `<link>`; preserves existing design tokens |

No violations. Proceeding to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/005-reference-captures-comparison/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── capture-api.md   # Capture system interface contract
│   └── comparison-api.md # Comparison pipeline interface contract
└── tasks.md             # Phase 2 output (NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
tests/visual/
├── playwright.config.ts          # Updated config (replace misleading test)
├── reference-harness/            # Isolated artifact renderer
│   ├── harness.ts                # Harness entry point and viewport control
│   ├── fixtures/                 # Deterministic synthetic data
│   │   ├── farmers.ts            # 5-10 farmer records
│   │   ├── plots.ts              # Plot/season data
│   │   └── admin.ts              # Admin/sponsor fixture data
│   ├── screens/                  # Per-surface render definitions
│   │   ├── line-oa.ts            # LINE OA Flex/LIFF screens
│   │   ├── admin.ts              # Admin console screens
│   │   └── sponsor.ts            # Sponsor dashboard screens
│   └── assets/                   # Documented asset dependencies
│       └── manifest.json         # Asset inventory with missing-asset markers
├── captures/                     # Output: reference screenshots
│   ├── reference/                # Clean reference captures
│   │   └── {screen}-{viewport}.png
│   └── provenance/               # Per-capture metadata
│       └── {screen}-{viewport}.json
├── comparison/                   # Output: comparison results
│   ├── diff/                     # Pixel diff images
│   ├── overlay/                  # Side-by-side overlay images
│   └── results/                  # JSON comparison reports
├── noise/                        # Noise measurement output
│   ├── profiles/                 # Per-region variance data
│   └── tolerances.json           # Derived per-region tolerance values
├── lib/                          # Shared comparison infrastructure
│   ├── capture.ts                # Deterministic capture with font-wait
│   ├── compare.ts                # Image comparison with dimension check
│   ├── noise.ts                  # Repeat-capture noise measurement
│   ├── regions.ts                # Region definition and extraction
│   └── provenance.ts             # Provenance record generation
├── coverage-manifest.md          # Screen/state coverage status
└── reproduction-guide.md         # Step-by-step capture reproduction

visual-qa-screenshots/            # Existing extracted sources (read-only)
├── admin-extracted/
├── line-oa-extracted/
└── sponsor-extracted/
```

**Structure Decision**: Extend existing `tests/visual/` directory. Reference harness is test infrastructure, not application code. No changes to `frontend/src/` app routes. Comparison library is pure functions operating on image files.

## Complexity Tracking

> No constitution violations to justify.
