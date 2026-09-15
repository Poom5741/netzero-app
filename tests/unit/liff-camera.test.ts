import { describe, expect, it } from "vitest";

/**
 * Tests for LIFF camera page API.
 * Handles photo capture with GPS and water depth for DRY rounds.
 */

function _mockD1() {
  const calls: { sql: string; args: unknown[] }[] = [];
  return {
    calls,
    prepare(sql: string) {
      return {
        bind(...args: unknown[]) {
          calls.push({ sql, args });
          return {
            run: async () => ({ success: true }),
            first: async () => null,
            all: async () => ({ results: [] }),
          };
        },
      };
    },
  };
}

describe("composeCameraPrompt", () => {
  it("composes WET round prompt", async () => {
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
    expect(msg).toContain("WET-1");
    expect(msg).toContain("SG-04");
    expect(msg).toContain("แปลงนาหลังบ้าน");
    expect(msg).toContain("28");
    expect(msg).toContain("8 ส.ค.");
    expect(msg).toContain("เปียก");
  });

  it("composes DRY round prompt with water depth instruction", async () => {
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
    expect(msg).toContain("DRY-1");
    expect(msg).toContain("แห้ง");
    expect(msg).toContain("ระดับน้ำ");
    expect(msg).toContain("ซม.");
  });

  it("composes deadline warning when days left <= 2", async () => {
    const { composeCameraPrompt } = await import("../../src/liff/camera-api");
    const msg = composeCameraPrompt({
      roundLabel: "WET-2",
      stepCode: "SG-07",
      plotName: "แปลงทดสอบ",
      dayAfterSow: 61,
      deadline: "14 ก.ย.",
      daysLeft: 1,
      isWet: true,
    });
    expect(msg).toContain("1 วัน");
    expect(msg).toContain("ด่วน");
  });
});

describe("composePhotoConfirmation", () => {
  it("composes confirmation with GPS coordinates", async () => {
    const { composePhotoConfirmation } = await import("../../src/liff/camera-api");
    const msg = composePhotoConfirmation({
      roundLabel: "WET-1",
      photoId: "photo_123",
      gpsLat: 14.9231,
      gpsLng: 100.1042,
      takenAt: "07:13",
      waterDepthCm: null,
    });
    expect(msg).toContain("WET-1");
    expect(msg).toContain("14.9231");
    expect(msg).toContain("100.1042");
    expect(msg).toContain("07:13");
  });

  it("includes water depth for DRY rounds", async () => {
    const { composePhotoConfirmation } = await import("../../src/liff/camera-api");
    const msg = composePhotoConfirmation({
      roundLabel: "DRY-1",
      photoId: "photo_456",
      gpsLat: 14.9231,
      gpsLng: 100.1042,
      takenAt: "07:41",
      waterDepthCm: 10,
    });
    expect(msg).toContain("10 ซม.");
  });

  it("omits water depth for WET rounds", async () => {
    const { composePhotoConfirmation } = await import("../../src/liff/camera-api");
    const msg = composePhotoConfirmation({
      roundLabel: "WET-1",
      photoId: "photo_789",
      gpsLat: 14.9231,
      gpsLng: 100.1042,
      takenAt: "07:13",
      waterDepthCm: null,
    });
    expect(msg).not.toContain("ซม.");
  });
});

describe("validatePhotoSubmission", () => {
  it("rejects when plot_id is missing", async () => {
    const { validatePhotoSubmission } = await import("../../src/liff/camera-api");
    const result = validatePhotoSubmission({
      plot_id: "",
      season_id: "season_1",
      photo_type: "wetdry",
      gps_lat: 14.9,
      gps_lng: 100.1,
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain("plot_id");
  });

  it("rejects when GPS coordinates missing", async () => {
    const { validatePhotoSubmission } = await import("../../src/liff/camera-api");
    const result = validatePhotoSubmission({
      plot_id: "plot_1",
      season_id: "season_1",
      photo_type: "wetdry",
      gps_lat: 0,
      gps_lng: 0,
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain("GPS");
  });

  it("accepts water depth for DRY rounds", async () => {
    const { validatePhotoSubmission } = await import("../../src/liff/camera-api");
    const result = validatePhotoSubmission({
      plot_id: "plot_1",
      season_id: "season_1",
      photo_type: "wetdry",
      gps_lat: 14.9,
      gps_lng: 100.1,
      water_depth_cm: 10,
    });
    expect(result.valid).toBe(true);
  });

  it("accepts valid DRY submission with water depth", async () => {
    const { validatePhotoSubmission } = await import("../../src/liff/camera-api");
    const result = validatePhotoSubmission({
      plot_id: "plot_1",
      season_id: "season_1",
      photo_type: "wetdry",
      gps_lat: 14.9,
      gps_lng: 100.1,
      water_depth_cm: 10,
    });
    expect(result.valid).toBe(true);
  });
});
