import { describe, expect, it } from "vitest";
import {
  base32Decode,
  base32Encode,
  generateOtpCode,
  generateOtpSecret,
  verifyOtp,
} from "../../src/auth/otp";

describe("OTP base32 encoding", () => {
  it("base32Decode reverses base32Encode", () => {
    const secret = generateOtpSecret();
    const decoded = base32Decode(secret);
    expect(decoded.length).toBeGreaterThan(0);
    const reEncoded = base32Encode(decoded);
    expect(reEncoded).toBe(secret);
  });

  it("base32Encode produces uppercase A-Z2-7 characters", () => {
    const secret = generateOtpSecret();
    expect(secret).toMatch(/^[A-Z2-7]+$/);
  });

  it("base32Decode handles padding correctly", () => {
    // JBSWY3DPEHPK3PXP is a well-known base32 test value
    const decoded = base32Decode("JBSWY3DPEHPK3PXP");
    expect(decoded.length).toBe(10);
  });
});

describe("generateOtpSecret", () => {
  it("returns a non-empty string", () => {
    const secret = generateOtpSecret();
    expect(typeof secret).toBe("string");
    expect(secret.length).toBeGreaterThan(0);
  });

  it("generates different secrets each call", () => {
    const s1 = generateOtpSecret();
    const s2 = generateOtpSecret();
    expect(s1).not.toBe(s2);
  });

  it("produces valid base32 that can be decoded", () => {
    const secret = generateOtpSecret();
    const bytes = base32Decode(secret);
    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(bytes.length).toBe(20); // 160 bits = 20 bytes
  });
});

describe("generateOtpCode", () => {
  it("returns a 6-digit string", () => {
    const code = generateOtpCode("JBSWY3DPEHPK3PXP");
    expect(code).toMatch(/^\d{6}$/);
  });

  it("produces consistent code for same secret and counter", () => {
    const secret = "JBSWY3DPEHPK3PXP";
    const code1 = generateOtpCode(secret, 1000);
    const code2 = generateOtpCode(secret, 1000);
    expect(code1).toBe(code2);
  });

  it("produces different code for different counter", () => {
    const secret = "JBSWY3DPEHPK3PXP";
    const code1 = generateOtpCode(secret, 1000);
    const code2 = generateOtpCode(secret, 1001);
    expect(code1).not.toBe(code2);
  });

  it("zero-pads short codes to 6 digits", () => {
    const code = generateOtpCode("JBSWY3DPEHPK3PXP", 0);
    expect(code.length).toBe(6);
  });
});

describe("verifyOtp", () => {
  it("accepts a valid OTP code", () => {
    const secret = generateOtpSecret();
    const code = generateOtpCode(secret);
    expect(verifyOtp(secret, code)).toBe(true);
  });

  it("rejects an invalid OTP code", () => {
    const secret = generateOtpSecret();
    expect(verifyOtp(secret, "000000")).toBe(false);
  });

  it("accepts OTP within tolerance window (previous counter)", () => {
    const secret = "JBSWY3DPEHPK3PXP";
    const nowCounter = Math.floor(Date.now() / 1000 / 30);
    // Generate code for current-1, then verify with tolerance=1
    const code = generateOtpCode(secret, nowCounter - 1);
    expect(verifyOtp(secret, code, 1)).toBe(true);
  });

  it("accepts OTP within tolerance window (next counter)", () => {
    const secret = "JBSWY3DPEHPK3PXP";
    const nowCounter = Math.floor(Date.now() / 1000 / 30);
    // Generate code for current+1, then verify with tolerance=1
    const code = generateOtpCode(secret, nowCounter + 1);
    expect(verifyOtp(secret, code, 1)).toBe(true);
  });

  it("rejects OTP outside tolerance window", () => {
    const secret = "JBSWY3DPEHPK3PXP";
    const nowCounter = Math.floor(Date.now() / 1000 / 30);
    // Generate code for counter way in the past, verify with tolerance=0
    const code = generateOtpCode(secret, nowCounter - 1000);
    expect(verifyOtp(secret, code, 0)).toBe(false);
  });

  it("rejects empty code", () => {
    const secret = generateOtpSecret();
    expect(verifyOtp(secret, "")).toBe(false);
  });

  it("rejects non-numeric code", () => {
    const secret = generateOtpSecret();
    expect(verifyOtp(secret, "abcdef")).toBe(false);
  });

  it("rejects code with wrong length", () => {
    const secret = generateOtpSecret();
    expect(verifyOtp(secret, "12345")).toBe(false);
    expect(verifyOtp(secret, "1234567")).toBe(false);
  });

  it("rejects empty secret", () => {
    expect(verifyOtp("", "123456")).toBe(false);
  });
});
