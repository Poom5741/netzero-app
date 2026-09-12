import { describe, expect, it } from "vitest";

/**
 * Tests for RP-01 to RP-04 chat flow: results display and backfill.
 */

function mockD1(opts: {
  estimate?: {
    total_offset_tco2e: number;
    sf_w: number;
  };
  photoProgress?: { approved: number; total: number };
  backfillCount?: number;
}) {
  const calls: { sql: string; args: unknown[] }[] = [];
  return {
    calls,
    prepare(sql: string) {
      return {
        bind(...args: unknown[]) {
          calls.push({ sql, args });
          if (sql.includes("SELECT") && sql.includes("carbon_estimates") && sql.includes("total_offset")) {
            return {
              first: async () => opts.estimate ?? null,
            };
          }
          if (sql.includes("COUNT") && sql.includes("photo_evidence") && sql.includes("admin_status")) {
            return {
              first: async () => opts.photoProgress ?? { approved: 0, total: 0 },
            };
          }
          if (sql.includes("COUNT") && sql.includes("season_inputs") && sql.includes("status")) {
            return {
              first: async () => ({ cnt: opts.backfillCount ?? 0 }),
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

describe("composeResultsMessage", () => {
  it("composes carbon credit summary", async () => {
    const { composeResultsMessage } = await import("../../src/line/flow-results");
    const msg = composeResultsMessage({
      farmerName: "สมชาย",
      plotName: "แปลงนาหลังบ้าน",
      totalOffset: 9.42,
      sfW: 0.55,
      photoProgress: { approved: 4, total: 4 },
      backfillCount: 2,
      pendingPhotos: 0,
    });
    expect(msg).toContain("9.42");
    expect(msg).toContain("สมชาย");
    expect(msg).toContain("แปลงนาหลังบ้าน");
  });

  it("shows incomplete photo warning when photos missing", async () => {
    const { composeResultsMessage } = await import("../../src/line/flow-results");
    const msg = composeResultsMessage({
      farmerName: "สมชาย",
      plotName: "แปลงทดสอบ",
      totalOffset: 6.1,
      sfW: 0.71,
      photoProgress: { approved: 2, total: 4 },
      backfillCount: 0,
      pendingPhotos: 2,
    });
    expect(msg).toContain("6.1");
    expect(msg).toContain("2");
    expect(msg).toContain("ถ่าย");
  });

  it("shows backfill prompt when seasons missing", async () => {
    const { composeResultsMessage } = await import("../../src/line/flow-results");
    const msg = composeResultsMessage({
      farmerName: "สมชาย",
      plotName: "แปลงทดสอบ",
      totalOffset: 9.42,
      sfW: 0.55,
      photoProgress: { approved: 4, total: 4 },
      backfillCount: 2,
      pendingPhotos: 0,
    });
    expect(msg).toContain("กรอกข้อมูลย้อนหลัง");
    expect(msg).toContain("2");
  });

  it("shows TODO list for pending tasks", async () => {
    const { composeTodoMessage } = await import("../../src/line/flow-results");
    const msg = composeTodoMessage({
      pendingPhotos: 1,
      retakePhotos: 0,
      backfillSeasons: 2,
    });
    expect(msg).toContain("3"); // total items
    expect(msg).toContain("ภาพ");
    expect(msg).toContain("ย้อนหลัง");
  });

  it("shows empty state when no tasks pending", async () => {
    const { composeTodoMessage } = await import("../../src/line/flow-results");
    const msg = composeTodoMessage({
      pendingPhotos: 0,
      retakePhotos: 0,
      backfillSeasons: 0,
    });
    expect(msg).toContain("ไม่มีงานค้าง");
  });
});
