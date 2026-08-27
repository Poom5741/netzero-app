import { calcBurning } from "./burning";
import { calcCO2 } from "./co2";
import { calcMethane } from "./methane";
import { calcN2O } from "./n2o";

/**
 * Estimation input: all raw values needed to compute baseline vs project.
 * Each field maps to a D1 column or default from season_inputs.
 */
export interface EstimationInput {
  // ── Methane (CH4) ──────────────────────────────────────────────
  ef_rice: number; // emission factor for rice (kg CH4 / rai)
  ad_rice: number; // rice area (rai)
  sf_w_baseline: number; // water management SF — baseline
  sf_w_project: number; // water management SF — project (e.g. AWD)
  sf_p: number; // pre-season residue SF (same BL/PJ)
  sf_o: number; // organic amendment SF (same BL/PJ)

  // ── Nitrous Oxide (N2O) ────────────────────────────────────────
  nitrogen_baseline: number; // total N applied (kg/rai) — baseline
  nitrogen_project: number; // total N applied (kg/rai) — project

  // ── CO2 ────────────────────────────────────────────────────────
  urea_baseline: number;
  lime_baseline: number;
  fuel_baseline: number;
  elec_baseline: number;
  urea_project: number;
  lime_project: number;
  fuel_project: number;
  elec_project: number;

  // ── Burning ────────────────────────────────────────────────────
  a_burn_baseline: number; // area burned (rai) — baseline
  a_burn_project: number; // area burned (rai) — project
  ef_burn_kg_per_rai: number; // EF for straw burning (kg CO2e / rai)
}

/**
 * Full estimation result — all components in tCO2e.
 */
export interface EstimationResult {
  baseline_ch4: number;
  project_ch4: number;
  baseline_n2o: number;
  project_n2o: number;
  baseline_co2: number;
  project_co2: number;
  baseline_burning: number;
  project_burning: number;
  total_offset_tco2e: number;
  sf_w_baseline: number;
  sf_w_project: number;
  sf_p: number;
  sf_o: number;
  nitrogen_total_kg_per_rai: number;
}

/**
 * Run a full carbon estimation: compute baseline vs project, return offset.
 *
 * Offset = BL_total − PJ_total. Positive value = carbon credit earned.
 * All sub-results are in tCO2e.
 */
export function runEstimation(input: EstimationInput): EstimationResult {
  const baseline_ch4 = calcMethane({
    ef_rice: input.ef_rice,
    ad_rice: input.ad_rice,
    sf_w: input.sf_w_baseline,
    sf_p: input.sf_p,
    sf_o: input.sf_o,
  });

  const project_ch4 = calcMethane({
    ef_rice: input.ef_rice,
    ad_rice: input.ad_rice,
    sf_w: input.sf_w_project,
    sf_p: input.sf_p,
    sf_o: input.sf_o,
  });

  const baseline_n2o = calcN2O({ nitrogen_kg_per_rai: input.nitrogen_baseline }).total;
  const project_n2o = calcN2O({ nitrogen_kg_per_rai: input.nitrogen_project }).total;

  const baseline_co2 = calcCO2({
    urea_kg_per_rai: input.urea_baseline,
    lime_kg_per_rai: input.lime_baseline,
    fuel_liters_per_rai: input.fuel_baseline,
    electricity_kwh_per_rai: input.elec_baseline,
  }).total;

  const project_co2 = calcCO2({
    urea_kg_per_rai: input.urea_project,
    lime_kg_per_rai: input.lime_project,
    fuel_liters_per_rai: input.fuel_project,
    electricity_kwh_per_rai: input.elec_project,
  }).total;

  const baseline_burning = calcBurning({
    a_burn_rai: input.a_burn_baseline,
    ef_burn_kg_per_rai: input.ef_burn_kg_per_rai,
  });

  const project_burning = calcBurning({
    a_burn_rai: input.a_burn_project,
    ef_burn_kg_per_rai: input.ef_burn_kg_per_rai,
  });

  const blTotal = baseline_ch4 + baseline_n2o + baseline_co2 + baseline_burning;
  const pjTotal = project_ch4 + project_n2o + project_co2 + project_burning;

  return {
    baseline_ch4,
    project_ch4,
    baseline_n2o,
    project_n2o,
    baseline_co2,
    project_co2,
    baseline_burning,
    project_burning,
    total_offset_tco2e: blTotal - pjTotal,
    sf_w_baseline: input.sf_w_baseline,
    sf_w_project: input.sf_w_project,
    sf_p: input.sf_p,
    sf_o: input.sf_o,
    nitrogen_total_kg_per_rai: input.nitrogen_baseline,
  };
}
