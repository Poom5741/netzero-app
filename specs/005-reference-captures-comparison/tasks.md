# Tasks: Reference Captures and Honest Visual Comparison

**Input**: Design documents from `specs/005-reference-captures-comparison/`

**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: Not explicitly requested as TDD. The existing `tests/visual/spec-comparison.spec.ts` is replaced as part of US3 implementation (it is the deliverable, not a test-of-tests).

**Organization**: Tasks grouped by user story. US1–US3 are P1 (foundation of visual parity); US4–US5 are P2 (measurement rigor and documentation).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US5)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create directory structure and output locations per implementation plan

- [x] T001 Create directory structure: `tests/visual/reference-harness/{fixtures,screens,assets}`, `tests/visual/captures/{reference,provenance}`, `tests/visual/comparison/{diff,overlay,results}`, `tests/visual/noise/profiles`, `tests/visual/lib/`, `tests/visual/scripts/`
- [x] T002 [P] Add `tests/visual/scripts/` to `.gitignore` output directories: add `tests/visual/captures/`, `tests/visual/comparison/`, `tests/visual/noise/profiles/` to `.gitignore` (keep `.gitkeep` placeholders)
- [x] T003 [P] Create `tests/visual/captures/.gitkeep`, `tests/visual/comparison/.gitkeep`, `tests/visual/noise/profiles/.gitkeep` placeholder files

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared library modules, fixture data, and harness skeleton that all user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Implement region definitions module in `tests/visual/lib/regions.ts` — export `DEFAULT_REGIONS` array with 4 regions (header, sidebar, content, footer) using percentage-based bounds `{x, y, width, height}` (0–1 relative to viewport); export `extractRegion(imageBuffer, bounds, viewportSize)` returning cropped canvas
- [x] T005 [P] Implement provenance record module in `tests/visual/lib/provenance.ts` — export `generateProvenance(options)` returning `CaptureProvenance` object with fields: `artifactId`, `screenName`, `stateName`, `viewport` ({width, height}), `deviceScaleFactor`, `fixtureId`, `fontState` ("ready"|"timeout"), `captureTimestamp` (ISO 8601), `sourceHash` (SHA-256 of rendered HTML via Web Crypto), `captureTool` ("playwright"), `noiseProfileId`; export `writeProvenance(provenance, outputDir)` writing JSON to `{outputDir}/provenance/{screenName}-{stateName}-{width}x{height}.json`
- [x] T006 [P] Create deterministic fixture data in `tests/visual/reference-harness/fixtures/farmers.ts` — export `FARMER_FIXTURES` array of 7 `FarmerFixture` objects with synthetic phone numbers ("08X-XXX-XXXX" pattern), Thai names, fixed dates (createdAt: "2026-01-10", updatedAt: "2026-09-01"), status values; each farmer has 1–3 `DeedFixture` with 1–4 `PlotFixture` each; each plot has 1–2 `SeasonFixture` with startDate "2026-01-15", verificationStatus always "unverified"; add test assertion verifying no real phone numbers (pattern check), no verified credits (all "unverified"), no real farmer PII
- [x] T007 [P] Create admin fixture data in `tests/visual/reference-harness/fixtures/admin.ts` — export `ADMIN_FIXTURES` array of 5 `AdminUserFixture` objects with usernames, roles ("admin"|"reviewer"), Thai displayNames; add test assertion verifying synthetic usernames only
- [x] T008 [P] Create sponsor fixture data in `tests/visual/reference-harness/fixtures/sponsor.ts` — export `SPONSOR_FIXTURES` array of 5 `SponsorAccountFixture` objects each with `cpaCode` ("CPA-001" through "CPA-005"), `assignedArea` (Thai province/region), `displayName`; constitution Principle VI: sponsor views MUST use CPA codes; add test assertion verifying all sponsors have cpaCode and assignedArea
- [x] T009 [P] Create fixture index in `tests/visual/reference-harness/fixtures/index.ts` — re-export all fixture modules; export `FIXTURE_META` object with `fixtureId: "fixed-2026-09-15"`, `todayDate: "2026-09-15"`, `timezone: "Asia/Bangkok"`; export `validateFixtures()` function that runs all fixture assertions and throws if any fail
- [x] T010 Create asset dependency manifest in `tests/visual/reference-harness/assets/manifest.json` — JSON object listing required fonts (Noto Sans Thai via Google Fonts `<link>`, Material Symbols via Google Fonts `<link>` — NOT `next/font/google`), icon sets, and image assets referenced by extracted sources; each entry has `name`, `type` ("font"|"icon"|"image"), `source` (URL or local path), `status` ("available"|"missing"); document any known missing assets from #142 inventory
- [x] T011 Create reference harness HTML skeleton in `tests/visual/reference-harness/harness.ts` — export `createHarnessPage(surface, screenName, stateName)` that returns an HTML string with: Google Fonts `<link>` for Noto Sans Thai + Material Symbols, inline CSS from extracted source styles, fixture data injected as JSON, `prefers-reduced-motion` media query override disabling animations; export `serveHarness(port)` launching a static file server for Playwright to navigate to
- [x] T012 Implement capture module in `tests/visual/lib/capture.ts` per `contracts/capture-api.md` — `captureReference(options)` launching headless Chromium with viewport/DPR, navigating to harness page, waiting for `networkidle` + `document.fonts.ready` (configurable timeout, default 5000ms), emulating `prefers-reduced-motion: reduce`, computing SHA-256 of rendered HTML, taking screenshot, writing provenance JSON; define `CaptureTimeoutError` class extending `Error` with `fontState: "timeout"` and `timeout: number` properties, thrown when font wait exceeds timeout; `captureAllViewports(options)` calling captureReference for all 5 viewports (1280×720@dpr1, 1440×900@dpr1, 390×844@dpr3, 360×844@dpr3, 430×844@dpr3)
- [x] T013 Implement comparison module in `tests/visual/lib/compare.ts` per `contracts/comparison-api.md` — `compareImages(options: CompareOptions): Promise<ComparisonResult>` loading both images via canvas, checking dimensions (reject mismatch with error, no diff produced), running pixelmatch for full diff image, saving diff to `{outputDir}/diff/{comparisonId}.png`, generating overlay (side-by-side) to `{outputDir}/overlay/{comparisonId}.png`, evaluating per-region tolerance, writing result JSON to `{outputDir}/results/{comparisonId}.json`; `rejectDimensionMismatch(refDims: {width, height}, implDims: {width, height}): DimensionMismatchError` returning descriptive error; `generateOverlay(refImage: Image, implImage: Image, mode: "side-by-side" | "blended" | "checkerboard"): Buffer` producing combined PNG buffer; `loadTolerances(profilePath: string): RegionTolerance[]` reading noise profile JSON; `detectIntentionalChange(options: ChangeDetectionTest): Promise<boolean>` returning boolean proving change detection works
- [x] T013a [P] Validate #142 inventory completeness — verify `visual-qa-screenshots/{admin,line-oa,sponsor}-extracted/` directories exist and contain source artifacts; verify #142 inventory manifest (or equivalent screen/state list) is accessible; if inventory missing or incomplete, block US1 tasks and report specific missing items; this gate ensures US1 has authoritative screen list before implementation

**Checkpoint**: Foundation ready — shared libs, fixtures, harness, capture, and comparison modules complete. User story implementation can now begin.

---

## Phase 3: User Story 1 — Render Clean Reference Screens (Priority: P1) 🎯 MVP

**Goal**: Every screen/state from the #142 inventory renders in an isolated harness without Claude wrapper, broken assets, or duplicated frames

**Independent Test**: Open each manifest-listed screen in the harness at 1280×720 and confirm complete rendering with no wrapper chrome, no clipped regions, no missing-asset placeholders

### Implementation for User Story 1

- [x] T014 [US1] Create LINE OA screen definitions in `tests/visual/reference-harness/screens/line-oa.ts` — export screen configs for each LINE OA state from #142 inventory (onboarding, welcome bubble, activation, season setup, calendar, results, photo-link, 6 menu actions, 7 LIFF destinations); each config specifies `screenName`, `stateName`, `artifactId` (from #142 manifest), `fixtureId`, required fixture data subset, and CSS selectors for missing-asset detection
- [x] T015 [P] [US1] Create Admin screen definitions in `tests/visual/reference-harness/screens/admin.ts` — export screen configs for all Admin states: login, overview/dashboard, work queue, farmer detail, review detail, filter states, modal states, empty/loading/error states; each config references `artifactId` from #142 and required `ADMIN_FIXTURES` subset
- [x] T016 [P] [US1] Create Sponsor screen definitions in `tests/visual/reference-harness/screens/sponsor.ts` — export screen configs for all Sponsor states: login, dashboard, scoped area view, PDPA notice, filter states, detail views; each config references `artifactId` from #142 and uses CPA-scoped `SPONSOR_FIXTURES` (constitution Principle VI)
- [x] T017 [US1] Create screen index in `tests/visual/reference-harness/screens/index.ts` — re-export all screen configs; export `ALL_SCREENS` array combining LINE OA + Admin + Sponsor configs; export `getScreenConfig(surface, screenName, stateName)` lookup function
- [x] T018 [US1] Implement missing-asset detection in `tests/visual/reference-harness/harness.ts` — after page render, scan for broken image icons (img elements with 0 naturalWidth), missing font glyphs (canvas text measurement fallback), and empty containers where source expects content; return array of `{assetName, assetType, screenName}` for each missing asset; render visible placeholder with asset name in the harness HTML when asset is missing (never silently infer)
- [x] T019 [US1] Create reference render script in `tests/visual/scripts/capture-single.ts` — CLI accepting `--screen`, `--state`, `--viewport`, `--dpr`, `--output` args; calls `createHarnessPage` → `captureReference`; validates output PNG dimensions match requested viewport; prints provenance path on success
- [x] T020 [US1] Run initial reference captures for all screens in `ALL_SCREENS` at 1280×720 primary viewport — verify each renders without wrapper frames; document any missing-asset placeholders in `tests/visual/reference-harness/assets/manifest.json` by updating status to "missing" with specific asset name

**Checkpoint**: All screens from #142 inventory render in the harness. Missing assets are explicitly documented, never silently inferred.

---

## Phase 4: User Story 2 — Reproducible Multi-Viewport Capture (Priority: P1)

**Goal**: Screens can be captured at 5 viewports with pixel-identical repeatability

**Independent Test**: Capture same screen twice at same viewport → pixel-identical output. Capture at all 5 viewports → correct dimensions, complete content.

### Implementation for User Story 2

- [x] T021 [US2] Create multi-viewport capture script in `tests/visual/scripts/capture-all-viewports.ts` — CLI accepting `--screen`, `--state`; calls `captureAllViewports` for all 5 default viewports; validates each output PNG has exact requested dimensions; writes all provenance JSONs
- [x] T022 [US2] Create determinism verification script in `tests/visual/scripts/verify-determinism.ts` — captures a given screen 5 times at identical settings; runs pixelmatch between each consecutive pair; asserts 0 non-matching pixels for each pair; reports pass/fail per pair
- [x] T023 [US2] Run determinism verification for at least 3 screens (one per surface: LINE OA, Admin, Sponsor) at 1280×720 — if any non-zero diff detected, investigate source of non-determinism (animations, timestamps, random values) and fix in harness or fixture data
- [x] T024 [US2] Run multi-viewport capture for all screens in `ALL_SCREENS` at all 5 viewports — verify each PNG has exact dimensions (1280×720, 1440×900, 390×844, 360×844, 430×844); verify no unintended clipping or scrollbars; verify Thai text renders correctly at all sizes
- [x] T025 [US2] Document any viewport-specific rendering issues in `tests/visual/reference-harness/assets/manifest.json` — e.g., horizontal overflow at 360px width, text truncation at 390px; these are expected findings, not bugs to fix

**Checkpoint**: All screens captured at all 5 viewports with provenance. Determinism proven for ≥3 screens.

---

## Phase 5: User Story 3 — Honest Image-File Comparison (Priority: P1)

**Goal**: Working comparison pipeline replacing misleading `spec-comparison.spec.ts`; rejects dimension mismatch, produces diff/overlay for every pair, proves intentional-change detection

**Independent Test**: Introduce known layout/color change → comparison detects it. Unchanged pair → passes within noise tolerance. Dimension mismatch → rejected.

### Implementation for User Story 3

- [x] T026 [US3] Replace `tests/visual/spec-comparison.spec.ts` — remove all existing misleading content (unused comparison helper, `/chat` as LINE OA surface, text-only assertions); rewrite as: (1) import `compareImages` from `lib/compare.ts`, (2) test "rejects dimension mismatch" — create two images of different sizes, assert `dimensionsMatch=false` and `dimensionMismatchError` is set, (3) test "detects intentional layout change" — capture a screen, inject CSS shift, compare, assert `overallPass=false`, (4) test "produces diff and overlay files" — run comparison, assert diff/overlay PNGs exist on disk, (5) test "passes unchanged pair" — capture same screen twice, compare with tolerance=0, assert `overallPass=true`
- [x] T027 [US3] Update `tests/visual/playwright.config.ts` — update `testMatch` to match new spec file name if changed; ensure `webServer` config still launches frontend for implementation screenshots; add `outputDir` config pointing to `tests/visual/comparison/`
- [x] T028 [US3] Create comparison pair script in `tests/visual/scripts/compare-pair.ts` — CLI accepting `--ref`, `--impl`, `--tolerances` (path to noise profile JSON), `--output` (comparison ID); calls `compareImages`; prints result summary (pass/fail, per-region breakdown, diff pixel counts); exits non-zero on failure
- [x] T029 [US3] Run intentional-change detection proof — use `detectIntentionalChange` from `lib/compare.ts` with: (a) 10px horizontal shift via CSS transform, (b) background color change, (c) content addition (extra list item); verify all three are detected (`overallPass=false`); verify diff images highlight the correct regions
- [x] T030 [US3] Run comparison self-test — capture admin-login at 1280×720 twice, compare with tolerance=0, verify 0 diff pixels and `overallPass=true`; this proves the pipeline works on unchanged pairs

**Checkpoint**: Old misleading test fully replaced. Comparison detects intentional changes, rejects dimension mismatch, produces diff/overlay for every pair.

---

## Phase 6: User Story 4 — Per-Region Noise Measurement and Tolerance (Priority: P2)

**Goal**: Per-region tolerance values derived from measured repeat-capture noise, not hardcoded

**Independent Test**: Run noise measurement → each region has tolerance value. Comparison uses these values. Tolerance never relaxed to hide mismatch.

### Implementation for User Story 4

- [x] T031 [US4] Implement noise measurement module in `tests/visual/lib/noise.ts` per `contracts/capture-api.md` — `measureNoise(options)` captures screen `captureCount` times (default 5), runs pixelmatch between consecutive pairs, extracts per-region sub-images using `extractRegion` from `lib/regions.ts`, counts non-matching pixels per region per pair, computes max and avg, sets tolerance = max + 1; returns `NoiseProfile`; writes JSON to `{outputDir}/noise/profiles/{screenName}-{width}x{height}.json`
- [x] T032 [US4] Create noise measurement script in `tests/visual/scripts/measure-noise.ts` — CLI accepting `--screen`, `--viewport`, `--dpr`, `--captures` (default 5); calls `measureNoise` with `DEFAULT_REGIONS`; prints per-region summary table (region name, max diff, avg diff, tolerance)
- [x] T033 [US4] Run noise measurement for primary screens (admin-login, admin-overview, sponsor-dashboard, line-oa-welcome) at 1280×720 and 390×844 — verify each produces a noise profile with 4 regions; verify tolerance values are small (<50 pixels per region for stable screens); save profiles to `tests/visual/noise/profiles/`
- [x] T034 [US4] Create tolerance validation script in `tests/visual/scripts/validate-tolerances.ts` — loads all noise profiles from `tests/visual/noise/profiles/`, verifies for each profile: (a) 4+ regions present, (b) tolerance >= maxDiffPixels for each region, (c) captureCount = 5; prints summary; exits non-zero if any profile violates invariants
- [x] T035 [US4] Integrate noise profiles into comparison workflow — update `tests/visual/scripts/compare-pair.ts` to accept `--tolerances` pointing to a noise profile JSON; load via `loadTolerances`; pass to `compareImages`; verify per-region evaluation uses profile values not hardcoded thresholds

**Checkpoint**: Noise profiles exist for primary screens. Comparison uses per-region tolerance from measurements. Tolerance invariants validated.

---

## Phase 7: User Story 5 — Provenance and Reproducibility Documentation (Priority: P2)

**Goal**: Every reference image traceable to source; reproduction instructions work from clean environment; blockers explicitly documented

**Independent Test**: Pick any reference image → provenance record has all fields. Follow reproduction instructions → pixel-identical result. Missing sources listed as blockers.

### Implementation for User Story 5

- [x] T036 [US5] Create coverage manifest generator in `tests/visual/scripts/generate-coverage.ts` — reads `ALL_SCREENS` from screen index, scans `tests/visual/captures/provenance/` for existing provenance files, builds `CoverageEntry` for each screen/state with: `captureStatus` ("complete" if provenance exists, "blocked-missing-source" if asset manifest shows missing, "blocked-not-implemented" if screen not yet in reference harness), `viewportCoverage` (count of viewport-specific provenance files found, 0–5), `blockerReason` (from asset manifest or null), `provenancePath` (link to provenance JSON); writes `tests/visual/coverage-manifest.md` as markdown table grouped by surface
- [x] T037 [US5] Run coverage manifest generation — verify every screen/state from #142 inventory appears; verify blocked entries have explicit reasons; verify complete entries have provenance links
- [x] T038 [US5] Create reproduction guide in `tests/visual/reproduction-guide.md` — document: (a) prerequisites (Node.js 20+, npm install, extracted sources present), (b) how to start harness server, (c) how to capture a single screen at a specific viewport, (d) how to verify capture matches original within noise tolerance, (e) how to interpret provenance JSON fields, (f) troubleshooting (font timeout, non-deterministic captures, comparison failures)
- [x] T039 [US5] Validate reproduction guide — follow the documented steps from a clean shell (no cached state) to capture admin-login at 1280×720; verify the resulting PNG matches the original within measured noise tolerance; document any steps that were unclear or missing and update the guide
- [x] T040 [US5] Create blocker report in `tests/visual/blockers.md` — list all screens/states that could not be captured: for each, state the blocker type (missing source artifact, unavailable device/viewport, unimplemented screen), the specific missing item, and the impact on manifest coverage; this satisfies FR-014 (never silently omit)

**Checkpoint**: Coverage manifest accounts for 100% of screens. Reproduction guide validated. Blockers explicitly documented.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final integration, validation, and cleanup

- [x] T041 Create quickstart validation runner in `tests/visual/scripts/run-quickstart.ts` — executes all 7 validation scenarios from `quickstart.md` in sequence; prints pass/fail per scenario; exits non-zero if any fail
- [x] T042 Run full quickstart validation (V1–V7) — all 7 scenarios must pass
- [x] T043 Run `npm run test:visual` — verify the replaced `spec-comparison.spec.ts` passes (dimension mismatch rejection, intentional change detection, diff/overlay file production, unchanged pair pass)
- [x] T044 [P] Run lint and typecheck — `npx biome check tests/visual/` and `npx tsc --noEmit` for visual test directory; fix any errors
- [x] T045 [P] Clean up temporary files — remove any intermediate captures, test outputs, or debug files not part of the deliverable; ensure `.gitignore` covers output directories
- [x] T046 Verify constitution compliance — re-read `.specify/memory/constitution.md` and confirm: no real farmer data in fixtures (Principle VI), synthetic credits marked unverified (Principle V), Material Symbols via `<link>` not `next/font/google` (Principle VIII), Playwright used for automated batch capture (FR-017), browser-use reserved for manual QA (FR-017)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup (T001–T003) — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Foundational — renders screens using harness + fixtures
- **US2 (Phase 4)**: Depends on US1 (needs screen definitions to capture) — multi-viewport capture
- **US3 (Phase 5)**: Depends on Foundational (needs capture + compare libs) — can partially parallel with US2
- **US4 (Phase 6)**: Depends on US2 (needs multi-viewport captures to measure noise) — noise measurement
- **US5 (Phase 7)**: Depends on US1–US4 (needs all captures and profiles for coverage manifest) — documentation
- **Polish (Phase 8)**: Depends on all user stories complete

### User Story Dependencies

- **US1 (P1)**: After Foundational → no story dependencies
- **US2 (P1)**: After Foundational + US1 screen definitions → captures rendered screens
- **US3 (P1)**: After Foundational → comparison pipeline (independent of specific screens)
- **US4 (P2)**: After US2 → needs captured images to measure noise
- **US5 (P2)**: After US1–US4 → aggregates all outputs into documentation

### Within Each User Story

- Screen definitions before capture scripts
- Capture scripts before batch captures
- Noise measurement before tolerance validation
- Provenance before coverage manifest

### Parallel Opportunities

- T002, T003 (Setup) can run in parallel
- T005, T006, T007, T008, T009, T010 (Foundational) can run in parallel
- T015, T016 (Admin + Sponsor screen defs) can run in parallel
- US3 comparison work can partially parallel with US2 capture work (comparison lib is independent)

---

## Parallel Example: Foundational Phase

```bash
# Launch all independent foundational tasks together:
Task: T005 "provenance module in tests/visual/lib/provenance.ts"
Task: T006 "farmer fixtures in tests/visual/reference-harness/fixtures/farmers.ts"
Task: T007 "admin fixtures in tests/visual/reference-harness/fixtures/admin.ts"
Task: T008 "sponsor fixtures in tests/visual/reference-harness/fixtures/sponsor.ts"
Task: T009 "fixture index in tests/visual/reference-harness/fixtures/index.ts"
Task: T010 "asset manifest in tests/visual/reference-harness/assets/manifest.json"
```

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: US1 — clean reference renders
4. **STOP and VALIDATE**: All screens render without wrapper frames
5. This alone delivers value — reviewers can inspect source-faithful renders

### Incremental Delivery

1. Setup + Foundational → shared infrastructure ready
2. US1 → reference renders working → immediate visual review capability
3. US2 → multi-viewport captures → comprehensive viewport coverage
4. US3 → comparison pipeline → automated change detection
5. US4 → noise measurement → honest tolerances
6. US5 → documentation → full traceability and reproducibility
7. Each phase adds rigor without breaking previous phases

### Parallel Team Strategy

With multiple developers:
1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: US1 (screen definitions + harness rendering)
   - Developer B: US3 (comparison pipeline — independent of specific screens)
3. After US1: Developer A moves to US2 (multi-viewport capture)
4. After US2: US4 (noise measurement)
5. After US1–US4: US5 (documentation)

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks in same phase
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable at its checkpoint
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- The existing `tests/visual/spec-comparison.spec.ts` is replaced in US3 (T026), not before — US1/US2 can proceed with the old file present
- No new npm dependencies required — pixelmatch, canvas, and playwright are already installed

---

## Phase 9: Convergence

- [x] T047 CRITICAL Reconcile the visual comparison contract and implementation in `tests/visual/lib/compare.ts` and `tests/visual/spec-comparison.spec.ts` so dimension mismatches return a structured `dimensionsMatch: false` result, matching-dimension comparisons always emit diff and overlay files, and per-region results use one consistent field name (`regionName`) per FR-007, FR-008, FR-009 and US3/AC1–AC4 (partial/contradicts)
- [x] T048 HIGH Implement the planned reference-capture API in `tests/visual/lib/capture.ts` and `tests/visual/lib/provenance.ts`, including viewport/DPR options, font readiness state, artifact/state/fixture metadata, source hash, and provenance JSON; remove incompatible callers or update them to the same contract per FR-005, FR-006 and FR-012 (partial)
 - [x] T049 HIGH Implement `tests/visual/lib/noise.ts` and make `tests/visual/scripts/measure-noise.ts` use it to capture five repeats, evaluate header/sidebar/content/footer regions, and write `maxDiffPixels`, `avgDiffPixels`, and `tolerance` profiles per FR-009, FR-019 and SC-005 (missing)
 - [x] T050 HIGH Replace placeholder screen definitions in `tests/visual/reference-harness/screens/{line-oa,admin,sponsor}.ts` with the authoritative #142 inventory entries, including state names, artifact IDs, and fixture mappings; add an explicit inventory-count validation before capture per FR-001, FR-003, FR-018 and US1/AC1–AC3 (partial)
 - [x] T051 HIGH Fix `tests/visual/scripts/generate-coverage.ts` so provenance filenames are parsed from JSON metadata rather than guessed filename tokens, coverage keys include state, and every #142 entry receives complete/blocked-missing-source/blocked-not-implemented status with blocker reason or provenance link per FR-014, FR-018 and SC-001 (partial)
 - [x] T052 HIGH Add the missing `tests/visual/scripts/capture-all-viewports.ts`, `tests/visual/scripts/compare-pair.ts`, and `tests/visual/scripts/validate-tolerances.ts` contract behavior or align their CLI/API calls with the finalized capture and comparison modules; verify all five required dimensions including DPR and exact output paths per FR-004 and US2/AC1–AC3 (partial)
 - [x] T053 MEDIUM Correct output path handling in `tests/visual/scripts/capture-all-screens.ts` and all visual scripts so paths are rooted at repository root exactly once; remove generated nested `tests/visual/tests/visual/` artifacts and ensure only intended output directories are ignored per plan: project structure and SC-004 (contradicts)
 - [x] T054 MEDIUM Add a deterministic fixture validation check covering synthetic phone patterns, absence of real PII, CPA-code/assigned-area scope, and `verificationStatus: "unverified"`; run it from the fixture entry point per FR-016 and Constitution V–VI (partial)
 - [x] T055 MEDIUM Stabilize sponsor-dashboard capture or record measured repeat-capture variance in a generated noise profile; ensure the determinism check distinguishes accepted measured anti-aliasing noise from unexplained dynamic content and reports the affected region per FR-005, FR-009 and US4/AC1–AC3 (partial)
 - [x] T056 MEDIUM Make `tests/visual/reproduction-guide.md` executable against the actual scripts and output paths, then run it from a clean shell and record the result in `tests/visual/blockers.md`; do not claim success while the guide references unavailable commands or mismatched filenames per FR-013 and SC-006 (partial)
 - [x] T057 LOW Add a cleanup task/script for temporary comparison fixtures and Playwright artifacts, keeping only reproducible source/docs and intentional `.gitkeep` files; update `.gitignore` without ignoring provenance or blocker documentation per FR-008 and plan: storage decision (unrequested)

---

## Phase 10: Convergence

**Purpose**: Address remaining gaps between specification intent and implementation reality.

- [x] T058 CRITICAL Fix viewport dimensions in `tests/visual/scripts/capture-all-viewports.ts` to match FR-004 specification — change `360x640` to `360x844` and `430x932` to `430x844` per FR-004 (contradicts)
- [x] T059 HIGH Complete reference captures for all 14 screens in #142 inventory — currently only 1/14 complete per `tests/visual/coverage-manifest.md`; render remaining screens from `tests/visual/reference-harness/screens/` definitions per SC-001 (partial)
- [x] T060 HIGH Generate provenance records for all captured screens — currently only 6 provenance JSONs exist in `tests/visual/captures/provenance/`, spec requires provenance for every reference capture per FR-012 (partial)
- [x] T061 MEDIUM Update `tests/visual/reproduction-guide.md` to document correct viewport dimensions (360x844, 430x844) instead of incorrect values (360x640, 430x932) per FR-013 and SC-006 (partial)
- [x] T062 MEDIUM Re-capture all screens at corrected viewports after T058 fix — multi-viewport captures currently produce incorrect dimensions, violating US2/AC2 "exact requested dimensions" acceptance criterion per US2/AC2 (partial)
- [x] T063 LOW Add explicit blocker reasons to `tests/visual/coverage-manifest.md` for 8 screens marked "Missing" — spec requires explicit blocker documentation, not silent omission per FR-018 and FR-014 (partial)
