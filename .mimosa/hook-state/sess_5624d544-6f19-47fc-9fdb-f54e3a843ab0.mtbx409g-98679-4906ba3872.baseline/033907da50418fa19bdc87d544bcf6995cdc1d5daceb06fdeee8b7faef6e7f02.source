import { EF_CO2_diesel } from "./factors";

const CO2_UREA_FACTOR = 0.2;
const CO2_LIME_FACTOR = 0.44;
const EF_CO2_GRID = 0.5093;

export type CO2Input = {
  urea_kg_per_rai: number;
  lime_kg_per_rai: number;
  fuel_liters_per_rai: number;
  electricity_kwh_per_rai: number;
};

type CO2Result = {
  urea: number;
  lime: number;
  fuel: number;
  electricity: number;
  total: number;
};

export function calcCO2(input: CO2Input): CO2Result {
  const urea = (input.urea_kg_per_rai * CO2_UREA_FACTOR) / 1000;
  const lime = (input.lime_kg_per_rai * CO2_LIME_FACTOR) / 1000;
  const fuel = (input.fuel_liters_per_rai * EF_CO2_diesel) / 1000;
  const electricity = (input.electricity_kwh_per_rai * EF_CO2_GRID) / 1000;
  return { urea, lime, fuel, electricity, total: urea + lime + fuel + electricity };
}
