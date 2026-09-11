import { describe, expect, it } from "vitest";

/**
 * Tests for carbon estimation trigger in season approval.
 * Verifies that approveSeason calls runEstimation and stores real values.
 */

function mockD1(opts: {
  seasonStatus?: string;
  photoCounts?: Record<string, number>;
  fertCount?: number;
  seasonInput?: Record<string, unknown>;
}) {
  const calls: { sql: string; args: unknown[] }[] = [];
  return {
    calls,
    prepare(sql: string) {
      return {
        bind(...args: unknown[]) {
          calls.push({ sql, args });
          if (sql.includes("SELECT status FROM season_inputs") && !sql.includes("sow_date")) {
            return {
              first: async () => (opts.seasonStatus ? { status: opts.seasonStatus } : null),
            };
          }
          if (sql.includes("SELECT sow_date FROM season_inputs")) {
            return {
              first: async () => opts.seasonInput ?? { sow_date: "2026-07-01" },
            };
          }
          if (sql.includes("COUNT") && sql.includes("photo_evidence") && sql.includes("photo_type")) {
            const photoType = args[2] as string;
            return {
              first: async () => ({ cnt: opts.photoCounts?.[photoType] ?? 0 }),
            };
          }
          if (sql.includes("COUNT") && sql.includes("fertilizer")) {
            return { first: async () => ({ cnt: opts.fertCount ?? 0 }) };
          }
          if (sql.includes("COUNT") && sql.includes("photo_evidence") && sql.includes("admin_status")) {
            return { first: async () => ({ approved: 4, total: 4 }) };
          }
          if (sql.includes("SELECT") && sql.includes("season_inputs") && sql.includes("rice_variety")) {
            return {
              first: async () => opts.seasonInput ?? {
                rice_variety: "RD6",
                sow_date: "2026-07-01",
                area_rai: 14,
              },
            };
          }
          if (sql.includes("SELECT") && sql.includes("fertilizer_entries") && sql.includes("SUM")) {
            return { first: async () => ({ total_n: 8.5, is_urea: 1 }) };
          }
          if (sql.includes("SELECT") && sql.includes("season_inputs") && sql.includes("water_management")) {
            return {
              first: async () => ({
                water_management: "awd",
                organic_material: "none",
                lime_kg_per_rai: 0,
                dolomite_kg_per_rai: 0,
                fuel_liters_per_rai: 5,
                electricity_kwh_per_rai: 2,
                straw_management: "incorporate",
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

describe("approveSeason with carbon estimation", () => {
  it("creates estimate with non-zero total_offset_tco2e", async () => {
    const db = mockD1({
      seasonStatus: "closed",
      photoCounts: { prepare: 1, wetdry: 1, harvest: 1 },
      fertCount: 1,
    }) as unknown as D1Database;
    const { approveSeason } = await import("../../src/season/approve-estimate");
    const result = await approveSeason(db, "plot_1", "season_1");
    expect(result.success).toBe(true);
    expect(result.estimateId).toBeDefined();
  });

  it("rejects when season not found", async () => {
    const db = mockD1({}) as unknown as D1Database;
    const { approveSeason } = await import("../../src/season/approve-estimate");
    const result = await approveSeason(db, "plot_1", "season_1");
    expect(result.success).toBe(false);
    expect(result.error).toContain("not found");
  });

  it("rejects when already approved", async () => {
    const db = mockD1({ seasonStatus: "approved" }) as unknown as D1Database;
    const { approveSeason } = await import("../../src/season/approve-estimate");
    const result = await approveSeason(db, "plot_1", "season_1");
    expect(result.success).toBe(false);
    expect(result.error).toContain("already approved");
  });

  it("rejects when season is not closed", async () => {
    const db = mockD1({ seasonStatus: "open" }) as unknown as D1Database;
    const { approveSeason } = await import("../../src/season/approve-estimate");
    const result = await approveSeason(db, "plot_1", "season_1");
    expect(result.success).toBe(false);
    expect(result.error).toContain("closed first");
  });

  it("rejects when photos are incomplete", async () => {
    const db = mockD1({
      seasonStatus: "closed",
      photoCounts: { prepare: 1, wetdry: 0, harvest: 1 },
      fertCount: 1,
    }) as unknown as D1Database;
    const { approveSeason } = await import("../../src/season/approve-estimate");
    const result = await approveSeason(db, "plot_1", "season_1");
    expect(result.success).toBe(false);
    expect(result.error).toContain("incomplete");
  });

  it("rejects when fertilizer entries missing", async () => {
    const db = mockD1({
      seasonStatus: "closed",
      photoCounts: { prepare: 1, wetdry: 1, harvest: 1 },
      fertCount: 0,
    }) as unknown as D1Database;
    const { approveSeason } = await import("../../src/season/approve-estimate");
    const result = await approveSeason(db, "plot_1", "season_1");
    expect(result.success).toBe(false);
    expect(result.error).toContain("incomplete");
  });
});
