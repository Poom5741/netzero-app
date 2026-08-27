import { describe, expect, it } from "vitest";
import {
  EF_CO2_diesel,
  EF_N2O_direct,
  EF_N2O_indirect,
  GWP_CH4,
  GWP_N2O,
  NCV_diesel,
  SF_O,
  SF_P,
  SF_W,
} from "../../src/calc/factors";

describe("TGO methodology factors", () => {
  it("GWP_CH4 = 28 (AR5 100-yr, Excel cell reference)", () => {
    expect(GWP_CH4).toBe(28);
  });

  it("GWP_N2O = 265 (AR5 100-yr, Excel cell reference)", () => {
    expect(GWP_N2O).toBe(265);
  });

  it("EF_CO2_diesel = 2.6819 (kgCO2/L, Excel cell reference)", () => {
    expect(EF_CO2_diesel).toBe(2.6819);
  });

  it("NCV_diesel = 38.6 (MJ/L, Excel cell reference)", () => {
    expect(NCV_diesel).toBe(38.6);
  });

  it("EF_N2O_direct = 0.01 (kg N2O-N/kg N applied)", () => {
    expect(EF_N2O_direct).toBe(0.01);
  });

  it("EF_N2O_indirect = 0.0075 (kg N2O-N/kg N applied)", () => {
    expect(EF_N2O_indirect).toBe(0.0075);
  });

  it("all factors are defined and not NaN", () => {
    const factors = [GWP_CH4, GWP_N2O, EF_CO2_diesel, NCV_diesel, EF_N2O_direct, EF_N2O_indirect];
    for (const f of factors) {
      expect(f).toBeDefined();
      expect(Number.isNaN(f)).toBe(false);
    }
  });
});

describe("Scale factors (SF_w, SF_p, SF_o)", () => {
  it("SF_W contains AWD = 0.55", () => {
    expect(SF_W.awd).toBe(0.55);
  });

  it("SF_W contains drained_once = 0.71", () => {
    expect(SF_W.drained_once).toBe(0.71);
  });

  it("SF_W contains continuous = 1.0", () => {
    expect(SF_W.continuous).toBe(1.0);
  });

  it("SF_P contains full = 1.0", () => {
    expect(SF_P.full).toBe(1.0);
  });

  it("SF_P contains partial = 0.75", () => {
    expect(SF_P.partial).toBe(0.75);
  });

  it("SF_P contains none = 0.5", () => {
    expect(SF_P.none).toBe(0.5);
  });

  it("SF_O contains incorporate = 1.0", () => {
    expect(SF_O.incorporate).toBe(1.0);
  });

  it("SF_O contains no_incorporate = 0.85", () => {
    expect(SF_O.no_incorporate).toBe(0.85);
  });

  it("all scale factors are defined and not NaN", () => {
    const sfValues = [...Object.values(SF_W), ...Object.values(SF_P), ...Object.values(SF_O)];
    for (const v of sfValues) {
      expect(v).toBeDefined();
      expect(Number.isNaN(v)).toBe(false);
    }
  });
});
