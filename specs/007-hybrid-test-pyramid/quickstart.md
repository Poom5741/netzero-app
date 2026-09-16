# Quickstart: Hybrid Test Pyramid Validation

**Date**: 2026-09-16

## Prerequisites

1. Node.js 22+ and bun installed
2. `.env.test` file with test LINE credentials:
   ```
   LINE_CHANNEL_SECRET=test-secret-xxx
   LINE_ACCESS_TOKEN=test-token-xxx
   LIFF_ID=test-liff-id-xxx
   ```
3. Dependencies installed: `bun install`

## Run State-Machine Tests

```bash
# Run all state-machine tests (MockDB isolation per test)
bun test tests/unit/state-machine.test.ts

# Run specific state
bun test tests/unit/state-machine.test.ts --grep "welcome"

# Update snapshots
bun test tests/unit/state-machine.test.ts --update-snapshots
```

**Expected outcome**: 36-54 tests pass in <10 seconds, each with isolated MockDB instance

## Run Message Snapshot Tests

```bash
# Run all snapshot tests
bun test tests/unit/message-snapshot.test.ts

# Validate against LINE endpoint (optional, requires network)
bun test tests/unit/message-snapshot.test.ts --validate-line

# Update snapshots
bun test tests/unit/message-snapshot.test.ts --update
```

**Expected outcome**: All snapshots match golden JSON, LINE validation passes (if enabled)

## Run LIFF Browser Tests

```bash
# Run all LIFF tests (fake adapter)
bun test tests/integration/liff-browser.test.ts

# Run specific page
bun test tests/integration/liff-browser.test.ts --grep "camera"
```

**Expected outcome**: 6 LIFF pages tested in <60 seconds

## Run Real-Device Smoke Tests

1. Open `tests/e2e/smoke-test-checklist.md`
2. Follow 10-15 steps on physical iPhone/Android
3. Check off each step as verified
4. Report any failures

**Expected outcome**: All 10-15 steps pass in <15 minutes

## Verify Test Isolation

```bash
# Run tests in random order (verifies no state leakage)
bun test tests/unit/state-machine.test.ts --shuffle

# Run with only one test at a time (verifies independence)
bun test tests/unit/state-machine.test.ts --maxWorkers=1
```

**Expected outcome**: All tests pass regardless of execution order

## Run Full Test Suite

```bash
# Run all tests
bun test

# Run with coverage
bun test --coverage
```

**Expected outcome**: All existing tests (813+) plus new pyramid tests pass

## Add New Test Fixture

1. Create fixture file in `tests/fixtures/line-events/`:
   ```json
   {
     "id": "consent-002",
     "description": "User rejects consent",
     "initialState": "consent",
     "event": {
       "type": "message",
       "source": { "type": "user", "userId": "U-test-001" },
       "message": { "type": "text", "text": "ไม่ยินยอม" },
       "timestamp": 1234567890
     },
     "signature": "<computed HMAC-SHA256>",
     "expectedState": "consent",
     "expectedReply": {
       "type": "text",
       "text": "กรุณายอมรับเพื่อใช้งานค่ะ"
     }
   }
   ```

2. Compute signature:
   ```bash
   echo -n '<event body JSON>' | openssl dgst -sha256 -hmac '<test channel secret>' -binary | base64
   ```

3. Run test to verify:
   ```bash
   bun test tests/unit/state-machine.test.ts --grep "consent-002"
   ```

## Debugging

### Test fails with "state mismatch"

Check that `initialState` and `expectedState` match actual `ConversationState` values in `src/line/flow.ts:44-63`.

### Test fails with "signature invalid"

Recompute the HMAC-SHA256 signature using the exact event body JSON and test channel secret from `.env.test`.

### MockDB seed fails

Check that seed helpers in `tests/helpers/integration.ts` support the required entity. Add new seed helper if needed.

### LINE validation fails

Check that the Flex Message JSON matches LINE's specification. Use the Flex Message Simulator to debug: https://developers.line.biz/flex-simulator/
