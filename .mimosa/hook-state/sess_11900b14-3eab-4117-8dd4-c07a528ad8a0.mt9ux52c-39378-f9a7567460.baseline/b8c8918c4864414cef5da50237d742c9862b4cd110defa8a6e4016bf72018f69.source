import { describe, expect, it } from "vitest";
import { getPlotsByProvince } from "../../src/sponsor/dashboard";

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

const PLOT_ROW = {
  plot_id: "plot-1",
  plot_code: "P-001",
  area_rai: 10,
  farmer_name: "Somchai",
  province: "Chiang Mai",
  district: "Mueang",
  total_offset_tco2e: 5.2,
  latest_season_id: "s2024",
  estimate_status: "draft",
};

const PLOT_ROW_2 = {
  plot_id: "plot-2",
  plot_code: "P-002",
  area_rai: 8,
  farmer_name: "Somchai",
  province: "Chiang Mai",
  district: "Mueang",
  total_offset_tco2e: 3.1,
  latest_season_id: "s2024",
  estimate_status: "final",
};

const PLOT_ROW_DIFF_PROVINCE = {
  plot_id: "plot-3",
  plot_code: "P-003",
  area_rai: 15,
  farmer_name: "Wichai",
  province: "Nakhon Pathom",
  district: "Bang Len",
  total_offset_tco2e: 7.8,
  latest_season_id: "s2024",
  estimate_status: "draft",
};

describe("getPlotsByProvince", () => {
  it("returns plots grouped by province", async () => {
    const db = mockD1([PLOT_ROW, PLOT_ROW_2, PLOT_ROW_DIFF_PROVINCE]) as unknown as D1Database;
    const result = await getPlotsByProvince(db);

    expect(result).toHaveLength(2);
    const chiangMai = result.find((g: { province: string }) => g.province === "Chiang Mai");
    expect(chiangMai).toBeDefined();
    expect(chiangMai?.plots).toHaveLength(2);
  });

  it("shows net tCO2e per plot", async () => {
    const db = mockD1([PLOT_ROW]) as unknown as D1Database;
    const result = await getPlotsByProvince(db);

    const plot = result[0]?.plots[0];
    expect(plot?.total_offset_tco2e).toBe(5.2);
    expect(plot?.estimate_status).toBe("draft");
  });

  it("returns empty array when no plots exist", async () => {
    const db = mockD1([]) as unknown as D1Database;
    const result = await getPlotsByProvince(db);

    expect(result).toEqual([]);
  });

  it("includes plot metadata: code, area, farmer, district", async () => {
    const db = mockD1([PLOT_ROW]) as unknown as D1Database;
    const result = await getPlotsByProvince(db);

    const plot = result[0]?.plots[0];
    expect(plot?.plot_code).toBe("P-001");
    expect(plot?.area_rai).toBe(10);
    expect(plot?.farmer_name).toBe("Somchai");
    expect(plot?.district).toBe("Mueang");
  });
});
