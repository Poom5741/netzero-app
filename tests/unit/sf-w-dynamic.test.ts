import { describe, expect, it } from "vitest";

/**
 * Tests for dynamic SF_w computation based on photo completeness.
 *
 * Design system rule:
 * - 4 approved photos (WET-1, DRY-1, WET-2, DRY-2) → SF_w = 0.55
 * - Incomplete photos → SF_w = 0.71
 * - No photos → SF_w = 1.0 (no water management benefit)
 */

function mockD1(opts: { approvedPhotos?: number; totalPhotos?: number }) {
  const calls: { sql: string; args: unknown[] }[] = [];
  return {
    calls,
    prepare(sql: string) {
      return {
        bind(...args: unknown[]) {
          calls.push({ sql, args });
          if (sql.includes("COUNT") && sql.includes("photo_evidence")) {
            return {
              first: async () => ({
                approved: opts.approvedPhotos ?? 0,
                total: opts.totalPhotos ?? 0,
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

describe("getSfW", () => {
  it("returns 0.55 when all 4 photos are approved", async () => {
    const db = mockD1({ approvedPhotos: 4, totalPhotos: 4 }) as unknown as D1Database;
    const { getSfW } = await import("../../src/calc/sf-w");
    const sfW = await getSfW(db, "plot_1", "season_1");
    expect(sfW).toBe(0.55);
  });

  it("returns 0.71 when photos are incomplete (1-3 approved)", async () => {
    const db = mockD1({ approvedPhotos: 2, totalPhotos: 3 }) as unknown as D1Database;
    const { getSfW } = await import("../../src/calc/sf-w");
    const sfW = await getSfW(db, "plot_1", "season_1");
    expect(sfW).toBe(0.71);
  });

  it("returns 1.0 when no photos are approved", async () => {
    const db = mockD1({ approvedPhotos: 0, totalPhotos: 0 }) as unknown as D1Database;
    const { getSfW } = await import("../../src/calc/sf-w");
    const sfW = await getSfW(db, "plot_1", "season_1");
    expect(sfW).toBe(1.0);
  });

  it("returns 0.71 when only 1 photo approved", async () => {
    const db = mockD1({ approvedPhotos: 1, totalPhotos: 2 }) as unknown as D1Database;
    const { getSfW } = await import("../../src/calc/sf-w");
    const sfW = await getSfW(db, "plot_1", "season_1");
    expect(sfW).toBe(0.71);
  });

  it("returns 0.55 when 4+ photos approved (edge case)", async () => {
    const db = mockD1({ approvedPhotos: 5, totalPhotos: 6 }) as unknown as D1Database;
    const { getSfW } = await import("../../src/calc/sf-w");
    const sfW = await getSfW(db, "plot_1", "season_1");
    expect(sfW).toBe(0.55);
  });

  it("queries photo_evidence with correct filters", async () => {
    const db = mockD1({ approvedPhotos: 4 }) as unknown as D1Database;
    const { getSfW } = await import("../../src/calc/sf-w");
    await getSfW(db, "plot_1", "season_1");
    expect(db.calls.length).toBeGreaterThan(0);
    const query = db.calls[0].sql;
    expect(query).toContain("photo_evidence");
    expect(query).toContain("admin_status");
    expect(query).toContain("plot_id");
    expect(query).toContain("season_id");
  });
});

describe("SF_W constants", () => {
  it("exports correct SF_W values", async () => {
    const { SF_W } = await import("../../src/calc/sf-w");
    expect(SF_W.full).toBe(0.55);
    expect(SF_W.incomplete).toBe(0.71);
    expect(SF_W.none).toBe(1.0);
  });
});
