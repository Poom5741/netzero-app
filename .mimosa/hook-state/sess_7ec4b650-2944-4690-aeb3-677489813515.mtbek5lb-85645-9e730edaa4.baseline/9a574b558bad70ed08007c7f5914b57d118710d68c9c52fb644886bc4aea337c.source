import { describe, expect, it } from "vitest";
import { type EstimationInput, runEstimation } from "../../src/calc/orchestrator";

describe("runEstimation", () => {
  const input: EstimationInput = {
    // Methane
    ef_rice: 15,
    ad_rice: 10,
    // Water management — BL=continuous, PJ=AWD
    sf_w_baseline: 1.0,
    sf_w_project: 0.55,
    sf_p: 1.0,
    sf_o: 1.0,
    // N2O
    nitrogen_baseline: 10,
    nitrogen_project: 8,
    // CO2
    urea_baseline: 100,
    lime_baseline: 50,
    fuel_baseline: 5,
    elec_baseline: 20,
    urea_project: 80,
    lime_project: 50,
    fuel_project: 3,
    elec_project: 15,
    // Burning
    a_burn_baseline: 5,
    a_burn_project: 0,
    ef_burn_kg_per_rai: 82.5,
  };

  it("calls all calc modules and returns an estimate", () => {
    const result = runEstimation(input);
    expect(result).toBeDefined();
    expect(result.baseline_ch4).toBeGreaterThan(0);
    expect(result.baseline_n2o).toBeGreaterThan(0);
    expect(result.baseline_co2).toBeGreaterThan(0);
  });

  it("baseline CH4 > project CH4 (AWD reduces methane)", () => {
    const result = runEstimation(input);
    expect(result.baseline_ch4).toBeGreaterThan(result.project_ch4);
  });

  it("baseline N2O > project N2O (less nitrogen)", () => {
    const result = runEstimation(input);
    expect(result.baseline_n2o).toBeGreaterThan(result.project_n2o);
  });

  it("baseline CO2 > project CO2 (less fuel/urea)", () => {
    const result = runEstimation(input);
    expect(result.baseline_co2).toBeGreaterThan(result.project_co2);
  });

  it("baseline burning > project burning (0 burned in project)", () => {
    const result = runEstimation(input);
    expect(result.baseline_burning).toBeGreaterThan(0);
    expect(result.project_burning).toBe(0);
  });

  it("total_offset = BL_total - PJ_total (positive = credit earned)", () => {
    const result = runEstimation(input);
    const blTotal =
      result.baseline_ch4 + result.baseline_n2o + result.baseline_co2 + result.baseline_burning;
    const pjTotal =
      result.project_ch4 + result.project_n2o + result.project_co2 + result.project_burning;
    expect(result.total_offset_tco2e).toBeCloseTo(blTotal - pjTotal, 6);
  });

  it("total_offset is positive when project has lower emissions", () => {
    const result = runEstimation(input);
    expect(result.total_offset_tco2e).toBeGreaterThan(0);
  });

  it("includes SF values in the result", () => {
    const result = runEstimation(input);
    expect(result.sf_w_baseline).toBe(1.0);
    expect(result.sf_w_project).toBe(0.55);
    expect(result.sf_p).toBe(1.0);
    expect(result.sf_o).toBe(1.0);
  });

  it("includes nitrogen_total in the result", () => {
    const result = runEstimation(input);
    expect(result.nitrogen_total_kg_per_rai).toBe(10); // baseline nitrogen
  });
});
