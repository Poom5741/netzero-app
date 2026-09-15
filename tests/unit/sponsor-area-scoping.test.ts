/**
 * Task 11 — Sponsor area-scoping tests
 * Verifies getSponsorSummary, getSponsorFarmers, and getPlotsByProvinceScoped
 * filter data by the sponsor's assigned areas.
 */
import { describe, expect, it } from "vitest";
import {
  getPlotsByProvinceScoped,
  getSponsorAreas,
  getSponsorFarmers,
  getSponsorSummary,
} from "../../src/sponsor/dashboard";

/** D1 mock that returns different rows based on SQL pattern matching. */
function mockD1(responses: Record<string, unknown[]>) {
  return {
    prepare(sql: string) {
      return {
        bind(..._args: unknown[]) {
          return {
            all: async () => {
              for (const [key, rows] of Object.entries(responses)) {
                if (sql.includes(key)) return { results: rows };
              }
              return { results: [] };
            },
            first: async () => {
              for (const [key, rows] of Object.entries(responses)) {
                if (sql.includes(key)) return rows[0] ?? null;
              }
              return null;
            },
          };
        },
      };
    },
  };
}

describe("getSponsorAreas", () => {
  it("returns parsed areas array from users table", async () => {
    const db = mockD1({
      "SELECT areas FROM users": [{ areas: '["สุพรรณบุรี","นครปฐม"]' }],
    }) as unknown as D1Database;
    const areas = await getSponsorAreas(db, "u1");
    expect(areas).toEqual(["สุพรรณบุรี", "นครปฐม"]);
  });

  it("returns null when areas column is null", async () => {
    const db = mockD1({
      "SELECT areas FROM users": [{ areas: null }],
    }) as unknown as D1Database;
    const areas = await getSponsorAreas(db, "u1");
    expect(areas).toBeNull();
  });

  it("returns null when areas is empty array", async () => {
    const db = mockD1({
      "SELECT areas FROM users": [{ areas: "[]" }],
    }) as unknown as D1Database;
    const areas = await getSponsorAreas(db, "u1");
    expect(areas).toBeNull();
  });

  it("returns null when user not found", async () => {
    const db = mockD1({
      "SELECT areas FROM users": [],
    }) as unknown as D1Database;
    const areas = await getSponsorAreas(db, "nonexistent");
    expect(areas).toBeNull();
  });

  it("returns null for invalid JSON", async () => {
    const db = mockD1({
      "SELECT areas FROM users": [{ areas: "not-json" }],
    }) as unknown as D1Database;
    const areas = await getSponsorAreas(db, "u1");
    expect(areas).toBeNull();
  });
});

describe("getSponsorSummary — area-scoped", () => {
  it("returns unscoped data when areas is null", async () => {
    const db = mockD1({
      "SUM(coalesce": [{ total_co2: 50 }],
      "COUNT(DISTINCT p.id)": [{ total_plots: 10 }],
      "si.water_management": [{ water_management: "AWD", cnt: 5 }],
      "COALESCE(SUM(p.area_rai)": [{ total_rai: 100 }],
      total_hh: [{ total_hh: 8 }],
      "COUNT(DISTINCT f.id)": [{ total_farmers: 8 }],
    }) as unknown as D1Database;

    const result = await getSponsorSummary(db, null);
    expect(result.totalCO2Tons).toBe(50);
    expect(result.totalPlots).toBe(10);
    expect(result.totalFarmers).toBe(8);
    expect(result.totalAreaRai).toBe(100);
    expect(result.totalHouseholds).toBe(8);
  });

  it("returns scoped data when areas is provided", async () => {
    const db = mockD1({
      "SUM(coalesce": [{ total_co2: 25 }],
      "COUNT(DISTINCT p.id)": [{ total_plots: 5 }],
      "si.water_management": [{ water_management: "AWD", cnt: 3 }],
      "COALESCE(SUM(p.area_rai)": [{ total_rai: 50 }],
      total_hh: [{ total_hh: 4 }],
      "COUNT(DISTINCT f.id)": [{ total_farmers: 4 }],
    }) as unknown as D1Database;

    const result = await getSponsorSummary(db, ["สุพรรณบุรี"]);
    expect(result.totalCO2Tons).toBe(25);
    expect(result.totalPlots).toBe(5);
    expect(result.totalFarmers).toBe(4);
    expect(result.totalAreaRai).toBe(50);
    expect(result.totalHouseholds).toBe(4);
  });

  it("returns zeros when no data matches areas", async () => {
    const db = mockD1({
      "SUM(coalesce": [{ total_co2: null }],
      "COUNT(DISTINCT p.id)": [{ total_plots: 0 }],
      "COUNT(DISTINCT f.id)": [{ total_farmers: 0 }],
      "si.water_management": [],
      "COALESCE(SUM(p.area_rai)": [{ total_rai: 0 }],
      "COUNT(DISTINCT f.id) as total_hh": [{ total_hh: 0 }],
    }) as unknown as D1Database;

    const result = await getSponsorSummary(db, ["-nonexistent-"]);
    expect(result.totalCO2Tons).toBe(0);
    expect(result.totalPlots).toBe(0);
    expect(result.totalAreaRai).toBe(0);
    expect(result.totalHouseholds).toBe(0);
  });

  it("includes new fields totalAreaRai and totalHouseholds", async () => {
    const db = mockD1({
      "SUM(coalesce": [{ total_co2: 10 }],
      "COUNT(DISTINCT p.id)": [{ total_plots: 2 }],
      "si.water_management": [],
      "COALESCE(SUM(p.area_rai)": [{ total_rai: 30 }],
      total_hh: [{ total_hh: 2 }],
      "COUNT(DISTINCT f.id)": [{ total_farmers: 2 }],
    }) as unknown as D1Database;

    const result = await getSponsorSummary(db);
    expect(result.totalAreaRai).toBe(30);
    expect(result.totalHouseholds).toBe(2);
  });
});

describe("getSponsorFarmers — area-scoped", () => {
  it("returns unscoped farmers when areas is null", async () => {
    const db = mockD1({
      "f.id AS farmer_id": [
        {
          farmer_id: "f1",
          cpa_code: "CPA001",
          province: "เชียงใหม่",
          plot_count: 2,
          total_tco2e: 10,
          verified_photos: 5,
          total_photos: 8,
        },
      ],
    }) as unknown as D1Database;

    const result = await getSponsorFarmers(db, null);
    expect(result).toHaveLength(1);
    expect(result[0]?.farmer_id).toBe("f1");
  });

  it("returns scoped farmers when areas is provided", async () => {
    const db = mockD1({
      "f.id AS farmer_id": [
        {
          farmer_id: "f2",
          cpa_code: "CPA002",
          province: "สุพรรณบุรี",
          plot_count: 1,
          total_tco2e: 5,
          verified_photos: 3,
          total_photos: 4,
        },
      ],
    }) as unknown as D1Database;

    const result = await getSponsorFarmers(db, ["สุพรรณบุรี"]);
    expect(result).toHaveLength(1);
    expect(result[0]?.province).toBe("สุพรรณบุรี");
  });

  it("returns empty array when no farmers match areas", async () => {
    const db = mockD1({
      "f.id AS farmer_id": [],
    }) as unknown as D1Database;

    const result = await getSponsorFarmers(db, ["-none-"]);
    expect(result).toEqual([]);
  });
});

describe("getPlotsByProvinceScoped — area-scoped", () => {
  it("returns plots grouped by province when areas is null", async () => {
    const db = mockD1({
      "plots p": [
        {
          plot_id: "p1",
          plot_code: "P-001",
          area_rai: 10,
          cpa_code: "CPA001",
          province: "เชียงใหม่",
          district: "เมือง",
          total_offset_tco2e: 5,
          latest_season_id: "s1",
          estimate_status: "draft",
        },
      ],
      "GROUP BY plot_id, water_state": [],
      "GROUP BY plot_id, provenance_type": [],
    }) as unknown as D1Database;

    const result = await getPlotsByProvinceScoped(db, null);
    expect(result).toHaveLength(1);
    expect(result[0]?.province).toBe("เชียงใหม่");
    expect(result[0]?.plots).toHaveLength(1);
  });

  it("returns scoped plots when areas is provided", async () => {
    const db = mockD1({
      "plots p": [
        {
          plot_id: "p2",
          plot_code: "SP-001",
          area_rai: 15,
          cpa_code: "CPA002",
          province: "สุพรรณบุรี",
          district: "เมือง",
          total_offset_tco2e: 8,
          latest_season_id: "s1",
          estimate_status: "final",
        },
      ],
      "GROUP BY plot_id, water_state": [],
      "GROUP BY plot_id, provenance_type": [],
    }) as unknown as D1Database;

    const result = await getPlotsByProvinceScoped(db, ["สุพรรณบุรี"]);
    expect(result).toHaveLength(1);
    expect(result[0]?.province).toBe("สุพรรณบุรี");
  });

  it("returns empty when no plots match areas", async () => {
    const db = mockD1({
      "plots p": [],
      "GROUP BY plot_id, water_state": [],
      "GROUP BY plot_id, provenance_type": [],
    }) as unknown as D1Database;

    const result = await getPlotsByProvinceScoped(db, ["-none-"]);
    expect(result).toEqual([]);
  });
});
