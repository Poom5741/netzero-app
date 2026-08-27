import { describe, expect, it } from "vitest";
import { updateFarmerTrust } from "../../src/trust/farmer-trust";

function mockDB(initialRow?: { total_photos: number; verified_count: number; rejected_count: number }) {
  const calls: { sql: string; args: unknown[] }[] = [];
  let row = initialRow ?? null;
  return {
    calls,
    prepare(sql: string) {
      return {
        bind(...args: unknown[]) {
          calls.push({ sql, args });
          return {
            run: async () => {
              // Simulate the UPDATE by tracking what was set
              return { success: true };
            },
            first: async () => row,
          };
        },
      };
    },
  };
}

describe("updateFarmerTrust", () => {
  it("increments total_photos and verified_count on verified", async () => {
    const db = mockDB({ total_photos: 5, verified_count: 3, rejected_count: 2 });
    await updateFarmerTrust(db as any, "farmer-1", true);
    // Should SELECT then INSERT/UPDATE
    expect(db.calls.length).toBe(2);
    expect(db.calls[1]!.sql).toContain("INSERT INTO farmer_trust");
  });

  it("increments total_photos and rejected_count on rejected", async () => {
    const db = mockDB({ total_photos: 5, verified_count: 3, rejected_count: 2 });
    await updateFarmerTrust(db as any, "farmer-1", false);
    expect(db.calls.length).toBe(2);
    expect(db.calls[1]!.sql).toContain("INSERT INTO farmer_trust");
  });

  it("calculates trust_score with Bayesian smoothing", async () => {
    const db = mockDB({ total_photos: 5, verified_count: 3, rejected_count: 2 });
    await updateFarmerTrust(db as any, "farmer-1", true);
    // After update: total=6, verified=4, trust=(4+1)/(6+2)=5/8=0.625
    const updateCall = db.calls[1]!;
    expect(updateCall.sql).toContain("trust_score");
    // Check the trust score argument (second bind parameter)
    expect(updateCall.args[1]).toBeCloseTo(0.625, 3);
  });

  it("calculates trust_score after rejection", async () => {
    const db = mockDB({ total_photos: 9, verified_count: 7, rejected_count: 2 });
    await updateFarmerTrust(db as any, "farmer-1", false);
    // After update: total=10, verified=7, trust=(7+1)/(10+2)=8/12=0.667
    const updateCall = db.calls[1]!;
    expect(updateCall.sql).toContain("trust_score");
    expect(updateCall.args[1]).toBeCloseTo(0.667, 3);
  });
});
