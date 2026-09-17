# Implementation Plan: QA Report Fixes

**Branch**: `009-qa-report-fixes` | **Date**: 2026-09-17 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/009-qa-report-fixes/spec.md`

## Summary

Fix critical production bugs and test infrastructure issues identified in QA audit:
1. Fix admin page 404 in dev mode (blocks E2E tests)
2. Fix 47 lint errors (all style, no bugs)
3. Enable E2E tests (17 tests currently failing)
4. Add R2 integration test (real Cloudflare binding)
5. Add Workers AI integration test (real API)
6. Add LINE webhook integration test (real signature verification)
7. Add CI/CD pipeline (run tests on every PR)

Technical approach: Investigate Next.js dev mode rendering issue, add null checks for lint errors, create integration tests using miniflare for local Cloudflare bindings, create GitHub Actions workflow for CI.

## Technical Context

**Language/Version**: TypeScript 5.x, Bun 1.4

**Primary Dependencies**: 
- Backend: Cloudflare Workers, Hono, D1 (SQLite), R2, Workers AI
- Frontend: Next.js 16.3, React 19, Tailwind v4
- Testing: Bun test, Playwright, miniflare
- CI: GitHub Actions

**Storage**: 
- D1 database (SQLite-compatible, Cloudflare)
- R2 bucket (photo storage, Cloudflare)
- KV namespace (session storage, Cloudflare)

**Testing**: 
- Unit: Bun test (846 tests, 100% pass)
- Integration: Bun test + miniflare (to be added)
- E2E: Playwright (17 tests, currently failing)
- Visual: Playwright screenshot comparison

**Target Platform**: 
- Backend: Cloudflare Workers (edge runtime)
- Frontend: Static export to Cloudflare Pages
- Dev: localhost (backend :8787, frontend :3000)

**Project Type**: Web application (LINE chatbot + admin dashboard + sponsor portal)

**Performance Goals**: 
- Unit tests: <5s
- E2E tests: <60s
- Integration tests: <30s
- Admin page render: <2s

**Constraints**: 
- Workers AI timeout: 10s
- LINE replyToken: single-use
- D1 concurrent writes: require transaction
- Static export: build-time env vars

**Scale/Scope**: 
- 3 user surfaces (farmer LINE, admin dashboard, sponsor portal)
- 19 database tables
- 6 R2 photo operations
- 17 E2E test scenarios

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle Compliance

**I. Phone-Is-Identity**: ✅ PASS
- No changes to identity logic in this spec
- Integration tests use existing phone-based auth

**II. Production-First Testing**: ✅ PASS
- R4-R6 add integration tests with real Cloudflare bindings (miniflare)
- E2E tests verify deployed behavior (after R1 fix)
- CI pipeline ensures tests run on every PR

**III. YAGNI Extremist**: ✅ PASS
- No new abstractions introduced
- Use existing miniflare for local Cloudflare emulation
- Use existing Playwright for E2E tests
- Lint fixes use simple null checks, not complex type guards

**IV. LINE-Native UX**: ✅ PASS
- R6 tests LINE webhook signature verification
- No changes to LINE chat interface
- LIFF deep links remain camera-only

**V. Evidence-Driven Carbon Accounting**: ✅ PASS
- R4 tests R2 photo storage (evidence integrity)
- R5 tests Workers AI vision model (photo classification)
- No changes to carbon calculation logic

**VI. Privacy and Least Privilege**: ✅ PASS
- Integration tests use synthetic data (no real farmer PII)
- Test fixtures cleaned up after execution
- No changes to role-based access control

**VII. Auditability and Safe Decisions**: ✅ PASS
- Integration tests verify audit log entries (R4, R5)
- No changes to audit log schema or logic
- Test data does not pollute production audit trail

**VIII. Design Consistency**: ✅ PASS
- R1 fixes admin page rendering (design tokens preserved)
- No changes to neumorphic cards or Material Symbols
- Lint fixes do not alter UI

### Technical Constraints Compliance

**Workers cryptography**: ✅ PASS
- R6 uses existing Web Crypto API for LINE signature
- No new crypto implementations

**D1 atomic operations**: ✅ PASS
- Integration tests use existing transaction patterns
- No new concurrent write scenarios

**Static-export builds**: ✅ PASS
- R1 fixes dev mode rendering (does not affect static export)
- No new build-time env vars

**Thai language**: ✅ PASS
- No new user-facing text
- E2E tests verify Thai labels (AC3)

**AI fallback behavior**: ✅ PASS
- R5 tests Workers AI timeout handling
- Existing fallback logic preserved

### Quality Gates Compliance

**Pre-commit (Mimosa)**: ✅ PASS
- No new security vulnerabilities introduced
- Integration tests use synthetic data (no secrets)

**Pre-merge (spec checkers)**: ✅ PASS
- Spec 009 defines clear acceptance criteria
- Tasks will be traceable to requirements

**Post-deploy (health check)**: ✅ PASS
- CI pipeline includes health check endpoint verification
- E2E tests verify critical flows

**Security (no secrets)**: ✅ PASS
- Integration tests use `.dev.vars` for LINE_CHANNEL_SECRET
- No secrets committed to source

### Pitfalls Avoidance

**D1 concurrent writes**: ✅ PASS
- Integration tests use sequential execution
- No new concurrent write scenarios

**node:crypto HMAC**: ✅ PASS
- R6 uses existing Web Crypto API
- No new HMAC implementations

**Tailwind v4 invalid classes**: ✅ PASS
- R1 does not introduce new Tailwind classes
- Lint fixes do not alter CSS

**next/font/google**: ✅ PASS
- R1 does not change font loading
- Existing Google Fonts `<link>` preserved

**LINE replyToken**: ✅ PASS
- R6 tests existing replyToken handling
- No new replyToken usage

**Wrangler deploy**: ✅ PASS
- CI pipeline uses standard `wrangler deploy`
- No sandbox deployment issues

### Gate Decision

**PASS**: All 8 principles satisfied, all technical constraints met, all quality gates compliant, all pitfalls avoided.

Proceed to Phase 0 research.

## Project Structure

### Documentation (this feature)

```text
specs/009-qa-report-fixes/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── r2-integration.md
│   ├── workers-ai-integration.md
│   └── line-webhook-integration.md
└── tasks.md             # Phase 2 output (created by /speckit-tasks)
```

### Source Code (repository root)

```text
# Backend (Cloudflare Workers)
src/
├── admin/
│   ├── review.ts        # R1: Fix admin page rendering
│   └── audit-log.ts
├── line/
│   └── webhook.ts       # R6: LINE webhook integration test
├── photo/
│   └── upload.ts        # R4: R2 integration test
└── vision/
    └── classifier.ts    # R5: Workers AI integration test

# Frontend (Next.js)
frontend/
├── src/
│   └── app/
│       └── admin/
│           ├── layout.tsx
│           └── page.tsx  # R1: Fix admin page rendering
└── e2e/
    ├── admin.spec.ts     # R3: E2E tests
    ├── chat.spec.ts
    └── sponsor.spec.ts

# Tests
tests/
├── unit/                 # 846 existing tests
├── integration/
│   ├── r2.test.ts        # R4: R2 integration test
│   ├── workers-ai.test.ts # R5: Workers AI integration test
│   └── line-webhook.test.ts # R6: LINE webhook integration test
└── fixtures/
    └── test-photo.jpg    # Test photo with EXIF

# CI/CD
.github/
└── workflows/
    └── ci.yml            # R7: CI pipeline
```

**Structure Decision**: Web application structure (backend + frontend). Backend uses Cloudflare Workers with Hono framework. Frontend uses Next.js with static export. Tests organized by type (unit, integration, e2e).

## Complexity Tracking

> No violations. All work uses existing patterns and dependencies.

## Phase 0: Research

### Unknowns to Resolve

1. **Admin page 404 root cause**
   - Research: Next.js dev mode RSC hydration
   - Deliverable: `research.md` section 1

2. **Miniflare configuration for local Cloudflare bindings**
   - Research: miniflare setup for D1, R2, Workers AI
   - Deliverable: `research.md` section 2

3. **LINE webhook test payload structure**
   - Research: LINE Messaging API webhook event format
   - Deliverable: `research.md` section 3

4. **GitHub Actions workflow for Cloudflare Workers**
   - Research: wrangler deploy in CI, secrets management
   - Deliverable: `research.md` section 4

### Research Tasks

**Task 1**: Investigate Next.js 16.3 dev mode rendering issue
- Check Next.js logs for hydration errors
- Verify admin/page.tsx exports default component
- Test with minimal admin page (no data fetching)
- Document root cause and fix

**Task 2**: Configure miniflare for local Cloudflare emulation
- Install miniflare as dev dependency
- Configure D1, R2, Workers AI bindings
- Test R2 upload/download with miniflare
- Document configuration

**Task 3**: Research LINE webhook event format
- Review LINE Messaging API documentation
- Create test payload for text message event
- Verify signature generation algorithm
- Document payload structure

**Task 4**: Create GitHub Actions workflow
- Review existing CI config (if any)
- Configure wrangler deploy with secrets
- Set up test execution (unit, integration, e2e)
- Document workflow

## Phase 1: Design & Contracts

### Data Model

No schema changes. Integration tests use existing tables:
- `photo_evidence` (R4: R2 integration)
- `audit_log` (R4, R5: audit trail verification)
- `line_links` (R6: LINE webhook test)

### Contracts

**R2 Integration Contract** (`contracts/r2-integration.md`):
- Upload photo to R2
- Retrieve photo from R2
- Verify metadata preservation
- Cleanup test data

**Workers AI Integration Contract** (`contracts/workers-ai-integration.md`):
- Send photo to Workers AI
- Receive classification response
- Handle timeout gracefully
- Verify response shape

**LINE Webhook Integration Contract** (`contracts/line-webhook-integration.md`):
- Generate valid signature
- Send webhook with valid signature
- Send webhook with invalid signature
- Verify processing/rejection

### Quickstart Validation

**Quickstart** (`quickstart.md`):
- Prerequisites: Node.js, Bun, wrangler
- Setup: `npm install`, configure `.dev.vars`
- Run tests: `bun run check:test`, `bun run test:e2e`
- Verify: Admin page renders, E2E tests pass

## Completion Report

**Branch**: `009-qa-report-fixes`

**Plan**: `/Users/poom-work/netzero-app/specs/009-qa-report-fixes/plan.md`

**Generated Artifacts**:
- `plan.md` (this file)
- `research.md` (Phase 0)
- `data-model.md` (Phase 1)
- `quickstart.md` (Phase 1)
- `contracts/r2-integration.md` (Phase 1)
- `contracts/workers-ai-integration.md` (Phase 1)
- `contracts/line-webhook-integration.md` (Phase 1)

**Next**: Run `/speckit-tasks` to break plan into traceable tasks.
