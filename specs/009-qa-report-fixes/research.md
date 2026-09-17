# Research: QA Report Fixes

**Date**: 2026-09-17 | **Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Research Task 1: Next.js 16.3 Dev Mode Rendering Issue

### Problem
Admin page returns 404 in dev mode. Layout renders (sidebar + header present) but main content missing.

### Investigation

**Symptom**: `curl http://localhost:3000/admin` shows:
- `<aside>` with sidebar (NetZero brand, navigation)
- `<header>` with search, notifications, settings
- `<main>` with empty content (404 in RSC payload)

**Root Cause Analysis**:

Checked `frontend/src/app/admin/page.tsx`:
- File exists (16.9K)
- Exports default component
- Uses React Server Components (RSC)

Checked Next.js logs:
- No hydration errors
- No build errors
- RSC payload contains 404 digest

**Hypothesis**: Next.js dev mode RSC routing issue. The admin page is a Server Component that fetches data from the backend API. In dev mode, the API call may be failing silently, causing the page to return 404.

**Test**: Create minimal admin page with no data fetching.

```typescript
// frontend/src/app/admin/page.tsx (minimal version)
export default function AdminPage() {
  return <div>Admin Dashboard</div>;
}
```

**Result**: Minimal page renders correctly. Issue is in data fetching or component logic.

**Investigation**: Check `admin/page.tsx` for:
- API calls that may fail in dev mode
- Conditional rendering that may return null
- Error boundaries that may catch errors silently

**Finding**: `admin/page.tsx` line 45-60 fetches data from `/api/admin/dashboard`. In dev mode, this API call returns 404 because the backend route is not registered.

**Root Cause**: Backend route `/api/admin/dashboard` not implemented. The admin page expects this endpoint but it doesn't exist.

### Decision

**Fix**: Implement `/api/admin/dashboard` endpoint in backend.

**Rationale**: 
- Admin page requires dashboard data (metrics, work queue, visualizations)
- Endpoint is referenced in spec (AD-OV-02, AD-OV-03, AD-OV-04)
- Without endpoint, admin page cannot render

**Alternatives Considered**:
1. Mock data in frontend — Rejected: violates Production-First Testing principle
2. Skip dashboard in dev mode — Rejected: breaks E2E tests
3. Implement endpoint — **Chosen**: aligns with constitution

**Implementation**:
- Add `GET /api/admin/dashboard` route in `src/admin/dashboard.ts`
- Return: total_farmers, active_plots, pending_reviews, verified_photos, work_queue, credit_visualizations
- Use existing D1 queries (no new schema)

## Research Task 2: Miniflare Configuration for Local Cloudflare Bindings

### Problem
Integration tests need real Cloudflare bindings (D1, R2, Workers AI) but cannot use production.

### Investigation

**Miniflare**: Local Cloudflare emulator for testing.

**Capabilities**:
- D1: In-memory SQLite database
- R2: In-memory object storage
- Workers AI: Mock AI responses (no real model)
- KV: In-memory key-value storage

**Configuration**:

```typescript
// tests/helpers/miniflare.ts
import { Miniflare } from 'miniflare';

const mf = new Miniflare({
  script: '',
  d1Databases: { DB: 'test-db' },
  r2Buckets: { R2: 'test-bucket' },
  ai: { binding: 'AI' },
});
```

**D1 Setup**:
- Create in-memory SQLite database
- Run migrations from `migrations/` directory
- Seed test data from `tests/fixtures/`

**R2 Setup**:
- Create in-memory bucket
- Upload test photo from `tests/fixtures/test-photo.jpg`
- Verify download preserves metadata

**Workers AI Setup**:
- Miniflare does not support real Workers AI
- Use mock AI responses (deterministic fixtures)
- Test timeout handling with delayed responses

### Decision

**Approach**: Use miniflare for D1 and R2, mock for Workers AI.

**Rationale**:
- Miniflare provides faithful D1 and R2 emulation
- Workers AI requires real Cloudflare account (not available in CI)
- Mock AI responses are sufficient for integration testing

**Alternatives Considered**:
1. Use production Cloudflare account — Rejected: violates Privacy and Least Privilege
2. Use real Workers AI in CI — Rejected: requires secrets, slow
3. Use miniflare + mock AI — **Chosen**: fast, isolated, no secrets

**Implementation**:
- Install miniflare: `bun add -d miniflare`
- Create `tests/helpers/miniflare.ts` with D1, R2, AI bindings
- Create `tests/integration/` directory for integration tests
- Use existing mock DB pattern for unit tests

## Research Task 3: LINE Webhook Test Payload Structure

### Problem
R6 requires LINE webhook integration test with valid/invalid signatures.

### Investigation

**LINE Webhook Format**:

```json
{
  "destination": "U1234567890abcdef",
  "events": [
    {
      "type": "message",
      "mode": "active",
      "timestamp": 1234567890123,
      "source": {
        "type": "user",
        "userId": "U1234567890abcdef"
      },
      "replyToken": "0f3779fba3b349968c5d07db31eabcd5",
      "message": {
        "type": "text",
        "id": "1234567890",
        "text": "สวัสดี"
      }
    }
  ]
}
```

**Signature Algorithm**:

```typescript
import { createHmac } from 'crypto';

const signature = createHmac('sha256', channelSecret)
  .update(JSON.stringify(body))
  .digest('base64');
```

**Headers**:
- `X-Line-Signature`: Base64 HMAC-SHA256
- `Content-Type`: application/json

**Test Scenarios**:
1. Valid signature → webhook processed
2. Invalid signature → 401 Unauthorized
3. Missing signature → 401 Unauthorized
4. Malformed JSON → 400 Bad Request

### Decision

**Approach**: Create test payload with valid signature, test rejection with invalid signature.

**Rationale**:
- Matches LINE Messaging API specification
- Tests signature verification logic (Web Crypto API)
- Covers happy path and error cases

**Alternatives Considered**:
1. Use real LINE test channel — Rejected: requires LINE account, not available in CI
2. Mock LINE API — Rejected: does not test signature verification
3. Generate test payload with known secret — **Chosen**: fast, isolated, deterministic

**Implementation**:
- Create `tests/fixtures/line-webhook-payload.json`
- Create `tests/integration/line-webhook.test.ts`
- Use `.dev.vars` for LINE_CHANNEL_SECRET (skip test if missing)
- Verify audit log entry created for valid webhook

## Research Task 4: GitHub Actions Workflow for Cloudflare Workers

### Problem
CI pipeline needed to run tests on every PR.

### Investigation

**Requirements**:
- Run on every PR to main branch
- Execute: lint, typecheck, unit tests, integration tests, E2E tests
- Deploy to staging (optional)
- Timeout: 10 minutes per job

**Workflow Structure**:

```yaml
name: CI

on:
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run check:lint

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run check:type

  test-unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run check:test

  test-integration:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run test:integration

  test-e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - uses: actions/setup-node@v4
      - run: bun install
      - run: bun install playwright
      - run: bun run dev:all &
      - run: bun run test:e2e
```

**Secrets Management**:
- `CLOUDFLARE_API_TOKEN`: For wrangler deploy (optional)
- `LINE_CHANNEL_SECRET`: For LINE webhook test
- Store in GitHub Secrets, inject via `.dev.vars`

**Deployment**:
- Optional: Deploy to staging after tests pass
- Use `wrangler deploy --env staging`
- Verify health check: `curl https://staging.netzero-carbon-poc.workers.dev/health`

### Decision

**Approach**: Create GitHub Actions workflow with 5 jobs (lint, typecheck, unit, integration, e2e).

**Rationale**:
- Matches constitution quality gates (Pre-merge: all tests green)
- Fast feedback loop (<10 minutes)
- No deployment required (can add later)

**Alternatives Considered**:
1. Single job with all tests — Rejected: slow, hard to debug
2. Deploy to production on PR — Rejected: violates Production-First Testing
3. Separate jobs per test type — **Chosen**: fast, clear failure isolation

**Implementation**:
- Create `.github/workflows/ci.yml`
- Configure secrets in GitHub repository settings
- Add status badge to README.md
- Block PR merge if any job fails

## Summary

### Decisions Made

1. **Admin page 404**: Implement missing `/api/admin/dashboard` endpoint
2. **Integration tests**: Use miniflare for D1/R2, mock for Workers AI
3. **LINE webhook**: Generate test payload with known secret
4. **CI pipeline**: GitHub Actions with 5 jobs (lint, typecheck, unit, integration, e2e)

### Risks Mitigated

- **Admin page rendering**: Root cause identified (missing endpoint), fix defined
- **Integration test isolation**: Miniflare provides faithful emulation, no production data
- **LINE webhook testing**: Deterministic payload generation, no real LINE account required
- **CI/CD**: Standard GitHub Actions workflow, no custom infrastructure

### Next Steps

1. Implement `/api/admin/dashboard` endpoint (R1)
2. Configure miniflare for integration tests (R4, R5, R6)
3. Create LINE webhook test payload (R6)
4. Create GitHub Actions workflow (R7)
