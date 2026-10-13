import { describe, expect, it } from "vitest";
import { getSponsorFarmers, getSponsorSummary } from "../../src/sponsor/dashboard";

/**
 * Minimal D1 mock that returns configured rows based on SQL content hints.
 * Each key in `responses` is a SQL substring match; value is the rows array.
 */
function mockD1(responses: Record<string, Record<string, unknown>[]>) {
  return {
    prepare(sql: string) {
      return {
        bind(..._args: unknown[]) {
          // Find matching response by checking if any key is a substring of the SQL
          const matchKey = Object.keys(responses).find((k) => sql.includes(k));
          const rows = (matchKey ? responses[matchKey] : []) as Record<string, unknown>[];
          return {
            all: async () => ({ results: rows }),
            first: async () => rows[0] ?? null,
          };
        },
      };
    },
  };
}

describe("getSponsorSummary", () => {
  it("returns computed totals from carbon_estimates", async () => {
    const db = mockD1({
      "SUM(coalesce": [{ total_co2: 25.5 }],
      "COUNT(DISTINCT p.id)": [{ total_plots: 3 }],
      "COUNT(DISTINCT f.id)": [{ total_farmers: 2 }],
      water_management: [
        { water_management: "AWD", cnt: 5 },
        { water_management: "Biochar", cnt: 2 },
        { water_management: null, cnt: 1 },
      ],
    }) as unknown as D1Database;

    const result = await getSponsorSummary(db);
    expect(result.totalCO2Tons).toBe(25.5);
    expect(result.totalPlots).toBe(3);
    expect(result.totalFarmers).toBe(2);
    expect(result.paymentEstimateUSD).toBe(25.5 * 200);
  });

  it("returns zeros when no data exists", async () => {
    const db = mockD1({
      "SUM(coalesce": [{ total_co2: null }],
      "COUNT(DISTINCT p.id)": [{ total_plots: 0 }],
      "COUNT(DISTINCT f.id)": [{ total_farmers: 0 }],
      water_management: [],
    }) as unknown as D1Database;

    const result = await getSponsorSummary(db);
    expect(result.totalCO2Tons).toBe(0);
    expect(result.totalPlots).toBe(0);
    expect(result.totalFarmers).toBe(0);
    expect(result.paymentEstimateUSD).toBe(0);
  });

  it("computes methodology breakdown percentages", async () => {
    const db = mockD1({
      "SUM(coalesce": [{ total_co2: 100 }],
      "COUNT(DISTINCT p.id)": [{ total_plots: 10 }],
      "COUNT(DISTINCT f.id)": [{ total_farmers: 5 }],
      water_management: [
        { water_management: "AWD", cnt: 6 },
        { water_management: "Biochar", cnt: 3 },
        { water_management: "Fertilization", cnt: 1 },
      ],
    }) as unknown as D1Database;

    const result = await getSponsorSummary(db);
    expect(result.methodologyBreakdown).toEqual({
      awd: 60,
      biochar: 30,
      fertilization: 10,
    });
  });

  it("handles empty methodology breakdown", async () => {
    const db = mockD1({
      "SUM(coalesce": [{ total_co2: 50 }],
      "COUNT(DISTINCT p.id)": [{ total_plots: 5 }],
      "COUNT(DISTINCT f.id)": [{ total_farmers: 3 }],
      water_management: [],
    }) as unknown as D1Database;

    const result = await getSponsorSummary(db);
    expect(result.methodologyBreakdown).toEqual({
      awd: 0,
      biochar: 0,
      fertilization: 0,
    });
  });

  // Regression (specs/018-sponsor-csv-farmer-count, FR-1): totalFarmers must be
  // plot-scoped like getSponsorFarmers/totalHouseholds, so the EX-2042 CSV
  // จำนวนเกษตรกร reconciles with the sponsor farmers list. A farmer registered
  // in an assigned province but with no plots is NOT in the sponsor's farmer
  // population. Before the fix the count query had no plot join, so only the
  // plot-joined population below answered with 1 and this test failed with 0.
  it("counts farmers plot-scoped: plotless in-scope farmer excluded (EX-2042 reconciliation)", async () => {
    const db = mockD1({
      "FROM farmers f JOIN plots p ON p.farmer_id = f.id": [{ total_farmers: 1 }],
      "COUNT(DISTINCT p.id)": [{ total_plots: 1 }],
      "SUM(coalesce": [{ total_co2: 0 }],
      water_management: [],
    }) as unknown as D1Database;

    const result = await getSponsorSummary(db, ["สุพรรณบุรี"]);
    expect(result.totalFarmers).toBe(1);
  });
});

describe("getSponsorFarmers", () => {
  it("returns per-farmer aggregation", async () => {
    const db = mockD1({
      "f.id AS farmer_id": [
        {
          farmer_id: "f1",
          cpa_code: "CPA001",
          province: "เชียงใหม่",
          plot_count: 2,
          total_tco2e: 15.5,
          verified_photos: 8,
          total_photos: 10,
        },
        {
          farmer_id: "f2",
          cpa_code: "CPA002",
          province: "เชียงราย",
          plot_count: 1,
          total_tco2e: 7.2,
          verified_photos: 3,
          total_photos: 5,
        },
      ],
    }) as unknown as D1Database;

    const result = await getSponsorFarmers(db);
    expect(result).toHaveLength(2);
    expect(result[0]?.farmer_id).toBe("f1");
    expect(result[0]?.cpa_code).toBe("CPA001");
    expect(result[0]?.plotCount).toBe(2);
    expect(result[0]?.totalTCO2e).toBe(15.5);
    expect(result[0]?.progressPercent).toBe(80); // 8/10 * 100
  });

  it("returns empty array when no farmers", async () => {
    const db = mockD1({
      "f.id AS farmer_id": [],
    }) as unknown as D1Database;

    const result = await getSponsorFarmers(db);
    expect(result).toEqual([]);
  });

  it("handles zero photos without division error", async () => {
    const db = mockD1({
      "f.id AS farmer_id": [
        {
          farmer_id: "f1",
          cpa_code: "CPA-TEST",
          province: "เชียงใหม่",
          plot_count: 1,
          total_tco2e: 5.0,
          verified_photos: 0,
          total_photos: 0,
        },
      ],
    }) as unknown as D1Database;

    const result = await getSponsorFarmers(db);
    expect(result[0]?.progressPercent).toBe(0);
  });
});
