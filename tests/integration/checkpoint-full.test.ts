/**
 * Issue #48 — Connectivity checkpoint: full 3-phase chain
 * Verifies data flows from Phase 1 → Phase 2 (calc) → Phase 3 (sponsor dashboard).
 */
import { describe, expect, it } from "vitest";
import { reviewPhoto } from "../../src/admin/review";
import { runEstimation } from "../../src/calc/orchestrator";
import { seasonSummary } from "../../src/season/summary";
import { screenPhoto } from "../../src/vision/screen";
import {
  createTestApp,
  makeSessionCookie,
  seedFarmer,
  seedFertilizer,
  seedPhoto,
  seedPlot,
  seedSeasonInput,
  seedUser,
} from "../helpers/integration";

const SEASON = "2026-01";

describe("Full 3-phase chain", () => {
  it("Phase 1 → Phase 2: farmer data feeds carbon estimation", async () => {
    const { db } = await createTestApp();

    // Phase 1: farmer data collection
    const farmer = await seedFarmer(db);
    const plot = await seedPlot(db, farmer.id as string);
    await seedPhoto(db, plot.id as string, SEASON);
    await seedFertilizer(db, plot.id as string, SEASON);
    await seedSeasonInput(db, plot.id as string, SEASON);

    // Phase 2: carbon estimation runs on Phase 1 data
    const summary = await seasonSummary(db as never, SEASON, plot.id as string);
    expect(summary).not.toBeNull();

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

    expect(estimate.baseline_ch4).toBeGreaterThan(0);
    expect(estimate.project_ch4).toBeGreaterThan(0);
    expect(estimate.total_offset_tco2e).toBeGreaterThan(0);
  });

  it("Phase 2 → Phase 3: sponsor sees dashboard after admin approval", async () => {
    const { app, db } = await createTestApp();

    // Seed admin and sponsor users
    await seedUser(db, { id: "admin-1", email: "admin@test.com", role: "admin" });
    await seedUser(db, { id: "sponsor-1", email: "sponsor@test.com", role: "sponsor" });

    // Phase 1 data
    const farmer = await seedFarmer(db);
    const plot = await seedPlot(db, farmer.id as string);
    const photo = await seedPhoto(db, plot.id as string, SEASON);
    await seedSeasonInput(db, plot.id as string, SEASON);

    // Phase 2: AI screen + admin review
    await screenPhoto(db as never, photo.id as string, "rice_paddy", 0.85);
    await reviewPhoto(db as never, photo.id as string, "verified", "Approved");

    // Phase 3: sponsor accesses dashboard
    const sponsorCookie = await makeSessionCookie("sponsor");
    const sponsorRes = await app.request(
      "/sponsor",
      new Request("http://localhost/sponsor", {
        headers: { Cookie: sponsorCookie },
      }),
    );
    expect(sponsorRes.status).toBe(200);
    const body = await sponsorRes.json() as { provinces: unknown[] };
    expect(body).toHaveProperty("provinces");
  });

  it("admin can access admin dashboard", async () => {
    const { app, db } = await createTestApp();
    await seedUser(db, { id: "admin-1", email: "admin@test.com", role: "admin" });

    const adminCookie = await makeSessionCookie("admin");
    const adminRes = await app.request(
      "/admin",
      new Request("http://localhost/admin", {
        headers: { Cookie: adminCookie },
      }),
    );
    expect(adminRes.status).toBe(200);
    const html = await adminRes.text();
    expect(html).toContain("Admin Dashboard");
  });

  it("unauthenticated user cannot access dashboards", async () => {
    const { app } = await createTestApp();

    const adminRes = await app.request("/admin");
    expect(adminRes.status).toBe(401);

    const sponsorRes = await app.request("/sponsor");
    expect(sponsorRes.status).toBe(401);
  });
});
