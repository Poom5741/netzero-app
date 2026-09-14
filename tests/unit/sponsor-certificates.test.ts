/**
 * Task 11 — Sponsor certificates + GHG sources + season credits tests
 */
import { describe, expect, it } from "vitest";
import { getCertificates, getGhgSourceBreakdown, getSeasonCredits } from "../../src/sponsor/dashboard";

function mockD1(responses: Record<string, unknown[]>) {
  return {
    prepare(sql: string) {
      return {
        bind(..._args: unknown[]) {
          return {
            all: async () => {
              for (const [key, rows] of Object.entries(responses)) {
                if (sql.includes(key)) return { results: rows };
              }
              return { results: [] };
            },
            first: async () => {
              for (const [key, rows] of Object.entries(responses)) {
                if (sql.includes(key)) return rows[0] ?? null;
              }
              return null;
            },
          };
        },
      };
    },
  };
}

describe("getCertificates", () => {
  it("returns certificate list from carbon_credits table", async () => {
    const db = mockD1({
      "cc.id": [
        { id: "c1", certificate_number: "TVER-001", season_id: "s1", volume_tco2e: 10.5, status: "verified", issued_at: "2026-01-15" },
        { id: "c2", certificate_number: "TVER-002", season_id: "s2", volume_tco2e: 8.3, status: "pending", issued_at: "2026-06-20" },
      ],
    }) as unknown as D1Database;

    const certs = await getCertificates(db);
    expect(certs).toHaveLength(2);
    expect(certs[0]!.certificate_number).toBe("TVER-001");
    expect(certs[0]!.status).toBe("verified");
    expect(certs[1]!.volume_tco2e).toBe(8.3);
  });

  it("returns empty array when no certificates exist", async () => {
    const db = mockD1({ "cc.id": [] }) as unknown as D1Database;
    const certs = await getCertificates(db);
    expect(certs).toEqual([]);
  });

  it("returns empty array when carbon_credits table does not exist", async () => {
    const db = {
      prepare(_sql: string) {
        return {
          bind() {
            return {
              all: async () => { throw new Error("no such table: carbon_credits"); },
            };
          },
        };
      },
    } as unknown as D1Database;

    const certs = await getCertificates(db);
    expect(certs).toEqual([]);
  });

  it("returns area-scoped certificates", async () => {
    const db = mockD1({
      "cc.id": [
        { id: "c1", certificate_number: "TVER-001", season_id: "s1", volume_tco2e: 5.0, status: "verified", issued_at: "2026-03-01" },
      ],
    }) as unknown as D1Database;

    const certs = await getCertificates(db, ["สุพรรณบุรี"]);
    expect(certs).toHaveLength(1);
    expect(certs[0]!.certificate_number).toBe("TVER-001");
  });
});

describe("getGhgSourceBreakdown", () => {
  it("returns CH4, N2O, CO2 source breakdown", async () => {
    const db = mockD1({
      "baseline_ch4": [{
        baseline_ch4: 100,
        project_ch4: 65,
        baseline_n2o: 30,
        project_n2o: 22,
        baseline_co2: 50,
        project_co2: 45,
      }],
    }) as unknown as D1Database;

    const sources = await getGhgSourceBreakdown(db);
    expect(sources).toHaveLength(3);
    expect(sources[0]!.source).toContain("CH");
    expect(sources[0]!.baseline).toBe(100);
    expect(sources[0]!.project).toBe(65);
    expect(sources[0]!.reduction).toBe(35);
    expect(sources[1]!.source).toContain("N");
    expect(sources[2]!.source).toContain("CO");
  });

  it("returns empty array when no data", async () => {
    const db = mockD1({ "baseline_ch4": [] }) as unknown as D1Database;
    const sources = await getGhgSourceBreakdown(db);
    expect(sources).toEqual([]);
  });
});

describe("getSeasonCredits", () => {
  it("returns season credit rows", async () => {
    const db = mockD1({
      "ce.season_id": [
        { season_id: "s1", season_name: "ฤดูนา 2568", estimated_tco2e: 50, verified_tco2e: 40 },
        { season_id: "s2", season_name: "ฤดูนา 2569", estimated_tco2e: 30, verified_tco2e: 0 },
      ],
    }) as unknown as D1Database;

    const credits = await getSeasonCredits(db);
    expect(credits).toHaveLength(2);
    expect(credits[0]!.season_name).toBe("ฤดูนา 2568");
    expect(credits[0]!.estimated_tco2e).toBe(50);
    expect(credits[0]!.verified_tco2e).toBe(40);
  });

  it("returns empty array when no season data", async () => {
    const db = mockD1({ "ce.season_id": [] }) as unknown as D1Database;
    const credits = await getSeasonCredits(db);
    expect(credits).toEqual([]);
  });
});
