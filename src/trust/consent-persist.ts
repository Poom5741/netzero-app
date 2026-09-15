/**
 * PDPA consent persistence — record and check farmer consents.
 *
 * Four consent types required:
 * - pdpa: general PDPA consent
 * - data_collection: consent to collect personal data
 * - photo_sharing: consent to share photos
 * - carbon_project: consent to participate in carbon credit project
 */

const VALID_CONSENT_TYPES = ["pdpa", "data_collection", "photo_sharing", "carbon_project"] as const;
type ConsentType = (typeof VALID_CONSENT_TYPES)[number];

export interface ConsentResult {
  success: boolean;
  error?: string;
}

/**
 * Record a single consent type for a farmer.
 *
 * Appends a new record each time (append-only audit trail).
 * hasAllConsents() counts DISTINCT types WHERE accepted=1,
 * so multiple records for the same type are deduplicated.
 */
export async function recordConsent(
  db: D1Database,
  farmerId: string,
  consentType: string,
  accepted: boolean,
): Promise<ConsentResult> {
  if (!farmerId?.trim()) {
    return { success: false, error: "farmer_id is required" };
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
      `INSERT INTO consent_log (id, farmer_id, consent_type, accepted)
       VALUES (?, ?, ?, ?)`,
    )
    .bind(id, farmerId, consentType, accepted ? 1 : 0)
    .run();

  return { success: true };
}

/**
 * Check if a farmer has accepted all 4 required consents.
 *
 * Counts distinct consent types where accepted = 1.
 * Returns true only if all 4 are present and accepted.
 */
export async function hasAllConsents(db: D1Database, farmerId: string): Promise<boolean> {
  const result = await db
    .prepare(
      `SELECT COUNT(DISTINCT consent_type) as cnt
       FROM consent_log
       WHERE farmer_id = ? AND accepted = 1`,
    )
    .bind(farmerId)
    .first<{ cnt: number }>();

  return (result?.cnt ?? 0) >= 4;
}
