import { describe, expect, it } from "vitest";
import { getPhotoDetail } from "../../src/admin/detail";

function mockD1(row: Record<string, unknown> | null) {
  return {
    prepare(_sql: string) {
      return {
        bind(..._args: unknown[]) {
          return { first: async () => row };
        },
      };
    },
  };
}

const PHOTO = {
  id: "photo-1",
  plot_id: "plot-1",
  season_id: "season-1",
  photo_url: "evidence/photo-1.jpg",
  gps_lat: 13.7563,
  gps_lng: 100.5018,
  gps_accuracy: 10,
  taken_at: "2025-01-01T12:00:00Z",
  ai_status: "flag",
  ai_label: "uncertain",
  ai_reason: "blurry image",
  ai_confidence: 0.45,
  admin_status: "pending",
  admin_reason: null,
};

describe("getPhotoDetail", () => {
  it("returns GPS coordinates", async () => {
    const db = mockD1(PHOTO) as unknown as D1Database;
    const result = await getPhotoDetail(db, "photo-1");

    expect(result).not.toBeNull();
    expect(result?.gps_lat).toBe(13.7563);
    expect(result?.gps_lng).toBe(100.5018);
  });

  it("returns AI analysis fields", async () => {
    const db = mockD1(PHOTO) as unknown as D1Database;
    const result = await getPhotoDetail(db, "photo-1");

    expect(result?.ai_status).toBe("flag");
    expect(result?.ai_reason).toBe("blurry image");
    expect(result?.ai_confidence).toBe(0.45);
  });

  it("returns photo metadata", async () => {
    const db = mockD1(PHOTO) as unknown as D1Database;
    const result = await getPhotoDetail(db, "photo-1");

    expect(result?.photo_url).toBeDefined();
    expect(result?.taken_at).toBeDefined();
  });

  it("returns null for missing photo", async () => {
    const db = mockD1(null) as unknown as D1Database;
    const result = await getPhotoDetail(db, "missing");

    expect(result).toBeNull();
  });
});
