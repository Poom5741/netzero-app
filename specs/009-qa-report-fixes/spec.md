# Spec 009: QA Report Fixes

> Date: 2026-09-17 | Status: Draft | Priority: HIGH

## Context

QA audit completed on 2026-09-17. Found 2 critical bugs (both fixed), but E2E tests blocked by dev environment rendering issue. This spec addresses remaining QA findings to achieve production readiness.

## Problem Statement

1. **Admin page returns 404 in dev mode** — Layout renders but main content missing, blocking all E2E tests
2. **47 lint errors remaining** — All style (noNonNullAssertion), but prevents clean CI
3. **E2E tests failing** — 17 tests fail due to admin page 404
4. **Missing integration tests** — R2, Workers AI, LINE webhook use mocks, not real Cloudflare bindings

## Requirements

### R1: Fix Admin Page Rendering (CRITICAL)

**User Story:** As a developer, I want the admin page to render correctly in dev mode so I can run E2E tests and verify user journeys.

**Acceptance Criteria:**
- AC1: `curl http://localhost:3000/admin` returns HTML with `<main>` containing:
  - Four primary metrics (AD-OV-02): total farmers, active plots, pending reviews, verified photos
  - Work queue section (AD-OV-03): list of photos pending review
  - Credit visualizations (AD-OV-04): carbon offset charts
- AC2: Admin page shows "Review Queue" heading (AD-REV-01)
- AC3: Admin page shows filter tabs with "ทั้งหมด" (All), "รอดำเนินการ" (Pending), "ยืนยันแล้ว" (Verified), "ปฏิเสธแล้ว" (Rejected)
- AC4: E2E test `admin.spec.ts` passes all 9 tests (chromium + mobile-chrome)
- AC5: Page renders in <2 seconds on localhost

**Technical Notes:**
- Issue: Next.js dev mode returns 404 in RSC payload for admin page
- Layout renders correctly (sidebar + header present)
- Page file exists at `frontend/src/app/admin/page.tsx`
- May be related to RSC (React Server Components) hydration or routing
- Check Next.js logs for hydration errors
- Verify admin/page.tsx exports default component

### R2: Fix Lint Errors (HIGH)

**User Story:** As a developer, I want zero lint errors so CI passes cleanly.

**Acceptance Criteria:**
- AC1: `bun run check:lint` exits with code 0
- AC2: Zero errors (warnings acceptable)
- AC3: All `noNonNullAssertion` errors resolved (add null checks or type guards)
- AC4: Null checks preserve existing behavior; unit tests still pass (846/846)

**Technical Notes:**
- 45× `noNonNullAssertion` in `src/auth/otp.ts` and `tests/visual/spec-comparison.spec.ts`
- 1× `noImplicitAnyLet`
- 1× `noUnusedVariables`
- Strategy: Add proper null checks instead of `!` assertions
- **Important:** Do not change logic — only add null safety. Run tests after each fix.

### R3: Enable E2E Tests (HIGH)

**User Story:** As a QA engineer, I want E2E tests to pass so I can verify user journeys in the browser.

**Acceptance Criteria:**
- AC1: All 17 E2E tests pass (admin, chat, full-qa, verify-journey, sponsor, mobile-accessibility)
- AC2: Tests run in <60 seconds
- AC3: No flaky tests (3 consecutive runs pass)
- AC4: If E2E tests fail for reasons other than admin 404, document and address in separate requirement

**Technical Notes:**
- Blocked by R1 (admin page 404)
- Tests use Playwright with Chromium + mobile-chrome projects
- Dev servers must be running (backend :8787, frontend :3000)
- If tests fail after R1 fix, investigate each failure individually

### R4: Add R2 Integration Test (MEDIUM)

**User Story:** As a developer, I want to verify R2 photo upload/download works with real Cloudflare bindings so I can catch integration bugs early.

**Acceptance Criteria:**
- AC1: Test uploads a photo to R2 and retrieves it
- AC2: Test verifies photo metadata (GPS, timestamp) preserved
- AC3: Test runs in local dev environment with `wrangler dev`
- AC4: Tests are isolated and can run in any order without shared state
- AC5: Test data uses fixtures from `tests/fixtures/` or synthetic data; cleanup after test

**Technical Notes:**
- Current tests use mock R2 (in-memory Map)
- Real R2 binding in `wrangler.toml`: `bucket_name = "netzero-photos"`
- Use miniflare or local R2 for integration test (no real Cloudflare account required)
- Test photo: 1MB JPEG with valid EXIF (GPS: 18.7883, 98.9853; timestamp: 2026-01-15T10:00:00Z)
- Cleanup: Delete test photo from R2 after test completes

### R5: Add Workers AI Integration Test (MEDIUM)

**User Story:** As a developer, I want to verify Workers AI vision model works with real API so I can catch integration bugs early.

**Acceptance Criteria:**
- AC1: Test sends a photo to Workers AI and receives classification
- AC2: Test verifies response shape (valid, water_state, confidence, reason)
- AC3: Test handles timeout gracefully (>10s) — returns error, does not crash
- AC4: Tests are isolated and can run in any order without shared state
- AC5: Test uses fixture photo from `tests/fixtures/` (1MB JPEG, valid EXIF)

**Technical Notes:**
- Current tests use deterministic fixtures
- Real Workers AI binding in `wrangler.toml`: `[ai] binding = "AI"`
- Vision model: CLIP classifier (see `src/vision/bakeoff/`)
- Timeout behavior: Return `{ error: "AI_TIMEOUT" }` after 10s, log warning
- Test photo: Same as R4 (1MB JPEG, GPS: 18.7883, 98.9853)

### R6: Add LINE Webhook Integration Test (MEDIUM)

**User Story:** As a developer, I want to verify LINE webhook signature verification works with real LINE API so I can catch integration bugs early.

**Acceptance Criteria:**
- AC1: Test sends a webhook with valid signature and verifies processing
- AC2: Test sends a webhook with invalid signature and verifies rejection (401)
- AC3: Test uses real LINE channel secret (from `.dev.vars`)
- AC4: Tests are isolated and can run in any order without shared state
- AC5: Test simulates LINE message event (text message from farmer)
- AC6: If `.dev.vars` missing LINE_CHANNEL_SECRET, test skips with warning

**Technical Notes:**
- Current tests use mock signatures
- LINE channel secret in `.dev.vars`: `LINE_CHANNEL_SECRET`
- Signature: Base64 HMAC-SHA256 (see `src/line/webhook.ts`)
- Test payload: LINE message event `{ type: "message", message: { type: "text", text: "สวัสดี" } }`
- Fallback: If no LINE_CHANNEL_SECRET, skip test (don't fail)

## Out of Scope

- Security testing (webhook replay, SQL injection, XSS, auth bypass) — separate spec
- Performance testing (load, stress, soak) — separate spec
- Accessibility audit (WCAG 2.1 AA) — separate spec
- Real-device LIFF testing (iOS + Android) — manual QA, not automated
- Cross-browser testing (mobile Safari, Firefox) — separate spec

## Assumptions

- Admin page 404 is a Next.js dev mode issue, not a production issue (prod uses static export)
- Lint errors are all style preferences, not logic bugs
- R2, Workers AI, LINE API are available in local dev via `wrangler dev`
- E2E tests will pass once admin page renders correctly
- **Unit tests already pass (846/846)** — preverify-review.test.ts mock DB chain issue already fixed
- Integration tests will use local dev environment (no real Cloudflare account required)
- CI pipeline exists or will be created as part of this spec

## Dependencies

- Next.js 16.3 (admin page rendering)
- Cloudflare Workers (R2, Workers AI bindings)
- LINE Messaging API (webhook signature)
- Playwright (E2E tests)

## Success Criteria

- All 6 requirements implemented and tested
- Unit tests: 846+ pass (100%)
- E2E tests: 17 pass (100%)
- Lint: 0 errors
- Typecheck: 0 errors
- Build: succeeds
- Deploy: succeeds (if configured)

## CI/CD Integration

**Requirement:** All tests must run in CI pipeline on every PR.

**Acceptance Criteria:**
- AC1: CI runs `bun run check:test` on every PR
- AC2: CI runs `bun run check:lint` on every PR
- AC3: CI runs `bun run check:type` on every PR
- AC4: CI runs E2E tests on every PR (after R1-R3 complete)
- AC5: CI runs integration tests on every PR (after R4-R6 complete)
- AC6: Deploy blocked if any test fails

**Technical Notes:**
- Current CI config: `.github/workflows/ci.yml` (if exists)
- If no CI config, create one
- Test execution order: lint → typecheck → unit → integration → e2e
- Timeout: 10 minutes per job
- Artifacts: Upload test results and coverage reports

## Risks

- **Admin page 404 may be complex** — Could be Next.js bug, RSC hydration issue, or routing problem
- **Integration tests may require real Cloudflare account** — Mitigated: Use miniflare or local R2 mock
- **LINE webhook test may require real LINE channel** — Mitigated: Skip test if LINE_CHANNEL_SECRET missing
- **CI pipeline may not exist** — Mitigated: Create `.github/workflows/ci.yml` as part of this spec
- **E2E tests may have additional failures** — Mitigated: Investigate each failure individually after R1 fix

## Mitigation

- Investigate admin page issue thoroughly (check Next.js logs, RSC payload, routing)
- Use miniflare or local R2 mock if real bindings unavailable
- Use LINE test channel or mock if real channel unavailable

## Traceability

- QA Report: `QA-REPORT.md`
- Test Strategy: `TEST-STRATEGY.md`
- QA Context: `.agents/qa-project-context.md`
