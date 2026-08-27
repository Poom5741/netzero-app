import { describe, it, expect } from "vitest";
import {
  formatWithCommas,
  formatTons,
  formatUSD,
  generateExportCSV,
  getFallbackData,
  type PlotSummary,
  type ProvinceGroup,
} from "../sponsor";

// ─── Pure helper tests ───

describe("formatWithCommas", () => {
  it("formats zero", () => {
    expect(formatWithCommas(0)).toBe("0");
  });

  it("formats small numbers without commas", () => {
    expect(formatWithCommas(999)).toBe("999");
  });

  it("formats numbers with comma separators", () => {
    expect(formatWithCommas(1234)).toBe("1,234");
  });

  it("formats large numbers correctly", () => {
    expect(formatWithCommas(14520)).toBe("14,520");
  });

  it("formats very large numbers", () => {
    expect(formatWithCommas(850000)).toBe("850,000");
  });
});

describe("formatTons", () => {
  it("formats integer tons", () => {
    expect(formatTons(14520)).toBe("14,520");
  });

  it("formats decimal tons to 2 decimal places", () => {
    expect(formatTons(14520.456)).toBe("14,520.46");
  });

  it("formats zero", () => {
    expect(formatTons(0)).toBe("0");
  });
});

describe("formatUSD", () => {
  it("formats USD with dollar sign", () => {
    expect(formatUSD(850000)).toBe("$850,000");
  });

  it("formats small amounts", () => {
    expect(formatUSD(100)).toBe("$100");
  });

  it("formats zero", () => {
    expect(formatUSD(0)).toBe("$0");
  });
});

// ─── CSV export tests ───

describe("generateExportCSV", () => {
  const sampleGroups: ProvinceGroup[] = [
    {
      province: "พระนครศรีอยุธยา",
      plots: [
        {
          plot_id: "1",
          plot_code: "AY-001",
          area_rai: 15,
          farmer_name: "สมชาย วงศ์สุข",
          province: "พระนครศรีอยุธยา",
          district: "พระนครศรีอยุธยา",
          total_offset_tco2e: 12.5,
          latest_season_id: "S1",
          estimate_status: "verified",
        },
        {
          plot_id: "2",
          plot_code: "AY-042",
          area_rai: 20,
          farmer_name: "พิชัย ชาญดี",
          province: "พระนครศรีอยุธยา",
          district: "บางปะอิน",
          total_offset_tco2e: 8.3,
          latest_season_id: "S1",
          estimate_status: "pending",
        },
      ],
    },
    {
      province: "สุพรรณบุรี",
      plots: [
        {
          plot_id: "3",
          plot_code: "SP-112",
          area_rai: 25,
          farmer_name: "มนตรี บุญศรี",
          province: "สุพรรณบุรี",
          district: "สุพรรณบุรี",
          total_offset_tco2e: 14.5,
          latest_season_id: "S1",
          estimate_status: "verified",
        },
      ],
    },
  ];

  it("returns a CSV string with header row", () => {
    const csv = generateExportCSV(sampleGroups);
    const lines = csv.split("\n");
    expect(lines[0]).toContain("plot_code");
    expect(lines[0]).toContain("province");
    expect(lines[0]).toContain("total_offset_tco2e");
  });

  it("includes all plots across all provinces", () => {
    const csv = generateExportCSV(sampleGroups);
    const lines = csv.split("\n").filter((l) => l.trim().length > 0);
    // 1 header + 3 data rows
    expect(lines.length).toBe(4);
  });

  it("handles empty groups", () => {
    const csv = generateExportCSV([]);
    const lines = csv.split("\n");
    // 1 header only
    expect(lines.length).toBe(1);
  });
});

// ─── Fallback data tests ───

describe("getFallbackData", () => {
  it("returns ProvinceGroup[] with provinces and plots", () => {
    const data = getFallbackData();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    data.forEach((group) => {
      expect(group.province).toBeTruthy();
      expect(group.plots.length).toBeGreaterThan(0);
    });
  });

  it("fallback data contains all expected fields", () => {
    const data = getFallbackData();
    data.forEach((group) => {
      expect(group.province).toBeDefined();
      group.plots.forEach((plot) => {
        expect(plot.plot_id).toBeDefined();
        expect(plot.plot_code).toBeDefined();
        expect(plot.farmer_name).toBeDefined();
        expect(plot.province).toBe(group.province);
        expect(typeof plot.total_offset_tco2e).toBe("number");
      });
    });
  });
});
