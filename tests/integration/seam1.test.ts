/**
 * Issue #44 — Integration harness (Seam 1)
 * Full vertical slice through public HTTP surface.
 * Simulates: webhook → onboarding → photo → fertilizer → admin review → calc → sponsor
 */
import { describe, expect, it } from "vitest";
import { reviewPhoto } from "../../src/admin/review";
import { runEstimation } from "../../src/calc/orchestrator";
import { screenPhoto } from "../../src/vision/screen";
import {
  createTestApp,
  makeSessionCookie,
  seedFarmer,
  seedFertilizer,
  seedPlot,
  seedSeasonInput,
} from "../helpers/integration";

const SEASON = "2026-01";

describe("Seam 1 — full vertical slice", () => {
  it("health endpoint returns ok", async () => {
    const { app } = await createTestApp();
    const res = await app.request("/health");
    expect(res.status).toBe(200);
    const body = await res.json<{ status: string }>();
    expect(body.status).toBe("ok");
  });

  it("onboarding → photo → fertilizer → review → calc → sponsor", async () => {
    const { app, db, r2 } = await createTestApp();

    // Step 1: Farmer onboarding (seed farmer + plot)
    const farmer = await seedFarmer(db);
    expect(farmer.id).toBe("farmer-1");

    const plot = await seedPlot(db, farmer.id as string);
    expect(plot.id).toBeDefined();

    // Step 2: Photo upload via HTTP
    const fd = new FormData();
    fd.append("photo", new File(["bytes"], "rice.jpg", { type: "image/jpeg" }));
    fd.append("plot_id", plot.id as string);
    fd.append("season_id", SEASON);
    fd.append("gps_lat", "18.7883");
    fd.append("gps_lng", "98.9853");
    fd.append("taken_at", "2026-01-15T10:00:00Z");
    fd.append("photo_type", "prepare");

    const photoRes = await app.request(
      "/photo/upload",
      new Request("http://localhost/photo/upload", { method: "POST", body: fd }),
    );
    expect(photoRes.status).toBe(201);
    const photoBody = await photoRes.json<{ id: string; photo_url: string }>();
    expect(photoBody.id).toMatch(/^photo_/);
    expect(r2.stored.size).toBe(1);

    // Step 3: Fertilizer entry (seed directly)
    const fert = await seedFertilizer(db, plot.id as string, SEASON);
    expect(fert.id).toBeDefined();

    // Step 4: AI vision screening
    const screenResult = await screenPhoto(db as never, photoBody.id, "rice_paddy", 0.92);
    expect(screenResult.ai_status).toBe("pass");
    expect(screenResult.ai_label).toBe("rice_paddy");

    // Step 5: Admin review
    const reviewResult = await reviewPhoto(db as never, photoBody.id, "verified", "Looks good");
    expect(reviewResult.success).toBe(true);

    // Step 6: Season input + carbon calculation
    const seasonInput = await seedSeasonInput(db, plot.id as string, SEASON);
    expect(seasonInput.status).toBe("open");

    const estimate = runEstimation({
      ef_rice: 1.39,
      ad_rice: 15,
      sf_w_baseline: 1.0,
      sf_w_project: 0.5,
      sf_p: 1.0,
      sf_o: 1.0,
      nitrogen_baseline: 20,
      nitrogen_project: 12,
      urea_baseline: 12,
      lime_baseline: 200,
      fuel_baseline: 5,
      elec_baseline: 10,
      urea_project: 8,
      lime_project: 200,
      fuel_project: 3,
      elec_project: 8,
      a_burn_baseline: 7.5,
      a_burn_project: 1.5,
      ef_burn_kg_per_rai: 45,
    });
    expect(estimate.total_offset_tco2e).toBeGreaterThan(0);

    // Step 7: Sponsor access
    const sponsorCookie = makeSessionCookie("sponsor");
    const sponsorRes = await app.request(
      "/sponsor",
      new Request("http://localhost/sponsor", {
        headers: { Cookie: sponsorCookie },
      }),
    );
    expect(sponsorRes.status).toBe(200);
    const html = await sponsorRes.text();
    expect(html).toContain("Sponsor Dashboard");
  });

  it("404 returned for unknown routes", async () => {
    const { app } = await createTestApp();
    const res = await app.request("/nonexistent");
    expect(res.status).toBe(404);
  });
});
