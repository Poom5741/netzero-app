import { describe, expect, it } from "vitest";
import { getFarmerTrust } from "../../src/trust/farmer-trust";

function mockDB(rows: Record<string, unknown>[] = []) {
  const calls: { sql: string; args: unknown[] }[] = [];
  return {
    calls,
    prepare(sql: string) {
      return {
        bind(...args: unknown[]) {
          calls.push({ sql, args });
          return {
            run: async () => ({ success: true }),
            first: async () => rows.shift() ?? null,
          };
        },
      };
    },
  };
}

describe("getFarmerTrust", () => {
  it("returns trust object for existing farmer", async () => {
    const db = mockDB([{ trust_score: 0.75, total_photos: 10, verified_count: 7, rejected_count: 3 }]);
    const trust = await getFarmerTrust(db as any, "farmer-1");
    expect(trust.trust_score).toBe(0.75);
    expect(trust.total_photos).toBe(10);
  });

  it("returns default trust object when no row exists", async () => {
    const db = mockDB(); // no rows
    const trust = await getFarmerTrust(db as any, "farmer-new");
    expect(trust.trust_score).toBe(0.5);
    expect(trust.total_photos).toBe(0);
  });
});
