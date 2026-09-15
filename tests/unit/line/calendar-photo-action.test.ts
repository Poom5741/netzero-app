/**
 * Unit tests for calendar photo button action (US1, US2, US3)
 *
 * Tests that the "ถ่ายรูป" button in the calendar Flex message:
 * - Uses type: "uri" action (not postback)
 * - Constructs correct LIFF camera URL with step, plot_id, season_id
 * - Handles missing LIFF_ID gracefully
 */

import { describe, expect, it } from "vitest";
import { buildCalendarBubble } from "../../../src/line/flex-builders";

// Helper to extract the photo button action from the bubble
function getPhotoButtonAction(bubble: any, stepCode: string) {
  const body = bubble.contents.body;
  for (const content of body.contents) {
    if (content.type === "box" && content.layout === "horizontal") {
      // Check if this is the photo button row
      const firstBox = content.contents?.[0];
      if (
        firstBox?.contents?.[0]?.text?.includes("ถ่ายรูป") &&
        firstBox.action?.label?.includes(stepCode)
      ) {
        return firstBox.action;
      }
    }
  }
  return null;
}

describe("Calendar Photo Button Action (US1)", () => {
  const mockSteps = [
    { stepCode: "SG-04", stepName: "WET-1", dueDay: 30, status: "pending", requiresPhoto: true },
  ];

  it("T005: uses type: uri action for photo button", () => {
    const bubble = buildCalendarBubble(mockSteps, "test-liff-id", "plot-123", "season-456");
    const action = getPhotoButtonAction(bubble, "SG-04");

    expect(action).toBeDefined();
    expect(action.type).toBe("uri");
  });

  it("T006: LIFF camera URL includes step parameter", () => {
    const bubble = buildCalendarBubble(mockSteps, "test-liff-id", "plot-123", "season-456");
    const action = getPhotoButtonAction(bubble, "SG-04");

    expect(action.uri).toContain("step=SG-04");
  });

  it("T007: LIFF camera URL includes plot_id and season_id", () => {
    const bubble = buildCalendarBubble(mockSteps, "test-liff-id", "plot-123", "season-456");
    const action = getPhotoButtonAction(bubble, "SG-04");

    expect(action.uri).toContain("plot_id=plot-123");
    expect(action.uri).toContain("season_id=season-456");
  });
});

describe("All Photo Rounds (US2)", () => {
  const allPhotoSteps = [
    { stepCode: "SG-04", stepName: "WET-1", dueDay: 30, status: "pending", requiresPhoto: true },
    { stepCode: "SG-05", stepName: "DRY-1", dueDay: 60, status: "pending", requiresPhoto: true },
    { stepCode: "SG-07", stepName: "WET-2", dueDay: 90, status: "pending", requiresPhoto: true },
    { stepCode: "SG-08", stepName: "DRY-2", dueDay: 110, status: "pending", requiresPhoto: true },
  ];

  it("T011: DRY-1 (SG-05) button has correct step in URL", () => {
    const bubble = buildCalendarBubble(allPhotoSteps, "test-liff-id", "plot-123", "season-456");
    const action = getPhotoButtonAction(bubble, "SG-05");

    expect(action).toBeDefined();
    expect(action.uri).toContain("step=SG-05");
  });

  it("T012: WET-2 (SG-07) button has correct step in URL", () => {
    const bubble = buildCalendarBubble(allPhotoSteps, "test-liff-id", "plot-123", "season-456");
    const action = getPhotoButtonAction(bubble, "SG-07");

    expect(action).toBeDefined();
    expect(action.uri).toContain("step=SG-07");
  });

  it("T013: DRY-2 (SG-08) button has correct step in URL", () => {
    const bubble = buildCalendarBubble(allPhotoSteps, "test-liff-id", "plot-123", "season-456");
    const action = getPhotoButtonAction(bubble, "SG-08");

    expect(action).toBeDefined();
    expect(action.uri).toContain("step=SG-08");
  });
});

describe("Error Handling (US3)", () => {
  const mockSteps = [
    { stepCode: "SG-04", stepName: "WET-1", dueDay: 30, status: "pending", requiresPhoto: true },
  ];

  it("T016: returns error message when LIFF_ID is missing", () => {
    const result = buildCalendarBubble(mockSteps, "", "plot-123", "season-456");

    // Should return a text message instead of flex bubble
    expect(result.type).toBe("text");
    if (result.type === "text") {
      expect(result.text).toContain("กล้องถ่ายรูปยังไม่พร้อมใช้งาน");
    }
  });

  it("T017: returns error message when LIFF_ID is empty string", () => {
    const result = buildCalendarBubble(mockSteps, "", "plot-123", "season-456");

    expect(result.type).toBe("text");
    if (result.type === "text") {
      expect(result.text).toContain("กรุณาติดต่อเจ้าหน้าที่");
    }
  });
});
