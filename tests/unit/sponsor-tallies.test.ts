/**
 * Issue #105 — Sponsor tallies + verification provenance
 * Tests for water-state tallies and provenance counts in sponsor plot detail.
 */
import { describe, expect, it } from "vitest";
import { getPlotDetail, type PlotDetail } from "../../src/sponsor/dashboard";

function mockD1Prepare(responses: Map<string, unknown[]>) {
  return {
    prepare(sql: string) {
      return {
        bind(..._args: unknown[]) {
          return {
            all: async <T>() => {
              // Match by SQL pattern
              if (sql.includes("water_state") && sql.includes("photo_evidence")) {
                return { results: (responses.get("tallies") ?? []) as T[] };
              }
              if (sql.includes("pre_verified") && sql.includes("photo_evidence")) {
                return { results: (responses.get("provenance") ?? []) as T[] };
              }
              if (sql.includes("plots p") && sql.includes("carbon_estimates")) {
                return { results: (responses.get("detail") ?? []) as T[] };
              }
              return { results: [] as T[] };
            },
            first: async <T>() => {
              if (sql.includes("plots p") && sql.includes("carbon_estimates")) {
                return ((responses.get("detail") ?? [])[0] ?? null) as T | null;
              }
              return null;
            },
          };
        },
      };
    },
  };
}

const BASE_PLOT_DETAIL = {
  plot_id: "plot-1",
  plot_code: "P-001",
  area_rai: 10,
  farmer_name: "Somchai",
  province: "Chiang Mai",
  district: "Mueang",
  season_id: "2569-napi",
  water_management: "alternate wetting and drying",
  estimate_status: "draft",
  total_offset_tco2e: 5.2,
  sf_w: 0.55,
  sf_p: 1.0,
  sf_o: 0.85,
  nitrogen_total_kg_per_rai: 12,
};

describe("getPlotDetail — water-state tallies", () => {
  it("includes flooded and dry counts per plot-season", async () => {
    const responses = new Map<string, unknown[]>([
      ["detail", [BASE_PLOT_DETAIL]],
      [
        "tallies",
        [
          { water_state: "flooded", count: 3 },
          { water_state: "dry", count: 2 },
        ],
      ],
      ["provenance", []],
    ]);
    const db = mockD1Prepare(responses) as unknown as D1Database;

    const result = await getPlotDetail(db, "plot-1");

    expect(result).toBeDefined();
    expect(result?.water_state_tallies).toEqual({
      flooded: 3,
      dry: 2,
    });
  });

  it("returns zero counts when no wet/dry photos exist", async () => {
    const responses = new Map<string, unknown[]>([
      ["detail", [BASE_PLOT_DETAIL]],
      ["tallies", []],
      ["provenance", []],
    ]);
    const db = mockD1Prepare(responses) as unknown as D1Database;

    const result = await getPlotDetail(db, "plot-1");

    expect(result).toBeDefined();
    expect(result?.water_state_tallies).toEqual({
      flooded: 0,
      dry: 0,
    });
  });

  it("handles plots with only flooded photos", async () => {
    const responses = new Map<string, unknown[]>([
      ["detail", [BASE_PLOT_DETAIL]],
      [
        "tallies",
        [
          { water_state: "flooded", count: 5 },
        ],
      ],
      ["provenance", []],
    ]);
    const db = mockD1Prepare(responses) as unknown as D1Database;

    const result = await getPlotDetail(db, "plot-1");

    expect(result?.water_state_tallies).toEqual({
      flooded: 5,
      dry: 0,
    });
  });
});

describe("getPlotDetail — provenance counts", () => {
  it("includes machine and human stamp counts", async () => {
    const responses = new Map<string, unknown[]>([
      ["detail", [BASE_PLOT_DETAIL]],
      ["tallies", []],
      [
        "provenance",
        [
          { provenance_type: "machine", count: 4 },
          { provenance_type: "human", count: 2 },
        ],
      ],
    ]);
    const db = mockD1Prepare(responses) as unknown as D1Database;

    const result = await getPlotDetail(db, "plot-1");

    expect(result).toBeDefined();
    expect(result?.provenance_counts).toEqual({
      machine: 4,
      human: 2,
    });
  });

  it("returns zero counts when no stamps exist", async () => {
    const responses = new Map<string, unknown[]>([
      ["detail", [BASE_PLOT_DETAIL]],
      ["tallies", []],
      ["provenance", []],
    ]);
    const db = mockD1Prepare(responses) as unknown as D1Database;

    const result = await getPlotDetail(db, "plot-1");

    expect(result?.provenance_counts).toEqual({
      machine: 0,
      human: 0,
    });
  });

  it("handles plots with only machine stamps", async () => {
    const responses = new Map<string, unknown[]>([
      ["detail", [BASE_PLOT_DETAIL]],
      ["tallies", []],
      [
        "provenance",
        [
          { provenance_type: "machine", count: 7 },
        ],
      ],
    ]);
    const db = mockD1Prepare(responses) as unknown as D1Database;

    const result = await getPlotDetail(db, "plot-1");

    expect(result?.provenance_counts).toEqual({
      machine: 7,
      human: 0,
    });
  });

  it("handles plots with only human stamps", async () => {
    const responses = new Map<string, unknown[]>([
      ["detail", [BASE_PLOT_DETAIL]],
      ["tallies", []],
      [
        "provenance",
        [
          { provenance_type: "human", count: 3 },
        ],
      ],
    ]);
    const db = mockD1Prepare(responses) as unknown as D1Database;

    const result = await getPlotDetail(db, "plot-1");

    expect(result?.provenance_counts).toEqual({
      machine: 0,
      human: 3,
    });
  });
});

describe("getPlotDetail — graceful degradation", () => {
  it("returns null when plot not found", async () => {
    const responses = new Map<string, unknown[]>([
      ["detail", []],
      ["tallies", []],
      ["provenance", []],
    ]);
    const db = mockD1Prepare(responses) as unknown as D1Database;

    const result = await getPlotDetail(db, "nonexistent");

    expect(result).toBeNull();
  });

  it("includes tallies and provenance even when season_id is null", async () => {
    const plotWithoutSeason = { ...BASE_PLOT_DETAIL, season_id: null };
    const responses = new Map<string, unknown[]>([
      ["detail", [plotWithoutSeason]],
      ["tallies", []],
      ["provenance", []],
    ]);
    const db = mockD1Prepare(responses) as unknown as D1Database;

    const result = await getPlotDetail(db, "plot-1");

    expect(result).toBeDefined();
    expect(result?.water_state_tallies).toEqual({ flooded: 0, dry: 0 });
    expect(result?.provenance_counts).toEqual({ machine: 0, human: 0 });
  });
});
