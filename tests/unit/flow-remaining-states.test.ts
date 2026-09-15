import { describe, expect, it } from "vitest";

/**
 * Task 06: Remaining chat states.
 *
 * Tests:
 * 1. composeRejectionMessage shows admin's reason + resubmission deadline
 * 2. composePendingTasksMessage shows real incomplete items
 * 3. renderPlotCards shows per-plot cards with photo progress
 * 4. composeContactPage shows coordinator info
 */

import { composeContactPage } from "../../src/liff/contact-page";
import { type PlotCardData, renderPlotCards } from "../../src/liff/plot-selection";
import { composeRejectionMessage, type RejectionInput } from "../../src/line/flow-photo-reporting";
import { composePendingTasksMessage } from "../../src/line/flow-results";

// ---------------------------------------------------------------------------
// Rejection flow (PJ-09)
// ---------------------------------------------------------------------------

describe("composeRejectionMessage (PJ-09)", () => {
  const validInput: RejectionInput = {
    roundLabel: "WET-1",
    reason: "ภาพไม่เห็นท่อ PVC",
    deadline: "15/07/2568",
    plotName: "แปลง SPB-0142",
  };

  it("includes rejection reason", () => {
    const msg = composeRejectionMessage(validInput);
    expect(msg).toContain("ภาพไม่เห็นท่อ PVC");
  });

  it("includes resubmission deadline", () => {
    const msg = composeRejectionMessage(validInput);
    expect(msg).toContain("15/07/2568");
  });

  it("includes retake button text", () => {
    const msg = composeRejectionMessage(validInput);
    expect(msg).toContain("ถ่ายใหม่");
  });

  it("includes plot name", () => {
    const msg = composeRejectionMessage(validInput);
    expect(msg).toContain("SPB-0142");
  });

  it("includes round label", () => {
    const msg = composeRejectionMessage(validInput);
    expect(msg).toContain("WET-1");
  });
});

// ---------------------------------------------------------------------------
// Pending tasks (RP-01)
// ---------------------------------------------------------------------------

describe("composePendingTasksMessage (RP-01)", () => {
  it("shows empty state when no tasks", () => {
    const msg = composePendingTasksMessage({
      pendingPhotos: 0,
      retakePhotos: 0,
      backfillSeasons: 0,
    });
    expect(msg).toContain("ไม่มีงานค้าง");
  });

  it("shows pending photos count", () => {
    const msg = composePendingTasksMessage({
      pendingPhotos: 3,
      retakePhotos: 0,
      backfillSeasons: 0,
    });
    expect(msg).toContain("3");
    expect(msg).toContain("ภาพ");
  });

  it("shows retake photos count", () => {
    const msg = composePendingTasksMessage({
      pendingPhotos: 0,
      retakePhotos: 2,
      backfillSeasons: 0,
    });
    expect(msg).toContain("2");
    expect(msg).toContain("ถ่ายใหม่");
  });

  it("shows backfill seasons count", () => {
    const msg = composePendingTasksMessage({
      pendingPhotos: 0,
      retakePhotos: 0,
      backfillSeasons: 1,
    });
    expect(msg).toContain("1");
    expect(msg).toContain("ย้อนหลัง");
  });

  it("shows combined task counts", () => {
    const msg = composePendingTasksMessage({
      pendingPhotos: 2,
      retakePhotos: 1,
      backfillSeasons: 1,
    });
    expect(msg).toContain("4"); // total
  });
});

// ---------------------------------------------------------------------------
// My plots (LiffFields)
// ---------------------------------------------------------------------------

describe("renderPlotCards", () => {
  it("renders plot cards with photo progress", () => {
    const plots: PlotCardData[] = [
      {
        id: "p1",
        plotCode: "SPB-0142",
        areaRai: 15.5,
        variety: "ข้าวหอมมะลิ",
        photosApproved: 3,
        photosTotal: 4,
      },
    ];
    const html = renderPlotCards(plots);
    expect(html).toContain("SPB-0142");
    expect(html).toContain("15.5");
    expect(html).toContain("ข้าวหอมมะลิ");
    expect(html).toContain("3/4");
  });

  it("renders multiple plot cards", () => {
    const plots: PlotCardData[] = [
      {
        id: "p1",
        plotCode: "SPB-0142",
        areaRai: 15.5,
        variety: "ข้าวหอมมะลิ",
        photosApproved: 3,
        photosTotal: 4,
      },
      {
        id: "p2",
        plotCode: "SPB-0143",
        areaRai: 8.0,
        variety: "ข้าวเหนียว",
        photosApproved: 1,
        photosTotal: 4,
      },
    ];
    const html = renderPlotCards(plots);
    expect(html).toContain("SPB-0142");
    expect(html).toContain("SPB-0143");
  });

  it("shows empty state when no plots", () => {
    const html = renderPlotCards([]);
    expect(html).toContain("ยังไม่มีแปลง");
  });

  it("includes LIFF init script", () => {
    const html = renderPlotCards([]);
    expect(html).toContain("liff.init");
  });
});

// ---------------------------------------------------------------------------
// Contact page (LiffContact)
// ---------------------------------------------------------------------------

describe("composeContactPage", () => {
  it("returns HTML with coordinator info", () => {
    const html = composeContactPage();
    expect(html).toContain("ติดต่อเจ้าหน้าที่");
  });

  it("includes project name", () => {
    const html = composeContactPage();
    expect(html).toContain("NetZeroCarbon");
  });

  it("includes contact instruction", () => {
    const html = composeContactPage();
    expect(html).toContain("ผู้ประสานงาน");
  });
});
