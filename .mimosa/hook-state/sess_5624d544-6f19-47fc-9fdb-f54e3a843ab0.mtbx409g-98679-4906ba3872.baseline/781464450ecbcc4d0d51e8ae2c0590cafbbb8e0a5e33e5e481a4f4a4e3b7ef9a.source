/**
 * Issue #103 — Admin queue filtering for two-tier world
 * Auto-stamped (pre_verified, not audit_sample) photos should be absent from queue.
 * Audit-sampled photos appear with audit badge.
 */
import { describe, expect, it } from "vitest";
import { getReviewQueue } from "../../src/admin/queue";

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

const FLAGGED = {
  id: "photo-1",
  plot_id: "plot-1",
  ai_status: "flag",
  ai_label: "uncertain",
  ai_reason: "blurry image",
  ai_confidence: 0.45,
  admin_status: "pending",
  photo_type: "wetdry",
  pre_verified: 0,
  audit_sample: 0,
  water_state: null,
};

const PRE_VERIFIED_NO_AUDIT = {
  id: "photo-2",
  plot_id: "plot-2",
  ai_status: "pass",
  ai_label: "flooded",
  ai_reason: "เห็นน้ำขังชัดเจน",
  ai_confidence: 0.95,
  admin_status: "pending",
  photo_type: "wetdry",
  pre_verified: 1,
  audit_sample: 0,
  water_state: "flooded",
};

const PRE_VERIFIED_AUDIT = {
  id: "photo-3",
  plot_id: "plot-3",
  ai_status: "pass",
  ai_label: "dry",
  ai_reason: "เห็นท่อชัดเจน — น้ำแห้ง",
  ai_confidence: 0.92,
  admin_status: "pending",
  photo_type: "wetdry",
  pre_verified: 1,
  audit_sample: 1,
  water_state: "dry",
};

const PENDING_PREPARE = {
  id: "photo-4",
  plot_id: "plot-4",
  ai_status: "pending",
  ai_label: null,
  ai_reason: null,
  ai_confidence: null,
  admin_status: "pending",
  photo_type: "prepare",
  pre_verified: 0,
  audit_sample: 0,
  water_state: null,
};

describe("getReviewQueue — two-tier filtering", () => {
  it("excludes auto-stamped photos that are not audit samples", async () => {
    const db = mockD1([FLAGGED, PRE_VERIFIED_NO_AUDIT, PRE_VERIFIED_AUDIT, PENDING_PREPARE]) as unknown as D1Database;
    const result = await getReviewQueue(db, {});

    const ids = result.map((r) => r.id);
    expect(ids).not.toContain("photo-2"); // pre-verified, not audit → excluded
    expect(ids).toContain("photo-1"); // flagged → included
    expect(ids).toContain("photo-3"); // audit sample → included
    expect(ids).toContain("photo-4"); // pending prepare → included
  });

  it("includes audit-sampled items with audit badge info", async () => {
    const db = mockD1([PRE_VERIFIED_AUDIT]) as unknown as D1Database;
    const result = await getReviewQueue(db, {});

    expect(result.length).toBe(1);
    expect(result[0]?.audit_sample).toBe(1);
  });

  it("returns empty when only auto-stamped photos exist", async () => {
    const db = mockD1([PRE_VERIFIED_NO_AUDIT]) as unknown as D1Database;
    const result = await getReviewQueue(db, {});

    expect(result.length).toBe(0);
  });
});
