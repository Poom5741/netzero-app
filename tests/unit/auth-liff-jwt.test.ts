import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * FINDING-D fix (2026-09-19): tests for the LIFF JWT verifier.
 *
 * Covers:
 *  - extractLiffIdToken parses Authorization: Bearer header
 *  - extractLiffIdToken accepts X-LIFF-ID-Token and form fallback
 *  - verifyLiffIdToken posts to LINE verify and extracts `sub`
 *  - verifyLiffIdToken rejects on missing token / server error
 *  - 5-minute in-memory cache short-circuits a second verify call
 */

const realFetch = globalThis.fetch;

afterEach(() => {
  vi.restoreAllMocks();
  // `bun test` exposes a reduced `vi` shim without `unstubAllGlobals`, so
  // restore the stubbed global directly to keep this file runner-agnostic.
  globalThis.fetch = realFetch;
});

describe("extractLiffIdToken", () => {
  it("reads Authorization: Bearer <token>", async () => {
    const { extractLiffIdToken } = await import("../../src/auth/liff-jwt");
    const headers = new Headers({ Authorization: "Bearer abc.def.ghi" });
    expect(extractLiffIdToken(headers, null)).toBe("abc.def.ghi");
  });

  it("is case-insensitive on the Bearer scheme", async () => {
    const { extractLiffIdToken } = await import("../../src/auth/liff-jwt");
    const headers = new Headers({ Authorization: "bearer xyz" });
    expect(extractLiffIdToken(headers, null)).toBe("xyz");
  });

  it("reads X-LIFF-ID-Token header when Authorization is missing", async () => {
    const { extractLiffIdToken } = await import("../../src/auth/liff-jwt");
    const headers = new Headers({ "X-LIFF-ID-Token": "hdr-token" });
    expect(extractLiffIdToken(headers, null)).toBe("hdr-token");
  });

  it("reads liff_id_token form field as a last resort", async () => {
    const { extractLiffIdToken } = await import("../../src/auth/liff-jwt");
    const headers = new Headers();
    const fd = new FormData();
    fd.append("liff_id_token", "form-token");
    expect(extractLiffIdToken(headers, fd)).toBe("form-token");
  });

  it("returns null when no token is present", async () => {
    const { extractLiffIdToken } = await import("../../src/auth/liff-jwt");
    expect(extractLiffIdToken(new Headers(), null)).toBeNull();
    expect(extractLiffIdToken(new Headers(), new FormData())).toBeNull();
  });

  it("prefers Authorization header over X-LIFF-ID-Token and form field", async () => {
    const { extractLiffIdToken } = await import("../../src/auth/liff-jwt");
    const headers = new Headers({
      Authorization: "Bearer primary",
      "X-LIFF-ID-Token": "secondary",
    });
    const fd = new FormData();
    fd.append("liff_id_token", "fallback");
    expect(extractLiffIdToken(headers, fd)).toBe("primary");
  });
});

describe("verifyLiffIdToken", () => {
  it("rejects empty token", async () => {
    const { verifyLiffIdToken } = await import("../../src/auth/liff-jwt");
    const r = await verifyLiffIdToken("", "liff-123");
    expect(r.ok).toBe(false);
  });

  it("rejects when clientId is missing", async () => {
    const { verifyLiffIdToken } = await import("../../src/auth/liff-jwt");
    const r = await verifyLiffIdToken("token", undefined);
    expect(r.ok).toBe(false);
    expect(r.error).toContain("LIFF_ID");
  });

  it("extracts `sub` on success and returns ok:true", async () => {
    const { verifyLiffIdToken, _clearLiffTokenCacheForTests } = await import(
      "../../src/auth/liff-jwt"
    );
    _clearLiffTokenCacheForTests();
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          sub: "U-line-user-001",
          aud: "liff-123",
          iss: "https://access.line.me",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const r = await verifyLiffIdToken("good.jwt", "liff-123");
    expect(r.ok).toBe(true);
    expect(r.lineUserId).toBe("U-line-user-001");
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("https://api.line.me/oauth2/v2.1/verify");
    expect((init as RequestInit).method).toBe("POST");
    expect((init as RequestInit).body).toBeInstanceOf(URLSearchParams);
  });

  it("returns error on LINE HTTP 400", async () => {
    const { verifyLiffIdToken, _clearLiffTokenCacheForTests } = await import(
      "../../src/auth/liff-jwt"
    );
    _clearLiffTokenCacheForTests();
    globalThis.fetch = vi
      .fn()
      .mockResolvedValue(new Response("invalid_token", { status: 400 })) as unknown as typeof fetch;
    const r = await verifyLiffIdToken("bad.jwt", "liff-123");
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/HTTP 400/);
  });

  it("returns error when response lacks a sub claim", async () => {
    const { verifyLiffIdToken, _clearLiffTokenCacheForTests } = await import(
      "../../src/auth/liff-jwt"
    );
    _clearLiffTokenCacheForTests();
    globalThis.fetch = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ aud: "liff-123" }), { status: 200 }),
      ) as unknown as typeof fetch;
    const r = await verifyLiffIdToken("weird.jwt", "liff-123");
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/sub/);
  });

  it("caches successful verification for repeated calls", async () => {
    const { verifyLiffIdToken, _clearLiffTokenCacheForTests } = await import(
      "../../src/auth/liff-jwt"
    );
    _clearLiffTokenCacheForTests();
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ sub: "U-cache-001" }), { status: 200 }));
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    const r1 = await verifyLiffIdToken("cached.jwt", "liff-123");
    const r2 = await verifyLiffIdToken("cached.jwt", "liff-123");
    expect(r1.ok).toBe(true);
    expect(r2.ok).toBe(true);
    expect(r2.lineUserId).toBe("U-cache-001");
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});
