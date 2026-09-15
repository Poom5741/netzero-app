/**
 * Results API — compute dashboard results from real carbon_estimates data.
 *
 * Replaces the hardcoded zeros in flow.ts handleResults() with real data
 * from carbon_estimates and photo_evidence tables.
 */

export interface EstimateResult {
  total_offset_tco2e: number;
  sf_w: number;
  approvedPhotos: number;
  totalPhotos: number;
  pendingPhotos: number;
  backfillCount: number;
}

export interface ResultsComputed {
  totalOffset: number;
  sfW: number;
  approvedPhotos: number;
  totalPhotos: number;
  pendingPhotos: number;
  pendingTasks: number;
  backfillCount: number;
}

/**
 * Compute results dashboard data from a carbon estimate record.
 *
 * @param estimate - The carbon estimate record (or null if no estimate)
 * @param backfillCount - Number of unfilled retrospective seasons
 * @returns Computed results for display
 */
export function computeResultsFromEstimate(
  estimate: EstimateResult | null,
  backfillCount: number,
): ResultsComputed {
  if (!estimate) {
    return {
      totalOffset: 0,
      sfW: 0,
      approvedPhotos: 0,
      totalPhotos: 4,
      pendingPhotos: 4,
      pendingTasks: 4 + backfillCount,
      backfillCount,
    };
  }

  return {
    totalOffset: estimate.total_offset_tco2e,
    sfW: estimate.sf_w,
    approvedPhotos: estimate.approvedPhotos,
    totalPhotos: estimate.totalPhotos,
    pendingPhotos: estimate.pendingPhotos,
    pendingTasks: estimate.pendingPhotos + backfillCount,
    backfillCount,
  };
}

/**
 * Query carbon_estimates + photo_evidence for real results data.
 * Used by flow.ts to replace hardcoded zeros.
 */
export async function fetchResultsData(
  db: D1Database,
  _farmerId: string,
  plotId: string,
): Promise<ResultsComputed> {
  // Get the latest carbon estimate for this plot
  const estimate = await db
    .prepare(
      `SELECT total_offset_tco2e, sf_w
       FROM carbon_estimates
       WHERE plot_id = ? AND status = 'final'
       ORDER BY created_at DESC
       LIMIT 1`,
    )
    .bind(plotId)
    .first<{ total_offset_tco2e: number; sf_w: number }>();

  // Count approved photos for this plot's active season
  const photoCount = await db
    .prepare(
      `SELECT
         COUNT(*) as total,
         SUM(CASE WHEN admin_status = 'verified' THEN 1 ELSE 0 END) as approved,
         SUM(CASE WHEN admin_status = 'pending' THEN 1 ELSE 0 END) as pending
       FROM photo_evidence
       WHERE plot_id = ?`,
    )
    .bind(plotId)
    .first<{ total: number; approved: number; pending: number }>();

  // Count unfilled retrospective seasons
  const backfill = await db
    .prepare(
      `SELECT COUNT(*) as cnt
       FROM season_inputs si
       JOIN seasons s ON s.id = si.season_id
       WHERE si.plot_id = ? AND si.status = 'draft' AND s.status = 'closed'`,
    )
    .bind(plotId)
    .first<{ cnt: number }>();

  const totalPhotos = photoCount?.total ?? 4;
  const approvedPhotos = photoCount?.approved ?? 0;
  const pendingPhotos = photoCount?.pending ?? 0;
  const backfillCount = backfill?.cnt ?? 0;

  const estimateData: EstimateResult | null = estimate
    ? {
        total_offset_tco2e: estimate.total_offset_tco2e,
        sf_w: estimate.sf_w,
        approvedPhotos,
        totalPhotos,
        pendingPhotos,
        backfillCount,
      }
    : null;

  return computeResultsFromEstimate(estimateData, backfillCount);
}
