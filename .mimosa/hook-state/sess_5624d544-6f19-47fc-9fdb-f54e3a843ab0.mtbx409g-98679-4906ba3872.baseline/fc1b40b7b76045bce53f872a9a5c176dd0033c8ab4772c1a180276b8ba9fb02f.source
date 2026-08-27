import { describe, expect, it } from "vitest";
import { createTestApp } from "../helpers/integration";

function makeRequest(overrides?: Record<string, string>) {
  const fd = new FormData();
  fd.append("photo", new File(["bytes"], "test.jpg", { type: "image/jpeg" }));
  fd.append("plot_id", "plot-1");
  fd.append("season_id", "season-1");
  fd.append("gps_lat", "13.75");
  fd.append("gps_lng", "100.50");
  fd.append("gps_accuracy", "10");
  fd.append("taken_at", "2025-05-01T12:00:00Z");
  fd.append("photo_type", "prepare");
  if (overrides) for (const [k, v] of Object.entries(overrides)) fd.set(k, v);
  return new Request("http://localhost/photo/upload", { method: "POST", body: fd });
}

describe("Temporal validation integration", () => {
  // sow_date = 2025-05-15 → prepare window: 2025-04-04 to 2025-05-29 (with grace)
  const sowDate = "2025-05-15";

  it("valid EXIF within phase window → continues to classification/queue", async () => {
    const { app, db } = await createTestApp();
    
    // Seed season_inputs with sow_date
    await db.prepare(
      "INSERT INTO season_inputs (id, plot_id, season_id, sow_date) VALUES (?, ?, ?, ?)"
    ).bind("si-1", "plot-1", "season-1", sowDate).run();
    
    // Within prepare window (2025-04-04 to 2025-05-29)
    const res = await app.request("/photo/upload", makeRequest({
      "__exif_timestamp": "2025-05-10T12:00:00Z",
    }));

    expect(res.status).toBe(201);
    const body = await res.json();
    // Should not be rejected or flagged for temporal reasons
    expect(body.error).toBeUndefined();
  });

  it("invalid EXIF outside phase window → rejected with 400", async () => {
    const { app, db } = await createTestApp();
    
    // Seed season_inputs with sow_date
    await db.prepare(
      "INSERT INTO season_inputs (id, plot_id, season_id, sow_date) VALUES (?, ?, ?, ?)"
    ).bind("si-1", "plot-1", "season-1", sowDate).run();
    
    // Outside prepare window (2025-04-04 to 2025-05-29) — July is way outside
    const res = await app.request("/photo/upload", makeRequest({
      "__exif_timestamp": "2025-07-01T12:00:00Z",
    }));

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Photo taken at wrong time");
  });

  it("missing EXIF → flagged for admin review", async () => {
    const { app, db } = await createTestApp();
    
    // Seed season_inputs with sow_date
    await db.prepare(
      "INSERT INTO season_inputs (id, plot_id, season_id, sow_date) VALUES (?, ?, ?, ?)"
    ).bind("si-1", "plot-1", "season-1", sowDate).run();
    
    // No __exif_timestamp → extractExifTimestamp returns null → unknown
    const res = await app.request("/photo/upload", makeRequest());

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.verdict).toBe("flagged");
    expect(body.reason).toContain("EXIF missing");
  });

  it("no season_inputs row → skips temporal validation, queues normally", async () => {
    const { app } = await createTestApp();
    // No season_inputs row seeded
    const res = await app.request("/photo/upload", makeRequest());

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.verdict).toBe("queued");
  });
});
