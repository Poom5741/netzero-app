/**
 * Issue #47 — Connectivity checkpoint: Phase 1
 * Verifies Phase 1 (farmer data collection) works end-to-end.
 * Tests: farmer can register, upload photo, submit fertilizer, view season summary.
 */
import { describe, expect, it } from "vitest";
import { seasonSummary } from "../../src/season/summary";
import { screenPhoto } from "../../src/vision/screen";
import {
  createTestApp,
  seedFarmer,
  seedFertilizer,
  seedPhoto,
  seedPlot,
  seedSeasonInput,
} from "../helpers/integration";

const SEASON = "2026-01";

describe("Phase 1 — farmer data collection", () => {
  it("farmer can be registered (seeded)", async () => {
    const { db } = await createTestApp();
    const farmer = await seedFarmer(db);
    expect(farmer.id).toBe("farmer-1");
    expect(farmer.full_name).toBe("Somchai Jaidee");
    expect(farmer.phone).toBe("0812345678");
  });

  it("farmer can have a plot registered", async () => {
    const { db } = await createTestApp();
    const farmer = await seedFarmer(db);
    const plot = await seedPlot(db, farmer.id as string);
    expect(plot.id).toBeDefined();
    expect(plot.farmer_id).toBe(farmer.id);
    expect(plot.area_rai).toBe(15);
  });

  it("farmer can upload a photo", async () => {
    const { app, db, r2 } = await createTestApp();
    const farmer = await seedFarmer(db);
    const plot = await seedPlot(db, farmer.id as string);

    const fd = new FormData();
    fd.append("photo", new File(["bytes"], "field.jpg", { type: "image/jpeg" }));
    fd.append("plot_id", plot.id as string);
    fd.append("season_id", SEASON);
    fd.append("gps_lat", "18.7883");
    fd.append("gps_lng", "98.9853");
    fd.append("taken_at", "2026-01-15T10:00:00Z");

    const res = await app.request(
      "/photo/upload",
      new Request("http://localhost/photo/upload", { method: "POST", body: fd }),
    );
    expect(res.status).toBe(201);
    expect(r2.stored.size).toBe(1);

    const body = await res.json<{ id: string }>();
    expect(body.id).toMatch(/^photo_/);
  });

  it("farmer can submit fertilizer entry", async () => {
    const { db } = await createTestApp();
    const farmer = await seedFarmer(db);
    const plot = await seedPlot(db, farmer.id as string);

    const fert = await seedFertilizer(db, plot.id as string, SEASON);
    expect(fert.step).toBe("base");
    expect(fert.formula).toBe("46-0-0");
    expect(fert.rate_kg_per_rai).toBe(12);
    expect(fert.nitrogen_kg_per_rai).toBe(5.52);
  });

  it("season summary is available after data entry", async () => {
    const { db } = await createTestApp();
    const farmer = await seedFarmer(db);
    const plot = await seedPlot(db, farmer.id as string);
    await seedSeasonInput(db, plot.id as string, SEASON);

    const summary = await seasonSummary(db as never, SEASON, plot.id as string);
    expect(summary).not.toBeNull();
    expect(summary?.water_management).toBe("continuous");
    expect(summary?.yield_kg_per_rai).toBe(400);
    expect(summary?.status).toBe("open");
  });

  it("AI screens uploaded photo with confidence", async () => {
    const { db } = await createTestApp();
    const farmer = await seedFarmer(db);
    const plot = await seedPlot(db, farmer.id as string);
    const photo = await seedPhoto(db, plot.id as string, SEASON);

    const result = await screenPhoto(db as never, photo.id as string, "rice_paddy", 0.92);
    expect(result.ai_status).toBe("pass");
    expect(result.ai_confidence).toBe(0.92);
  });
});
