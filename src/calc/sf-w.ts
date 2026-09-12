/**
 * SF_w — Water management scaling factor.
 *
 * Computed dynamically from photo completeness:
 * - 4 approved photos (WET-1, DRY-1, WET-2, DRY-2) → 0.55 (full AWD benefit)
 * - 1-3 approved photos → 0.71 (partial benefit)
 * - 0 photos → 1.0 (no water management benefit)
 *
 * Design system reference: OB-01 sidebar note
 * "ครบทั้ง 4 ภาพจึงใช้ตัวปรับการจัดการน้ำ SF_w = 0.55 ได้เต็มค่า
 *  ถ้าไม่ครบระบบถอยเป็น 0.71 โดยอัตโนมัติ"
 */

export const SF_W = {
  full: 0.55,
  incomplete: 0.71,
  none: 1.0,
} as const;

/**
 * Compute SF_w for a given plot+season based on approved photo count.
 *
 * @param db - D1 database
 * @param plotId - Plot ID
 * @param seasonId - Season ID
 * @returns SF_w value (0.55, 0.71, or 1.0)
 */
export async function getSfW(
  db: D1Database,
  plotId: string,
  seasonId: string,
): Promise<number> {
  const result = await db
    .prepare(
      `SELECT
        COUNT(CASE WHEN admin_status = 'verified' THEN 1 END) as approved,
        COUNT(*) as total
       FROM photo_evidence
       WHERE plot_id = ? AND season_id = ?`
    )
    .bind(plotId, seasonId)
    .first<{ approved: number; total: number }>();

  const approved = result?.approved ?? 0;

  if (approved >= 4) return SF_W.full;
  if (approved >= 1) return SF_W.incomplete;
  return SF_W.none;
}
