import { describe, expect, it } from "vitest";
import { getReviewQueue } from "../../src/admin/queue";

function mockD1(rows: Record<string, unknown>[]) {
  return {
    prepare(_sql: string) {
      return {
        bind(..._args: unknown[]) {
          return { all: async () => ({ results: rows }) };
        },
      };
    },
  };
}

const FLAGGED = {
  id: "photo-1",
  plot_id: "plot-1",
  ai_status: "flag",
  ai_label: "uncertain",
  ai_reason: "blurry image",
  ai_confidence: 0.45,
  admin_status: "pending",
};

const PASS = {
  id: "photo-2",
  plot_id: "plot-2",
  ai_status: "pass",
  ai_label: "healthy_crop",
  ai_reason: "clear image",
  ai_confidence: 0.92,
  admin_status: "pending",
};

describe("getReviewQueue", () => {
  it("returns photos filtered by ai_status", async () => {
    const db = mockD1([FLAGGED, PASS]) as unknown as D1Database;
    const result = await getReviewQueue(db, { ai_status: "flag" });

    expect(result.length).toBe(2);
    expect(result.some((p) => p.ai_status === "flag")).toBe(true);
  });

  it("sorts flagged photos first", async () => {
    const db = mockD1([PASS, FLAGGED]) as unknown as D1Database;
    const result = await getReviewQueue(db, {});

    expect(result[0]?.ai_status).toBe("flag");
    expect(result[1]?.ai_status).toBe("pass");
  });

  it("returns empty when no photos match filter", async () => {
    const db = mockD1([]) as unknown as D1Database;
    const result = await getReviewQueue(db, { ai_status: "reject" });

    expect(result).toEqual([]);
  });
});
