# Test Strategy — NetZeroCarbon POC

> Mode: Audit | Strategy pass: Combined | Date: 2026-09-17

## Subject

LINE-based carbon credit verification POC: three surfaces (farmer LINE OA, admin console, sponsor portal), Cloudflare Workers backend, D1 database, R2 photo storage, LIFF camera integration.

## Risk Ledger

### Critical Risks

| Risk / criterion | Failure mode | Impact | Exposure | Risk evidence |
|---|---|---|---|---|
| **Photo evidence integrity** | GPS/timestamp missing or spoofed; AI screening used as final authority instead of advisory | Invalid carbon credits, compliance failure | Every photo upload | REQUIREMENTS.md: "AI screening never final authority"; CONTEXT.md: "Photo Evidence requires GPS + timestamp" |
| **Phone = identity bypass** | Unverified phone match grants immediate trust; coordinator verification skipped | Unauthorized farmer access, data tampering | Farmer onboarding via LINE | CONTEXT.md: "If phone matches farmer, trust immediately, no verification gate"; memory: phone-is-identity |
| **LIFF context loss** | URI params for step/plot/season dropped during redirect; camera route receives wrong context | Photo linked to wrong plot/season, admin review confusion | LIFF camera flow | memory: liff-camera-route-pitfall; native-line-photo-action-fix |
| **LINE replyToken single-use** | Multiple reply calls with same token; only first succeeds | Farmer receives incomplete response, thinks bot is broken | Every chat response | CONTEXT.md: "replyToken can only be used once"; memory: line-replytoken-constraint |
| **Static export API base** | `NEXT_PUBLIC_API_BASE` not set at build time; API calls resolve to wrong origin | 405 in prod, CORS in local dev | Every frontend API call | memory: nextjs-static-export-api-base-pitfall |

### High Risks

| Risk / criterion | Failure mode | Impact | Exposure | Risk evidence |
|---|---|---|---|---|
| **Hono sub-router POST drop** | `app.route("/", subRouter)` silently drops POST handlers | Admin review, farmer create, season update fail silently | All POST endpoints | memory: hono-subrouter-post-pitfall |
| **node:crypto on Workers** | HMAC uses node:crypto instead of Web Crypto API | LINE webhook signature verification fails; all webhooks rejected | LINE webhook handler | memory: cloudflare-workers-node-crypto; line-signature-base64 |
| **D1 schema drift** | Local dev schema differs from prod; FK constraints behave differently | Migration failures, data integrity issues in prod | Any DB write | memory: admin-console-convergence (season ordering bug) |
| **Cross-origin XHR** | Missing `withCredentials` flag; auth cookies not sent | Admin/sponsor sessions lost on API calls | Admin + sponsor portals | memory: browser-use-testing-approach |
| **Material Symbols font** | `next/font/google` used instead of `<link>`; static build breaks | Icons render as text boxes; UI unusable | All pages | memory: material-symbols-font-missing |

### Medium Risks

| Risk / criterion | Failure mode | Impact | Exposure | Risk evidence |
|---|---|---|---|---|
| **Tailwind v4 invalid classes** | `ml-72`/`left-72` silently no-op | Layout broken; sidebar overlaps content | Admin + sponsor dashboards | memory: tailwind-v4-pitfalls |
| **Mock DB chain mismatch** | Test mock returns wrong shape; `.bind().first()` not a function | False confidence; test passes but prod fails | Unit tests using MockDB | Current failure: preverify-review.test.ts |
| **R2 upload failure** | Photo upload succeeds but R2 write fails; no rollback | Orphaned photo records; admin sees broken image | Photo upload flow | Architecture: R2 binding in wrangler.toml |
| **Workers AI timeout** | Vision model takes >10s; request times out | Photo screening incomplete; admin sees "AI error" | Photo review queue | memory: openrouter-api-integration (Qwen 3.5 Flash too slow) |

## Current Test Portfolio Audit

### Unit Tests (375 tests, 117 files)

**Coverage by module:**
- ✅ calc (CH₄, N₂O, CO₂, methane, burning) — 45 tests
- ✅ chat (draft parsing, consent, retake messages) — 38 tests
- ✅ admin (review queue, precision, detail, sponsors, settings) — 52 tests
- ✅ farmer (create, deed, plot) — 28 tests
- ✅ season (create, close, calendar) — 34 tests
- ✅ photo (validation, water depth, EXIF) — 22 tests
- ✅ line (consent, webhook contract) — 19 tests
- ✅ sponsor (summary, credential auth) — 17 tests
- ✅ liff (dashboard, camera context) — 14 tests
- ✅ migration (schema, FK) — 12 tests
- ⚠️ **preverify-review** — 1 test FAILING (mock DB chain)

**Strengths:**
- Deterministic logic well-covered (calc, state transitions, validation)
- MockDB pattern consistent across 57 files
- Fast execution (269ms for 375 tests)

**Gaps:**
- No tests for R2 upload/download
- No tests for Workers AI vision model integration
- No tests for cross-origin XHR with auth cookies
- No tests for LIFF URI param passing
- Mock DB chain `.bind().first()` returns undefined — mock doesn't match D1 API

### E2E Tests (6 spec files)

**Coverage:**
- ✅ admin.spec.ts — admin login, review queue, photo verification
- ✅ sponsor.spec.ts — sponsor login, dashboard, summary
- ✅ chat.spec.ts — farmer chat, draft confirmation
- ✅ full-qa.spec.ts — end-to-end journey (onboarding → activation → calendar)
- ✅ verify-journey.spec.ts — admin verification flow
- ✅ mobile-accessibility.spec.ts — mobile viewport, keyboard nav

**Strengths:**
- Covers three user surfaces
- Includes mobile + accessibility
- Real browser behavior (not just API mocks)

**Gaps:**
- Not run in this session (requires dev servers + browser)
- No LIFF camera flow (requires real LINE environment)
- No cross-browser matrix (mobile Safari untested)
- No performance/load scenarios

### Visual Tests

- Snapshot tests for chat messages
- Config: `tests/visual/playwright.config.ts`
- **Gap:** No visual regression for admin/sponsor dashboards

## Oracle Analysis

### Strong Oracles (clear pass/fail)
- **Calc logic:** Expected values from methodology spec → deterministic
- **Webhook signature:** Known secret + payload → expected HMAC
- **State transitions:** Season status enum → valid/invalid transitions
- **Photo validation:** GPS/timestamp presence → required fields check

### Weak Oracles (need improvement)
- **Mock DB chains:** `.bind().first()` returns undefined → mock doesn't match D1 API
- **AI screening:** Uses deterministic fixtures → doesn't test real Workers AI behavior
- **LIFF context:** Tests check query params exist → don't verify correct values passed through

### Missing Oracles (no test)
- **R2 photo storage:** No test verifies upload/download round-trip
- **Cross-origin auth:** No test verifies cookies sent with `withCredentials`
- **LINE replyToken batching:** No test verifies all messages sent in single call
- **Static export API base:** No test verifies `NEXT_PUBLIC_API_BASE` set correctly

## Technique Selection

### What we test well
- **Examples:** Farmer create, season create, admin review — concrete scenarios
- **Partitions:** Photo validation (GPS present/absent, timestamp valid/invalid)
- **State transitions:** Season status (pending → active → closed)

### What we under-test
- **Real boundaries:** D1, R2, Workers AI, LINE API — all mocked or stubbed
- **Composition:** LIFF context passing through multiple redirects
- **Concurrency:** Multiple admins reviewing same photo; race conditions
- **Performance:** Photo upload latency, AI screening timeout
- **Resilience:** R2 write failure, Workers AI timeout, D1 connection drop

### What we don't test
- **Security:** LINE webhook replay attacks, SQL injection, XSS
- **Accessibility:** WCAG compliance, screen reader compatibility
- **Compatibility:** Mobile Safari, older browsers
- **Usability:** Farmer comprehension of chat drafts, admin workflow efficiency

## Scope and Fidelity Decisions

### Keep at unit level (fast, deterministic)
- Calc logic (CH₄, N₂O, CO₂)
- State transitions (season status, photo status)
- Validation rules (GPS, timestamp, phone format)
- Webhook signature verification

### Move to integration level (real boundaries)
- **D1 queries:** Replace MockDB with real D1 in test environment
- **R2 upload:** Test actual R2 binding (local dev or staging)
- **Workers AI:** Test real vision model (or at least real API shape)
- **LINE API:** Test real webhook signature with real LINE test channel

### Keep at E2E level (critical journeys)
- Farmer onboarding → activation → calendar → photo upload
- Admin review queue → photo verification → results
- Sponsor login → dashboard → summary

### Add at production level (continuous verification)
- **Synthetic monitoring:** LINE webhook health check every 5 min
- **Real-device LIFF:** Monthly manual test on iOS + Android
- **Performance probes:** Photo upload p95 latency, AI screening p99

## Dependencies and Data

### Test doubles policy
- **D1:** Replace MockDB with real D1 (local dev binding or in-memory SQLite)
- **R2:** Use local filesystem mock for unit tests; real R2 for integration
- **Workers AI:** Deterministic fixtures for unit tests; real API for integration
- **LINE API:** Stub for unit tests; real test channel for integration

### Test data
- **Fixtures:** Farmer, plot, season, photo records in `tests/fixtures/`
- **Factories:** `createFarmer()`, `createPlot()`, `createSeason()` helpers
- **Reset:** Each test resets DB to known state; no shared state across tests
- **Privacy:** No real farmer data; synthetic phone numbers, names, locations

### Environment
- **Unit:** Bun test runner, in-process, no external services
- **Integration:** Local dev environment (wrangler dev + D1 + R2)
- **E2E:** Playwright with dev servers running (backend :8787, frontend :3000)
- **Production:** Synthetic monitors on workers.dev URLs

## Quality Scan

### Functional correctness ✅
- Actor workflows covered (farmer, admin, sponsor)
- State transitions tested
- Validation rules enforced

### Compatibility ⚠️
- **Gap:** No cross-browser matrix (mobile Safari untested)
- **Gap:** No older browser support verification

### Performance ❌
- **Gap:** No load testing
- **Gap:** No photo upload latency monitoring
- **Gap:** No AI screening timeout tracking

### Reliability ⚠️
- **Gap:** No R2 write failure handling
- **Gap:** No Workers AI timeout recovery
- **Gap:** No D1 connection drop resilience

### Security ❌
- **Gap:** No LINE webhook replay attack testing
- **Gap:** No SQL injection testing (D1 parameterized queries assumed)
- **Gap:** No XSS testing (frontend input sanitization assumed)
- **Gap:** No auth bypass testing (admin/sponsor credential checks assumed)

### Accessibility ⚠️
- **Partial:** mobile-accessibility.spec.ts exists but not run
- **Gap:** No WCAG audit
- **Gap:** No screen reader testing

### Usability ❌
- **Gap:** No farmer comprehension testing (chat drafts)
- **Gap:** No admin workflow efficiency testing
- **Gap:** No sponsor dashboard clarity testing

### Operability ⚠️
- **Partial:** Deployment verified (workers.dev URLs)
- **Gap:** No synthetic monitoring
- **Gap:** No production verification after deploy

## Portfolio Adequacy

### Decision: PARTIAL

**Rationale:**
- Critical path (farmer onboarding → admin review → sponsor view) covered
- Deterministic logic well-tested (calc, state, validation)
- **But:** Real boundaries (D1, R2, Workers AI, LINE API) all mocked
- **But:** Security, performance, accessibility not tested
- **But:** 1 unit test failing (mock DB chain) — false confidence
- **But:** E2E tests not verified in this session

### Adequacy signals
- **Trace coverage:** 375 unit tests + 6 E2E specs → covers functional correctness
- **Gaps:** Security, performance, accessibility, real-boundary integration
- **Mutation:** Not run (would reveal weak assertions)
- **Escaped defects:** UX/UI audit found 16 issues (font missing, layout constraints)
- **Flakes:** 1 test failing (preverify-review) — mock DB chain issue

## Manual Evaluation Obligations

### Required (cannot automate)
- **Real-device LIFF:** Camera access, GPS, photo upload on iOS + Android
- **Farmer comprehension:** Do chat drafts make sense to non-technical farmers?
- **Admin workflow:** Is review queue efficient? Can admin process 100 photos/day?
- **Sponsor clarity:** Does dashboard communicate impact clearly?
- **Visual fidelity:** Do admin/sponsor dashboards match design spec?

### Recommended
- **Accessibility audit:** WCAG 2.1 AA compliance with screen reader
- **Security audit:** LINE webhook replay, SQL injection, XSS, auth bypass
- **Performance audit:** Photo upload latency, AI screening timeout, page load

## Handoffs

### To defect-shift-left
- Fix mock DB chain: `.bind().first()` returns undefined → align mock with D1 API
- Replace MockDB with real D1 (local binding or in-memory SQLite)
- Add R2 upload/download integration test
- Add Workers AI vision model integration test

### To CI/CD reliability
- Run E2E tests on every PR (requires dev servers in CI)
- Add synthetic monitoring for LINE webhook health
- Add visual regression for admin/sponsor dashboards
- Gate deploy on E2E pass (not just unit tests)

### To requirements traceability
- Map 375 unit tests to REQUIREMENTS.md acceptance criteria
- Map 6 E2E specs to actor workflows
- Identify untested requirements (security, performance, accessibility)

### To system optimization
- Suite latency: 269ms (unit) + unknown (E2E) → acceptable
- Resource cost: Bun test runner → low
- Flakiness: 1 test failing → fix before adding more
- Duplication: None identified (no same-scope duplicates)

### To companion skills
- **Security testing:** LINE webhook replay, SQL injection, XSS, auth bypass
- **Performance testing:** Photo upload latency, AI screening timeout, page load
- **Accessibility testing:** WCAG audit, screen reader, keyboard nav
- **Exploratory testing:** Farmer comprehension, admin workflow, sponsor clarity

## Residual Risk

### Accepted
- No real-device LIFF testing (requires physical iOS + Android devices)
- No performance/load testing (POC stage, low traffic expected)
- No cross-browser matrix (mobile Safari untested but assumed compatible)

### Blocked
- Security testing (no security requirements in REQUIREMENTS.md)
- Accessibility testing (no WCAG target in REQUIREMENTS.md)
- Usability testing (no farmer/admin/sponsor personas defined)

### Deferred
- Mutation testing (would reveal weak assertions but not urgent for POC)
- Chaos engineering (R2 write failure, Workers AI timeout — add post-POC)
- Contract testing (LINE API, Workers AI — add if integrations change)

### Unknown
- Production error rate (no observability/monitoring set up)
- Real-world photo quality (GPS accuracy, lighting, camera compatibility)
- LINE rate limiting (how many messages/second can farmer send?)

## Next Actions

### Immediate (this session)
1. **Fix failing test:** `preverify-review.test.ts` — mock DB chain `.bind().first()` returns undefined
2. **Triage lint errors:** 42 errors → real bugs vs style issues
3. **Run E2E tests:** Verify 6 specs pass with dev servers running

### Short-term (this week)
4. **Replace MockDB:** Use real D1 (local binding or in-memory SQLite) for integration tests
5. **Add R2 integration test:** Photo upload/download round-trip
6. **Add Workers AI integration test:** Vision model with real API (or at least real shape)
7. **Add LINE webhook integration test:** Real signature verification with test channel

### Medium-term (this month)
8. **Security testing:** LINE webhook replay, SQL injection, XSS, auth bypass
9. **Accessibility audit:** WCAG 2.1 AA compliance
10. **Real-device LIFF testing:** iOS + Android camera, GPS, photo upload
11. **Synthetic monitoring:** LINE webhook health check every 5 min

### Long-term (post-POC)
12. **Performance testing:** Photo upload latency, AI screening timeout, page load
13. **Chaos engineering:** R2 write failure, Workers AI timeout, D1 connection drop
14. **Contract testing:** LINE API, Workers AI — add if integrations change
15. **Mutation testing:** Reveal weak assertions in calc, state, validation

## Verification

### Commands
```bash
# Unit tests
bun run check:test

# Lint
bun run check:lint

# Type check
bun run check:type

# E2E (requires dev servers)
npm run dev:all &  # backend :8787 + frontend :3000
bun run test:e2e
```

### Results
- **Unit:** 374/375 pass (1 failing: preverify-review)
- **Lint:** 42 errors, 53 warnings (not triaged)
- **E2E:** Not run (requires dev servers + browser)

### Not run
- Integration tests (no real D1/R2/Workers AI tests yet)
- Security tests (no security testing skill invoked)
- Performance tests (no performance testing skill invoked)
- Accessibility tests (mobile-accessibility.spec.ts exists but not run)

## Output Summary

```
Subject:              LINE-based carbon credit verification POC
Mode:                 Audit
Strategy pass:        Combined
Decision:             PARTIAL
Test basis:           REQUIREMENTS.md, CONTEXT.md, memory, existing tests
Architecture basis:   Stable (Cloudflare Workers, D1, R2, LIFF, LINE API)
Quality risks:        Photo integrity, phone identity, LIFF context, replyToken, API base
Manual evaluation:    Real-device LIFF, farmer comprehension, admin workflow, sponsor clarity
Adequacy signals:     375 unit + 6 E2E; gaps in security, performance, accessibility
Handoffs:             defect-shift-left (mock DB), CI/CD (E2E gate), security/perf/a11y skills
Residual risk:        Accepted (no real-device LIFF, no perf testing); blocked (no security/a11y requirements); unknown (prod error rate)
Next action:          Fix failing test, triage lint, run E2E, then replace MockDB with real D1
Verification:         bun run check:test (374/375 pass), bun run check:lint (42 errors), E2E not run
```
