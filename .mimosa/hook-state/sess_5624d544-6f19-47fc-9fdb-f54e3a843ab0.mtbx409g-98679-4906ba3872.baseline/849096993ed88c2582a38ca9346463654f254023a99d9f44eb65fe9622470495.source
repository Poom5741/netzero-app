import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "../../src/auth/password";

describe("password hashing", () => {
  it("hash produces a string with salt separator", async () => {
    const result = await hashPassword("hunter2");
    expect(result).toContain(":");
    const [salt, hash] = result.split(":") as [string, string];
    expect(salt.length).toBeGreaterThan(0);
    expect(hash.length).toBeGreaterThan(0);
  });

  it("same password produces different hashes (random salt)", async () => {
    const h1 = await hashPassword("test123");
    const h2 = await hashPassword("test123");
    expect(h1).not.toBe(h2);
  });

  it("verify accepts correct password", async () => {
    const hashed = await hashPassword("correct");
    const ok = await verifyPassword("correct", hashed);
    expect(ok).toBe(true);
  });

  it("verify rejects wrong password", async () => {
    const hashed = await hashPassword("correct");
    const ok = await verifyPassword("wrong", hashed);
    expect(ok).toBe(false);
  });

  it("verify rejects malformed hash string", async () => {
    const ok = await verifyPassword("anything", "not-a-hash");
    expect(ok).toBe(false);
  });
});
