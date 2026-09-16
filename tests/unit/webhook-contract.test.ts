/**
 * Webhook contract tests — verifies signature validation.
 */
import { describe, expect, it } from "bun:test";
import { generateTestSignature, verifyTestSignature } from "../helpers/signature";

describe("Webhook Signature Validation", () => {
  const testSecret = "test-channel-secret-xxx";
  const testBody = JSON.stringify({
    type: "message",
    source: { type: "user", userId: "U-test-001" },
    message: { type: "text", text: "test" },
    timestamp: 1234567890,
  });

  it("generates valid signature", () => {
    const signature = generateTestSignature(testSecret, testBody);
    expect(signature).toBeTruthy();
    expect(typeof signature).toBe("string");
  });

  it("verifies valid signature", () => {
    const signature = generateTestSignature(testSecret, testBody);
    const isValid = verifyTestSignature(testSecret, testBody, signature);
    expect(isValid).toBe(true);
  });

  it("rejects invalid signature", () => {
    const isValid = verifyTestSignature(testSecret, testBody, "invalid-signature");
    expect(isValid).toBe(false);
  });

  it("rejects signature with wrong secret", () => {
    const signature = generateTestSignature(testSecret, testBody);
    const isValid = verifyTestSignature("wrong-secret", testBody, signature);
    expect(isValid).toBe(false);
  });

  it("rejects signature with tampered body", () => {
    const signature = generateTestSignature(testSecret, testBody);
    const tamperedBody = testBody.replace("test", "tampered");
    const isValid = verifyTestSignature(testSecret, tamperedBody, signature);
    expect(isValid).toBe(false);
  });
});
