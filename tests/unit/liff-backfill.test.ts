import { describe, expect, it } from "vitest";

/**
 * Tests for LIFF backfill page API.
 * Handles historical season data entry (up to 3 years).
 */

describe("composeBackfillPrompt", () => {
  it("composes backfill prompt with season count", async () => {
    const { composeBackfillPrompt } = await import("../../src/liff/backfill-api");
    const msg = composeBackfillPrompt({
      plotName: "แปลงนาหลังบ้าน",
      missingSeasons: 2,
      availableYears: ["2567", "2568"],
    });
    expect(msg).toContain("แปลงนาหลังบ้าน");
    expect(msg).toContain("2");
    expect(msg).toContain("2567");
    expect(msg).toContain("2568");
  });

  it("includes instructions for data needed", async () => {
    const { composeBackfillPrompt } = await import("../../src/liff/backfill-api");
    const msg = composeBackfillPrompt({
      plotName: "แปลงทดสอบ",
      missingSeasons: 1,
      availableYears: ["2568"],
    });
    expect(msg).toContain("ข้อมูลย้อนหลัง");
    expect(msg).toContain("วันหว่าน");
    expect(msg).toContain("การจัดการน้ำ");
  });

  it("shows completion when no seasons missing", async () => {
    const { composeBackfillPrompt } = await import("../../src/liff/backfill-api");
    const msg = composeBackfillPrompt({
      plotName: "แปลงทดสอบ",
      missingSeasons: 0,
      availableYears: [],
    });
    expect(msg).toContain("ครบทุกฤดู");
  });
});

describe("validateBackfillEntry", () => {
  it("rejects when sow_date is missing", async () => {
    const { validateBackfillEntry } = await import("../../src/liff/backfill-api");
    const result = validateBackfillEntry({
      plot_id: "plot_1",
      season_name: "นาปี 2568",
      sow_date: "",
      water_management: "awd",
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain("sow_date");
  });

  it("rejects when water_management is missing", async () => {
    const { validateBackfillEntry } = await import("../../src/liff/backfill-api");
    const result = validateBackfillEntry({
      plot_id: "plot_1",
      season_name: "นาปี 2568",
      sow_date: "2025-07-01",
      water_management: "",
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain("water_management");
  });

  it("accepts valid backfill entry", async () => {
    const { validateBackfillEntry } = await import("../../src/liff/backfill-api");
    const result = validateBackfillEntry({
      plot_id: "plot_1",
      season_name: "นาปี 2568",
      sow_date: "2025-07-01",
      water_management: "awd",
    });
    expect(result.valid).toBe(true);
  });

  it("accepts optional fields", async () => {
    const { validateBackfillEntry } = await import("../../src/liff/backfill-api");
    const result = validateBackfillEntry({
      plot_id: "plot_1",
      season_name: "นาปี 2568",
      sow_date: "2025-07-01",
      water_management: "awd",
      yield_kg_per_rai: 400,
      straw_management: "incorporate",
    });
    expect(result.valid).toBe(true);
  });
});
