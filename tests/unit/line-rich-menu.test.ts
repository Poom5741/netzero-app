import { describe, expect, it } from "vitest";

/**
 * Task 05: Rich menu + calendar real data + results real data.
 *
 * Tests:
 * 1. buildRichMenu returns valid rich menu JSON with 6 items
 * 2. calendarStepsFromDB computes due dates from sow_date + rice_age_days
 * 3. fetchResultsData queries carbon_estimates + photo_evidence for real values
 */

import {
  buildRichMenu,
  getRichMenuItems,
} from "../../src/line/rich-menu";
import {
  computeCalendarFromSeasonSteps,
  type SeasonStepRow,
} from "../../src/line/calendar-api";
import {
  computeResultsFromEstimate,
  type EstimateResult,
} from "../../src/line/results-api";

// ---------------------------------------------------------------------------
// Rich menu
// ---------------------------------------------------------------------------

describe("buildRichMenu", () => {
  it("returns a rich menu object with type rich", () => {
    const menu = buildRichMenu();
    expect(menu.type).toBe("rich");
  });

  it("has 6 items", () => {
    const items = getRichMenuItems();
    expect(items).toHaveLength(6);
  });

  it("includes BL_HOME item", () => {
    const items = getRichMenuItems();
    const home = items.find((i) => i.action.data.includes("BL_HOME"));
    expect(home).toBeDefined();
  });

  it("includes SEASON_HOME item", () => {
    const items = getRichMenuItems();
    const item = items.find((i) => i.action.data.includes("SEASON_HOME"));
    expect(item).toBeDefined();
  });

  it("includes TODO item", () => {
    const items = getRichMenuItems();
    const item = items.find((i) => i.action.data.includes("TODO"));
    expect(item).toBeDefined();
  });

  it("includes FIELD_LIST item", () => {
    const items = getRichMenuItems();
    const item = items.find((i) => i.action.data.includes("FIELD_LIST"));
    expect(item).toBeDefined();
  });

  it("includes SUMMARY item", () => {
    const items = getRichMenuItems();
    const item = items.find((i) => i.action.data.includes("SUMMARY"));
    expect(item).toBeDefined();
  });

  it("includes CONTACT item", () => {
    const items = getRichMenuItems();
    const item = items.find((i) => i.action.data.includes("CONTACT"));
    expect(item).toBeDefined();
  });

  it("all items have Thai labels", () => {
    const items = getRichMenuItems();
    for (const item of items) {
      expect(item.label).toBeTruthy();
    }
  });
});

// ---------------------------------------------------------------------------
// Calendar real data
// ---------------------------------------------------------------------------

describe("computeCalendarFromSeasonSteps", () => {
  it("returns empty array when no steps", () => {
    const steps: SeasonStepRow[] = [];
    const result = computeCalendarFromSeasonSteps(steps, "2025-06-15");
    expect(result).toHaveLength(0);
  });

  it("computes due days from sow_date", () => {
    const steps: SeasonStepRow[] = [
      { step_code: "SG-01", step_name: "เตรียมแปลง", due_day: 0, status: "pending" },
      { step_code: "SG-02", step_name: "หว่านข้าว", due_day: 0, status: "pending" },
      { step_code: "SG-03", step_name: "ใส่ปุ๋ยครั้งที่ 1", due_day: 14, status: "pending" },
      { step_code: "SG-04", step_name: "WET-1", due_day: 30, status: "pending" },
      { step_code: "SG-05", step_name: "DRY-1", due_day: 45, status: "pending" },
      { step_code: "SG-06", step_name: "ใส่ปุ๋ยครั้งที่ 2", due_day: 60, status: "pending" },
      { step_code: "SG-07", step_name: "WET-2", due_day: 75, status: "pending" },
      { step_code: "SG-08", step_name: "DRY-2", due_day: 90, status: "pending" },
      { step_code: "SG-09", step_name: "เก็บเกี่ยว", due_day: 120, status: "pending" },
    ];
    const result = computeCalendarFromSeasonSteps(steps, "2025-06-15");
    expect(result).toHaveLength(9);
    expect(result[0]!.dueDay).toBe(0);
    expect(result[2]!.dueDay).toBe(14);
    expect(result[4]!.dueDay).toBe(45);
  });

  it("marks completed steps with status from DB", () => {
    const steps: SeasonStepRow[] = [
      { step_code: "SG-01", step_name: "เตรียมแปลง", due_day: 0, status: "completed" },
      { step_code: "SG-02", step_name: "หว่านข้าว", due_day: 0, status: "completed" },
      { step_code: "SG-03", step_name: "ใส่ปุ๋ยครั้งที่ 1", due_day: 14, status: "pending" },
      { step_code: "SG-04", step_name: "WET-1", due_day: 30, status: "pending" },
      { step_code: "SG-05", step_name: "DRY-1", due_day: 45, status: "pending" },
      { step_code: "SG-06", step_name: "ใส่ปุ๋ยครั้งที่ 2", due_day: 60, status: "pending" },
      { step_code: "SG-07", step_name: "WET-2", due_day: 75, status: "pending" },
      { step_code: "SG-08", step_name: "DRY-2", due_day: 90, status: "pending" },
      { step_code: "SG-09", step_name: "เก็บเกี่ยว", due_day: 120, status: "pending" },
    ];
    // Pass today = sow_date + 10 days so only SG-01/02 are completed and rest are pending
    const result = computeCalendarFromSeasonSteps(steps, "2025-06-15", "2025-06-25");
    expect(result[0]!.status).toBe("completed");
    expect(result[1]!.status).toBe("completed");
    expect(result[2]!.status).toBe("pending");
  });

  it("marks steps as overdue when past due and not completed", () => {
    const steps: SeasonStepRow[] = [
      { step_code: "SG-01", step_name: "เตรียมแปลง", due_day: 0, status: "completed" },
      { step_code: "SG-02", step_name: "หว่านข้าว", due_day: 0, status: "completed" },
      { step_code: "SG-03", step_name: "ใส่ปุ๋ยครั้งที่ 1", due_day: 14, status: "completed" },
      { step_code: "SG-04", step_name: "WET-1", due_day: 30, status: "completed" },
      { step_code: "SG-05", step_name: "DRY-1", due_day: 45, status: "pending" },
      { step_code: "SG-06", step_name: "ใส่ปุ๋ยครั้งที่ 2", due_day: 60, status: "pending" },
      { step_code: "SG-07", step_name: "WET-2", due_day: 75, status: "pending" },
      { step_code: "SG-08", step_name: "DRY-2", due_day: 90, status: "pending" },
      { step_code: "SG-09", step_name: "เก็บเกี่ยว", due_day: 120, status: "pending" },
    ];
    // Sow date 2025-06-15, today ~2025-08-15 = ~61 days after sow
    const result = computeCalendarFromSeasonSteps(steps, "2025-06-15", "2025-08-15");
    // SG-05 (due_day 45) should be overdue
    expect(result[4]!.status).toBe("overdue");
  });

  it("marks photo-required steps correctly", () => {
    const steps: SeasonStepRow[] = [
      { step_code: "SG-01", step_name: "เตรียมแปลง", due_day: 0, status: "pending" },
      { step_code: "SG-02", step_name: "หว่านข้าว", due_day: 0, status: "pending" },
      { step_code: "SG-03", step_name: "ใส่ปุ๋ยครั้งที่ 1", due_day: 14, status: "pending" },
      { step_code: "SG-04", step_name: "WET-1", due_day: 30, status: "pending" },
      { step_code: "SG-05", step_name: "DRY-1", due_day: 45, status: "pending" },
      { step_code: "SG-06", step_name: "ใส่ปุ๋ยครั้งที่ 2", due_day: 60, status: "pending" },
      { step_code: "SG-07", step_name: "WET-2", due_day: 75, status: "pending" },
      { step_code: "SG-08", step_name: "DRY-2", due_day: 90, status: "pending" },
      { step_code: "SG-09", step_name: "เก็บเกี่ยว", due_day: 120, status: "pending" },
    ];
    const result = computeCalendarFromSeasonSteps(steps, "2025-06-15");
    // Photo steps: SG-04, SG-05, SG-07, SG-08
    expect(result[3]!.requiresPhoto).toBe(true);
    expect(result[4]!.requiresPhoto).toBe(true);
    expect(result[6]!.requiresPhoto).toBe(true);
    expect(result[7]!.requiresPhoto).toBe(true);
    // Non-photo steps
    expect(result[0]!.requiresPhoto).toBe(false);
    expect(result[2]!.requiresPhoto).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Results real data
// ---------------------------------------------------------------------------

describe("computeResultsFromEstimate", () => {
  it("returns zero values when no estimate", () => {
    const result = computeResultsFromEstimate(null, 0);
    expect(result.totalOffset).toBe(0);
    expect(result.sfW).toBe(0);
    expect(result.approvedPhotos).toBe(0);
    expect(result.totalPhotos).toBe(4);
  });

  it("extracts values from estimate", () => {
    const estimate: EstimateResult = {
      total_offset_tco2e: 9.42,
      sf_w: 0.55,
      approvedPhotos: 3,
      totalPhotos: 4,
      pendingPhotos: 1,
      backfillCount: 0,
    };
    const result = computeResultsFromEstimate(estimate, 0);
    expect(result.totalOffset).toBe(9.42);
    expect(result.sfW).toBe(0.55);
    expect(result.approvedPhotos).toBe(3);
    expect(result.totalPhotos).toBe(4);
    expect(result.pendingPhotos).toBe(1);
  });

  it("computes pending tasks from estimate", () => {
    const estimate: EstimateResult = {
      total_offset_tco2e: 5.0,
      sf_w: 0.71,
      approvedPhotos: 2,
      totalPhotos: 4,
      pendingPhotos: 2,
      backfillCount: 1,
    };
    const result = computeResultsFromEstimate(estimate, 1);
    expect(result.pendingTasks).toBe(3); // 2 pending photos + 1 backfill
  });
});
