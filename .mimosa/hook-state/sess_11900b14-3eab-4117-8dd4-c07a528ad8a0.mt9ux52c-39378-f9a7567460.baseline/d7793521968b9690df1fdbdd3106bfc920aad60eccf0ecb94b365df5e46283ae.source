import { describe, expect, it } from "vitest";
import { type CO2Input, calcCO2 } from "../../src/calc/co2";

describe("calcCO2", () => {
  // CO2 has 4 components:
  // 1. Urea decomposition: CO2_urea = Urea_kg × (44/12) × (12/60) × GWP_CO2
  //    Actually: CO2_urea = Urea_kg × fraction_C_in_urea × 44/12
  //    Simplified: CO2_urea = Urea_kg × 0.2 (fraction of C released)  — Excel "CO2" B6
  //    Per methodology: Urea N → CO2 via 44/28 conversion of urea decomposition
  // 2. Lime: CO2_lime = Lime_kg × 0.44 (CaCO3 fraction × CO2/CaCO3 = 44/100) — Excel "CO2" B10
  // 3. Fuel: CO2_fuel = Fuel_L × EF_CO2_diesel — Excel "CO2" B14
  // 4. Electricity: CO2_elec = Elec_kWh × EF_CO2_grid — Excel "CO2" B18
  //    EF_CO2_grid (Thailand) ≈ 0.5093 kgCO2/kWh

  const base: CO2Input = {
    urea_kg_per_rai: 100,
    lime_kg_per_rai: 50,
    fuel_liters_per_rai: 5,
    electricity_kwh_per_rai: 20,
  };

  it("urea component = urea_kg × 0.2 (decomposition factor)", () => {
    const result = calcCO2(base);
    // 100 × 0.2 = 20 kg CO2e → 0.020 tCO2e
    expect(result.urea).toBeCloseTo(0.02, 4);
  });

  it("lime component = lime_kg × 0.44 (CaCO3 calcination)", () => {
    const result = calcCO2(base);
    // 50 × 0.44 = 22 kg CO2e → 0.022 tCO2e
    expect(result.lime).toBeCloseTo(0.022, 4);
  });

  it("fuel component = fuel_L × EF_CO2_diesel (2.6819)", () => {
    const result = calcCO2(base);
    // 5 × 2.6819 = 13.4095 kg CO2e → 0.0134095 tCO2e
    expect(result.fuel).toBeCloseTo(0.0134095, 5);
  });

  it("electricity component = kWh × EF_CO2_grid (0.5093)", () => {
    const result = calcCO2(base);
    // 20 × 0.5093 = 10.186 kg CO2e → 0.010186 tCO2e
    expect(result.electricity).toBeCloseTo(0.010186, 5);
  });

  it("total = urea + lime + fuel + electricity", () => {
    const result = calcCO2(base);
    expect(result.total).toBeCloseTo(
      result.urea + result.lime + result.fuel + result.electricity,
      6,
    );
  });

  it("returns tCO2e", () => {
    const result = calcCO2(base);
    expect(result.total).toBeGreaterThan(0);
    // 0.02 + 0.022 + 0.0134 + 0.0102 ≈ 0.0656 tCO2e
    expect(result.total).toBeCloseTo(0.0655955, 4);
  });

  it("zero inputs → zero CO2", () => {
    const result = calcCO2({
      urea_kg_per_rai: 0,
      lime_kg_per_rai: 0,
      fuel_liters_per_rai: 0,
      electricity_kwh_per_rai: 0,
    });
    expect(result.total).toBe(0);
  });

  it("each component is independent — changing one doesn't affect others", () => {
    const baseline = calcCO2(base);
    const moreFuel = calcCO2({ ...base, fuel_liters_per_rai: 10 });
    expect(moreFuel.urea).toBeCloseTo(baseline.urea, 6);
    expect(moreFuel.lime).toBeCloseTo(baseline.lime, 6);
    expect(moreFuel.fuel).toBeGreaterThan(baseline.fuel);
    expect(moreFuel.electricity).toBeCloseTo(baseline.electricity, 6);
  });
});
