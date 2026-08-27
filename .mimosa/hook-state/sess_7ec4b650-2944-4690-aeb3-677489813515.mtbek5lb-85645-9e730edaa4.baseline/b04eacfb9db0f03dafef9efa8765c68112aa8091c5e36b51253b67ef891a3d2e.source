import { describe, expect, it } from "vitest";
import { calcMethane, type MethaneInput } from "../../src/calc/methane";

describe("calcMethane", () => {
  const base: MethaneInput = {
    ef_rice: 15, // kg CH4 / rai — Excel "CH4" sheet, cell B6
    ad_rice: 10, // rai
    sf_w: 1.0, // continuous (baseline default)
    sf_p: 1.0, // full incorporation
    sf_o: 1.0, // organic incorporated
  };

  it("baseline CH4 with continuous flooding = EF × AD × SF_w × SF_p × SF_o × GWP_CH4", () => {
    const result = calcMethane(base);
    // 15 × 10 × 1.0 × 1.0 × 1.0 × 28 = 4200 kg CO2e = 4.2 tCO2e
    expect(result).toBeCloseTo(4.2, 3);
  });

  it("AWD reduces CH4: baseline > project when SF_w=0.55", () => {
    const baseline = calcMethane(base);
    const project = calcMethane({ ...base, sf_w: 0.55 });
    expect(baseline).toBeGreaterThan(project);
  });

  it("AWD (SF_w=0.55) reduces by 45% from continuous", () => {
    const baseline = calcMethane(base);
    const project = calcMethane({ ...base, sf_w: 0.55 });
    const reduction = (baseline - project) / baseline;
    expect(reduction).toBeCloseTo(0.45, 5);
  });

  it("partial incorporation (SF_p=0.75) reduces CH4", () => {
    const full = calcMethane(base);
    const partial = calcMethane({ ...base, sf_p: 0.75 });
    expect(full).toBeGreaterThan(partial);
  });

  it("no organic amendment (SF_o=0.85) reduces CH4", () => {
    const withOrg = calcMethane(base);
    const withoutOrg = calcMethane({ ...base, sf_o: 0.85 });
    expect(withOrg).toBeGreaterThan(withoutOrg);
  });

  it("combined AWD + partial + no-organic is lowest", () => {
    const baseline = calcMethane(base);
    const project = calcMethane({ ...base, sf_w: 0.55, sf_p: 0.75, sf_o: 0.85 });
    expect(project).toBeLessThan(baseline);
    // 15 × 10 × 0.55 × 0.75 × 0.85 × 28 = 1470.8625 kg CO2e = ~1.471 tCO2e
    expect(project).toBeCloseTo(1.471, 2);
  });

  it("returns tCO2e (result in tonnes)", () => {
    const result = calcMethane(base);
    // kg CO2e / 1000 = tCO2e
    expect(result).toBeCloseTo((15 * 10 * 1 * 1 * 1 * 28) / 1000, 3);
  });
});
