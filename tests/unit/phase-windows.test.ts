import { describe, expect, it } from "vitest";
import { calculatePhaseWindows } from "../../src/season/phase-windows";

const day = 86_400_000;

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / day);
}

describe("calculatePhaseWindows", () => {
  const sowDate = "2025-05-15";

  it("returns prepare, grow, harvest with start/end Dates", () => {
    const result = calculatePhaseWindows(sowDate);
    expect(result).toHaveProperty("prepare.start");
    expect(result).toHaveProperty("prepare.end");
    expect(result).toHaveProperty("grow.start");
    expect(result).toHaveProperty("grow.end");
    expect(result).toHaveProperty("harvest.start");
    expect(result).toHaveProperty("harvest.end");
    expect(result.prepare.start).toBeInstanceOf(Date);
  });

  it("computes correct phase offsets with 7-day grace", () => {
    const r = calculatePhaseWindows(sowDate);
    const sow = new Date("2025-05-15");

    // prepare: sow-37-7 to sow+7+7 → sow-44 to sow+14
    expect(daysBetween(r.prepare.start, sow)).toBe(44);
    expect(daysBetween(sow, r.prepare.end)).toBe(14);

    // grow: sow-7-7 to sow+127+7 → sow-14 to sow+134
    expect(daysBetween(r.grow.start, sow)).toBe(14);
    expect(daysBetween(sow, r.grow.end)).toBe(134);

    // harvest: sow+113-7 to sow+157+7 → sow+106 to sow+164
    expect(daysBetween(sow, r.harvest.start)).toBe(106);
    expect(daysBetween(sow, r.harvest.end)).toBe(164);
  });

  it("handles month boundaries", () => {
    const r = calculatePhaseWindows("2025-03-01");
    const sow = new Date("2025-03-01");
    // prepare start: 2025-03-01 - 44 days = 2025-01-16
    expect(daysBetween(r.prepare.start, sow)).toBe(44);
    // harvest end: 2025-03-01 + 164 days = 2025-08-12
    expect(daysBetween(sow, r.harvest.end)).toBe(164);
  });

  it("handles leap year", () => {
    const r = calculatePhaseWindows("2024-02-29");
    const sow = new Date("2024-02-29");
    expect(daysBetween(r.prepare.start, sow)).toBe(44);
    expect(daysBetween(sow, r.harvest.end)).toBe(164);
  });

  it("phases overlap due to grace period", () => {
    const r = calculatePhaseWindows(sowDate);
    // prepare.end > grow.start (overlap)
    expect(r.prepare.end.getTime()).toBeGreaterThan(r.grow.start.getTime());
    // grow.end > harvest.start (overlap)
    expect(r.grow.end.getTime()).toBeGreaterThan(r.harvest.start.getTime());
  });

  it("throws on invalid date", () => {
    expect(() => calculatePhaseWindows("not-a-date")).toThrow();
  });
});
