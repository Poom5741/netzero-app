import { describe, expect, it } from "vitest";
import { seasonSummary } from "../../src/season/summary";

function mockD1(rows: Record<string, unknown>[]) {
  return {
    prepare(_sql: string) {
      return {
        bind(..._args: unknown[]) {
          return {
            first: async () => rows[0] ?? null,
            all: async () => ({ results: rows }),
          };
        },
      };
    },
  };
}

const SUMMARY_ROW = {
  water_pre_plant: "flooded",
  water_management: "alternate wetting and drying",
  fuel_liters_per_rai: 2.5,
  fuel_type: "diesel",
  electricity_kwh_per_rai: 15.0,
  straw_management: "incorporated",
  yield_kg_per_rai: 450,
  harvest_fuel_liters: 3.0,
  harvest_electricity_kwh: 20.0,
  status: "open",
  plot_id: "plot-1",
  season_id: "season-2024",
};

describe("seasonSummary", () => {
  it("returns water fields from season_inputs", async () => {
    const db = mockD1([SUMMARY_ROW]) as unknown as D1Database;
    const result = await seasonSummary(db, "season-2024", "plot-1");
    expect(result).not.toBeNull();
    expect(result?.water_pre_plant).toBe("flooded");
    expect(result?.water_management).toBe("alternate wetting and drying");
  });

  it("returns fuel values", async () => {
    const db = mockD1([SUMMARY_ROW]) as unknown as D1Database;
    const result = await seasonSummary(db, "season-2024", "plot-1");
    expect(result?.fuel_liters_per_rai).toBe(2.5);
    expect(result?.fuel_type).toBe("diesel");
    expect(result?.harvest_fuel_liters).toBe(3.0);
  });

  it("returns electricity value", async () => {
    const db = mockD1([SUMMARY_ROW]) as unknown as D1Database;
    const result = await seasonSummary(db, "season-2024", "plot-1");
    expect(result?.electricity_kwh_per_rai).toBe(15.0);
    expect(result?.harvest_electricity_kwh).toBe(20.0);
  });

  it("returns straw and yield", async () => {
    const db = mockD1([SUMMARY_ROW]) as unknown as D1Database;
    const result = await seasonSummary(db, "season-2024", "plot-1");
    expect(result?.straw_management).toBe("incorporated");
    expect(result?.yield_kg_per_rai).toBe(450);
  });

  it("returns null when no season input exists", async () => {
    const db = mockD1([]) as unknown as D1Database;
    const result = await seasonSummary(db, "missing-season", "plot-1");
    expect(result).toBeNull();
  });
});
