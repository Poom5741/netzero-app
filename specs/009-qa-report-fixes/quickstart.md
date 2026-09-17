# Quickstart: QA Report Fixes Validation

**Date**: 2026-09-17 | **Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Prerequisites

- **Node.js**: 18+ (for Playwright)
- **Bun**: 1.4+ (for tests)
- **wrangler**: Latest (for Cloudflare Workers)
- **Git**: For version control

## Setup

### 1. Install Dependencies

```bash
# Install Node dependencies
npm install

# Install Bun (if not installed)
curl -fsSL https://bun.sh/install | bash

# Install Playwright browsers
cd frontend && bunx playwright install
```

### 2. Configure Environment

Create `.dev.vars` (if not exists):
```bash
LINE_CHANNEL_SECRET=your_test_channel_secret
LINE_CHANNEL_ACCESS_TOKEN=your_test_access_token
```

**Note**: For CI, these are injected via GitHub Secrets.

### 3. Start Dev Servers

```bash
# Terminal 1: Backend (Cloudflare Workers)
npm run dev

# Terminal 2: Frontend (Next.js)
cd frontend && npm run dev
```

**Verify**:
- Backend: http://localhost:8787/health → `{"status":"ok"}`
- Frontend: http://localhost:3000 → Redirects to /chat

## Validation Scenarios

### Scenario 1: Admin Page Renders (R1)

**Goal**: Verify admin page renders correctly in dev mode.

**Steps**:
```bash
# Check admin page
curl http://localhost:3000/admin | grep -o "Review Queue"
```

**Expected**: Output contains "Review Queue"

**Alternative** (browser):
1. Open http://localhost:3000/admin
2. Verify sidebar with "NetZero" brand
3. Verify "Review Queue" heading
4. Verify filter tabs (ทั้งหมด, รอดำเนินการ, ยืนยันแล้ว, ปฏิเสธแล้ว)
5. Verify dashboard metrics (total farmers, active plots, pending reviews, verified photos)

**Pass Criteria**: All elements visible, page loads in <2s

### Scenario 2: Lint Errors Fixed (R2)

**Goal**: Verify zero lint errors.

**Steps**:
```bash
bun run check:lint
```

**Expected**: Exit code 0, "Found 0 errors"

**Pass Criteria**: No errors (warnings acceptable)

### Scenario 3: E2E Tests Pass (R3)

**Goal**: Verify all E2E tests pass.

**Steps**:
```bash
# Ensure dev servers running (see Setup step 3)
cd frontend
bunx playwright test
```

**Expected**: 17 tests pass (admin, chat, full-qa, verify-journey, sponsor, mobile-accessibility)

**Pass Criteria**: All tests pass, duration <60s

### Scenario 4: R2 Integration Test (R4)

**Goal**: Verify R2 photo upload/download works.

**Steps**:
```bash
bun test tests/integration/r2.test.ts
```

**Expected**: 3 tests pass (upload, retrieve, cleanup)

**Pass Criteria**:
- Photo uploaded to R2
- Photo retrieved with metadata preserved
- Test data cleaned up

### Scenario 5: Workers AI Integration Test (R5)

**Goal**: Verify Workers AI vision model works.

**Steps**:
```bash
bun test tests/integration/workers-ai.test.ts
```

**Expected**: 3 tests pass (classification, timeout, response shape)

**Pass Criteria**:
- Photo classified successfully
- Timeout handled gracefully (>10s)
- Response shape validated

### Scenario 6: LINE Webhook Integration Test (R6)

**Goal**: Verify LINE webhook signature verification.

**Steps**:
```bash
bun test tests/integration/line-webhook.test.ts
```

**Expected**: 4 tests pass (valid signature, invalid signature, missing signature, malformed JSON)

**Pass Criteria**:
- Valid signature → 200 OK
- Invalid signature → 401 Unauthorized
- Missing signature → 401 Unauthorized
- Malformed JSON → 400 Bad Request

### Scenario 7: CI Pipeline (R7)

**Goal**: Verify CI pipeline runs on every PR.

**Steps**:
1. Create PR to main branch
2. Check GitHub Actions tab
3. Verify 5 jobs run: lint, typecheck, unit, integration, e2e

**Expected**: All jobs pass

**Pass Criteria**:
- Lint: 0 errors
- Typecheck: 0 errors
- Unit tests: 846+ pass
- Integration tests: 10+ pass
- E2E tests: 17 pass

## Full Validation

**Run all checks**:
```bash
# Lint
bun run check:lint

# Typecheck
bun run check:type

# Unit tests
bun run check:test

# Integration tests
bun test tests/integration/

# E2E tests (requires dev servers)
cd frontend && bunx playwright test
```

**Expected**: All checks pass

## Troubleshooting

### Admin page 404

**Symptom**: Admin page shows empty `<main>` with 404 in RSC payload

**Cause**: Missing `/api/admin/dashboard` endpoint

**Fix**: Implement endpoint in `src/admin/dashboard.ts`

### E2E tests timeout

**Symptom**: Playwright tests timeout after 5s

**Cause**: Dev servers not running

**Fix**: Start backend (port 8787) and frontend (port 3000)

### LINE webhook test skipped

**Symptom**: Test outputs "LINE_CHANNEL_SECRET not set, skipping test"

**Cause**: Missing `.dev.vars` or LINE_CHANNEL_SECRET

**Fix**: Add LINE_CHANNEL_SECRET to `.dev.vars`

### Integration tests fail

**Symptom**: R2/AI tests fail with binding errors

**Cause**: Miniflare not configured

**Fix**: Install miniflare, configure in `tests/helpers/miniflare.ts`

## Success Criteria

All 7 requirements validated:
- ✅ R1: Admin page renders
- ✅ R2: 0 lint errors
- ✅ R3: 17 E2E tests pass
- ✅ R4: R2 integration test passes
- ✅ R5: Workers AI integration test passes
- ✅ R6: LINE webhook integration test passes
- ✅ R7: CI pipeline runs on PR

## Next Steps

After validation:
1. Commit changes: `git add -A && git commit -m "feat(qa): fix QA report issues"`
2. Push to branch: `git push origin HEAD`
3. Create PR to main
4. Verify CI passes
5. Merge after review

## References

- **Spec**: [spec.md](./spec.md)
- **Plan**: [plan.md](./plan.md)
- **Research**: [research.md](./research.md)
- **Data Model**: [data-model.md](./data-model.md)
- **Contracts**: [contracts/](./contracts/)
- **QA Report**: [QA-REPORT.md](../../QA-REPORT.md)
