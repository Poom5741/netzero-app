import { EF_N2O_direct, EF_N2O_indirect, GWP_N2O } from "./factors";

const N2O_TO_CO2E = 44 / 28;

export type N2OInput = {
  nitrogen_kg_per_rai: number;
};

type N2OResult = {
  direct: number;
  indirect: number;
  total: number;
};

export function calcN2O(input: N2OInput): N2OResult {
  const n = input.nitrogen_kg_per_rai;
  const direct = (n * EF_N2O_direct * N2O_TO_CO2E * GWP_N2O) / 1000;
  const indirect = (n * EF_N2O_indirect * N2O_TO_CO2E * GWP_N2O) / 1000;
  return { direct, indirect, total: direct + indirect };
}
