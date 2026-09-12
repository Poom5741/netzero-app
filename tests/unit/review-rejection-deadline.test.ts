import { describe, expect, it } from "vitest";

/**
 * Tests for composing rejection messages with retake deadline.
 * The deadline is composed into the chat message, not stored in DB.
 */

describe("composeRejectionMessage", () => {
  it("composes rejection message with reason and deadline", async () => {
    const { composeRejectionMessage } = await import("../../src/vision/retake-message");
    const msg = composeRejectionMessage({
      photoType: "wetdry",
      roundLabel: "WET-2",
      reason: "น้ำต่ำกว่าผิวดิน",
      deadline: "14 ก.ย.",
      plotName: "แปลงนาหลังบ้าน",
    });
    expect(msg).toContain("WET-2");
    expect(msg).toContain("น้ำต่ำกว่าผิวดิน");
    expect(msg).toContain("14 ก.ย.");
    expect(msg).toContain("แปลงนาหลังบ้าน");
  });

  it("includes retry button text", async () => {
    const { composeRejectionMessage } = await import("../../src/vision/retake-message");
    const msg = composeRejectionMessage({
      photoType: "wetdry",
      roundLabel: "DRY-1",
      reason: "ภาพไม่ชัด",
      deadline: "20 ส.ค.",
      plotName: "แปลงทดสอบ",
    });
    expect(msg).toContain("ถ่ายใหม่");
  });

  it("handles missing deadline gracefully", async () => {
    const { composeRejectionMessage } = await import("../../src/vision/retake-message");
    const msg = composeRejectionMessage({
      photoType: "wetdry",
      roundLabel: "WET-1",
      reason: "Wrong phase",
      deadline: null,
      plotName: "แปลงทดสอบ",
    });
    expect(msg).toContain("WET-1");
    expect(msg).toContain("Wrong phase");
  });
});
