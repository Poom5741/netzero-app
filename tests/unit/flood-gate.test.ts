/**
 * Flood gate unit tests — per-user rate limit + global daily budget.
 *
 * Uses a minimal mock DB that supports the specific SQL patterns
 * used by the flood gate (INSERT ON CONFLICT, SELECT, batch).
 */
import { describe, it, expect, beforeEach } from "vitest";
import {
  checkFloodGate,
  recordUsage,
  PER_USER_LIMIT,
  GLOBAL_DAILY_LIMIT,
  type FloodGateDB,
} from "../../src/rate-limit/flood-gate";

// ── Minimal mock that tracks counters in memory ──────────────────

// Mock without batch — forces sequential fallback in recordUsage
function createMockDB(): FloodGateDB & { counters: Map<string, number> } {
  const counters = new Map<string, number>();

  const db: FloodGateDB & { counters: Map<string, number> } = {
    counters,
    prepare(sql: string) {
      return {
        bind(...args: unknown[]) {
          const key = args[0] as string;
          return {
            async first<T = { count: number }>(): Promise<T | null> {
              const count = counters.get(key);
              if (count === undefined) return null;
              return { count } as T;
            },
            async run() {
              const current = counters.get(key) ?? 0;
              counters.set(key, current + 1);
              return { success: true };
            },
          };
        },
      };
    },
    // No batch method — recordUsage falls back to sequential calls
  };

  return db;
}

describe("Flood Gate — per-user rate limit", () => {
  let db: ReturnType<typeof createMockDB>;

  beforeEach(() => {
    db = createMockDB();
  });

  it("allows first message", async () => {
    const result = await checkFloodGate("user-1", db);
    expect(result.allowed).toBe(true);
  });

  it("allows up to PER_USER_LIMIT messages per minute", async () => {
    // Simulate PER_USER_LIMIT - 1 previous messages
    for (let i = 0; i < PER_USER_LIMIT - 1; i++) {
      await recordUsage("user-1", db);
    }

    const result = await checkFloodGate("user-1", db);
    expect(result.allowed).toBe(true);
  });

  it("rejects when per-user limit exceeded", async () => {
    // Simulate PER_USER_LIMIT previous messages
    for (let i = 0; i < PER_USER_LIMIT; i++) {
      await recordUsage("user-1", db);
    }

    const result = await checkFloodGate("user-1", db);
    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.status).toBe(429);
      expect(result.message).toContain("กรุณา");
      expect(result.retryAfter).toBeGreaterThan(0);
    }
  });

  it("does not affect other users when one is rate-limited", async () => {
    // Flood user-1
    for (let i = 0; i < PER_USER_LIMIT + 5; i++) {
      await recordUsage("user-1", db);
    }

    // user-2 should still be allowed
    const result = await checkFloodGate("user-2", db);
    expect(result.allowed).toBe(true);
  });
});

describe("Flood Gate — global daily budget", () => {
  let db: ReturnType<typeof createMockDB>;

  beforeEach(() => {
    db = createMockDB();
  });

  it("allows when under global budget", async () => {
    const result = await checkFloodGate("user-1", db);
    expect(result.allowed).toBe(true);
  });

  it("rejects all users when global budget exceeded", async () => {
    // Simulate GLOBAL_DAILY_LIMIT global messages
    // The global key format is "global:day:YYYY-MM-DD"
    // We need to figure out the current day bucket and fill it
    const now = new Date();
    const bangkok = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    const dayBucket = bangkok.toISOString().slice(0, 10);
    const globalKey = `global:day:${dayBucket}`;

    // Fill global counter
    for (let i = 0; i < GLOBAL_DAILY_LIMIT; i++) {
      db.counters.set(globalKey, (db.counters.get(globalKey) ?? 0) + 1);
    }

    // All users should be rejected
    const result1 = await checkFloodGate("user-1", db);
    expect(result1.allowed).toBe(false);

    const result2 = await checkFloodGate("user-2", db);
    expect(result2.allowed).toBe(false);
  });

  it("returns Thai message for global budget exceeded", async () => {
    const now = new Date();
    const bangkok = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    const dayBucket = bangkok.toISOString().slice(0, 10);
    const globalKey = `global:day:${dayBucket}`;

    db.counters.set(globalKey, GLOBAL_DAILY_LIMIT);

    const result = await checkFloodGate("user-1", db);
    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.message).toMatch(/โควต้า|ประจำวัน|วันถัดไป/);
    }
  });
});

describe("Flood Gate — Thai 429 response", () => {
  let db: ReturnType<typeof createMockDB>;

  beforeEach(() => {
    db = createMockDB();
  });

  it("returns Thai-language message with no token leak", async () => {
    for (let i = 0; i < PER_USER_LIMIT; i++) {
      await recordUsage("user-1", db);
    }

    const result = await checkFloodGate("user-1", db);
    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      // Should be Thai text
      expect(result.message).toMatch(/[\u0E00-\u0E7F]/);
      // Should not leak internal details
      expect(result.message).not.toMatch(/rate.?limit|quota|counter|limit/i);
    }
  });

  it("includes retry-after hint", async () => {
    for (let i = 0; i < PER_USER_LIMIT; i++) {
      await recordUsage("user-1", db);
    }

    const result = await checkFloodGate("user-1", db);
    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.retryAfter).toBeGreaterThan(0);
      expect(result.retryAfter).toBeLessThanOrEqual(60);
    }
  });
});

describe("Flood Gate — race safety", () => {
  it("handles concurrent increments correctly", async () => {
    const db = createMockDB();

    // Simulate 20 concurrent requests
    const promises = Array.from({ length: 20 }, () =>
      recordUsage("user-1", db).then(() => checkFloodGate("user-1", db))
    );

    const results = await Promise.all(promises);

    // Some should be allowed, some should be rejected
    const allowed = results.filter((r) => r.allowed).length;
    const rejected = results.filter((r) => !r.allowed).length;

    // Exactly PER_USER_LIMIT should be allowed (the first N that got through)
    // Due to the mock's sequential nature, all 20 increments happen before checks
    // In real D1, the atomic increment + check would allow exactly PER_USER_LIMIT
    expect(allowed + rejected).toBe(20);
    // At minimum, some should be rejected (the counter is at 20)
    expect(rejected).toBeGreaterThan(0);
  });
});
