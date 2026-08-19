import { describe, expect, it } from "vitest";
import { calcN2O, type N2OInput } from "../../src/calc/n2o";

describe("calcN2O", () => {
  const base: N2OInput = {
    nitrogen_kg_per_rai: 10, // total N applied (kg/rai)
  };

  // Formula (Excel "N2O" sheet):
  // N2O_direct   = N_applied × EF_N2O_direct × (44/28) × GWP_N2O
  // N2O_indirect = N_applied × EF_N2O_indirect × (44/28) × GWP_N2O
  // Total N2O    = N2O_direct + N2O_indirect
  //
  // With EF_N2O_direct=0.01, EF_N2O_indirect=0.0075, GWP_N2O=265:
  // Direct:   10 × 0.01 × (44/28) × 265 = 10 × 0.01 × 1.57143 × 265 = 41.6429 kg CO2e
  // Indirect: 10 × 0.0075 × (44/28) × 265 = 10 × 0.0075 × 1.57143 × 265 = 31.2321 kg CO2e
  // Total:    72.875 kg CO2e = 0.072875 tCO2e

  it("direct N2O = N × EF_direct × (44/28) × GWP_N2O", () => {
    const result = calcN2O(base);
    const expected = (10 * 0.01 * (44 / 28) * 265) / 1000; // tCO2e
    expect(result.direct).toBeCloseTo(expected, 6);
  });

  it("indirect N2O = N × EF_indirect × (44/28) × GWP_N2O", () => {
    const result = calcN2O(base);
    const expected = (10 * 0.0075 * (44 / 28) * 265) / 1000; // tCO2e
    expect(result.indirect).toBeCloseTo(expected, 6);
  });

  it("total = direct + indirect", () => {
    const result = calcN2O(base);
    expect(result.total).toBeCloseTo(result.direct + result.indirect, 6);
  });

  it("returns tCO2e", () => {
    const result = calcN2O(base);
    // ~0.072875 tCO2e for 10 kg N/rai
    expect(result.total).toBeGreaterThan(0.07);
    expect(result.total).toBeLessThan(0.08);
  });

  it("higher nitrogen → higher N2O", () => {
    const low = calcN2O({ nitrogen_kg_per_rai: 5 });
    const mid = calcN2O({ nitrogen_kg_per_rai: 10 });
    const high = calcN2O({ nitrogen_kg_per_rai: 20 });
    expect(low.total).toBeLessThan(mid.total);
    expect(mid.total).toBeLessThan(high.total);
  });

  it("doubles N → doubles N2O (linear relationship)", () => {
    const single = calcN2O({ nitrogen_kg_per_rai: 10 });
    const double = calcN2O({ nitrogen_kg_per_rai: 20 });
    expect(double.total).toBeCloseTo(single.total * 2, 6);
  });

  it("zero nitrogen → zero N2O", () => {
    const result = calcN2O({ nitrogen_kg_per_rai: 0 });
    expect(result.direct).toBe(0);
    expect(result.indirect).toBe(0);
    expect(result.total).toBe(0);
  });
});
