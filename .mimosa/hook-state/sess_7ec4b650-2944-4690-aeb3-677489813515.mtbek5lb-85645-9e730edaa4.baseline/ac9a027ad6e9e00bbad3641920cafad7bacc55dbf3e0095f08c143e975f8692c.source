import { describe, expect, it } from "vitest";
import { calcBurning } from "../../src/calc/burning";

describe("calcBurning", () => {
  // Burning emissions from straw/biomass combustion.
  // Formula (Excel "Burn" sheet):
  //   Burning = A_burn × EF_burn_CO2 × GWP_CO2
  //   Where A_burn = area where straw is burned (rai)
  //   EF_burn_CO2 = emission factor for straw burning (kg CO2 / rai)
  //   Default EF_burn for rice straw ≈ 82.5 kg CO2 / rai — Excel "Burn" B4

  const defaultEf = 82.5; // kg CO2 / rai burned — Excel "Burn" B4

  it("returns zero when no area is burned (A_burn=0)", () => {
    const result = calcBurning({ a_burn_rai: 0, ef_burn_kg_per_rai: defaultEf });
    expect(result).toBe(0);
  });

  it("returns zero when EF is zero", () => {
    const result = calcBurning({ a_burn_rai: 10, ef_burn_kg_per_rai: 0 });
    expect(result).toBe(0);
  });

  it("returns positive when A_burn > 0", () => {
    const result = calcBurning({ a_burn_rai: 5, ef_burn_kg_per_rai: defaultEf });
    expect(result).toBeGreaterThan(0);
  });

  it("formula = A_burn × EF_burn in tCO2e", () => {
    const result = calcBurning({ a_burn_rai: 10, ef_burn_kg_per_rai: defaultEf });
    // 10 × 82.5 = 825 kg CO2e = 0.825 tCO2e
    expect(result).toBeCloseTo(0.825, 4);
  });

  it("doubles area → doubles burning emissions", () => {
    const half = calcBurning({ a_burn_rai: 5, ef_burn_kg_per_rai: defaultEf });
    const full = calcBurning({ a_burn_rai: 10, ef_burn_kg_per_rai: defaultEf });
    expect(full).toBeCloseTo(half * 2, 6);
  });

  it("returns tCO2e (kg / 1000)", () => {
    const result = calcBurning({ a_burn_rai: 1, ef_burn_kg_per_rai: 100 });
    expect(result).toBeCloseTo(0.1, 4);
  });
});
