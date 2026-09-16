# Research: Hybrid Test Pyramid

**Date**: 2026-09-16

## D1 Isolation Strategy

**Decision**: Use existing MockDB infrastructure (`tests/helpers/integration.ts:40-173`) with fresh instance per test

**Rationale**: 
- Already implemented and used by 19 existing unit tests
- In-memory Map-based mock, microseconds per test (vs hundreds of ms for wrangler d1)
- Seed helpers already exist: `seedFarmer()`, `seedPlot()`, `seedPhoto()`, etc.
- Aligns with constitution §III YAGNI Extremist — no new infrastructure needed
- Each test creates `new MockDB()` guaranteeing complete isolation

**Implementation approach**:
```typescript
// tests/unit/state-machine.test.ts
import { MockDB, seedFarmer, seedPlot } from "../helpers/integration";

test("welcome -> consent on 'ลงทะเบียน'", async () => {
  const db = new MockDB(); // Fresh instance per test
  const farmer = seedFarmer(db, { phone: "0812345678" });
  
  const result = await handleFlow({
    db,
    state: "welcome",
    text: "ลงทะเบียน",
    userId: "U-test-001",
    linkId: "line-001",
    farmerId: farmer.id,
    token: "test-token",
    apiKey: "test-key"
  });
  
  expect(result.newState).toBe("consent");
});
```

**Alternatives considered**:
1. **wrangler d1 execute --local with temp files**: Real D1 behavior but 100-500ms per test startup, violates YAGNI
2. **Shared DB with reset between tests**: Risk of state leakage if reset fails
3. **D1 remote with test project**: Requires network, slower, costs money

**Verdict**: Existing MockDB is the correct choice — fast, isolated, already tested, no new dependencies.

---

## LINE Message Validation Endpoint

**Decision**: Use `https://api.line.me/v2/bot/message/validate` for Flex Message validation

**Rationale**:
- Official LINE endpoint, free to call
- Catches structural errors that local JSON schema validation might miss
- Validates against current LINE platform rules (which may change)

**Implementation approach**:
```typescript
// test/harness/line-validation.ts
export async function validateMessage(accessToken: string, message: unknown): Promise<void> {
  const response = await fetch("https://api.line.me/v2/bot/message/validate", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ messages: [message] })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`LINE validation failed: ${error.message}`);
  }
}
```

**Alternatives considered**:
1. **Local JSON schema validation**: Faster, no network required, but may miss LINE-specific rules
2. **Mock the validation endpoint**: Fastest, but doesn't catch real validation errors

**Verdict**: Use real LINE validation endpoint for snapshot tests; can add local schema validation as a faster pre-check if needed.

---

## LIFF Adapter Interface

**Decision**: `getProfile()`, `isInClient()`, `getAccessToken()`, `openWindow()`, `closeWindow()`

**Rationale**:
- Covers all LIFF SDK behaviors used in the NetZeroCarbon app
- Fake implementation returns deterministic test data
- Interface matches LINE LIFF SDK v2 types exactly

**Implementation approach**:
```typescript
// src/line/liff-adapter.ts
export interface LiffAdapter {
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
export class RealLiffAdapter implements LiffAdapter {
  constructor(private liff: typeof liff) {}
  
  async getProfile() {
    return await this.liff.getProfile();
  }
  
  isInClient() {
    return this.liff.isInClient();
  }
  
  getAccessToken() {
    return this.liff.getAccessToken();
  }
  
  openWindow(options) {
    this.liff.openWindow(options);
  }
  
  closeWindow() {
    this.liff.closeWindow();
  }
}

// Test implementation
export class FakeLiffAdapter implements LiffAdapter {
  constructor(
    private profile: { userId: string; displayName: string; pictureUrl: string; statusMessage: string },
    private token: string
  ) {}
  
  async getProfile() {
    return this.profile;
  }
  
  isInClient() {
    return true; // Always true in tests
  }
  
  getAccessToken() {
    return this.token;
  }
  
  openWindow(options) {
    // No-op in tests, or log for assertion
    console.log(`[FAKE LIFF] openWindow: ${options.url}`);
  }
  
  closeWindow() {
    // No-op in tests
  }
}
```

**Alternatives considered**:
1. **Mock the entire LIFF SDK**: Tighter coupling to LINE SDK, harder to maintain when SDK updates
2. **Use LINE's official mock**: Not available as a standalone package

**Verdict**: Custom adapter interface with fake implementation provides the right balance of isolation and maintainability.

---

## Test Credential Management

**Decision**: `.env.test` file (gitignored) for local, repository secrets for CI

**Rationale**:
- Standard 12-factor app practice
- No hardcoded secrets in source code
- Different credentials per environment (local, CI, production)
- Aligns with constitution §VI Privacy and Least Privilege

**Implementation approach**:
```bash
# .env.test (gitignored)
LINE_CHANNEL_SECRET=test-secret-xxx
LINE_ACCESS_TOKEN=test-token-xxx
LIFF_ID=test-liff-id-xxx
D1_TEST_DB_PATH=/tmp/netzero-test.db
```

```typescript
// test/harness/config.ts
import { config } from "dotenv";

// Load .env.test only in test mode
if (process.env.NODE_ENV === "test") {
  config({ path: ".env.test" });
}

export const testConfig = {
  lineChannelSecret: process.env.LINE_CHANNEL_SECRET!,
  lineAccessToken: process.env.LINE_ACCESS_TOKEN!,
  liffId: process.env.LIFF_ID!,
};
```

**Alternatives considered**:
1. **Cloudflare KV**: Overkill for test credentials, requires network
2. **Dedicated test config file**: Same as `.env.test` but less standard
3. **Hardcoded test credentials**: Violates constitution, security risk

**Verdict**: `.env.test` with gitignore is the standard, secure approach.

---

## Summary

All unknowns resolved. Ready for Phase 1 design.
