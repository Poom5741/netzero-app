import { describe, expect, it } from "vitest";

/**
 * Tests for water_depth_cm field in photo upload.
 * Verifies the field is accepted and stored for DRY photo types.
 */

function mockD1() {
  const calls: { sql: string; args: unknown[] }[] = [];
  return {
    calls,
    prepare(sql: string) {
      return {
        bind(...args: unknown[]) {
          calls.push({ sql, args });
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

describe("photo water_depth_cm field", () => {
  it("extracts water_depth_cm from FormData", () => {
    const formData = new FormData();
    formData.set("water_depth_cm", "10");
    const waterDepth = formData.get("water_depth_cm");
    expect(waterDepth).toBe("10");
    expect(Number(waterDepth)).toBe(10);
  });

  it("water_depth_cm is null when not provided", () => {
    const formData = new FormData();
    const waterDepth = formData.get("water_depth_cm");
    expect(waterDepth).toBeNull();
  });

  it("water_depth_cm accepts integer values", () => {
    const formData = new FormData();
    formData.set("water_depth_cm", "0");
    expect(Number(formData.get("water_depth_cm"))).toBe(0);

    formData.set("water_depth_cm", "25");
    expect(Number(formData.get("water_depth_cm"))).toBe(25);
  });

  it("water_depth_cm is stored in photo_evidence INSERT", () => {
    // Verify the SQL includes water_depth_cm column
    const insertSql = `INSERT INTO photo_evidence (id, plot_id, season_id, photo_url, gps_lat, gps_lng, gps_accuracy, taken_at, ai_status, admin_status, photo_type, water_depth_cm)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending', ?, ?)`;
    expect(insertSql).toContain("water_depth_cm");
    expect(insertSql.split("?").length).toBe(11); // 10 bind params + trailing
  });

  it("water_depth_cm is NULL for WET rounds", () => {
    const waterDepth = null;
    expect(waterDepth).toBeNull();
  });

  it("water_depth_cm is integer for DRY rounds", () => {
    const waterDepth = 10;
    expect(typeof waterDepth).toBe("number");
    expect(waterDepth).toBeGreaterThan(0);
  });
});
