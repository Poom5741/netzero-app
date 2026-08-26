type ApproveResult = {
  success: boolean;
  estimateId?: string;
  error?: string;
  missing?: string[];
};

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

  const estimateId = `est_${crypto.randomUUID()}`;
  await db
    .prepare(
      `INSERT INTO carbon_estimates (id, plot_id, season_id, version, status, total_offset_tco2e)
       VALUES (?, ?, ?, 1, 'draft', 0)`,
    )
    .bind(estimateId, plotId, seasonId)
    .run();

  await db
    .prepare(
      "UPDATE season_inputs SET status = 'approved', updated_at = datetime('now') WHERE plot_id = ? AND season_id = ?",
    )
    .bind(plotId, seasonId)
    .run();

  return { success: true, estimateId };
}
