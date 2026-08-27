import { describe, expect, it } from "vitest";
import { closeSeason } from "../../src/season/close";

function mockD1(existing: Record<string, unknown> | null) {
  const calls: { sql: string; args: unknown[] }[] = [];
  return {
    calls,
    prepare(sql: string) {
      return {
        bind(...args: unknown[]) {
          calls.push({ sql, args });
          return {
            first: async () => existing,
            run: async () => ({ changes: existing ? 1 : 0 }),
          };
        },
      };
    },
  };
}

describe("closeSeason", () => {
  it("transitions status from open to closed", async () => {
    const db = mockD1({ status: "open", id: "season-1" }) as unknown as D1Database;
    const result = await closeSeason(db, "season-1");

    expect(result.success).toBe(true);
  });

  it("rejects double-close when already closed", async () => {
    const db = mockD1({ status: "closed", id: "season-1" }) as unknown as D1Database;
    const result = await closeSeason(db, "season-1");

    expect(result.success).toBe(false);
    expect(result.error).toContain("closed");
  });

  it("rejects closing a draft season", async () => {
    const db = mockD1({ status: "draft", id: "season-1" }) as unknown as D1Database;
    const result = await closeSeason(db, "season-1");

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("returns error when season not found", async () => {
    const db = mockD1(null) as unknown as D1Database;
    const result = await closeSeason(db, "missing-season");

    expect(result.success).toBe(false);
    expect(result.error).toContain("not found");
  });
});
