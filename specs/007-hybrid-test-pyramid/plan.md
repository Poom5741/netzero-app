# Implementation Plan: Hybrid Test Pyramid

**Branch**: `007-hybrid-test-pyramid` | **Date**: 2026-09-16 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/007-hybrid-test-pyramid/spec.md`

## Summary

Implement a hybrid test pyramid for NetZeroCarbon LINE OA with four layers: (1) state-machine and webhook contract tests using Vitest with isolated D1 databases per test, (2) message snapshot tests validating Flex JSON against LINE's validation endpoint, (3) LIFF browser tests with a fake LIFF adapter, and (4) a real-device smoke test checklist. Test credentials are managed via `.env.test` (gitignored) and CI repository secrets.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 22

**Primary Dependencies**: bun test (existing test runner), Hono (web framework), Cloudflare Workers (runtime), D1 (database)

**Storage**: MockDB (existing in-memory mock at `tests/helpers/integration.ts:40-173`) — each test creates a fresh MockDB instance with seed helpers, guaranteeing isolation without external database setup

**Testing**: bun test with existing MockDB infrastructure, extended with fake LINE transport and LIFF adapter

**Target Platform**: Cloudflare Workers (backend), Next.js static export (frontend), LINE mobile app (farmer interface)

**Project Type**: Web service (LINE OA bot + admin/sponsor dashboards)

**Performance Goals**: State-machine tests run in <10 seconds total (MockDB is microseconds per test), LIFF browser tests run in <60 seconds per PR

**Constraints**: 
- No hardcoded credentials (constitution §VI Privacy and Least Privilege)
- No `node:crypto` in Workers (use Web Crypto API)
- LINE replyToken is single-use (batch replies)
- Tests must use existing MockDB infrastructure (constitution §III YAGNI Extremist)
- Test runner must be bun test (existing project standard)

**Scale/Scope**: 18 conversation states, 36-54 test fixtures, 6 LIFF pages, 10-15 real-device smoke tests

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

✅ **I. Phone-Is-Identity**: Test fixtures will include phone-matching scenarios (valid, invalid, already-linked)

✅ **II. Production-First Testing**: Tests run against deployed workers.dev where possible; isolated D1 databases are real D1 instances, not mocks

✅ **III. YAGNI Extremist**: No new dependencies added; uses existing Vitest, D1, and Web Crypto API

✅ **IV. LINE-Native UX**: Message snapshot tests validate Flex JSON structure; real-device tests verify Rich Menu rendering

✅ **V. Evidence-Driven Carbon Accounting**: Test fixtures include photo evidence states (0/4, 3/4, 4/4) and carbon estimate scenarios

✅ **VI. Privacy and Least Privilege**: Test credentials in `.env.test` (gitignored); test database uses anonymized farmer data

✅ **VII. Auditability and Safe Decisions**: Test fixtures cover retake, rejection, and pending states with audit trail verification

✅ **VIII. Design Consistency**: Visual snapshot tests use project design tokens; no new UI components

**Gate Status**: PASS — all constitution principles satisfied

## Project Structure

### Documentation (this feature)

```text
specs/007-hybrid-test-pyramid/
── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── webhook-fixture.json
│   ├── message-snapshots/
│   ── liff-adapter.ts
└── tasks.md             # Phase 2 output (NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
src/
├── line/
│   ├── flow.ts                    # State machine (existing, 18 states)
│   ├── webhook.ts                 # Webhook handler (existing, signature-only)
│   ├── flex-builders.ts           # Message builders (existing, 8+ builders)
│   └── liff-adapter.ts            # NEW: LIFF adapter interface + fake impl

tests/
├── helpers/
│   └── integration.ts             # Existing MockDB + seed helpers (extend)
├── fixtures/
│   ├── line-events/               # NEW: LINE webhook event fixtures
│   │   ├── welcome-001.json
│   │   ├── consent-001.json
│   │   └── ...
│   └── message-snapshots/         # NEW: Golden JSON snapshots
│       ├── welcome-bubble.json
│       ├── consent-bubble.json
│       └── ...
├── unit/
│   ├── state-machine.test.ts      # NEW: State transition tests (using MockDB)
│   ├── webhook-contract.test.ts   # NEW: Webhook signature tests
│   ── message-snapshot.test.ts   # NEW: Flex JSON snapshot tests
├── integration/
│   ├── liff-browser.test.ts       # NEW: LIFF page tests (fake adapter)
│   └── api-contract.test.ts       # NEW: API endpoint tests
└── e2e/
    └── smoke-test-checklist.md    # NEW: Real-device smoke test checklist
```

**Structure Decision**: Single project with `src/test/` for test infrastructure and `tests/` for test suites. LIFF adapter interface in `src/line/liff-adapter.ts` with production and fake implementations.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations — all constitution principles satisfied.

## Phase 0: Research

### Unknowns Resolved

1. **D1 isolation strategy**: Use `wrangler d1 execute --local` with temp database files, or in-memory SQLite mock?
   - **Decision**: Temp database files via `wrangler d1 execute --local --command` with unique DB name per test
   - **Rationale**: Real D1 behavior (transactions, constraints) without production data; faster than full Workers runtime
   - **Alternatives considered**: In-memory SQLite mock (faster but may miss D1-specific behavior), shared DB with reset (risk of state leakage)

2. **LINE message validation endpoint**: Is it available for test use?
   - **Decision**: Yes, LINE provides `https://api.line.me/v2/bot/message/validate` for Flex Message validation
   - **Rationale**: Official endpoint, free to call, catches structural errors before sending
   - **Alternatives considered**: Local JSON schema validation (faster but may miss LINE-specific rules)

3. **LIFF adapter interface**: What methods are needed?
   - **Decision**: `getProfile()`, `isInClient()`, `getAccessToken()`, `openWindow()`, `closeWindow()`
   - **Rationale**: Covers all LIFF SDK behaviors used in the app; fake implementation returns deterministic test data
   - **Alternatives considered**: Mock the entire LIFF SDK (tighter coupling, harder to maintain)

4. **Test credential management**: How to store LINE channel secret, access token, LIFF ID?
   - **Decision**: `.env.test` file (gitignored) for local, repository secrets for CI
   - **Rationale**: Standard 12-factor app practice, no hardcoded secrets, different credentials per environment
   - **Alternatives considered**: Cloudflare KV (overkill for test credentials), dedicated test config file (same as .env.test but less standard)

## Phase 1: Design & Contracts

### Data Model

#### Test Fixture Schema

```typescript
interface WebhookFixture {
  id: string;                    // e.g., "welcome-001"
  description: string;           // Human-readable description
  initialState: ConversationState; // State before event
  event: {
    type: "message" | "postback" | "follow" | "unfollow";
    source: { type: "user"; userId: string };
    message?: { type: "text"; text: string; id?: string };
    postback?: { data: string; params?: Record<string, string> };
    timestamp: number;
  };
  signature: string;             // Valid test signature
  expectedState: ConversationState; // State after event
  expectedReply: {
    type: "text" | "flex" | "sticker" | "image";
    text?: string;
    contents?: unknown;          // Flex message JSON
    quickReply?: unknown;
  };
  databaseChanges?: {
    table: string;
    operation: "insert" | "update" | "delete";
    where?: Record<string, unknown>;
    values?: Record<string, unknown>;
  }[];
}
```

#### Message Snapshot Schema

```typescript
interface MessageSnapshot {
  id: string;                    // e.g., "welcome-bubble"
  builder: string;               // Builder function name
  inputs: Record<string, unknown>; // Input parameters
  expectedJson: unknown;         // Golden JSON output
  validationEndpoint?: string;   // LINE validation endpoint URL
}
```

#### LIFF Adapter Interface

```typescript
interface LiffAdapter {
  getProfile(): Promise<{
    userId: string;
    displayName: string;
    pictureUrl: string;
    statusMessage: string;
  }>;
  isInClient(): boolean;
  getAccessToken(): string | null;
  openWindow(options: { url: string; external?: boolean }): void;
  closeWindow(): void;
}

// Production implementation
class RealLiffAdapter implements LiffAdapter {
  constructor(private liff: typeof liff) {}
  // ... delegates to liff.* methods
}

// Test implementation
class FakeLiffAdapter implements LiffAdapter {
  constructor(private profile: Profile, private token: string) {}
  // ... returns deterministic test data
}
```

### Contracts

#### Webhook Fixture Contract

File: `contracts/webhook-fixture.json`

Each fixture file must:
- Have a unique `id` (kebab-case, e.g., `welcome-001`)
- Specify `initialState` matching one of the 18 `ConversationState` values
- Include a valid `signature` generated from the event body and test channel secret
- Specify `expectedState` and `expectedReply` for assertion
- Optionally specify `databaseChanges` for DB assertion

#### Message Snapshot Contract

File: `contracts/message-snapshots/*.json`

Each snapshot file must:
- Have a unique `id` (kebab-case, e.g., `welcome-bubble`)
- Specify the `builder` function name
- Include `inputs` for reproducibility
- Include `expectedJson` as the golden output
- Optionally specify `validationEndpoint` for LINE validation

#### LIFF Adapter Contract

File: `contracts/liff-adapter.ts`

The interface must:
- Be implemented by both `RealLiffAdapter` and `FakeLiffAdapter`
- Use only methods available in the LINE LIFF SDK v2
- Return types must match LINE SDK types exactly
- Fake implementation must accept profile and token via constructor

### Quickstart Validation Guide

File: `quickstart.md`

#### Prerequisites

1. Node.js 22+ installed
2. `.env.test` file with test LINE credentials:
   ```
   LINE_CHANNEL_SECRET=test-secret-xxx
   LINE_ACCESS_TOKEN=test-token-xxx
   LIFF_ID=test-liff-id-xxx
   ```
3. Wrangler CLI installed (`npm install -g wrangler`)

#### Run State-Machine Tests

```bash
# Run all state-machine tests (isolated DB per test)
npm run test:state-machine

# Run specific state
npm run test:state-machine -- --grep "welcome"

# Update snapshots
npm run test:state-machine -- --update-snapshots
```

**Expected outcome**: 36-54 tests pass in <30 seconds, each with isolated database

#### Run Message Snapshot Tests

```bash
# Run all snapshot tests
npm run test:snapshots

# Validate against LINE endpoint
npm run test:snapshots -- --validate-line

# Update snapshots
npm run test:snapshots -- --update
```

**Expected outcome**: All snapshots match golden JSON, LINE validation passes

#### Run LIFF Browser Tests

```bash
# Run all LIFF tests (fake adapter)
npm run test:liff

# Run specific page
npm run test:liff -- --grep "camera"

# Run with real LIFF (requires LINE mobile)
npm run test:liff:real
```

**Expected outcome**: 6 LIFF pages tested in <60 seconds

#### Run Real-Device Smoke Tests

1. Open `tests/e2e/smoke-test-checklist.md`
2. Follow 10-15 steps on physical iPhone/Android
3. Check off each step as verified
4. Report any failures

**Expected outcome**: All 10-15 steps pass in <15 minutes

#### Verify Test Isolation

```bash
# Run tests in random order (verifies no state leakage)
npm run test:state-machine -- --shuffle

# Run with only one test at a time (verifies independence)
npm run test:state-machine -- --maxWorkers=1
```

**Expected outcome**: All tests pass regardless of execution order

## Next Steps

After this plan is approved, run `/speckit-tasks` to break into implementation tasks.
