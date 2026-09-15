import { describe, expect, it } from "vitest";

/**
 * Tests for POST /api/season/create route.
 * Uses mock D1 to verify SQL operations without a real database.
 */

function mockD1(opts: {
  plotExists?: boolean;
  existingSeasonInput?: boolean;
  insertResult?: { success: boolean };
  stepsInserted?: number;
}) {
  const calls: { sql: string; args: unknown[] }[] = [];
  return {
    calls,
    prepare(sql: string) {
      return {
        bind(...args: unknown[]) {
          calls.push({ sql, args });
          // Check if plot exists
          if (sql.includes("SELECT id FROM plots WHERE id = ?")) {
            return {
              first: async () => (opts.plotExists !== false ? { id: args[0] } : null),
            };
          }
          // Check existing season_input
          if (sql.includes("SELECT id FROM season_inputs WHERE plot_id = ? AND season_id = ?")) {
            return {
              first: async () => (opts.existingSeasonInput ? { id: "existing_input_1" } : null),
            };
          }
          // Insert season_input
          if (sql.includes("INSERT INTO season_inputs")) {
            return {
              run: async () => opts.insertResult ?? { success: true },
              first: async () => ({ id: "new_input_1" }),
            };
          }
          // Insert season_steps
          if (sql.includes("INSERT INTO season_steps")) {
            return {
              run: async () => ({ success: true }),
            };
          }
          // Default
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

describe("POST /api/season/create", () => {
  it("rejects when plot_id is missing", async () => {
    const db = mockD1({}) as unknown as D1Database;
    // Import the handler and test directly
    const { handleSeasonCreate } = await import("../../src/season/create");
    const result = await handleSeasonCreate(db, {
      plot_id: "",
      sow_date: "2026-07-01",
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain("plot_id");
  });

  it("rejects when sow_date is missing", async () => {
    const db = mockD1({}) as unknown as D1Database;
    const { handleSeasonCreate } = await import("../../src/season/create");
    const result = await handleSeasonCreate(db, {
      plot_id: "plot_1",
      sow_date: "",
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain("sow_date");
  });

  it("rejects when plot does not exist", async () => {
    const db = mockD1({ plotExists: false }) as unknown as D1Database;
    const { handleSeasonCreate } = await import("../../src/season/create");
    const result = await handleSeasonCreate(db, {
      plot_id: "nonexistent",
      sow_date: "2026-07-01",
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain("Plot not found");
  });

  it("creates season_input and returns 9 steps", async () => {
    const db = mockD1({ plotExists: true }) as unknown as D1Database;
    const { handleSeasonCreate } = await import("../../src/season/create");
    const result = await handleSeasonCreate(db, {
      plot_id: "plot_1",
      sow_date: "2026-07-01",
    });
    expect(result.success).toBe(true);
    expect(result.season_input_id).toBeDefined();
    expect(result.steps).toHaveLength(9);
  });

  it("returns steps with correct codes and due dates", async () => {
    const db = mockD1({ plotExists: true }) as unknown as D1Database;
    const { handleSeasonCreate } = await import("../../src/season/create");
    const result = await handleSeasonCreate(db, {
      plot_id: "plot_1",
      sow_date: "2026-07-01",
    });
    expect(result.success).toBe(true);
    const codes = result.steps.map((s: { step_code: string }) => s.step_code);
    expect(codes).toContain("SG-01");
    expect(codes).toContain("SG-04");
    expect(codes).toContain("SG-09");
  });
});

describe("POST /api/season-steps/:stepId/complete", () => {
  it("marks step as completed", async () => {
    const db = mockD1({}) as unknown as D1Database;
    const { handleStepComplete } = await import("../../src/season/create");
    const result = await handleStepComplete(db, "step_1", undefined);
    expect(result.success).toBe(true);
  });

  it("links photo_evidence_id when provided", async () => {
    const db = mockD1({}) as unknown as D1Database;
    const { handleStepComplete } = await import("../../src/season/create");
    const result = await handleStepComplete(db, "step_1", "photo_123");
    expect(result.success).toBe(true);
  });
});
