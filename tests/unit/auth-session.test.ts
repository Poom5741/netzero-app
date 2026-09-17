import { describe, expect, it } from "vitest";
import { createSessionCookie, parseSessionCookie, type SessionData } from "../../src/auth/session";

const SECRET = "test-secret-key-for-sessions";

function extractRawCookie(cookie: string): string {
  return cookie.split(";")[0]?.split("=").slice(1).join("=") ?? "";
}

describe("session cookie", () => {
  it("createSessionCookie returns a Set-Cookie header value", async () => {
    const cookie = await createSessionCookie(
      { userId: "u1", role: "admin", email: "a@test.com" },
      SECRET,
    );
    expect(cookie).toContain("nzc_session=");
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("Path=/");
    expect(cookie).toContain("SameSite=None");
    // Secure is the default since the 2026-09-04 security pass (prod is HTTPS-only)
    expect(cookie).toContain("Secure");
    // S10 fix: session cookies must have a Max-Age of 24 hours
    expect(cookie).toContain("Max-Age=86400");
  });

  it("createSessionCookie with secure flag in production", async () => {
    const cookie = await createSessionCookie(
      { userId: "u1", role: "admin", email: "a@test.com" },
      SECRET,
      true,
    );
    expect(cookie).toContain("Secure");
  });

  it("parseSessionCookie decodes a valid signed cookie", async () => {
    const cookie = await createSessionCookie(
      { userId: "u1", role: "sponsor", email: "s@test.com" },
      SECRET,
    );
    const raw = extractRawCookie(cookie);
    const data = await parseSessionCookie(raw, SECRET);
    expect(data).toBeDefined();
    expect(data?.userId).toBe("u1");
    expect(data?.role).toBe("sponsor");
    expect(data?.email).toBe("s@test.com");
  });

  it("parseSessionCookie returns null for tampered cookie", async () => {
    const cookie = await createSessionCookie(
      { userId: "u1", role: "admin", email: "a@test.com" },
      SECRET,
    );
    const raw = extractRawCookie(cookie);
    const parts = raw.split(".");
    parts[1] = "tampered";
    const data = await parseSessionCookie(parts.join("."), SECRET);
    expect(data).toBeNull();
  });

  it("parseSessionCookie returns null for empty string", async () => {
    const data = await parseSessionCookie("", SECRET);
    expect(data).toBeNull();
  });

  it("parseSessionCookie returns null for wrong secret", async () => {
    const cookie = await createSessionCookie(
      { userId: "u1", role: "admin", email: "a@test.com" },
      SECRET,
    );
    const raw = extractRawCookie(cookie);
    const data = await parseSessionCookie(raw, "wrong-secret");
    expect(data).toBeNull();
  });
});

describe("SessionData type", () => {
  it("has required fields", () => {
    const data: SessionData = {
      userId: "1",
      role: "admin",
      email: "a@b.com",
    };
    expect(data.userId).toBeDefined();
    expect(data.role).toBeDefined();
    expect(data.email).toBeDefined();
  });
});
