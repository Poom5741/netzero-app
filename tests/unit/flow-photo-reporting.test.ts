import { describe, expect, it } from "vitest";

/**
 * Tests for PJ-00 to PJ-13 photo reporting chat flow.
 * Handles: calendar display → photo prompts → submission → review status
 */

describe("composePhotoReminder", () => {
  it("composes reminder for WET round", async () => {
    const { composePhotoReminder } = await import("../../src/line/flow-photo-reporting");
    const msg = composePhotoReminder({
      roundLabel: "WET-1",
      stepCode: "SG-04",
      plotName: "แปลงนาหลังบ้าน",
      dayAfterSow: 28,
      deadline: "8 ส.ค.",
      daysLeft: 2,
      isWet: true,
      photosSubmitted: 0,
      totalPhotos: 4,
    });
    expect(msg).toContain("WET-1");
    expect(msg).toContain("SG-04");
    expect(msg).toContain("แปลงนาหลังบ้าน");
    expect(msg).toContain("28");
    expect(msg).toContain("0/4");
  });

  it("composes reminder for DRY round", async () => {
    const { composePhotoReminder } = await import("../../src/line/flow-photo-reporting");
    const msg = composePhotoReminder({
      roundLabel: "DRY-1",
      stepCode: "SG-05",
      plotName: "แปลงทดสอบ",
      dayAfterSow: 42,
      deadline: "22 ส.ค.",
      daysLeft: 3,
      isWet: false,
      photosSubmitted: 1,
      totalPhotos: 4,
    });
    expect(msg).toContain("DRY-1");
    expect(msg).toContain("แห้ง");
    expect(msg).toContain("1/4");
  });

  it("shows progress correctly", async () => {
    const { composePhotoReminder } = await import("../../src/line/flow-photo-reporting");
    const msg = composePhotoReminder({
      roundLabel: "WET-2",
      stepCode: "SG-07",
      plotName: "แปลงทดสอบ",
      dayAfterSow: 61,
      deadline: "14 ก.ย.",
      daysLeft: 5,
      isWet: true,
      photosSubmitted: 3,
      totalPhotos: 4,
    });
    expect(msg).toContain("3/4");
  });
});

describe("composePhotoAccepted", () => {
  it("composes acceptance with remaining count", async () => {
    const { composePhotoAccepted } = await import("../../src/line/flow-photo-reporting");
    const msg = composePhotoAccepted({
      roundLabel: "WET-1",
      photosAccepted: 1,
      totalPhotos: 4,
      nextRound: "DRY-1",
    });
    expect(msg).toContain("รับภาพ");
    expect(msg).toContain("เหลืออีก 3");
    expect(msg).toContain("DRY-1");
  });

  it("shows completion when all photos accepted", async () => {
    const { composePhotoAccepted } = await import("../../src/line/flow-photo-reporting");
    const msg = composePhotoAccepted({
      roundLabel: "DRY-2",
      photosAccepted: 4,
      totalPhotos: 4,
      nextRound: null,
    });
    expect(msg).toContain("ครบทั้ง 4 ภาพ");
    expect(msg).toContain("SF_w");
    expect(msg).toContain("0.55");
  });
});

describe("composePhotoRejected", () => {
  it("composes rejection with reason and deadline", async () => {
    const { composePhotoRejected } = await import("../../src/line/flow-photo-reporting");
    const msg = composePhotoRejected({
      roundLabel: "WET-2",
      reason: "น้ำต่ำกว่าผิวดิน",
      deadline: "14 ก.ย.",
      plotName: "แปลงทดสอบ",
    });
    expect(msg).toContain("WET-2");
    expect(msg).toContain("ตีกลับ");
    expect(msg).toContain("น้ำต่ำกว่าผิวดิน");
    expect(msg).toContain("14 ก.ย.");
  });

  it("includes retake instruction", async () => {
    const { composePhotoRejected } = await import("../../src/line/flow-photo-reporting");
    const msg = composePhotoRejected({
      roundLabel: "DRY-1",
      reason: "ภาพไม่ชัด",
      deadline: "20 ส.ค.",
      plotName: "แปลงทดสอบ",
    });
    expect(msg).toContain("ถ่ายใหม่");
  });
});

describe("PJ_STEPS", () => {
  it("defines photo reporting steps", async () => {
    const { PJ_STEPS } = await import("../../src/line/flow-photo-reporting");
    expect(PJ_STEPS.length).toBeGreaterThan(0);
  });

  it("includes WET and DRY rounds", async () => {
    const { PJ_STEPS } = await import("../../src/line/flow-photo-reporting");
    const stepCodes = PJ_STEPS.map((s: { stepCode: string }) => s.stepCode);
    expect(stepCodes).toContain("SG-04");
    expect(stepCodes).toContain("SG-05");
    expect(stepCodes).toContain("SG-07");
    expect(stepCodes).toContain("SG-08");
  });
});
