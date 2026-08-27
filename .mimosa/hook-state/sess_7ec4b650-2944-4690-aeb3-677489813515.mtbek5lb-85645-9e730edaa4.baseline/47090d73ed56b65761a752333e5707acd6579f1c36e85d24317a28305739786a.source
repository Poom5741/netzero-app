import { describe, expect, it } from "vitest";
import type { EstimationInput } from "../../src/calc/orchestrator";
import { runEstimation } from "../../src/calc/orchestrator";

/**
 * Golden fixture tests — reproduce Excel row-level calculations.
 *
 * Each fixture models a realistic Thai rice paddy scenario with expected
 * values hand-calculated from the TGO methodology formulas. Tolerance:
 * 0.001 tCO2e per the issue spec.
 *
 * Excel references:
 *   CH4  = EF_rice × AD_rice × SF_w × SF_p × SF_o × GWP_CH4
 *   N2O  = (N × EF_direct × 44/28 × GWP_N2O) + (N × EF_indirect × 44/28 × GWP_N2O)
 *   CO2  = urea×0.2 + lime×0.44 + fuel×2.6819 + elec×0.5093
 *   Burn = A_burn × EF_burn
 *   Offset = (BL_CH4+BL_N2O+BL_CO2+BL_Burn) − (PJ_CH4+PJ_N2O+PJ_CO2+PJ_Burn)
 */

// ── Fixture 1: Full baseline → AWD project ───────────────────────
// BL: continuous flooding, 10 kgN, 100 urea, 50 lime, 5L fuel, 20kWh, 5 rai burned
// PJ: AWD (0.55), reduced N (8kg), less urea (80), same lime, 3L fuel, 15kWh, no burn
describe("Golden fixture 1: Full baseline → AWD project", () => {
  const input: EstimationInput = {
    ef_rice: 15,
    ad_rice: 10,
    sf_w_baseline: 1.0,
    sf_w_project: 0.55,
    sf_p: 1.0,
    sf_o: 1.0,
    nitrogen_baseline: 10,
    nitrogen_project: 8,
    urea_baseline: 100,
    lime_baseline: 50,
    fuel_baseline: 5,
    elec_baseline: 20,
    urea_project: 80,
    lime_project: 50,
    fuel_project: 3,
    elec_project: 15,
    a_burn_baseline: 5,
    a_burn_project: 0,
    ef_burn_kg_per_rai: 82.5,
  };

  it("BL CH4 = 15×10×1.0×1.0×1.0×28 / 1000 = 4.200 tCO2e", () => {
    const r = runEstimation(input);
    expect(r.baseline_ch4).toBeCloseTo(4.2, 3);
  });

  it("PJ CH4 = 15×10×0.55×1.0×1.0×28 / 1000 = 2.310 tCO2e", () => {
    const r = runEstimation(input);
    expect(r.project_ch4).toBeCloseTo(2.31, 3);
  });

  it("BL N2O = 10 × (0.01+0.0075) × (44/28) × 265 / 1000 = 0.073 tCO2e", () => {
    const r = runEstimation(input);
    const expected = (10 * 0.0175 * (44 / 28) * 265) / 1000;
    expect(r.baseline_n2o).toBeCloseTo(expected, 3);
  });

  it("BL CO2 = 100×0.2 + 50×0.44 + 5×2.6819 + 20×0.5093 / 1000 ≈ 0.066 tCO2e", () => {
    const r = runEstimation(input);
    const expected = (100 * 0.2 + 50 * 0.44 + 5 * 2.6819 + 20 * 0.5093) / 1000;
    expect(r.baseline_co2).toBeCloseTo(expected, 3);
  });

  it("BL burning = 5 × 82.5 / 1000 = 0.413 tCO2e", () => {
    const r = runEstimation(input);
    expect(r.baseline_burning).toBeCloseTo(0.4125, 3);
  });

  it("offset is positive and matches BL - PJ", () => {
    const r = runEstimation(input);
    expect(r.total_offset_tco2e).toBeGreaterThan(0);
  });
});

// ── Fixture 2: Drained-once baseline → same project (no AWD) ─────
// Both scenarios identical except water management
describe("Golden fixture 2: Drained-once baseline, same project", () => {
  const input: EstimationInput = {
    ef_rice: 12,
    ad_rice: 8,
    sf_w_baseline: 0.71,
    sf_w_project: 0.71, // same — no AWD improvement
    sf_p: 0.75,
    sf_o: 0.85,
    nitrogen_baseline: 12,
    nitrogen_project: 12,
    urea_baseline: 60,
    lime_baseline: 0,
    fuel_baseline: 4,
    elec_baseline: 10,
    urea_project: 60,
    lime_project: 0,
    fuel_project: 4,
    elec_project: 10,
    a_burn_baseline: 0,
    a_burn_project: 0,
    ef_burn_kg_per_rai: 82.5,
  };

  it("BL = PJ when all inputs identical → zero offset", () => {
    const r = runEstimation(input);
    expect(r.total_offset_tco2e).toBeCloseTo(0, 6);
  });

  it("CH4 = 12×8×0.71×0.75×0.85×28 / 1000 ≈ 1.203 tCO2e", () => {
    const r = runEstimation(input);
    const expected = (12 * 8 * 0.71 * 0.75 * 0.85 * 28) / 1000;
    expect(r.baseline_ch4).toBeCloseTo(expected, 3);
    expect(r.project_ch4).toBeCloseTo(expected, 3);
  });
});

// ── Fixture 3: Zero-input plot (fallow/unmanaged) ─────────────────
describe("Golden fixture 3: Zero-input fallow plot", () => {
  const input: EstimationInput = {
    ef_rice: 0,
    ad_rice: 10,
    sf_w_baseline: 1.0,
    sf_w_project: 1.0,
    sf_p: 1.0,
    sf_o: 1.0,
    nitrogen_baseline: 0,
    nitrogen_project: 0,
    urea_baseline: 0,
    lime_baseline: 0,
    fuel_baseline: 0,
    elec_baseline: 0,
    urea_project: 0,
    lime_project: 0,
    fuel_project: 0,
    elec_project: 0,
    a_burn_baseline: 0,
    a_burn_project: 0,
    ef_burn_kg_per_rai: 82.5,
  };

  it("all zeros → zero offset", () => {
    const r = runEstimation(input);
    expect(r.baseline_ch4).toBe(0);
    expect(r.baseline_n2o).toBe(0);
    expect(r.baseline_co2).toBe(0);
    expect(r.baseline_burning).toBe(0);
    expect(r.total_offset_tco2e).toBeCloseTo(0, 6);
  });
});

// ── Fixture 4: High-input with organic amendment ──────────────────
// EF_rice=20, large area, full organic, lots of N
describe("Golden fixture 4: High-input organic rice", () => {
  const input: EstimationInput = {
    ef_rice: 20,
    ad_rice: 15,
    sf_w_baseline: 1.0,
    sf_w_project: 0.55,
    sf_p: 1.0,
    sf_o: 1.0,
    nitrogen_baseline: 15,
    nitrogen_project: 12,
    urea_baseline: 150,
    lime_baseline: 100,
    fuel_baseline: 8,
    elec_baseline: 30,
    urea_project: 120,
    lime_project: 100,
    fuel_project: 5,
    elec_project: 25,
    a_burn_baseline: 10,
    a_burn_project: 2,
    ef_burn_kg_per_rai: 82.5,
  };

  it("BL CH4 = 20×15×1.0×1.0×1.0×28 / 1000 = 8.400 tCO2e", () => {
    const r = runEstimation(input);
    expect(r.baseline_ch4).toBeCloseTo(8.4, 3);
  });

  it("PJ CH4 = 20×15×0.55×1.0×1.0×28 / 1000 = 4.620 tCO2e", () => {
    const r = runEstimation(input);
    expect(r.project_ch4).toBeCloseTo(4.62, 3);
  });

  it("offset > 3 tCO2e for this high-input scenario", () => {
    const r = runEstimation(input);
    expect(r.total_offset_tco2e).toBeGreaterThan(3);
  });

  it("burning baseline = 10×82.5/1000 = 0.825, project = 2×82.5/1000 = 0.165", () => {
    const r = runEstimation(input);
    expect(r.baseline_burning).toBeCloseTo(0.825, 3);
    expect(r.project_burning).toBeCloseTo(0.165, 3);
  });
});

// ── Fixture 5: Medium baseline → AWD with partial incorporation ──
describe("Golden fixture 5: Medium baseline → AWD with partial straw", () => {
  const input: EstimationInput = {
    ef_rice: 18,
    ad_rice: 12,
    sf_w_baseline: 1.0,
    sf_w_project: 0.55,
    sf_p: 0.75, // partial straw incorporation
    sf_o: 0.85, // no organic incorporation
    nitrogen_baseline: 11,
    nitrogen_project: 9,
    urea_baseline: 80,
    lime_baseline: 30,
    fuel_baseline: 6,
    elec_baseline: 25,
    urea_project: 65,
    lime_project: 30,
    fuel_project: 4,
    elec_project: 20,
    a_burn_baseline: 3,
    a_burn_project: 0,
    ef_burn_kg_per_rai: 82.5,
  };

  it("BL CH4 = 18×12×1.0×0.75×0.85×28 / 1000 ≈ 3.857 tCO2e", () => {
    const r = runEstimation(input);
    const expected = (18 * 12 * 1.0 * 0.75 * 0.85 * 28) / 1000;
    expect(r.baseline_ch4).toBeCloseTo(expected, 3);
  });

  it("PJ CH4 = 18×12×0.55×0.75×0.85×28 / 1000 ≈ 2.122 tCO2e", () => {
    const r = runEstimation(input);
    const expected = (18 * 12 * 0.55 * 0.75 * 0.85 * 28) / 1000;
    expect(r.project_ch4).toBeCloseTo(expected, 3);
  });

  it("BL N2O = 11 × 0.0175 × (44/28) × 265 / 1000 ≈ 0.080 tCO2e", () => {
    const r = runEstimation(input);
    const expected = (11 * 0.0175 * (44 / 28) * 265) / 1000;
    expect(r.baseline_n2o).toBeCloseTo(expected, 3);
  });

  it("BL CO2 ≈ 0.057 tCO2e", () => {
    const r = runEstimation(input);
    const expected = (80 * 0.2 + 30 * 0.44 + 6 * 2.6819 + 25 * 0.5093) / 1000;
    expect(r.baseline_co2).toBeCloseTo(expected, 3);
  });

  it("offset is positive", () => {
    const r = runEstimation(input);
    expect(r.total_offset_tco2e).toBeGreaterThan(0);
  });
});
