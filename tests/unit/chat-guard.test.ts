import { describe, expect, it } from "vitest";
import { checkFarmerApproved } from "../../src/chat/guard";

function mockDB(farmerStatus: string | null) {
  return {
    prepare(_sql: string) {
      return {
        bind(..._args: unknown[]) {
          return {
            first: async () => {
              if (farmerStatus === null) return null;
              return { id: "f1", status: farmerStatus };
            },
          };
        },
      };
    },
  } as unknown as D1Database;
}

describe("checkFarmerApproved", () => {
  it("allows approved farmer", async () => {
    const db = mockDB("approved");
    const result = await checkFarmerApproved("f1", db);
    expect(result.allowed).toBe(true);
  });

  it("blocks pending farmer", async () => {
    const db = mockDB("pending");
    const result = await checkFarmerApproved("f1", db);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("pending");
  });

  it("blocks rejected farmer", async () => {
    const db = mockDB("rejected");
    const result = await checkFarmerApproved("f1", db);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("rejected");
  });

  it("blocks unknown farmer (no record)", async () => {
    const db = mockDB(null);
    const result = await checkFarmerApproved("f-unknown", db);
    expect(result.allowed).toBe(false);
  });
});
