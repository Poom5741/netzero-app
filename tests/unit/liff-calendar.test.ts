import { describe, expect, it } from "vitest";

/**
 * Tests for LIFF calendar API endpoint.
 * Returns 9-step season calendar with status for a given season_input_id.
 */

function mockD1(opts: {
  steps?: Array<{
    id: string;
    step_code: string;
    step_name: string;
    due_day: number;
    due_date: string;
    status: string;
    photo_evidence_id: string | null;
    completed_at: string | null;
  }>;
}) {
  const calls: { sql: string; args: unknown[] }[] = [];
  return {
    calls,
    prepare(sql: string) {
      return {
        bind(...args: unknown[]) {
          calls.push({ sql, args });
          if (sql.includes("SELECT") && sql.includes("season_steps")) {
            // Simulate ORDER BY due_day ASC
            const sorted = [...(opts.steps ?? [])].sort((a, b) => a.due_day - b.due_day);
            return {
              all: async () => ({ results: sorted }),
            };
          }
          return {
            run: async () => ({ success: true }),
            first: async () => null,
            all: async () => ({ results: [] }),
          };
        },
      };
    },
  };
}

describe("GET /api/liff/calendar/:seasonInputId", () => {
  it("returns 9 steps for a valid season_input_id", async () => {
    const steps = Array.from({ length: 9 }, (_, i) => ({
      id: `step_${i}`,
      step_code: `SG-0${i + 1}`,
      step_name: `Step ${i + 1}`,
      due_day: i * 10,
      due_date: `2026-07-${String(i * 10 + 1).padStart(2, "0")}`,
      status: i < 3 ? "completed" : "pending",
      photo_evidence_id: i < 3 ? `photo_${i}` : null,
      completed_at: i < 3 ? "2026-07-10" : null,
    }));

    const db = mockD1({ steps }) as unknown as D1Database;
    const { handleLiffCalendar } = await import("../../src/liff/calendar-api");
    const result = await handleLiffCalendar(db, "input_1");

    expect(result.steps).toHaveLength(9);
    expect(result.steps[0].step_code).toBe("SG-01");
    expect(result.steps[8].step_code).toBe("SG-09");
  });

  it("returns steps sorted by due_day ascending", async () => {
    const steps = [
      {
        id: "2",
        step_code: "SG-02",
        step_name: "Sow",
        due_day: 0,
        due_date: "2026-07-01",
        status: "pending",
        photo_evidence_id: null,
        completed_at: null,
      },
      {
        id: "1",
        step_code: "SG-01",
        step_name: "Prepare",
        due_day: -7,
        due_date: "2026-06-24",
        status: "completed",
        photo_evidence_id: null,
        completed_at: "2026-06-24",
      },
    ];
    const db = mockD1({ steps }) as unknown as D1Database;
    const { handleLiffCalendar } = await import("../../src/liff/calendar-api");
    const result = await handleLiffCalendar(db, "input_1");

    expect(result.steps[0].step_code).toBe("SG-01");
    expect(result.steps[1].step_code).toBe("SG-02");
  });

  it("marks photo steps as requiring camera", async () => {
    const steps = [
      {
        id: "4",
        step_code: "SG-04",
        step_name: "WET-1",
        due_day: 28,
        due_date: "2026-07-29",
        status: "pending",
        photo_evidence_id: null,
        completed_at: null,
      },
      {
        id: "1",
        step_code: "SG-01",
        step_name: "Prepare",
        due_day: -7,
        due_date: "2026-06-24",
        status: "completed",
        photo_evidence_id: null,
        completed_at: "2026-06-24",
      },
    ];
    const db = mockD1({ steps }) as unknown as D1Database;
    const { handleLiffCalendar } = await import("../../src/liff/calendar-api");
    const result = await handleLiffCalendar(db, "input_1");

    const wetStep = result.steps.find((s: { step_code: string }) => s.step_code === "SG-04");
    expect(wetStep?.requires_photo).toBe(true);

    const prepStep = result.steps.find((s: { step_code: string }) => s.step_code === "SG-01");
    expect(prepStep?.requires_photo).toBe(false);
  });

  it("returns empty steps when no season_input_id found", async () => {
    const db = mockD1({ steps: [] }) as unknown as D1Database;
    const { handleLiffCalendar } = await import("../../src/liff/calendar-api");
    const result = await handleLiffCalendar(db, "nonexistent");
    expect(result.steps).toHaveLength(0);
  });

  it("queries with correct season_input_id", async () => {
    const db = mockD1({ steps: [] }) as unknown as D1Database;
    const { handleLiffCalendar } = await import("../../src/liff/calendar-api");
    await handleLiffCalendar(db, "input_42");

    const query = db.calls[0].sql;
    expect(query).toContain("season_steps");
    expect(db.calls[0].args).toContain("input_42");
  });
});
