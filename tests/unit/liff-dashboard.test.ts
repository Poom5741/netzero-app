import { describe, expect, it } from "vitest";

/**
 * Tests for LIFF Farmer Dashboard API.
 * Shows carbon credits, photo progress, and pending tasks.
 */

function mockD1(opts: {
  estimate?: { total_offset_tco2e: number; sf_w: number };
  photoProgress?: { approved: number; total: number };
  pendingPhotos?: number;
  backfillCount?: number;
  farmer?: { id: string; full_name: string };
  plot?: { id: string; plot_code: string; area_rai: number };
  seasonInput?: { rice_variety: string; sow_date: string };
}) {
  const calls: { sql: string; args: unknown[] }[] = [];
  return {
    calls,
    prepare(sql: string) {
      return {
        bind(...args: unknown[]) {
          calls.push({ sql, args });
          if (sql.includes("carbon_estimates") && sql.includes("total_offset")) {
            return { first: async () => opts.estimate ?? null };
          }
          if (sql.includes("COUNT") && sql.includes("photo_evidence") && sql.includes("admin_status")) {
            return { first: async () => opts.photoProgress ?? { approved: 0, total: 0 } };
          }
          if (sql.includes("photo_evidence") && sql.includes("status = 'pending'")) {
            return { first: async () => ({ cnt: opts.pendingPhotos ?? 0 }) };
          }
          if (sql.includes("season_inputs") && sql.includes("status != 'approved'")) {
            return { first: async () => ({ cnt: opts.backfillCount ?? 0 }) };
          }
          if (sql.includes("SELECT") && sql.includes("farmers")) {
            return { first: async () => opts.farmer ?? null };
          }
          if (sql.includes("SELECT") && sql.includes("plots")) {
            return { first: async () => opts.plot ?? null };
          }
          if (sql.includes("season_inputs") && sql.includes("rice_variety")) {
            return { first: async () => opts.seasonInput ?? null };
          }
          return { run: async () => ({ success: true }), first: async () => null, all: async () => ({ results: [] }) };
        },
      };
    },
  };
}

describe("composeDashboardMessage", () => {
  it("composes dashboard with carbon credits", async () => {
    const { composeDashboardMessage } = await import("../../src/liff/dashboard-api");
    const msg = composeDashboardMessage({
      farmerName: "สมชาย",
      plotCode: "SPB-0142",
      plotName: "แปลงนาหลังบ้าน",
      areaRai: 14.0,
      totalOffset: 9.42,
      sfW: 0.55,
      photoProgress: { approved: 4, total: 4 },
      pendingPhotos: 0,
      backfillCount: 0,
    });
    expect(msg).toContain("9.42");
    expect(msg).toContain("SPB-0142");
    expect(msg).toContain("สมชาย");
    expect(msg).toContain("14");
  });

  it("shows incomplete photo warning", async () => {
    const { composeDashboardMessage } = await import("../../src/liff/dashboard-api");
    const msg = composeDashboardMessage({
      farmerName: "สมชาย",
      plotCode: "SPB-0142",
      plotName: "แปลงทดสอบ",
      areaRai: 10.0,
      totalOffset: 6.1,
      sfW: 0.71,
      photoProgress: { approved: 2, total: 4 },
      pendingPhotos: 2,
      backfillCount: 0,
    });
    expect(msg).toContain("2/4");
    expect(msg).toContain("2");
  });

  it("shows backfill prompt", async () => {
    const { composeDashboardMessage } = await import("../../src/liff/dashboard-api");
    const msg = composeDashboardMessage({
      farmerName: "สมชาย",
      plotCode: "SPB-0142",
      plotName: "แปลงทดสอบ",
      areaRai: 10.0,
      totalOffset: 9.42,
      sfW: 0.55,
      photoProgress: { approved: 4, total: 4 },
      pendingPhotos: 0,
      backfillCount: 2,
    });
    expect(msg).toContain("กรอกข้อมูลย้อนหลัง");
    expect(msg).toContain("2");
  });

  it("shows no tasks when everything complete", async () => {
    const { composeDashboardMessage } = await import("../../src/liff/dashboard-api");
    const msg = composeDashboardMessage({
      farmerName: "สมชาย",
      plotCode: "SPB-0142",
      plotName: "แปลงทดสอบ",
      areaRai: 10.0,
      totalOffset: 9.42,
      sfW: 0.55,
      photoProgress: { approved: 4, total: 4 },
      pendingPhotos: 0,
      backfillCount: 0,
    });
    expect(msg).toContain("ครบทุกรายการ");
  });
});
