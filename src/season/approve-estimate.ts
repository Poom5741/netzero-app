/**
 * Season approval with carbon estimation.
 *
 * Enhanced version of approve.ts that calls runEstimation()
 * to populate carbon_estimates with real values instead of zero.
 */

import { runEstimation, type EstimationInput } from "../calc/orchestrator";
import { getSfW } from "../calc/sf-w";
import { SF_W } from "../calc/sf-w";

type ApproveResult = {
  success: boolean;
  estimateId?: string;
  total_offset_tco2e?: number;
  error?: string;
  missing?: string[];
};

/**
 * Build estimation input from D1 records.
 */
async function buildEstimationInput(
  db: D1Database,
  plotId: string,
  seasonId: string,
): Promise<EstimationInput> {
  // Get plot area
  const plot = await db
    .prepare("SELECT area_rai FROM plots WHERE id = ?")
    .bind(plotId)
    .first<{ area_rai: number }>();

  // Get season input data
  const seasonInput = await db
    .prepare(
      `SELECT water_management, organic_material, lime_kg_per_rai, dolomite_kg_per_rai,
              fuel_liters_per_rai, electricity_kwh_per_rai, straw_management, yield_kg_per_rai
       FROM season_inputs WHERE plot_id = ? AND season_id = ?`
    )
    .bind(plotId, seasonId)
    .first<{
      water_management: string;
      organic_material: string;
      lime_kg_per_rai: number;
      dolomite_kg_per_rai: number;
      fuel_liters_per_rai: number;
      electricity_kwh_per_rai: number;
      straw_management: string;
      yield_kg_per_rai: number;
    }>();

  // Get fertilizer totals
  const fert = await db
    .prepare(
      `SELECT SUM(nitrogen_kg_per_rai) as total_n,
              SUM(CASE WHEN is_urea = 1 THEN rate_kg_per_rai ELSE 0 END) as urea_rate
       FROM fertilizer_entries
       WHERE plot_id = ? AND season_id = ? AND confirmed = 1`
    )
    .bind(plotId, seasonId)
    .first<{ total_n: number; urea_rate: number }>();

  // Get dynamic SF_w
  const sfWProject = await getSfW(db, plotId, seasonId);
  const sfWBaseline = SF_W.none; // Baseline is always 1.0 (no AWD)

  // Compute SF_p from organic material
  const sfP = seasonInput?.organic_material === "none" ? 0.5 : 1.0;

  // Compute SF_o from lime application
  const limeTotal = (seasonInput?.lime_kg_per_rai ?? 0) + (seasonInput?.dolomite_kg_per_rai ?? 0);
  const sfO = limeTotal > 0 ? 1.0 : 0.85;

  // Straw management factor
  const strawBurned = seasonInput?.straw_management === "burn";
  const areaRai = plot?.area_rai ?? 0;

  return {
    ef_rice: 10.0, // Default emission factor (kg CH4 / rai)
    ad_rice: areaRai,
    sf_w_baseline: sfWBaseline,
    sf_w_project: sfWProject,
    sf_p: sfP,
    sf_o: sfO,
    nitrogen_baseline: fert?.total_n ?? 0,
    nitrogen_project: fert?.total_n ?? 0,
    urea_baseline: fert?.urea_rate ?? 0,
    lime_baseline: seasonInput?.lime_kg_per_rai ?? 0,
    fuel_baseline: seasonInput?.fuel_liters_per_rai ?? 0,
    elec_baseline: seasonInput?.electricity_kwh_per_rai ?? 0,
    urea_project: fert?.urea_rate ?? 0,
    lime_project: seasonInput?.lime_kg_per_rai ?? 0,
    fuel_project: seasonInput?.fuel_liters_per_rai ?? 0,
    elec_project: seasonInput?.electricity_kwh_per_rai ?? 0,
    a_burn_baseline: strawBurned ? areaRai : 0,
    a_burn_project: 0, // Project assumes no burning
    ef_burn_kg_per_rai: 25.0, // Default burning EF
  };
}

/**
 * Approve a season and run carbon estimation.
 *
 * 1. Gate check (status, photos, fertilizer)
 * 2. Build estimation input from DB records
 * 3. Run estimation
 * 4. Store result in carbon_estimates
 * 5. Update season status to approved
 */
export async function approveSeason(
  db: D1Database,
  plotId: string,
  seasonId: string,
): Promise<ApproveResult> {
  const existing = await db
    .prepare("SELECT status FROM season_inputs WHERE plot_id = ? AND season_id = ?")
    .bind(plotId, seasonId)
    .first<{ status: string }>();

  if (!existing) return { success: false, error: "season not found" };
  if (existing.status === "approved") return { success: false, error: "already approved" };
  if (existing.status !== "closed") return { success: false, error: "season must be closed first" };

  const missing: string[] = [];
  const PHOTO_TYPES = ["prepare", "wetdry", "harvest"] as const;

  for (const photoType of PHOTO_TYPES) {
    const count = await db
      .prepare(
        `SELECT COUNT(*) as cnt FROM photo_evidence
         WHERE plot_id = ? AND season_id = ? AND photo_type = ?
         AND (admin_status = 'verified' OR (pre_verified = 1 AND COALESCE(superseded, 0) = 0))`,
      )
      .bind(plotId, seasonId, photoType)
      .first<{ cnt: number }>();
    if (!count || count.cnt < 1) missing.push(`${photoType} photo`);
  }

  const fertilizer = await db
    .prepare(
      "SELECT COUNT(*) as cnt FROM fertilizer_entries WHERE plot_id = ? AND season_id = ? AND confirmed = 1",
    )
    .bind(plotId, seasonId)
    .first<{ cnt: number }>();
  if (!fertilizer || fertilizer.cnt < 1) missing.push("confirmed fertilizer entries");

  if (missing.length > 0) {
    return { success: false, error: "incomplete", missing };
  }

  // Run carbon estimation
  const input = await buildEstimationInput(db, plotId, seasonId);
  const result = runEstimation(input);

  // Store estimate
  const estimateId = `est_${crypto.randomUUID()}`;
  await db
    .prepare(
      `INSERT INTO carbon_estimates (
        id, plot_id, season_id, version, status,
        baseline_ch4, project_ch4, baseline_n2o, project_n2o,
        baseline_co2, project_co2, burning_emissions,
        total_offset_tco2e, sf_w, sf_p, sf_o, nitrogen_total_kg_per_rai
      ) VALUES (?, ?, ?, 1, 'draft', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      estimateId,
      plotId,
      seasonId,
      result.baseline_ch4,
      result.project_ch4,
      result.baseline_n2o,
      result.project_n2o,
      result.baseline_co2,
      result.project_co2,
      result.project_burning,
      result.total_offset_tco2e,
      result.sf_w_project,
      result.sf_p,
      result.sf_o,
      result.nitrogen_total_kg_per_rai,
    )
    .run();

  // Update season status
  await db
    .prepare(
      "UPDATE season_inputs SET status = 'approved', updated_at = datetime('now') WHERE plot_id = ? AND season_id = ?",
    )
    .bind(plotId, seasonId)
    .run();

  return {
    success: true,
    estimateId,
    total_offset_tco2e: result.total_offset_tco2e,
  };
}
