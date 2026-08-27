type SeasonSummaryResult = {
  water_pre_plant: string | null;
  water_management: string | null;
  fuel_liters_per_rai: number | null;
  fuel_type: string | null;
  electricity_kwh_per_rai: number | null;
  straw_management: string | null;
  yield_kg_per_rai: number | null;
  harvest_fuel_liters: number | null;
  harvest_electricity_kwh: number | null;
  status: string | null;
  plot_id: string | null;
  season_id: string | null;
};

/**
 * Retrieve season summary for a plot-season from D1.
 */
export async function seasonSummary(
  db: D1Database,
  seasonId: string,
  plotId: string,
): Promise<SeasonSummaryResult | null> {
  const row = await db
    .prepare(
      "SELECT water_pre_plant, water_management, fuel_liters_per_rai, fuel_type, electricity_kwh_per_rai, straw_management, yield_kg_per_rai, harvest_fuel_liters, harvest_electricity_kwh, status, plot_id, season_id FROM season_inputs WHERE season_id = ? AND plot_id = ?",
    )
    .bind(seasonId, plotId)
    .first<SeasonSummaryResult>();

  return row ?? null;
}
