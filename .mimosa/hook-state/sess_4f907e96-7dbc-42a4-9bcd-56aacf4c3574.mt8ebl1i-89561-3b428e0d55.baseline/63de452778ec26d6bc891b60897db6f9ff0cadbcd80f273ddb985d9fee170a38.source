import { GWP_CH4 } from "./factors";

export type MethaneInput = {
  ef_rice: number;
  ad_rice: number;
  sf_w: number;
  sf_p: number;
  sf_o: number;
};

export function calcMethane(input: MethaneInput): number {
  const kg = input.ef_rice * input.ad_rice * input.sf_w * input.sf_p * input.sf_o * GWP_CH4;
  return kg / 1000;
}
