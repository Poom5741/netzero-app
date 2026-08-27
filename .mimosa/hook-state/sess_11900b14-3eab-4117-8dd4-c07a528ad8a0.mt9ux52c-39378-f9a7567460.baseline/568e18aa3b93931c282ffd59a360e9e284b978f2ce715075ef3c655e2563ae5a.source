import { describe, expect, it } from "vitest";
import { screenPhoto } from "../../src/vision/screen";

function mockD1() {
  const calls: { sql: string; args: unknown[] }[] = [];
  return {
    calls,
    prepare(sql: string) {
      return {
        bind(...args: unknown[]) {
          calls.push({ sql, args });
          return {
            first: async () => null,
            run: async () => ({ success: true }),
          };
        },
      };
    },
  };
}

describe("screenPhoto", () => {
  it("can return pass outcome", async () => {
    const db = mockD1() as unknown as D1Database;
    const result = await screenPhoto(db, "photo-1", "healthy crop", 0.92);

    expect(result.ai_status).toBe("pass");
    expect(result.ai_label).toBeDefined();
    expect(result.ai_confidence).toBeGreaterThanOrEqual(0);
    expect(result.ai_confidence).toBeLessThanOrEqual(1);
  });

  it("can return flag outcome", async () => {
    const db = mockD1() as unknown as D1Database;
    const result = await screenPhoto(db, "photo-2", "unclear image", 0.45);

    expect(result.ai_status).toBe("flag");
    expect(result.ai_reason).toBeDefined();
  });

  it("can return reject outcome", async () => {
    const db = mockD1() as unknown as D1Database;
    const result = await screenPhoto(db, "photo-3", "no crop visible", 0.15);

    expect(result.ai_status).toBe("reject");
    expect(result.ai_reason).toBeDefined();
  });

  it("returns screen result for given inputs", async () => {
    const db = mockD1() as unknown as D1Database;
    const result = await screenPhoto(db, "photo-4", "test", 0.8);

    expect(result.ai_status).toBe("pass");
    expect(result.ai_label).toBe("test");
  });

  it("deterministic: same input produces same result", async () => {
    const db = mockD1() as unknown as D1Database;
    const r1 = await screenPhoto(db, "p", "healthy crop", 0.9);
    const r2 = await screenPhoto(db, "p", "healthy crop", 0.9);

    expect(r1.ai_status).toBe(r2.ai_status);
    expect(r1.ai_label).toBe(r2.ai_label);
  });
});
