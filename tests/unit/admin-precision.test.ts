/**
 * Issue #104 — Admin pre-verify precision stat
 * Rolling precision = confirmed audits / total reviewed audits.
 * Also tracks override count (pre-verified items admin rejected).
 */
import { describe, expect, it } from "vitest";
import { getPrecisionStat } from "../../src/admin/precision";

function mockD1(rows: Record<string, unknown>[]) {
  return {
    prepare(_sql: string) {
      return {
        bind(..._args: unknown[]) {
          return { all: async () => ({ results: rows }) };
        },
      };
    },
  };
}

describe("getPrecisionStat", () => {
  it("returns null precision when no audit samples have been reviewed", async () => {
    const db = mockD1([]) as unknown as D1Database;
    const stat = await getPrecisionStat(db);

    expect(stat.auditReviewed).toBe(0);
    expect(stat.overrides).toBe(0);
    expect(stat.precision).toBeNull();
  });

  it("computes precision from audit samples confirmed by admin", async () => {
    // 3 audit samples reviewed: 2 confirmed, 1 overridden
    const db = mockD1([
      { id: "p1", audit_sample: 1, pre_verified: 1, admin_status: "verified", superseded: 0 },
      { id: "p2", audit_sample: 1, pre_verified: 1, admin_status: "verified", superseded: 0 },
      { id: "p3", audit_sample: 1, pre_verified: 1, admin_status: "rejected", superseded: 1 },
    ]) as unknown as D1Database;

    const stat = await getPrecisionStat(db);

    expect(stat.auditReviewed).toBe(3);
    expect(stat.overrides).toBe(1);
    // 2 confirmed out of 3 reviewed → precision = 2/3 ≈ 0.67
    expect(stat.precision).toBeCloseTo(0.67, 2);
  });

  it("counts overrides from pre-verified items rejected by admin (not just audit samples)", async () => {
    // Non-audit pre-verified items that were superseded also count as overrides
    const db = mockD1([
      { id: "p1", audit_sample: 1, pre_verified: 1, admin_status: "verified", superseded: 0 },
      { id: "p2", audit_sample: 0, pre_verified: 0, admin_status: "rejected", superseded: 1 },
    ]) as unknown as D1Database;

    const stat = await getPrecisionStat(db);

    expect(stat.auditReviewed).toBe(1);
    expect(stat.overrides).toBe(1);
  });

  it("precision is 1.0 when all audits confirmed", async () => {
    const db = mockD1([
      { id: "p1", audit_sample: 1, pre_verified: 1, admin_status: "verified", superseded: 0 },
      { id: "p2", audit_sample: 1, pre_verified: 1, admin_status: "verified", superseded: 0 },
    ]) as unknown as D1Database;

    const stat = await getPrecisionStat(db);

    expect(stat.precision).toBe(1);
  });

  it("precision is 0 when all audits overridden", async () => {
    const db = mockD1([
      { id: "p1", audit_sample: 1, pre_verified: 1, admin_status: "rejected", superseded: 1 },
      { id: "p2", audit_sample: 1, pre_verified: 1, admin_status: "rejected", superseded: 1 },
    ]) as unknown as D1Database;

    const stat = await getPrecisionStat(db);

    expect(stat.precision).toBe(0);
  });
});
