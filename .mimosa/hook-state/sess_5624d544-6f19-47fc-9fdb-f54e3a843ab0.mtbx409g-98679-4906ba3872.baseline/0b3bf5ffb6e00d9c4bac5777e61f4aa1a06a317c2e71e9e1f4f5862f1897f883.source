import { describe, expect, it } from "vitest";
import { getQueueDigest, formatDigestMessage } from "../../src/admin/queue-digest";

function mockDB(queueLength: number, verified: number, rejected: number) {
  return {
    prepare: (sql: string) => ({
      first: async <T>(): Promise<T | null> => {
        if (sql.includes("COUNT(*)")) {
          return { count: queueLength } as T;
        }
        if (sql.includes("SUM(CASE WHEN admin_status")) {
          return { verified, rejected } as T;
        }
        if (sql.includes("trust_score")) {
          return { high: 5, medium: 3, low: 2 } as T;
        }
        return null;
      },
      bind: (...args: unknown[]) => ({
        first: async <T>(): Promise<T | null> => {
          if (sql.includes("COUNT(*)")) {
            return { count: queueLength } as T;
          }
          if (sql.includes("SUM(CASE WHEN admin_status")) {
            return { verified, rejected } as T;
          }
          if (sql.includes("trust_score")) {
            return { high: 5, medium: 3, low: 2 } as T;
          }
          return null;
        },
      }),
    }),
  } as any;
}

describe("getQueueDigest", () => {
  it("returns queue stats", async () => {
    const db = mockDB(15, 20, 5);
    const digest = await getQueueDigest(db);
    
    expect(digest.queueLength).toBe(15);
    expect(digest.precisionStat).toContain("80%");
    expect(digest.trustDistribution.high).toBe(5);
  });

  it("handles empty queue", async () => {
    const db = mockDB(0, 0, 0);
    const digest = await getQueueDigest(db);
    
    expect(digest.queueLength).toBe(0);
    expect(digest.precisionStat).toContain("N/A");
  });
});

describe("formatDigestMessage", () => {
  it("formats digest with queue length and stats", () => {
    const digest = {
      queueLength: 15,
      precisionStat: "Precision: 92%",
      trustDistribution: { high: 10, medium: 5, low: 3 },
    };
    
    const message = formatDigestMessage(digest);
    expect(message).toContain("15");
    expect(message).toContain("92%");
    expect(message).toContain("High: 10");
  });
});
