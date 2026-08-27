import { describe, expect, it } from "vitest";
import { recordVisionEvent } from "../../src/vision/events";

function mockD1(eventCount = 0, quotaUsed = 0) {
  const calls: { sql: string; args: unknown[] }[] = [];
  return {
    calls,
    prepare(sql: string) {
      return {
        bind(...args: unknown[]) {
          calls.push({ sql, args });
          if (sql.includes("COUNT")) {
            return { first: async () => ({ cnt: eventCount }) };
          }
          if (sql.includes("SUM")) {
            return { first: async () => ({ total: quotaUsed }) };
          }
          return { run: async () => ({ success: true }) };
        },
      };
    },
  };
}

describe("recordVisionEvent", () => {
  it("inserts an ai_events row for vision screening", async () => {
    const mock = mockD1();
    const db = mock as unknown as D1Database;
    const result = await recordVisionEvent(db, "farmer-1", {
      model_version: "v1.0",
      input_tokens: 100,
      output_tokens: 50,
      cost_usd: 0.001,
    });

    expect(result.recorded).toBe(true);
    const insertCall = mock.calls.find((c) => c.sql.includes("INSERT INTO ai_events"));
    expect(insertCall).toBeDefined();
    expect(insertCall?.args).toContain("farmer-1");
    expect(insertCall?.args).toContain("vision");
  });

  it("enforces quota — rejects when event count exceeds limit", async () => {
    const db = mockD1(50, 0) as unknown as D1Database;
    const result = await recordVisionEvent(db, "farmer-1", {
      model_version: "v1.0",
      input_tokens: 100,
      output_tokens: 50,
      cost_usd: 0.001,
      quota_limit: 50,
    });

    expect(result.recorded).toBe(false);
    expect(result.error).toContain("quota");
  });

  it("allows recording when under quota", async () => {
    const db = mockD1(10, 0) as unknown as D1Database;
    const result = await recordVisionEvent(db, "farmer-1", {
      model_version: "v1.0",
      input_tokens: 100,
      output_tokens: 50,
      cost_usd: 0.001,
      quota_limit: 50,
    });

    expect(result.recorded).toBe(true);
  });

  it("enforces cost quota when exceeded", async () => {
    const db = mockD1(0, 10.0) as unknown as D1Database;
    const result = await recordVisionEvent(db, "farmer-1", {
      model_version: "v1.0",
      input_tokens: 100,
      output_tokens: 50,
      cost_usd: 0.001,
      cost_limit_usd: 10.0,
    });

    expect(result.recorded).toBe(false);
    expect(result.error?.toLowerCase()).toContain("cost");
  });
});
