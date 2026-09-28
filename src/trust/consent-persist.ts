/**
 * PDPA consent persistence — record and check farmer consents.
 *
 * Four consent types required:
 * - pdpa: general PDPA consent
 * - data_collection: consent to collect personal data
 * - photo_sharing: consent to share photos
 * - carbon_project: consent to participate in carbon credit project
 *
 * FINDING-A fix (2026-09-19):
 * recordConsent / hasAllConsents now accept a nullable farmerId. New LINE
 * users enter conversation_state=consent with line_links.farmer_id=NULL.
 * They key their consents on line_user_id; once phone-confirm resolves the
 * farmer, attachConsentsToFarmer() materializes the row's farmer_id.
 */

const VALID_CONSENT_TYPES = ["pdpa", "data_collection", "photo_sharing", "carbon_project"] as const;
type ConsentType = (typeof VALID_CONSENT_TYPES)[number];

export interface ConsentResult {
  success: boolean;
  error?: string;
}

/**
 * Record a single consent type for a farmer OR a (not-yet-resolved) LINE user.
 *
 * At least one of (farmerId, lineUserId) must be supplied. Exactly one is
 * typically set: farmerId once the user has completed phone-confirm,
 * lineUserId while still pre-link.
 *
 * Appends a new record each time (append-only audit trail).
 * hasAllConsents() counts DISTINCT types WHERE accepted=1, so multiple
 * records for the same type are deduplicated.
 */
export async function recordConsent(
  db: D1Database,
  farmerId: string | null,
  consentType: string,
  accepted: boolean,
  lineUserId?: string | null,
): Promise<ConsentResult> {
  const hasFarmer = !!farmerId?.trim();
  const hasLine = !!lineUserId?.trim();
  if (!hasFarmer && !hasLine) {
    return { success: false, error: "farmer_id or line_user_id is required" };
  }
  if (!VALID_CONSENT_TYPES.includes(consentType as ConsentType)) {
    return {
      success: false,
      error: `consent_type must be one of: ${VALID_CONSENT_TYPES.join(", ")}`,
    };
  }

  const id = `consent_${crypto.randomUUID()}`;
  await db
    .prepare(
      `INSERT INTO consent_log (id, farmer_id, line_user_id, consent_type, accepted)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .bind(
      id,
      hasFarmer ? farmerId : null,
      hasLine ? lineUserId : null,
      consentType,
      accepted ? 1 : 0,
    )
    .run();

  return { success: true };
}

/**
 * Check if a farmer OR LINE user has accepted all 4 required consents.
 *
 * Counts distinct consent types where accepted = 1 for the given key.
 * Returns true only if all 4 are present and accepted.
 */
export async function hasAllConsents(
  db: D1Database,
  farmerId: string | null | undefined,
  lineUserId?: string | null,
): Promise<boolean> {
  const hasFarmer = !!farmerId?.trim();
  const hasLine = !!lineUserId?.trim();
  if (!hasFarmer && !hasLine) return false;

  // Build a query that unions matches on farmer_id OR line_user_id.
  // Either key alone is sufficient to identify a single consent holder,
  // so we don't need to OR them in the same WHERE clause — pick whichever
  // is set, preferring farmer_id.
  const key = hasFarmer ? farmerId! : lineUserId!;
  const col = hasFarmer ? "farmer_id" : "line_user_id";

  const result = await db
    .prepare(
      `SELECT COUNT(DISTINCT consent_type) as cnt
       FROM consent_log
       WHERE ${col} = ? AND accepted = 1`,
    )
    .bind(key)
    .first<{ cnt: number }>();

  return (result?.cnt ?? 0) >= 4;
}

/**
 * Backfill farmer_id on all consents previously recorded against line_user_id.
 * Called when a LINE user completes phone-confirm and their farmer row is
 * resolved. Existing farmer_id-keyed rows are untouched.
 */
export async function attachConsentsToFarmer(
  db: D1Database,
  lineUserId: string,
  farmerId: string,
): Promise<{ success: boolean; updated: number }> {
  if (!lineUserId?.trim() || !farmerId?.trim()) {
    return { success: false, updated: 0 };
  }
  const result = await db
    .prepare(
      `UPDATE consent_log
       SET farmer_id = ?, line_user_id = NULL
       WHERE line_user_id = ? AND farmer_id IS NULL`,
    )
    .bind(farmerId, lineUserId)
    .run();
  // D1 .run() returns { success, meta: { changes } }.
  const changes = (result as { meta?: { changes?: number } }).meta?.changes ?? 0;
  return { success: true, updated: changes };
}
