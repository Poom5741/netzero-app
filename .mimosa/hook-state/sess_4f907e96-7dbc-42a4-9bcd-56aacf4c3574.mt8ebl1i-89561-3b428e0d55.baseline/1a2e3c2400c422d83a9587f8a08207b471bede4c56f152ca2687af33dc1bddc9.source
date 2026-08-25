import { describe, expect, it } from "vitest";
import { checkQuota, recordAiEvent } from "../../src/chat/quota";

function mockDB() {
  const calls: { sql: string; args: unknown[] }[] = [];
  const totalTokens = 0;
  return {
    calls,
    totalTokens,
    prepare(sql: string) {
      const self = this;
      return {
        bind(...args: unknown[]) {
          calls.push({ sql, args });
          return {
            run: async () => ({ success: true }),
            first: async () => {
              if (sql.includes("SUM")) {
                return { total: self.totalTokens };
              }
              return null;
            },
          };
        },
      };
    },
  };
}

describe("checkQuota", () => {
  it("allows request when under quota", async () => {
    const db = mockDB();
    db.totalTokens = 5000;
    const result = await checkQuota("f1", 10000, db as any);
    expect(result.allowed).toBe(true);
  });

  it("denies request when over quota", async () => {
    const db = mockDB();
    db.totalTokens = 10500;
    const result = await checkQuota("f1", 10000, db as any);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("quota");
  });

  it("allows when exactly at quota", async () => {
    const db = mockDB();
    db.totalTokens = 10000;
    const result = await checkQuota("f1", 10000, db as any);
    expect(result.allowed).toBe(true);
  });

  it("allows when zero tokens used", async () => {
    const db = mockDB();
    db.totalTokens = 0;
    const result = await checkQuota("f1", 10000, db as any);
    expect(result.allowed).toBe(true);
  });
});

describe("recordAiEvent", () => {
  it("inserts an ai_events record", async () => {
    const db = mockDB();
    await recordAiEvent("f1", "chat", "gpt-4o", 500, 200, 0.001, db as any);
    expect(db.calls.length).toBe(1);
    expect(db.calls[0]?.sql).toContain("INSERT INTO ai_events");
  });

  it("records token counts correctly", async () => {
    const db = mockDB();
    await recordAiEvent("f1", "vision", "gpt-4o", 1000, 500, 0.005, db as any);
    const args = db.calls[0]?.args;
    expect(args).toContain(1000); // input_tokens
    expect(args).toContain(500); // output_tokens
    expect(args).toContain(0.005); // cost_usd
  });
});
