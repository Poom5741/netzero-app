import { describe, expect, it, vi } from "vitest";

vi.mock("../../src/chat/ai", () => ({
  chatWithAi: vi.fn().mockResolvedValue({ type: "reply", text: "คำตอบจาก AI" }),
}));

import { handleFlowApi } from "../../src/line/flow";
import { createMockDB } from "../helpers/integration";

function seasonSetupCtx(db: D1Database, text: string) {
  return {
    db,
    userId: "U-test",
    linkId: "link-1",
    farmerId: "farmer-001",
    state: "season_setup" as const,
    selectedPlotId: null,
    text,
  };
}

describe("season_setup chat path (OB-10)", () => {
  it("creates the season AND seeds the 9 calendar steps when the farmer sends a sow date", async () => {
    const db = createMockDB();
    db.store.set("plots", [
      { id: "plot-001", farmer_id: "farmer-001", plot_code: "CM-001", area_rai: 10 },
    ]);

    const result = await handleFlowApi(seasonSetupCtx(db as unknown as D1Database, "15/06/2568"));

    expect(result.newState).toBe("calendar");

    // The 9-step calendar must be seeded, not just the season_inputs row
    const steps = db.store.get("season_steps") ?? [];
    expect(steps).toHaveLength(9);
    expect(steps.map((s) => s.step_code)).toEqual([
      "SG-01",
      "SG-02",
      "SG-03",
      "SG-04",
      "SG-05",
      "SG-06",
      "SG-07",
      "SG-08",
      "SG-09",
    ]);

    // sow_date is stored in CE ISO form (Buddhist 2568 -> 2025), matching /api/season/create
    const season = (db.store.get("season_inputs") ?? [])[0];
    expect(season?.sow_date).toBe("2025-06-15");
    expect(season?.plot_id).toBe("plot-001");
  });

  it("still shows the date the farmer typed in the confirmation reply", async () => {
    const db = createMockDB();
    db.store.set("plots", [
      { id: "plot-001", farmer_id: "farmer-001", plot_code: "CM-001", area_rai: 10 },
    ]);

    const result = await handleFlowApi(seasonSetupCtx(db as unknown as D1Database, "15/06/2568"));

    expect(result.reply).toContain("15/06/2568");
  });

  it("treats an already-CE year as-is", async () => {
    const db = createMockDB();
    db.store.set("plots", [
      { id: "plot-001", farmer_id: "farmer-001", plot_code: "CM-001", area_rai: 10 },
    ]);

    await handleFlowApi(seasonSetupCtx(db as unknown as D1Database, "15/06/2025"));

    const season = (db.store.get("season_inputs") ?? [])[0];
    expect(season?.sow_date).toBe("2025-06-15");
  });

  it("does not crash when the farmer has no plot yet", async () => {
    const db = createMockDB();

    const result = await handleFlowApi(seasonSetupCtx(db as unknown as D1Database, "15/06/2568"));

    expect(result.newState).toBe("calendar");
    expect(db.store.get("season_steps") ?? []).toHaveLength(0);
  });
});
