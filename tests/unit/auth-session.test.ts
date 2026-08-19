import { describe, expect, it } from "vitest";
import { createSessionCookie, parseSessionCookie, type SessionData } from "../../src/auth/session";

const SECRET = "test-secret-key-for-sessions";

function extractRawCookie(cookie: string): string {
  return cookie.split(";")[0]?.split("=").slice(1).join("=") ?? "";
}

describe("session cookie", () => {
  it("createSessionCookie returns a Set-Cookie header value", () => {
    const cookie = createSessionCookie(
      { userId: "u1", role: "admin", email: "a@test.com" },
      SECRET,
    );
    expect(cookie).toContain("nzc_session=");
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("Path=/");
    expect(cookie).toContain("SameSite=Lax");
    expect(cookie).not.toContain("Secure");
  });

  it("createSessionCookie with secure flag in production", () => {
    const cookie = createSessionCookie(
      { userId: "u1", role: "admin", email: "a@test.com" },
      SECRET,
      true,
    );
    expect(cookie).toContain("Secure");
  });

  it("parseSessionCookie decodes a valid signed cookie", () => {
    const cookie = createSessionCookie(
      { userId: "u1", role: "sponsor", email: "s@test.com" },
      SECRET,
    );
    const raw = extractRawCookie(cookie);
    const data = parseSessionCookie(raw, SECRET);
    expect(data).toBeDefined();
    expect(data?.userId).toBe("u1");
    expect(data?.role).toBe("sponsor");
    expect(data?.email).toBe("s@test.com");
  });

  it("parseSessionCookie returns null for tampered cookie", () => {
    const cookie = createSessionCookie(
      { userId: "u1", role: "admin", email: "a@test.com" },
      SECRET,
    );
    const raw = extractRawCookie(cookie);
    const parts = raw.split(".");
    parts[1] = "tampered";
    const data = parseSessionCookie(parts.join("."), SECRET);
    expect(data).toBeNull();
  });

  it("parseSessionCookie returns null for empty string", () => {
    const data = parseSessionCookie("", SECRET);
    expect(data).toBeNull();
  });

  it("parseSessionCookie returns null for wrong secret", () => {
    const cookie = createSessionCookie(
      { userId: "u1", role: "admin", email: "a@test.com" },
      SECRET,
    );
    const raw = extractRawCookie(cookie);
    const data = parseSessionCookie(raw, "wrong-secret");
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
