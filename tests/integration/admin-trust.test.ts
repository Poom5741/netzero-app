import { describe, expect, it } from "vitest";
import { reviewPhoto } from "../../src/admin/review";

function mockDB(photo?: Record<string, unknown>, plot?: Record<string, unknown>) {
  const calls: { sql: string; args: unknown[] }[] = [];
  return {
    calls,
    prepare(sql: string) {
      return {
        bind(...args: unknown[]) {
          calls.push({ sql, args });
          return {
            run: async () => ({ success: true }),
            first: async () => {
              if (sql.includes("photo_evidence") && sql.includes("SELECT")) return photo ?? null;
              if (sql.includes("plots")) return plot ?? null;
              if (sql.includes("farmer_trust") && sql.includes("SELECT")) {
                return { total_photos: 5, accepted_photos: 3 };
              }
              return null;
            },
          };
        },
      };
    },
  };
}

describe("Admin review trust integration", () => {
  it("calls updateFarmerTrust on verify", async () => {
    const db = mockDB(
      { id: "photo-1", plot_id: "plot-1", pre_verified: 0, audit_sample: 0 },
      { farmer_id: "farmer-1" },
    );
    const result = await reviewPhoto(db as any, "photo-1", "verified", "");
    expect(result.success).toBe(true);
    // Should have: SELECT photo, SELECT plot, UPDATE photo, SELECT trust, INSERT/UPDATE trust, INSERT audit
    const trustUpdate = db.calls.find((c) => c.sql.includes("farmer_trust"));
    expect(trustUpdate).toBeDefined();
  });

  it("calls updateFarmerTrust on reject", async () => {
    const db = mockDB(
      { id: "photo-1", plot_id: "plot-1", pre_verified: 0, audit_sample: 0 },
      { farmer_id: "farmer-1" },
    );
    const result = await reviewPhoto(db as any, "photo-1", "rejected", "bad photo");
    expect(result.success).toBe(true);
    const trustUpdate = db.calls.find((c) => c.sql.includes("farmer_trust"));
    expect(trustUpdate).toBeDefined();
  });

  it("handles superseded pre-verified photo", async () => {
    const db = mockDB(
      { id: "photo-1", plot_id: "plot-1", pre_verified: 1, audit_sample: 0 },
      { farmer_id: "farmer-1" },
    );
    const result = await reviewPhoto(db as any, "photo-1", "rejected", "override");
    expect(result.success).toBe(true);
    const trustUpdate = db.calls.find((c) => c.sql.includes("farmer_trust"));
    expect(trustUpdate).toBeDefined();
  });
});
