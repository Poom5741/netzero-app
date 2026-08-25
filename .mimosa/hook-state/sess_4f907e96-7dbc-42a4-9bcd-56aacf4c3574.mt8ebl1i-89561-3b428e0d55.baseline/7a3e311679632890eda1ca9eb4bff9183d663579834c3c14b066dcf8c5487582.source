import { describe, expect, it } from "vitest";
import { capturePhotoMetadata } from "../../src/liff/camera";

describe("capturePhotoMetadata", () => {
  it("returns timestamp as ISO string", () => {
    const result = capturePhotoMetadata({
      gpsLat: 13.7563,
      gpsLng: 100.5018,
      gpsAccuracy: 10,
      photoDataUrl: "data:image/jpeg;base64,abc123",
    });
    expect(result.taken_at).toBeDefined();
    expect(new Date(result.taken_at).toISOString()).toBe(result.taken_at);
  });

  it("includes GPS coordinates", () => {
    const result = capturePhotoMetadata({
      gpsLat: 13.7563,
      gpsLng: 100.5018,
      gpsAccuracy: 10,
      photoDataUrl: "data:image/jpeg;base64,abc123",
    });
    expect(result.gps_lat).toBe(13.7563);
    expect(result.gps_lng).toBe(100.5018);
  });

  it("includes gps_accuracy when provided", () => {
    const result = capturePhotoMetadata({
      gpsLat: 13.7563,
      gpsLng: 100.5018,
      gpsAccuracy: 5,
      photoDataUrl: "data:image/jpeg;base64,abc123",
    });
    expect(result.gps_accuracy).toBe(5);
  });

  it("returns null gps_accuracy when not provided", () => {
    const result = capturePhotoMetadata({
      gpsLat: 13.7563,
      gpsLng: 100.5018,
      gpsAccuracy: undefined,
      photoDataUrl: "data:image/jpeg;base64,abc123",
    });
    expect(result.gps_accuracy).toBeNull();
  });

  it("includes photo data url", () => {
    const result = capturePhotoMetadata({
      gpsLat: 13.7563,
      gpsLng: 100.5018,
      gpsAccuracy: 10,
      photoDataUrl: "data:image/jpeg;base64,abc123",
    });
    expect(result.photo_data_url).toBe("data:image/jpeg;base64,abc123");
  });

  it("generates a unique id", () => {
    const a = capturePhotoMetadata({
      gpsLat: 13.7563,
      gpsLng: 100.5018,
      gpsAccuracy: 10,
      photoDataUrl: "data:image/jpeg;base64,abc",
    });
    const b = capturePhotoMetadata({
      gpsLat: 13.7563,
      gpsLng: 100.5018,
      gpsAccuracy: 10,
      photoDataUrl: "data:image/jpeg;base64,abc",
    });
    expect(a.id).toBeDefined();
    expect(a.id).not.toBe(b.id);
  });
});
