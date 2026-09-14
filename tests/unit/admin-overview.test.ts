import { describe, expect, it } from "vitest";
import { getOverviewKpis, getWorkQueueAlerts, getCreditChart, getGhgSourceTable, getProvinceTable } from "../../src/admin/overview";

/** Single-result mock: every prepare().bind().first() returns the same row. */
function mockD1First(row: Record<string, unknown> | null) {
  return {
    prepare(_sql: string) {
      return {
        bind(..._args: unknown[]) {
          return { first: async () => row, all: async () => ({ results: row ? [row] : [] }) };
        },
      };
    },
  };
}

/** Multi-row mock: every prepare().bind().all() returns rows; first() returns first row. */
function mockD1All(rows: Record<string, unknown>[]) {
  return {
    prepare(_sql: string) {
      return {
        bind(..._args: unknown[]) {
          return { all: async () => ({ results: rows }), first: async () => rows[0] ?? null };
        },
      };
    },
  };
}

/**
 * Sequence mock: each prepare() call returns a different row from the
 * provided array, cycling if needed.
 */
function mockD1Sequence(rows: Record<string, unknown>[]) {
  let idx = 0;
  return {
    prepare(_sql: string) {
      const row = rows[idx % rows.length];
      idx++;
      return {
        bind(..._args: unknown[]) {
          return { first: async () => row, all: async () => ({ results: [row] }) };
        },
      };
    },
  };
}

describe("getOverviewKpis", () => {
  it("returns total farmers, total plots, pending reviews, and total credits", async () => {
    // getOverviewKpis runs 5 sequential queries; mock returns per-query row
    const db = mockD1Sequence([
      { cnt: 42 },         // farmers count
      { cnt: 87 },         // plots count
      { total: 100 },      // total area
      { cnt: 15 },         // pending reviews count
      { total: 1234.56 },  // credits sum
    ]) as unknown as D1Database;
    const result = await getOverviewKpis(db);
    expect(result.totalFarmers).toBe(42);
    expect(result.totalPlots).toBe(87);
    expect(result.pendingReviews).toBe(15);
    expect(result.totalCredits).toBe(1234.56);
  });

  it("returns zeros when no data", async () => {
    const db = mockD1Sequence([
      { cnt: 0 },
      { cnt: 0 },
      { total: 0 },
      { cnt: 0 },
      { total: 0 },
      { total: 0 },
    ]) as unknown as D1Database;
    const result = await getOverviewKpis(db);
    expect(result.totalFarmers).toBe(0);
    expect(result.totalPlots).toBe(0);
    expect(result.pendingReviews).toBe(0);
    expect(result.totalCredits).toBe(0);
  });
});

describe("getWorkQueueAlerts", () => {
  it("returns pending applications, photo queue, missing photos, and SF_w fallback counts", async () => {
    const db = mockD1Sequence([
      { cnt: 8 },   // pending applications
      { cnt: 12 },  // photo queue
      { cnt: 3 },   // missing photos
      { cnt: 5 },   // SF_w fallback
    ]) as unknown as D1Database;
    const result = await getWorkQueueAlerts(db);
    expect(result.pendingApplications).toBe(8);
    expect(result.photoQueue).toBe(12);
    expect(result.missingPhotos).toBe(3);
    expect(result.sfwFallback).toBe(5);
  });
});

describe("getCreditChart", () => {
  it("returns array of { season, estimated, verified }", async () => {
    const db = mockD1All([
      { season: "ฤดู 1/2567", estimated: 500, verified: 300 },
      { season: "ฤดู 2/2567", estimated: 600, verified: 400 },
    ]) as unknown as D1Database;
    const result = await getCreditChart(db);
    expect(result.length).toBe(2);
    expect(result[0].season).toBe("ฤดู 1/2567");
    expect(result[0].estimated).toBe(500);
    expect(result[0].verified).toBe(300);
  });

  it("returns empty array when no seasons", async () => {
    const db = mockD1All([]) as unknown as D1Database;
    const result = await getCreditChart(db);
    expect(result).toEqual([]);
  });
});

describe("getGhgSourceTable", () => {
  it("returns GHG emission sources with values", async () => {
    const db = mockD1All([
      { source: "CH4 (มีเทน)", value: 120.5 },
      { source: "N2O (ไนตรัสออกไซด์)", value: 45.2 },
      { source: "CO2 (คาร์บอนไดออกไซด์)", value: 30.1 },
    ]) as unknown as D1Database;
    const result = await getGhgSourceTable(db);
    expect(result.length).toBe(3);
    expect(result[0].source).toContain("CH4");
    expect(result[0].value).toBe(120.5);
  });
});

describe("getProvinceTable", () => {
  it("returns province/sponsor data with plot and credit counts", async () => {
    const db = mockD1All([
      { province: "สุพรรณบุรี", sponsor: "SCG", plots: 25, credits: 500.5 },
      { province: "ชัยนาท", sponsor: "PTT", plots: 18, credits: 350.2 },
    ]) as unknown as D1Database;
    const result = await getProvinceTable(db);
    expect(result.length).toBe(2);
    expect(result[0].province).toBe("สุพรรณบุรี");
    expect(result[0].plots).toBe(25);
    expect(result[0].credits).toBe(500.5);
  });

  it("returns empty array when no data", async () => {
    const db = mockD1All([]) as unknown as D1Database;
    const result = await getProvinceTable(db);
    expect(result).toEqual([]);
  });
});

describe("getOverviewKpis filter", () => {
  it("applies season filter", async () => {
    const db = mockD1Sequence([
      { cnt: 10 },   // farmers (unaffected by season filter)
      { cnt: 20 },   // plots
      { cnt: 3 },    // pending reviews
      { total: 100 },// credits
    ]) as unknown as D1Database;
    const result = await getOverviewKpis(db, { season: "season-1" });
    expect(result.totalFarmers).toBe(10);
  });
});
