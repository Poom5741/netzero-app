import { describe, expect, it } from "vitest";
import { approveSeason } from "../../src/season/approve";

function mockD1(opts: { seasonStatus?: string; photoCount?: number; fertCount?: number }) {
  const calls: { sql: string; args: unknown[] }[] = [];
  return {
    calls,
    prepare(sql: string) {
      return {
        bind(...args: unknown[]) {
          calls.push({ sql, args });
          if (sql.includes("SELECT status FROM season_inputs")) {
            return {
              first: async () => (opts.seasonStatus ? { status: opts.seasonStatus } : null),
            };
          }
          if (sql.includes("COUNT") && sql.includes("photo_evidence")) {
            return { first: async () => ({ cnt: opts.photoCount ?? 0 }) };
          }
          if (sql.includes("COUNT") && sql.includes("fertilizer")) {
            return { first: async () => ({ cnt: opts.fertCount ?? 0 }) };
          }
          return { run: async () => ({ success: true }) };
        },
      };
    },
  };
}

describe("approveSeason", () => {
  it("rejects when season not found", async () => {
    const db = mockD1({}) as unknown as D1Database;
    const r = await approveSeason(db, "p1", "s1");
    expect(r.success).toBe(false);
    expect(r.error).toContain("not found");
  });

  it("rejects when already approved", async () => {
    const db = mockD1({ seasonStatus: "approved" }) as unknown as D1Database;
    const r = await approveSeason(db, "p1", "s1");
    expect(r.success).toBe(false);
    expect(r.error).toContain("already approved");
  });

  it("rejects when season is not closed", async () => {
    const db = mockD1({ seasonStatus: "open" }) as unknown as D1Database;
    const r = await approveSeason(db, "p1", "s1");
    expect(r.success).toBe(false);
    expect(r.error).toContain("closed first");
  });

  it("rejects when no verified photos for any type", async () => {
    const db = mockD1({ seasonStatus: "closed", photoCount: 0 }) as unknown as D1Database;
    const r = await approveSeason(db, "p1", "s1");
    expect(r.success).toBe(false);
    expect(r.missing).toContain("prepare photo");
    expect(r.missing).toContain("wetdry photo");
    expect(r.missing).toContain("harvest photo");
  });

  it("rejects when no confirmed fertilizer", async () => {
    const db = mockD1({
      seasonStatus: "closed",
      photoCount: 3,
      fertCount: 0,
    }) as unknown as D1Database;
    const r = await approveSeason(db, "p1", "s1");
    expect(r.success).toBe(false);
    expect(r.missing).toContain("confirmed fertilizer entries");
  });

  it("approves when all conditions met", async () => {
    const mock = mockD1({ seasonStatus: "closed", photoCount: 3, fertCount: 2 });
    const db = mock as unknown as D1Database;
    const r = await approveSeason(db, "p1", "s1");
    expect(r.success).toBe(true);
    expect(r.estimateId).toBeDefined();
    expect(mock.calls.some((c) => c.sql.includes("INSERT INTO carbon_estimates"))).toBe(true);
    expect(
      mock.calls.some((c) => c.sql.includes("UPDATE season_inputs") && c.sql.includes("approved")),
    ).toBe(true);
  });
});
