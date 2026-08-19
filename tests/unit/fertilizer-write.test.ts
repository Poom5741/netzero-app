import { describe, expect, it } from "vitest";
import {
  calculateNitrogen,
  calculatePercentN,
  writeFertilizerEntry,
} from "../../src/fertilizer/write";

describe("calculatePercentN", () => {
  it("16-16-16 → 16%N", () => {
    expect(calculatePercentN("16-16-16")).toBe(16);
  });

  it("46-0-0 → 46%N (urea)", () => {
    expect(calculatePercentN("46-0-0")).toBe(46);
  });

  it("20-10-10 → 20%N", () => {
    expect(calculatePercentN("20-10-10")).toBe(20);
  });

  it("0-0-0 → 0%N", () => {
    expect(calculatePercentN("0-0-0")).toBe(0);
  });
});

describe("calculateNitrogen", () => {
  it("rate=25, %N=16 → 4 kg/rai", () => {
    expect(calculateNitrogen(25, 16)).toBeCloseTo(4, 6);
  });

  it("rate=20, %N=46 → 9.2 kg/rai (urea)", () => {
    expect(calculateNitrogen(20, 46)).toBeCloseTo(9.2, 6);
  });

  it("rate=0 → 0 nitrogen", () => {
    expect(calculateNitrogen(0, 46)).toBe(0);
  });
});

function mockDB() {
  const calls: { sql: string; args: unknown[] }[] = [];
  return {
    calls,
    prepare(sql: string) {
      return {
        bind(...args: unknown[]) {
          calls.push({ sql, args });
          return { run: async () => ({ success: true }) };
        },
      };
    },
  };
}

describe("writeFertilizerEntry", () => {
  it("auto-calculates percent_n and nitrogen_kg_per_rai", async () => {
    const db = mockDB();
    await writeFertilizerEntry(
      {
        plot_id: "p1",
        season_id: "s1",
        step: "base",
        formula: "16-16-16",
        rate_kg_per_rai: 25,
        is_urea: false,
      },
      db as any,
    );
    expect(db.calls.length).toBe(1);
    const args = db.calls[0]?.args;
    expect(args).toContain(16); // percent_n
    expect(args).toContain(4); // nitrogen_kg_per_rai
  });

  it("sets is_urea=1 when formula is 46-0-0", async () => {
    const db = mockDB();
    await writeFertilizerEntry(
      {
        plot_id: "p1",
        season_id: "s1",
        step: "tillering",
        formula: "46-0-0",
        rate_kg_per_rai: 20,
        is_urea: true,
      },
      db as any,
    );
    const args = db.calls[0]?.args;
    expect(args).toContain(1); // is_urea=1
  });

  it("sets confirmed=1 in the insert", async () => {
    const db = mockDB();
    await writeFertilizerEntry(
      {
        plot_id: "p1",
        season_id: "s1",
        step: "panicle",
        formula: "16-16-16",
        rate_kg_per_rai: 15,
        is_urea: false,
      },
      db as any,
    );
    expect(db.calls[0]?.sql).toContain("confirmed");
  });
});
