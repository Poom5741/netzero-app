/**
 * LLM Flood Gate — per-user rate limit + global daily budget circuit breaker.
 *
 * Uses D1 with atomic INSERT ON CONFLICT for race-safe counters.
 * ponytail: ceiling is KV or DO for higher throughput; upgrade when >100 req/s.
 */

export const PER_USER_LIMIT = 10; // messages per minute
export const GLOBAL_DAILY_LIMIT = 500; // messages per day (all users combined)

// Thai-language messages — no internal details leaked
const THAI_USER_LIMIT =
  "ระบบกำลังประมวลผลข้อความจำนวนมาก กรุณารอสักครู่แล้วลองใหม่อีกครั้ง";
const THAI_GLOBAL_LIMIT =
  "ระบบได้ใช้โควต้าประจำวันครบแล้ว กรุณาลองใหม่ในวันถัดไป";

// ── DB interface (minimal, testable) ──────────────────────────────

export interface FloodGateDB {
  prepare(sql: string): {
    bind(...args: unknown[]): {
      first<T>(): Promise<T | null>;
      run(): Promise<{ success: boolean }>;
    };
  };
  batch?(statements: unknown[]): Promise<unknown>;
}

// ── Time helpers ──────────────────────────────────────────────────

/** Bangkok is UTC+7. Returns YYYY-MM-DD in Bangkok time. */
function bangkokDayBucket(now: Date): string {
  const bangkok = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  return bangkok.toISOString().slice(0, 10);
}

/** Returns YYYY-MM-DDTHH:mm in UTC (1-minute fixed window). */
function minuteBucket(now: Date): string {
  return now.toISOString().slice(0, 16);
}

/** Seconds until next midnight Bangkok time. */
function secondsUntilBangkokMidnight(now: Date): number {
  const bangkokNow = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  const utcMidnight = new Date(Date.UTC(
    bangkokNow.getUTCFullYear(),
    bangkokNow.getUTCMonth(),
    bangkokNow.getUTCDate() + 1,
  ));
  // utcMidnight is Bangkok midnight in UTC terms
  return Math.ceil((utcMidnight.getTime() - now.getTime()) / 1000);
}

// ── Types ─────────────────────────────────────────────────────────

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; status: 429; message: string; retryAfter: number };

// ── Core functions ────────────────────────────────────────────────

/**
 * Check whether a user's request should be allowed.
 * Checks global daily budget first, then per-user rate limit.
 */
export async function checkFloodGate(
  userId: string,
  db: FloodGateDB,
  now: Date = new Date(),
): Promise<RateLimitResult> {
  // 1. Global daily budget
  const globalKey = `global:day:${bangkokDayBucket(now)}`;
  const globalRow = await db
    .prepare("SELECT count FROM rate_limits WHERE key = ?")
    .bind(globalKey)
    .first<{ count: number }>();

  if (globalRow && globalRow.count >= GLOBAL_DAILY_LIMIT) {
    return {
      allowed: false,
      status: 429,
      message: THAI_GLOBAL_LIMIT,
      retryAfter: secondsUntilBangkokMidnight(now),
    };
  }

  // 2. Per-user rate limit
  const userKey = `user:${userId}:${minuteBucket(now)}`;
  const userRow = await db
    .prepare("SELECT count FROM rate_limits WHERE key = ?")
    .bind(userKey)
    .first<{ count: number }>();

  if (userRow && userRow.count >= PER_USER_LIMIT) {
    return {
      allowed: false,
      status: 429,
      message: THAI_USER_LIMIT,
      retryAfter: 60,
    };
  }

  return { allowed: true };
}

/**
 * Record one usage event — increments both per-user and global counters atomically.
 * Call this AFTER the request is allowed and processed.
 */
export async function recordUsage(
  userId: string,
  db: FloodGateDB,
  now: Date = new Date(),
): Promise<void> {
  const globalKey = `global:day:${bangkokDayBucket(now)}`;
  const userKey = `user:${userId}:${minuteBucket(now)}`;
  const ts = now.toISOString();

  const upsertSql =
    "INSERT INTO rate_limits (key, count, window_start) VALUES (?, 1, ?) ON CONFLICT(key) DO UPDATE SET count = count + 1";

  if (db.batch) {
    await db.batch([
      db.prepare(upsertSql).bind(globalKey, ts),
      db.prepare(upsertSql).bind(userKey, ts),
    ]);
  } else {
    // Fallback: sequential (still correct, just not atomic as a pair)
    await db.prepare(upsertSql).bind(globalKey, ts).run();
    await db.prepare(upsertSql).bind(userKey, ts).run();
  }
}

/**
 * D1 migration SQL for the rate_limits table.
 * Run once during setup.
 */
export const FLOOD_GATE_MIGRATION = `
CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 1,
  window_start TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON rate_limits(window_start);
`;
