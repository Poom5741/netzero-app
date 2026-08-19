import { describe, expect, it, vi } from "vitest";
import { createMagicLinkService } from "../../src/line/magic-link";

/**
 * Mock D1 that routes by SQL content to the right mock handler.
 * - line_links SELECT → returns linkRow or null
 * - farmers SELECT → returns farmerRow or null
 * - INSERT → insertRun
 * - UPDATE → updateRun
 */
function mockD1(opts: {
  linkRow?: { id: string; line_user_id: string; status: string } | null;
  farmerRow?: { id: string; full_name: string } | null;
}) {
  const linkFirst = vi.fn().mockResolvedValue(opts.linkRow ?? null);
  const farmerFirst = vi.fn().mockResolvedValue(opts.farmerRow ?? null);
  const insertRun = vi.fn().mockResolvedValue({ success: true, meta: {} });
  const updateRun = vi.fn().mockResolvedValue({ success: true, meta: {} });

  return {
    prepare: vi.fn().mockImplementation((sql: string) => {
      if (sql.includes("line_links") && sql.includes("SELECT")) {
        return { bind: vi.fn().mockReturnValue({ first: linkFirst }) };
      }
      if (sql.includes("farmers")) {
        return { bind: vi.fn().mockReturnValue({ first: farmerFirst }) };
      }
      if (sql.includes("INSERT")) {
        return { bind: vi.fn().mockReturnValue({ run: insertRun }) };
      }
      if (sql.includes("UPDATE")) {
        return { bind: vi.fn().mockReturnValue({ run: updateRun }) };
      }
      return { bind: vi.fn().mockReturnValue({ first: vi.fn(), run: vi.fn() }) };
    }),
  } as unknown as D1Database;
}

describe("createMagicLinkService", () => {
  it("generates a token for a valid test farmer", async () => {
    const db = mockD1({
      linkRow: null,
      farmerRow: { id: "demo-farmer-1", full_name: "Demo" },
    });
    const service = createMagicLinkService(db);
    const result = await service.generate("demo-farmer-1", "U222");

    expect(result.token).toBeDefined();
    expect(typeof result.token).toBe("string");
    expect(result.token?.length).toBeGreaterThan(10);
  });

  it("returns already_linked if farmer already has a verified link", async () => {
    const db = mockD1({
      linkRow: { id: "link-1", line_user_id: "U222", status: "verified" },
      farmerRow: { id: "demo-farmer-1", full_name: "Demo" },
    });
    const service = createMagicLinkService(db);
    const result = await service.generate("demo-farmer-1", "U222");

    expect(result.status).toBe("already_linked");
    expect(result.token).toBeUndefined();
  });

  it("returns not_found for unknown farmer", async () => {
    const db = mockD1({ linkRow: null, farmerRow: null });
    const service = createMagicLinkService(db);
    const result = await service.generate("unknown-farmer", "U333");

    expect(result.status).toBe("not_found");
    expect(result.token).toBeUndefined();
  });

  it("verify creates a verified line_link for valid token", async () => {
    const db = mockD1({
      linkRow: null,
      farmerRow: { id: "demo-farmer-1", full_name: "Demo" },
    });
    const service = createMagicLinkService(db);
    const genResult = await service.generate("demo-farmer-1", "U444");

    expect(genResult.token).toBeDefined();

    const verifyResult = await service.verify(genResult.token ?? "");
    expect(verifyResult.status).toBe("verified");
    expect(verifyResult.farmerId).toBe("demo-farmer-1");
  });

  it("verify rejects expired token", async () => {
    const db = mockD1({ linkRow: null, farmerRow: null });
    const service = createMagicLinkService(db);

    const verifyResult = await service.verify("garbage-token");
    expect(verifyResult.status).toBe("expired");
  });

  it("verify rejects already-used token", async () => {
    const db = mockD1({
      linkRow: null,
      farmerRow: { id: "demo-farmer-1", full_name: "Demo" },
    });
    const service = createMagicLinkService(db);
    const genResult = await service.generate("demo-farmer-1", "U555");
    expect(genResult.token).toBeDefined();

    const first = await service.verify(genResult.token ?? "");
    expect(first.status).toBe("verified");

    const second = await service.verify(genResult.token ?? "");
    expect(second.status).toBe("already_used");
  });
});
