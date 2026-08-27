type CloseResult = { success: boolean; error?: string };

export async function closeSeason(db: D1Database, seasonId: string): Promise<CloseResult> {
  const row = await db
    .prepare("SELECT id, status FROM season_inputs WHERE id = ?")
    .bind(seasonId)
    .first<{ id: string; status: string }>();

  if (!row) return { success: false, error: "season not found" };
  if (row.status === "closed") return { success: false, error: "already closed" };
  if (row.status === "draft") return { success: false, error: "cannot close draft season" };

  await db
    .prepare(
      "UPDATE season_inputs SET status = 'closed', updated_at = datetime('now') WHERE id = ?",
    )
    .bind(seasonId)
    .run();

  return { success: true };
}
