import { describe, expect, it } from "vitest";
import { composeRetakeMessage } from "../../src/vision/retake-message";

describe("composeRetakeMessage", () => {
  it("composes low confidence message in Thai", () => {
    const msg = composeRetakeMessage("Low confidence detected", "th");
    expect(msg.message_type).toBe("retake_notification");
    expect(msg.raw_text).toContain("ไม่ชัดเจน");
    expect(msg.locale).toBe("th");
  });

  it("composes invalid photo message in English", () => {
    const msg = composeRetakeMessage("No water pipe detected", "en");
    expect(msg.message_type).toBe("retake_notification");
    expect(msg.raw_text).toContain("No water pipe");
    expect(msg.locale).toBe("en");
  });

  it("defaults to Thai locale", () => {
    const msg = composeRetakeMessage("Some reason");
    expect(msg.locale).toBe("th");
  });

  it("uses default message for unknown reasons", () => {
    const msg = composeRetakeMessage("Unknown issue", "en");
    expect(msg.raw_text).toContain("retake");
  });
});
