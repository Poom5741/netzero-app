import { describe, expect, it } from "vitest";

/**
 * Tests for PDPA consent persistence.
 * Verifies consent recording and checking logic.
 */

function mockD1(opts: { consentCount?: number; allConsented?: boolean }) {
  const calls: { sql: string; args: unknown[] }[] = [];
  return {
    calls,
    prepare(sql: string) {
      return {
        bind(...args: unknown[]) {
          calls.push({ sql, args });
          if (sql.includes("INSERT INTO consent_log")) {
            return {
              run: async () => ({ success: true }),
            };
          }
          if (sql.includes("COUNT") && sql.includes("consent_log")) {
            return {
              first: async () => ({
                cnt: opts.consentCount ?? 0,
                all_consented: opts.allConsented ? 1 : 0,
              }),
            };
          }
          return {
            run: async () => ({ success: true }),
            first: async () => null,
            all: async () => ({ results: [] }),
          };
        },
      };
    },
  };
}

describe("recordConsent", () => {
  it("records a single consent type", async () => {
    const db = mockD1({}) as unknown as D1Database;
    const { recordConsent } = await import("../../src/trust/consent-persist");
    const result = await recordConsent(db, "farmer_1", "pdpa", true);
    expect(result.success).toBe(true);
  });

  it("records multiple consent types", async () => {
    const db = mockD1({}) as unknown as D1Database;
    const { recordConsent } = await import("../../src/trust/consent-persist");
    const r1 = await recordConsent(db, "farmer_1", "pdpa", true);
    const r2 = await recordConsent(db, "farmer_1", "data_collection", true);
    const r3 = await recordConsent(db, "farmer_1", "photo_sharing", true);
    const r4 = await recordConsent(db, "farmer_1", "carbon_project", true);
    expect(r1.success).toBe(true);
    expect(r2.success).toBe(true);
    expect(r3.success).toBe(true);
    expect(r4.success).toBe(true);
  });

  it("rejects invalid consent type", async () => {
    const db = mockD1({}) as unknown as D1Database;
    const { recordConsent } = await import("../../src/trust/consent-persist");
    const result = await recordConsent(db, "farmer_1", "invalid_type", true);
    expect(result.success).toBe(false);
    expect(result.error).toContain("consent_type");
  });

  it("rejects missing farmer_id", async () => {
    const db = mockD1({}) as unknown as D1Database;
    const { recordConsent } = await import("../../src/trust/consent-persist");
    const result = await recordConsent(db, "", "pdpa", true);
    expect(result.success).toBe(false);
    expect(result.error).toContain("farmer_id");
  });
});

describe("hasAllConsents", () => {
  it("returns true when all 4 consents are accepted", async () => {
    const db = mockD1({ consentCount: 4, allConsented: true }) as unknown as D1Database;
    const { hasAllConsents } = await import("../../src/trust/consent-persist");
    const result = await hasAllConsents(db, "farmer_1");
    expect(result).toBe(true);
  });

  it("returns false when consents are missing", async () => {
    const db = mockD1({ consentCount: 2, allConsented: false }) as unknown as D1Database;
    const { hasAllConsents } = await import("../../src/trust/consent-persist");
    const result = await hasAllConsents(db, "farmer_1");
    expect(result).toBe(false);
  });

  it("returns false when no consents recorded", async () => {
    const db = mockD1({ consentCount: 0 }) as unknown as D1Database;
    const { hasAllConsents } = await import("../../src/trust/consent-persist");
    const result = await hasAllConsents(db, "farmer_1");
    expect(result).toBe(false);
  });
});
