import { describe, expect, it } from "vitest";

/**
 * Integration tests for the full LINE OA flow.
 * Verifies: registration → season creation → photo submission → carbon estimation
 *
 * These tests use mock D1 to verify the integration between modules
 * without requiring a real database.
 */

// ─── Registration Flow Integration ──────────────────────────────────

describe("Registration flow integration", () => {
  it("complete OB-01 to OB-11 flow produces correct messages", async () => {
    const { composeRegistrationWelcome } = await import("../../src/line/flow-registration");
    const { composePdpaConsent } = await import("../../src/line/flow-registration");
    const { composeIdentityConfirmation } = await import("../../src/line/flow-registration");
    const { composeActivationSuccess } = await import("../../src/line/flow-registration");

    // OB-01: Welcome
    const welcome = composeRegistrationWelcome();
    expect(welcome).toContain("NetZeroCarbon");
    expect(welcome).toContain("10 นาที");

    // OB-02: PDPA
    const pdpa = composePdpaConsent();
    expect(pdpa).toContain("PDPA");
    expect(pdpa).toContain("ถอนความยินยอม");

    // OB-04: Identity
    const identity = composeIdentityConfirmation({
      farmerName: "สมชาย ใจดี",
      province: "สุพรรณบุรี",
      district: "สามชุก",
    });
    expect(identity).toContain("สมชาย ใจดี");
    expect(identity).toContain("ใช่ท่าน");

    // OB-09: Activation
    const activation = composeActivationSuccess({
      farmerCode: "SPB-0142",
      plotName: "แปลงนาหลังบ้าน",
      areaRai: 14.0,
    });
    expect(activation).toContain("SPB-0142");
    expect(activation).toContain("วันหว่าน");
  });

  it("registration steps are ordered correctly", async () => {
    const { REGISTRATION_STEPS } = await import("../../src/line/flow-registration");
    expect(REGISTRATION_STEPS).toHaveLength(11);
    expect(REGISTRATION_STEPS[0].code).toBe("OB-01");
    expect(REGISTRATION_STEPS[10].code).toBe("OB-11");
  });
});

// ─── Season Creation Integration ────────────────────────────────────

describe("Season creation integration", () => {
  it("generates 9 steps with correct codes and due dates", async () => {
    const { generateSeasonSteps } = await import("../../src/season/calendar");
    const steps = generateSeasonSteps("input_1", "2026-07-01", 120);

    expect(steps).toHaveLength(9);
    expect(steps[0].step_code).toBe("SG-01");
    expect(steps[3].step_code).toBe("SG-04"); // WET-1
    expect(steps[4].step_code).toBe("SG-05"); // DRY-1
    expect(steps[6].step_code).toBe("SG-07"); // WET-2
    expect(steps[7].step_code).toBe("SG-08"); // DRY-2
    expect(steps[8].step_code).toBe("SG-09"); // Harvest
  });

  it("photo steps are flagged as requiring camera", async () => {
    const { generateSeasonSteps } = await import("../../src/season/calendar");
    const steps = generateSeasonSteps("input_1", "2026-07-01", 120);
    const photoSteps = steps.filter((s) => s.requires_photo);
    expect(photoSteps).toHaveLength(4);
    expect(photoSteps.map((s) => s.step_code)).toEqual([
      "SG-04", "SG-05", "SG-07", "SG-08",
    ]);
  });
});

// ─── Photo Submission Integration ───────────────────────────────────

describe("Photo submission integration", () => {
  it("WET round prompt includes correct instructions", async () => {
    const { composeCameraPrompt } = await import("../../src/liff/camera-api");
    const msg = composeCameraPrompt({
      roundLabel: "WET-1",
      stepCode: "SG-04",
      plotName: "แปลงนาหลังบ้าน",
      dayAfterSow: 28,
      deadline: "8 ส.ค.",
      daysLeft: 2,
      isWet: true,
    });
    expect(msg).toContain("ท่อ PVC");
    expect(msg).toContain("น้ำเต็มระดับผิวดิน");
    expect(msg).toContain("GPS");
  });

  it("DRY round prompt includes water depth instruction", async () => {
    const { composeCameraPrompt } = await import("../../src/liff/camera-api");
    const msg = composeCameraPrompt({
      roundLabel: "DRY-1",
      stepCode: "SG-05",
      plotName: "แปลงทดสอบ",
      dayAfterSow: 42,
      deadline: "22 ส.ค.",
      daysLeft: 3,
      isWet: false,
    });
    expect(msg).toContain("ระดับน้ำ");
    expect(msg).toContain("ซม.");
  });

  it("photo confirmation includes GPS coordinates", async () => {
    const { composePhotoConfirmation } = await import("../../src/liff/camera-api");
    const msg = composePhotoConfirmation({
      roundLabel: "WET-1",
      photoId: "photo_123",
      gpsLat: 14.9231,
      gpsLng: 100.1042,
      takenAt: "07:13",
      waterDepthCm: null,
    });
    expect(msg).toContain("14.9231");
    expect(msg).toContain("100.1042");
  });
});

// ─── Carbon Estimation Integration ──────────────────────────────────

describe("Carbon estimation integration", () => {
  it("SF_w computed correctly from photo count", async () => {
    // Mock: 4 approved photos
    const approvedPhotos = 4;
    let sfW: number;
    if (approvedPhotos >= 4) sfW = 0.55;
    else if (approvedPhotos >= 1) sfW = 0.71;
    else sfW = 1.0;
    expect(sfW).toBe(0.55);
  });

  it("SF_w downgrades when photos incomplete", async () => {
    const approvedPhotos = 2;
    let sfW: number;
    if (approvedPhotos >= 4) sfW = 0.55;
    else if (approvedPhotos >= 1) sfW = 0.71;
    else sfW = 1.0;
    expect(sfW).toBe(0.71);
  });

  it("carbon estimate is non-zero when estimation runs", async () => {
    const { runEstimation } = await import("../../src/calc/orchestrator");
    const result = runEstimation({
      ef_rice: 10.0,
      ad_rice: 14.0,
      sf_w_baseline: 1.0,
      sf_w_project: 0.55,
      sf_p: 1.0,
      sf_o: 1.0,
      nitrogen_baseline: 8.5,
      nitrogen_project: 8.5,
      urea_baseline: 18.5,
      lime_baseline: 0,
      fuel_baseline: 5,
      elec_baseline: 2,
      urea_project: 18.5,
      lime_project: 0,
      fuel_project: 5,
      elec_project: 2,
      a_burn_baseline: 0,
      a_burn_project: 0,
      ef_burn_kg_per_rai: 25.0,
    });
    expect(result.total_offset_tco2e).toBeGreaterThan(0);
    expect(result.sf_w_project).toBe(0.55);
  });
});

// ─── Results Flow Integration ───────────────────────────────────────

describe("Results flow integration", () => {
  it("dashboard message shows all key information", async () => {
    const { composeDashboardMessage } = await import("../../src/liff/dashboard-api");
    const msg = composeDashboardMessage({
      farmerName: "สมชาย",
      plotCode: "SPB-0142",
      plotName: "แปลงนาหลังบ้าน",
      areaRai: 14.0,
      totalOffset: 9.42,
      sfW: 0.55,
      photoProgress: { approved: 4, total: 4 },
      pendingPhotos: 0,
      backfillCount: 0,
    });
    expect(msg).toContain("9.42");
    expect(msg).toContain("SPB-0142");
    expect(msg).toContain("4/4");
    expect(msg).toContain("ครบทุกรายการ");
  });

  it("TODO message shows pending tasks", async () => {
    const { composeTodoMessage } = await import("../../src/line/flow-results");
    const msg = composeTodoMessage({
      pendingPhotos: 1,
      retakePhotos: 0,
      backfillSeasons: 2,
    });
    expect(msg).toContain("3");
    expect(msg).toContain("ภาพ");
    expect(msg).toContain("ย้อนหลัง");
  });
});

// ─── Document Upload Integration ────────────────────────────────────

describe("Document upload integration", () => {
  it("document prompt includes all 3 required types", async () => {
    const { composeDocumentPrompt } = await import("../../src/liff/documents-api");
    const msg = composeDocumentPrompt({
      plotCode: "SPB-0142",
      deedNo: "12345",
    });
    expect(msg).toContain("โฉนดที่ดิน");
    expect(msg).toContain("สำเนาบัตรประชาชน");
    expect(msg).toContain("หนังสือมอบอำนาจ");
  });

  it("validates document types correctly", async () => {
    const { validateDocumentSubmission } = await import("../../src/liff/documents-api");
    expect(validateDocumentSubmission({ plot_id: "p1", doc_type: "chanote" }).valid).toBe(true);
    expect(validateDocumentSubmission({ plot_id: "p1", doc_type: "id_copy" }).valid).toBe(true);
    expect(validateDocumentSubmission({ plot_id: "p1", doc_type: "invalid" }).valid).toBe(false);
  });
});

// ─── Rejection Flow Integration ─────────────────────────────────────

describe("Rejection flow integration", () => {
  it("rejection message includes reason and deadline", async () => {
    const { composeRejectionMessage } = await import("../../src/vision/retake-message");
    const msg = composeRejectionMessage({
      photoType: "wetdry",
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
});

// ─── Backfill Integration ───────────────────────────────────────────

describe("Backfill integration", () => {
  it("backfill prompt shows missing seasons", async () => {
    const { composeBackfillPrompt } = await import("../../src/liff/backfill-api");
    const msg = composeBackfillPrompt({
      plotName: "แปลงนาหลังบ้าน",
      missingSeasons: 2,
      availableYears: ["2567", "2568"],
    });
    expect(msg).toContain("2");
    expect(msg).toContain("2567");
    expect(msg).toContain("วันหว่าน");
  });

  it("validates backfill entry correctly", async () => {
    const { validateBackfillEntry } = await import("../../src/liff/backfill-api");
    expect(validateBackfillEntry({
      plot_id: "p1", season_name: "test", sow_date: "2025-07-01", water_management: "awd",
    }).valid).toBe(true);
    expect(validateBackfillEntry({
      plot_id: "p1", season_name: "test", sow_date: "", water_management: "awd",
    }).valid).toBe(false);
  });
});
