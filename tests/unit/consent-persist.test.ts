import { describe, expect, it } from "vitest";

/**
 * Tests for PDPA consent persistence.
 *
 * FINDING-A fix (2026-09-19): recordConsent / hasAllConsents now accept a
 * nullable farmerId and an optional lineUserId, so a brand-new LINE user
 * (with line_links.farmer_id=NULL) can record consents against their
 * line_user_id until phone-confirm resolves a farmer.
 */

function mockD1(
  opts: { consentCount?: number; allConsented?: boolean; consentKey?: "farmer" | "line" } = {},
) {
  const calls: { sql: string; args: unknown[] }[] = [];
  return {
    calls,
    prepare(sql: string) {
      return {
        bind(...args: unknown[]) {
          calls.push({ sql, args });
          if (sql.includes("INSERT INTO consent_log")) {
            return { run: async () => ({ success: true, meta: { changes: 1 } }) };
          }
          if (sql.includes("UPDATE consent_log")) {
            return { run: async () => ({ success: true, meta: { changes: 4 } }) };
          }
          if (sql.includes("COUNT") && sql.includes("consent_log")) {
            // The COUNT query is keyed on either farmer_id or line_user_id.
            const arg = args[0];
            if (opts.consentKey === "line" && typeof arg === "string" && arg.startsWith("U-")) {
              return {
                first: async () => ({
                  cnt: opts.consentCount ?? 0,
                  all_consented: opts.allConsented ? 1 : 0,
                }),
              };
            }
            if (
              opts.consentKey === "farmer" &&
              typeof arg === "string" &&
              arg.startsWith("farmer_")
            ) {
              return {
                first: async () => ({
                  cnt: opts.consentCount ?? 0,
                  all_consented: opts.allConsented ? 1 : 0,
                }),
              };
            }
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
    const db = mockD1() as unknown as D1Database;
    const { recordConsent } = await import("../../src/trust/consent-persist");
    const result = await recordConsent(db, "farmer_1", "pdpa", true);
    expect(result.success).toBe(true);
  });

  it("records multiple consent types", async () => {
    const db = mockD1() as unknown as D1Database;
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
    const db = mockD1() as unknown as D1Database;
    const { recordConsent } = await import("../../src/trust/consent-persist");
    const result = await recordConsent(db, "farmer_1", "invalid_type", true);
    expect(result.success).toBe(false);
    expect(result.error).toContain("consent_type");
  });

  it("rejects when both farmer_id and line_user_id are missing", async () => {
    const db = mockD1() as unknown as D1Database;
    const { recordConsent } = await import("../../src/trust/consent-persist");
    const result = await recordConsent(db, "", "pdpa", true);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/farmer_id|line_user_id/);
  });

  // FINDING-A: brand-new LINE user (farmer_id=null) records by line_user_id.
  it("records by line_user_id when farmer_id is null", async () => {
    const db = mockD1() as unknown as D1Database;
    const { recordConsent } = await import("../../src/trust/consent-persist");
    const result = await recordConsent(db, null, "pdpa", true, "U-lineuser-001");
    expect(result.success).toBe(true);
    const insert = db.calls.find((c) => c.sql.includes("INSERT INTO consent_log"));
    expect(insert).toBeDefined();
    expect(insert!.args[1]).toBeNull(); // farmer_id column
    expect(insert!.args[2]).toBe("U-lineuser-001"); // line_user_id column
  });

  it("records by farmer_id when farmer_id is non-null and line_user_id is null", async () => {
    const db = mockD1() as unknown as D1Database;
    const { recordConsent } = await import("../../src/trust/consent-persist");
    const result = await recordConsent(db, "farmer_1", "pdpa", true, null);
    expect(result.success).toBe(true);
    const insert = db.calls.find((c) => c.sql.includes("INSERT INTO consent_log"));
    expect(insert!.args[1]).toBe("farmer_1");
    expect(insert!.args[2]).toBeNull();
  });
});

describe("hasAllConsents", () => {
  it("returns true when all 4 consents are accepted (farmer_id key)", async () => {
    const db = mockD1({
      consentCount: 4,
      allConsented: true,
      consentKey: "farmer",
    }) as unknown as D1Database;
    const { hasAllConsents } = await import("../../src/trust/consent-persist");
    const result = await hasAllConsents(db, "farmer_1");
    expect(result).toBe(true);
  });

  it("returns false when consents are missing", async () => {
    const db = mockD1({
      consentCount: 2,
      allConsented: false,
      consentKey: "farmer",
    }) as unknown as D1Database;
    const { hasAllConsents } = await import("../../src/trust/consent-persist");
    const result = await hasAllConsents(db, "farmer_1");
    expect(result).toBe(false);
  });

  it("returns false when no consents recorded", async () => {
    const db = mockD1({ consentCount: 0, consentKey: "farmer" }) as unknown as D1Database;
    const { hasAllConsents } = await import("../../src/trust/consent-persist");
    const result = await hasAllConsents(db, "farmer_1");
    expect(result).toBe(false);
  });

  it("returns false when neither farmer_id nor line_user_id is supplied", async () => {
    const db = mockD1() as unknown as D1Database;
    const { hasAllConsents } = await import("../../src/trust/consent-persist");
    const result = await hasAllConsents(db, null, undefined);
    expect(result).toBe(false);
  });

  // FINDING-A: hasAllConsents works against line_user_id for pre-link users.
  it("returns true when all 4 consents are accepted (line_user_id key)", async () => {
    const db = mockD1({
      consentCount: 4,
      allConsented: true,
      consentKey: "line",
    }) as unknown as D1Database;
    const { hasAllConsents } = await import("../../src/trust/consent-persist");
    const result = await hasAllConsents(db, null, "U-lineuser-001");
    expect(result).toBe(true);
    const countCall = db.calls.find(
      (c) => c.sql.includes("COUNT") && c.sql.includes("line_user_id"),
    );
    expect(countCall).toBeDefined();
  });

  it("prefers farmer_id column when farmer_id is supplied", async () => {
    const db = mockD1({
      consentCount: 4,
      allConsented: true,
      consentKey: "farmer",
    }) as unknown as D1Database;
    const { hasAllConsents } = await import("../../src/trust/consent-persist");
    const result = await hasAllConsents(db, "farmer_1", "U-lineuser-001");
    expect(result).toBe(true);
    const countCall = db.calls.find((c) => c.sql.includes("COUNT") && c.sql.includes("farmer_id"));
    expect(countCall).toBeDefined();
  });
});

describe("attachConsentsToFarmer", () => {
  it("returns success:false when inputs are missing", async () => {
    const db = mockD1() as unknown as D1Database;
    const { attachConsentsToFarmer } = await import("../../src/trust/consent-persist");
    expect(await attachConsentsToFarmer(db, "", "farmer_1")).toEqual({
      success: false,
      updated: 0,
    });
    expect(await attachConsentsToFarmer(db, "U-1", "")).toEqual({ success: false, updated: 0 });
  });

  it("runs UPDATE consent_log SET farmer_id = ? WHERE line_user_id = ?", async () => {
    const db = mockD1() as unknown as D1Database;
    const { attachConsentsToFarmer } = await import("../../src/trust/consent-persist");
    const r = await attachConsentsToFarmer(db, "U-lineuser-001", "farmer_1");
    expect(r.success).toBe(true);
    expect(r.updated).toBe(4);
    const upd = db.calls.find((c) => c.sql.startsWith("UPDATE consent_log"));
    expect(upd).toBeDefined();
    expect(upd!.args).toEqual(["farmer_1", "U-lineuser-001"]);
  });
});
