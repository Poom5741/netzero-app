import { describe, expect, it } from "vitest";
import { overrideEstimate } from "../../src/season/override";

function mockD1(prevVersion: number | null) {
  const calls: { sql: string; args: unknown[] }[] = [];
  return {
    calls,
    prepare(sql: string) {
      return {
        bind(...args: unknown[]) {
          calls.push({ sql, args });
          if (sql.includes("SELECT") && sql.includes("version")) {
            return {
              first: async () => (prevVersion !== null ? { version: prevVersion } : null),
            };
          }
          return { run: async () => ({ success: true }) };
        },
      };
    },
  };
}

describe("overrideEstimate", () => {
  it("creates new version when previous exists", async () => {
    const mock = mockD1(1);
    const db = mock as unknown as D1Database;
    const r = await overrideEstimate(db, "p1", "s1", 100, "data correction");

    expect(r.success).toBe(true);
    expect(r.newVersion).toBe(2);
    expect(mock.calls.some((c) => c.sql.includes("superseded"))).toBe(true);
    expect(mock.calls.some((c) => c.sql.includes("INSERT INTO carbon_estimates"))).toBe(true);
  });

  it("rejects when no previous version", async () => {
    const db = mockD1(null) as unknown as D1Database;
    const r = await overrideEstimate(db, "p1", "s1", 100, "reason");
    expect(r.success).toBe(false);
    expect(r.error).toContain("previous estimate");
  });

  it("records override reason", async () => {
    const mock = mockD1(1);
    const db = mock as unknown as D1Database;
    await overrideEstimate(db, "p1", "s1", 100, "admin correction");

    const insertCall = mock.calls.find((c) => c.sql.includes("INSERT INTO carbon_estimates"));
    expect(insertCall?.args).toContain("admin correction");
  });
});
