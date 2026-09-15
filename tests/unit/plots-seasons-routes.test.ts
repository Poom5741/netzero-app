import { describe, expect, it } from "vitest";
import { createTestApp, seedFarmer, seedPlot } from "../helpers/integration";

describe("GET /api/plots", () => {
  it("returns farmer's plots", async () => {
    const { app, db } = await createTestApp();
    await seedFarmer(db, { id: "farmer-001" });
    await seedPlot(db, "farmer-001", { id: "plot-001", plot_code: "CM-001", area_rai: 15.5 });
    await seedPlot(db, "farmer-001", { id: "plot-004", plot_code: "CM-002", area_rai: 8.0 });

    const res = await app.request("/api/plots?farmer_id=farmer-001");
    expect(res.status).toBe(200);

    const body = await res.json<{
      plots: Array<{ id: string; plot_code: string; area_rai: number }>;
    }>();
    expect(body.plots).toHaveLength(2);
    expect(body.plots[0]?.id).toBe("plot-001");
    expect(body.plots[1]?.id).toBe("plot-004");
  });

  it("returns empty array for farmer with no plots", async () => {
    const { app } = await createTestApp();
    const res = await app.request("/api/plots?farmer_id=nobody");
    expect(res.status).toBe(200);
    const body = await res.json<{ plots: unknown[] }>();
    expect(body.plots).toHaveLength(0);
  });

  it("returns 400 without farmer_id", async () => {
    const { app } = await createTestApp();
    const res = await app.request("/api/plots");
    expect(res.status).toBe(400);
  });
});

describe("GET /api/seasons", () => {
  it("returns seasons for a plot", async () => {
    const { app, db } = await createTestApp();
    await seedFarmer(db, { id: "farmer-001" });
    await seedPlot(db, "farmer-001", { id: "plot-001" });

    // Seed seasons
    await db
      .prepare("INSERT INTO seasons (id, plot_id, name, status) VALUES (?, ?, ?, ?)")
      .bind("2568-napi", "plot-001", "นาปี 2568", "active")
      .run();

    await db
      .prepare("INSERT INTO seasons (id, plot_id, name, status) VALUES (?, ?, ?, ?)")
      .bind("2568-prang", "plot-001", "นาปรัง 2568", "closed")
      .run();

    const res = await app.request("/api/seasons?plot_id=plot-001");
    expect(res.status).toBe(200);

    const body = await res.json<{ seasons: Array<{ id: string; name: string; status: string }> }>();
    expect(body.seasons).toHaveLength(2);
    expect(body.seasons[0]?.id).toBe("2568-napi");
    expect(body.seasons[0]?.status).toBe("active");
  });

  it("returns 400 without plot_id", async () => {
    const { app } = await createTestApp();
    const res = await app.request("/api/seasons");
    expect(res.status).toBe(400);
  });
});

describe("GET /api/season-steps/:seasonInputId", () => {
  it("returns calendar steps with the requires_photo flag from the LIFF calendar handler", async () => {
    const { app, db } = await createTestApp();
    await seedFarmer(db, { id: "farmer-001" });
    await seedPlot(db, "farmer-001", { id: "plot-001", plot_code: "CM-001", area_rai: 10 });

    const created = await app.request("/api/season/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plot_id: "plot-001", sow_date: "2025-06-15" }),
    });
    const { season_input_id } = await created.json<{ season_input_id: string }>();
    expect(created.status).toBe(200);

    const res = await app.request(`/api/season-steps/${season_input_id}`);
    expect(res.status).toBe(200);

    const body = await res.json<{ steps: Array<{ step_code: string; requires_photo: boolean }> }>();
    expect(body.steps).toHaveLength(9);
    // WET/DRY photo rounds require photo evidence; land prep does not
    expect(body.steps.find((s) => s.step_code === "SG-04")?.requires_photo).toBe(true);
    expect(body.steps.find((s) => s.step_code === "SG-01")?.requires_photo).toBe(false);
  });
});
