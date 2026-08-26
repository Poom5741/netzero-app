/**
 * Issue #107 — Sponsor dashboard enrichment
 * Verifies getPlotsByProvince includes water_state_tallies and provenance_counts.
 */
import { describe, expect, it } from "vitest";
import { getPlotsByProvince } from "../../src/sponsor/dashboard";

function mockD1ForPlotsByProvince() {
  return {
    prepare(sql: string) {
      return {
        bind(..._args: unknown[]) {
          return {
            all: async <T>() => {
              if (sql.includes("water_state") && sql.includes("GROUP BY water_state")) {
                return { results: [{ water_state: "flooded", count: 3 }] as T[] };
              }
              if (sql.includes("provenance_type") && sql.includes("GROUP BY provenance_type")) {
                return { results: [{ provenance_type: "machine", count: 2 }] as T[] };
              }
              if (sql.includes("plots p") && sql.includes("carbon_estimates")) {
                return {
                  results: [
                    {
                      plot_id: "plot-1",
                      plot_code: "P-001",
                      area_rai: 10,
                      farmer_name: "Somchai",
                      province: "Chiang Mai",
                      district: "Mueang",
                      total_offset_tco2e: 5.2,
                      latest_season_id: "2569-napi",
                      estimate_status: "verified",
                    },
                  ] as T[],
                };
              }
              return { results: [] as T[] };
            },
            first: async () => null,
          };
        },
      };
    },
  };
}

describe("getPlotsByProvince — enrichment", () => {
  it("includes water_state_tallies per plot", async () => {
    const db = mockD1ForPlotsByProvince() as unknown as D1Database;
    const groups = await getPlotsByProvince(db);

    expect(groups.length).toBe(1);
    const plot = groups[0]?.plots[0];
    expect(plot).toBeDefined();
    expect(plot?.water_state_tallies).toEqual({ flooded: 3, dry: 0 });
  });

  it("includes provenance_counts per plot", async () => {
    const db = mockD1ForPlotsByProvince() as unknown as D1Database;
    const groups = await getPlotsByProvince(db);

    const plot = groups[0]?.plots[0];
    expect(plot?.provenance_counts).toEqual({ machine: 2, human: 0 });
  });
});
