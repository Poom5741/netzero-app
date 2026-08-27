import { describe, expect, it } from "vitest";
import { validateFertilizer } from "../../src/fertilizer/validate";

describe("validateFertilizer", () => {
  it("accepts valid inputs", () => {
    const result = validateFertilizer({
      formula: "16-16-16",
      rate_kg_per_rai: 25,
    });
    expect(result.isValid).toBe(true);
  });

  it("rejects rate < 0", () => {
    const result = validateFertilizer({
      formula: "16-16-16",
      rate_kg_per_rai: -5,
    });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("rate");
  });

  it("rejects rate > 100 kg/rai", () => {
    const result = validateFertilizer({
      formula: "16-16-16",
      rate_kg_per_rai: 150,
    });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("rate");
  });

  it("rejects empty formula", () => {
    const result = validateFertilizer({
      formula: "",
      rate_kg_per_rai: 25,
    });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("formula");
  });

  it("correctly identifies 46-0-0 as urea", () => {
    const result = validateFertilizer({
      formula: "46-0-0",
      rate_kg_per_rai: 20,
    });
    expect(result.isValid).toBe(true);
    expect(result.is_urea).toBe(true);
  });

  it("correctly identifies 16-16-16 as non-urea", () => {
    const result = validateFertilizer({
      formula: "16-16-16",
      rate_kg_per_rai: 25,
    });
    expect(result.isValid).toBe(true);
    expect(result.is_urea).toBe(false);
  });

  it("accepts rate of exactly 0", () => {
    const result = validateFertilizer({
      formula: "16-16-16",
      rate_kg_per_rai: 0,
    });
    expect(result.isValid).toBe(true);
  });

  it("accepts rate of exactly 100", () => {
    const result = validateFertilizer({
      formula: "16-16-16",
      rate_kg_per_rai: 100,
    });
    expect(result.isValid).toBe(true);
  });
});
