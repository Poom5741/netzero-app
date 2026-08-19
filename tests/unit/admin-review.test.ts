import { describe, expect, it } from "vitest";
import { reviewPhoto } from "../../src/admin/review";

function mockD1() {
  const calls: { sql: string; args: unknown[] }[] = [];
  return {
    calls,
    prepare(sql: string) {
      return {
        bind(...args: unknown[]) {
          calls.push({ sql, args });
          if (sql.includes("SELECT")) {
            return {
              first: async () => ({
                id: "photo-1",
                ai_status: "flag",
                admin_status: "pending",
              }),
            };
          }
          return { run: async () => ({ success: true }) };
        },
      };
    },
  };
}

function findUpdate(mock: ReturnType<typeof mockD1>) {
  return mock.calls.find(
    (c) => c.sql.includes("UPDATE photo_evidence") && c.sql.includes("admin_status"),
  );
}

describe("reviewPhoto", () => {
  it("sets admin_status to verified with reason", async () => {
    const mock = mockD1();
    const db = mock as unknown as D1Database;
    const result = await reviewPhoto(db, "photo-1", "verified", "looks good");

    expect(result.success).toBe(true);
    const updateCall = findUpdate(mock);
    expect(updateCall).toBeDefined();
    expect(updateCall?.args).toContain("verified");
  });

  it("sets admin_status to rejected with reason", async () => {
    const mock = mockD1();
    const db = mock as unknown as D1Database;
    const result = await reviewPhoto(db, "photo-1", "rejected", "wrong location");

    expect(result.success).toBe(true);
    const updateCall = findUpdate(mock);
    expect(updateCall).toBeDefined();
    expect(updateCall?.args).toContain("rejected");
  });

  it("does not modify ai_status", async () => {
    const mock = mockD1();
    const db = mock as unknown as D1Database;
    await reviewPhoto(db, "photo-1", "verified", "looks good");

    const updateCall = findUpdate(mock);
    expect(updateCall?.sql).not.toContain("ai_status =");
  });

  it("records admin_reason", async () => {
    const mock = mockD1();
    const db = mock as unknown as D1Database;
    await reviewPhoto(db, "photo-1", "rejected", "blurry");

    const updateCall = findUpdate(mock);
    expect(updateCall?.args).toContain("blurry");
  });

  it("rejects invalid admin_status", async () => {
    const mock = mockD1();
    const db = mock as unknown as D1Database;
    const result = await reviewPhoto(db, "photo-1", "invalid", "test");

    expect(result.success).toBe(false);
    expect(result.error).toContain("status");
  });

  it("returns error when photo not found", async () => {
    const db = {
      prepare(_sql: string) {
        return {
          bind(..._args: unknown[]) {
            return { first: async () => null };
          },
        };
      },
    } as unknown as D1Database;
    const result = await reviewPhoto(db, "missing", "verified", "test");

    expect(result.success).toBe(false);
    expect(result.error).toContain("not found");
  });
});
