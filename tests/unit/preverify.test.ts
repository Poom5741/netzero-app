/**
 * Issue #103 — Pre-Verification stamp + audit sampling + kill switch
 * Unit tests for pre-verification logic.
 */
import { describe, expect, it } from "vitest";
import {
  shouldPreVerify,
  shouldAuditSample,
  applyPreVerification,
  type PreVerifyConfig,
} from "../../src/vision/preverify";

const defaultConfig: PreVerifyConfig = {
  confidenceThreshold: 0.85,
  auditSampleRate: 0.1,
  enabled: true,
};

describe("shouldPreVerify", () => {
  it("returns true when confidence >= threshold and enabled", () => {
    expect(shouldPreVerify(0.9, defaultConfig)).toBe(true);
  });

  it("returns true at exact threshold", () => {
    expect(shouldPreVerify(0.85, defaultConfig)).toBe(true);
  });

  it("returns false when confidence below threshold", () => {
    expect(shouldPreVerify(0.84, defaultConfig)).toBe(false);
  });

  it("returns false when disabled (kill switch)", () => {
    expect(shouldPreVerify(0.95, { ...defaultConfig, enabled: false })).toBe(false);
  });

  it("returns false for invalid photos", () => {
    expect(shouldPreVerify(0.9, defaultConfig, false)).toBe(false);
  });
});

describe("shouldAuditSample", () => {
  it("returns deterministic result for same seed", () => {
    const a = shouldAuditSample("photo-abc", 0.1);
    const b = shouldAuditSample("photo-abc", 0.1);
    expect(a).toBe(b);
  });

  it("returns different results for different photo ids with same rate", () => {
    // With rate=0.5, roughly half should be sampled
    const ids = Array.from({ length: 20 }, (_, i) => `photo-${i}`);
    const sampled = ids.filter((id) => shouldAuditSample(id, 0.5));
    // Should be somewhere around 10 (allow wide margin for hash distribution)
    expect(sampled.length).toBeGreaterThan(2);
    expect(sampled.length).toBeLessThan(18);
  });

  it("returns false for all when rate is 0", () => {
    const ids = Array.from({ length: 10 }, (_, i) => `photo-${i}`);
    const sampled = ids.filter((id) => shouldAuditSample(id, 0));
    expect(sampled.length).toBe(0);
  });

  it("returns true for all when rate is 1", () => {
    const ids = Array.from({ length: 10 }, (_, i) => `photo-${i}`);
    const sampled = ids.filter((id) => shouldAuditSample(id, 1));
    expect(sampled.length).toBe(10);
  });
});

describe("applyPreVerification", () => {
  it("stamps photo as pre-verified when above threshold", async () => {
    const calls: { sql: string; args: unknown[] }[] = [];
    const db = {
      prepare(sql: string) {
        return {
          bind(...args: unknown[]) {
            calls.push({ sql, args });
            if (sql.includes("SELECT")) {
              return { first: async () => ({ id: "photo-1", ai_status: "pass", admin_status: "pending" }) };
            }
            return { run: async () => ({ success: true }) };
          },
        };
      },
    } as unknown as D1Database;

    const result = await applyPreVerification(db, "photo-1", {
      confidence: 0.92,
      water_state: "flooded",
      valid: true,
      reason: "เห็นน้ำขังชัดเจน",
    }, defaultConfig, "photo-1");

    expect(result.stamped).toBe(true);
    expect(result.audit_sample).toBeTypeOf("boolean");
    // Should write pre_verified=1
    const preVerifyCall = calls.find((c) => c.sql.includes("pre_verified"));
    expect(preVerifyCall).toBeDefined();
  });

  it("does not stamp when below threshold", async () => {
    const calls: { sql: string; args: unknown[] }[] = [];
    const db = {
      prepare(sql: string) {
        return {
          bind(...args: unknown[]) {
            calls.push({ sql, args });
            if (sql.includes("SELECT")) {
              return { first: async () => ({ id: "photo-1" }) };
            }
            return { run: async () => ({ success: true }) };
          },
        };
      },
    } as unknown as D1Database;

    const result = await applyPreVerification(db, "photo-1", {
      confidence: 0.5,
      water_state: "flooded",
      valid: true,
      reason: "ไม่ชัดเจน",
    }, defaultConfig, "photo-1");

    expect(result.stamped).toBe(false);
  });

  it("does not stamp when kill switch is off", async () => {
    const db = {
      prepare(_sql: string) {
        return {
          bind(..._args: unknown[]) {
            return {
              first: async () => ({ id: "photo-1" }),
              run: async () => ({ success: true }),
            };
          },
        };
      },
    } as unknown as D1Database;

    const result = await applyPreVerification(db, "photo-1", {
      confidence: 0.95,
      water_state: "flooded",
      valid: true,
      reason: "เห็นน้ำขังชัดเจน",
    }, { ...defaultConfig, enabled: false }, "photo-1");

    expect(result.stamped).toBe(false);
  });
});
