import { describe, expect, it } from "vitest";
import { validatePhoto } from "../../src/photo/validation";

function makeExistingPhoto(hash: string) {
  return { id: "existing-1", photo_url: `evidence/${hash}.jpg` };
}

describe("validatePhoto", () => {
  it("rejects duplicate photo by hash", async () => {
    const db = {
      prepare(_sql: string) {
        return {
          bind(...args: unknown[]) {
            return {
              first: async () => makeExistingPhoto(args[0] as string),
            };
          },
        };
      },
    };

    const result = await validatePhoto({
      fileHash: "abc123",
      gpsLat: 13.75,
      gpsLng: 100.5,
      gpsAccuracy: 10,
      db: db as any,
    });

    expect(result.isValid).toBe(false);
    expect(result.reason).toContain("ซ้ำ");
  });

  it("passes when no duplicate found", async () => {
    const db = {
      prepare() {
        return {
          bind() {
            return { first: async () => null };
          },
        };
      },
    };

    const result = await validatePhoto({
      fileHash: "abc123",
      gpsLat: 13.75,
      gpsLng: 100.5,
      gpsAccuracy: 10,
      db: db as any,
    });

    expect(result.isValid).toBe(true);
  });

  it("rejects when gps_accuracy > 50 meters", async () => {
    const db = {
      prepare() {
        return {
          bind() {
            return { first: async () => null };
          },
        };
      },
    };

    const result = await validatePhoto({
      fileHash: "abc123",
      gpsLat: 13.75,
      gpsLng: 100.5,
      gpsAccuracy: 100,
      db: db as any,
    });

    expect(result.isValid).toBe(false);
    expect(result.reason).toContain("GPS");
  });
});
