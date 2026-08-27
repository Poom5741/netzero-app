type OverrideResult = {
  success: boolean;
  newVersion?: number;
  error?: string;
};

export async function overrideEstimate(
  db: D1Database,
  plotId: string,
  seasonId: string,
  newOffset: number,
  reason: string,
): Promise<OverrideResult> {
  const prev = await db
    .prepare(
      "SELECT version FROM carbon_estimates WHERE plot_id = ? AND season_id = ? ORDER BY version DESC LIMIT 1",
    )
    .bind(plotId, seasonId)
    .first<{ version: number }>();

  if (!prev) return { success: false, error: "no previous estimate found" };

  const newVersion = prev.version + 1;

  await db
    .prepare(
      "UPDATE carbon_estimates SET status = 'superseded' WHERE plot_id = ? AND season_id = ? AND version = ?",
    )
    .bind(plotId, seasonId, prev.version)
    .run();

  await db
    .prepare(
      `INSERT INTO carbon_estimates (id, plot_id, season_id, version, status, total_offset_tco2e, override_reason)
       VALUES (?, ?, ?, ?, 'draft', ?, ?)`,
    )
    .bind(`est_${crypto.randomUUID()}`, plotId, seasonId, newVersion, newOffset, reason)
    .run();

  return { success: true, newVersion };
}
