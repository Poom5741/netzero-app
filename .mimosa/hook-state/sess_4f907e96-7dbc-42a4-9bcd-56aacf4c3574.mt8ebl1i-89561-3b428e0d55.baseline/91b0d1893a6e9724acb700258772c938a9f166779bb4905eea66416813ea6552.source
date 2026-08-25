import { describe, it, expect, vi } from "vitest";
import { getGpsLocation } from "@/lib/photo";

// Mock geolocation
const mockGeolocation = {
  getCurrentPosition: vi.fn(),
};
Object.defineProperty(navigator, "geolocation", {
  value: mockGeolocation,
  writable: true,
});

describe("getGpsLocation", () => {
  it("resolves with position on success", async () => {
    const mockPosition = {
      coords: { latitude: 14.0322, longitude: 100.5231, accuracy: 5 },
      timestamp: Date.now(),
    };
    mockGeolocation.getCurrentPosition.mockImplementation((success) => {
      success(mockPosition);
    });

    const result = await getGpsLocation();
    expect(result.coords.latitude).toBe(14.0322);
    expect(result.coords.longitude).toBe(100.5231);
  });

  it("rejects on error", async () => {
    mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
      error({ code: 1, message: "Permission denied" });
    });

    await expect(getGpsLocation()).rejects.toThrow();
  });
});
