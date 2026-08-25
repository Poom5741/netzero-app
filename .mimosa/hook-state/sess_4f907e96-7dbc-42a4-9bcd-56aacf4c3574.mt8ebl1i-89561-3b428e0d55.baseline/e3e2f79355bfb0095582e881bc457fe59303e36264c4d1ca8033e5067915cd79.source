import { describe, expect, it, vi } from "vitest";
import { createPhoneMatcher } from "../../src/line/phone-match";

type D1Row = Record<string, unknown>;
type D1Result = {
  results: D1Row[];
  first: D1Row | null;
  success: boolean;
  meta: unknown;
};

function mockD1(prepared: D1Result) {
  const firstFn = vi.fn().mockResolvedValue(prepared.first);
  return {
    prepare: vi.fn().mockReturnValue({
      bind: vi.fn().mockReturnValue({
        first: firstFn,
        all: vi.fn().mockResolvedValue(prepared),
        run: vi.fn().mockResolvedValue({ success: true, meta: {} }),
      }),
    }),
  } as unknown as D1Database;
}

describe("createPhoneMatcher", () => {
  it("creates line_link with pending status when phone matches farmer", async () => {
    const db = mockD1({
      results: [{ id: "farmer-1", phone: "0812345678" }],
      first: { id: "farmer-1", phone: "0812345678" },
      success: true,
      meta: {},
    });
    const matcher = createPhoneMatcher(db);
    const result = await matcher("0812345678", "U789");

    expect(result.status).toBe("pending");
    expect(result.farmerId).toBe("farmer-1");
  });

  it("returns not_found when phone does not match any farmer", async () => {
    const db = mockD1({
      results: [],
      first: null,
      success: true,
      meta: {},
    });
    const matcher = createPhoneMatcher(db);
    const result = await matcher("0999999999", "U999");

    expect(result.status).toBe("not_found");
    expect(result.farmerId).toBeUndefined();
  });

  it("rejects duplicate phone for same LINE user", async () => {
    const db = mockD1({
      results: [{ id: "farmer-1", phone: "0812345678" }],
      first: { id: "farmer-1", phone: "0812345678" },
      success: true,
      meta: {},
    });
    const matcher = createPhoneMatcher(db);

    const r1 = await matcher("0812345678", "U789");
    expect(r1.status).toBe("pending");

    const r2 = await matcher("0812345678", "U789");
    expect(r2.status).toBe("duplicate");
  });

  it("allows different LINE user with same phone", async () => {
    const db = mockD1({
      results: [{ id: "farmer-1", phone: "0812345678" }],
      first: { id: "farmer-1", phone: "0812345678" },
      success: true,
      meta: {},
    });
    const matcher = createPhoneMatcher(db);

    const r1 = await matcher("0812345678", "U789");
    expect(r1.status).toBe("pending");

    const r2 = await matcher("0812345678", "U999");
    expect(r2.status).toBe("pending");
  });

  it("new matcher instance starts with empty state", async () => {
    const db = mockD1({
      results: [{ id: "farmer-1", phone: "0812345678" }],
      first: { id: "farmer-1", phone: "0812345678" },
      success: true,
      meta: {},
    });
    const matcher = createPhoneMatcher(db);
    const result = await matcher("0812345678", "U789");

    expect(result.status).toBe("pending");
  });
});
