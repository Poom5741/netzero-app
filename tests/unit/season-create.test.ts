import { describe, expect, it, beforeEach } from "vitest";
import { generateSeasonSteps, COMPLETE_CALENDAR } from "../../src/season/calendar";

describe("generateSeasonSteps", () => {
  const sowDate = "2026-07-01";

  it("generates 9 steps for a standard 120-day rice cycle", () => {
    const steps = generateSeasonSteps("input_1", sowDate, 120);
    expect(steps).toHaveLength(9);
  });

  it("uses correct step codes SG-01 through SG-09", () => {
    const steps = generateSeasonSteps("input_1", sowDate, 120);
    const codes = steps.map((s) => s.step_code);
    expect(codes).toEqual([
      "SG-01", "SG-02", "SG-03", "SG-04", "SG-05",
      "SG-06", "SG-07", "SG-08", "SG-09",
    ]);
  });

  it("assigns correct due_days relative to sow_date", () => {
    const steps = generateSeasonSteps("input_1", sowDate, 120);
    // SG-01: prepare (day -7), SG-02: sow (day 0), SG-03: fertilizer (day 7)
    // SG-04: WET-1 (day 28), SG-05: DRY-1 (day 42)
    // SG-06: fertilizer2 (day 50), SG-07: WET-2 (day 61), SG-08: DRY-2 (day 75)
    // SG-09: harvest (day 120)
    expect(steps[0].due_day).toBe(-7);   // prepare
    expect(steps[1].due_day).toBe(0);    // sow
    expect(steps[2].due_day).toBe(7);    // fertilizer 1
    expect(steps[3].due_day).toBe(28);   // WET-1
    expect(steps[4].due_day).toBe(42);   // DRY-1
    expect(steps[5].due_day).toBe(50);   // fertilizer 2
    expect(steps[6].due_day).toBe(61);   // WET-2
    expect(steps[7].due_day).toBe(75);   // DRY-2
    expect(steps[8].due_day).toBe(120);  // harvest
  });

  it("computes correct due_date strings", () => {
    const steps = generateSeasonSteps("input_1", sowDate, 120);
    expect(steps[0].due_date).toBe("2026-06-24"); // -7 days
    expect(steps[1].due_date).toBe("2026-07-01"); // day 0
    expect(steps[3].due_date).toBe("2026-07-29"); // day 28
    expect(steps[8].due_date).toBe("2026-10-29"); // day 120
  });

  it("sets all steps to pending status initially", () => {
    const steps = generateSeasonSteps("input_1", sowDate, 120);
    for (const step of steps) {
      expect(step.status).toBe("pending");
    }
  });

  it("includes step names in Thai", () => {
    const steps = generateSeasonSteps("input_1", sowDate, 120);
    expect(steps[0].step_name).toContain("เตรียมแปลง");
    expect(steps[1].step_name).toContain("หว่าน");
    expect(steps[3].step_name).toContain("เปียก");
    expect(steps[4].step_name).toContain("แห้ง");
  });

  it("marks photo steps (SG-04, 05, 07, 08) as requiring camera", () => {
    const steps = generateSeasonSteps("input_1", sowDate, 120);
    const photoSteps = steps.filter((s) => s.requires_photo);
    expect(photoSteps).toHaveLength(4);
    expect(photoSteps.map((s) => s.step_code)).toEqual([
      "SG-04", "SG-05", "SG-07", "SG-08",
    ]);
  });

  it("COMPLETE_CALENDAR has 9 entries", () => {
    expect(COMPLETE_CALENDAR).toHaveLength(9);
  });
});
