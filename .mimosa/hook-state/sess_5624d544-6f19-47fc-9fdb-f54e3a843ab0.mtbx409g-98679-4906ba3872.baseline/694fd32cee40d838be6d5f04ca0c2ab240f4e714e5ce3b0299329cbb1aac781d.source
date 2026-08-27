/**
 * Issue #103 — Pre-Verification stamp + audit sampling
 *
 * Pre-verification: high-confidence passes get a machine-written stamp.
 * Audit sampling: seeded RNG selects a configurable share for human audit.
 * Kill switch: when disabled, no stamping — everything goes to human queue.
 */

export type PreVerifyConfig = {
  confidenceThreshold: number;
  auditSampleRate: number; // 0..1
  enabled: boolean;
};

/**
 * Should this photo receive the Pre-Verification stamp?
 */
export function shouldPreVerify(
  confidence: number,
  config: PreVerifyConfig,
  valid = true,
): boolean {
  if (!config.enabled) return false;
  if (!valid) return false;
  return confidence >= config.confidenceThreshold;
}

/**
 * Seeded deterministic audit sampling.
 * Uses a simple hash of the photo id to decide if it's in the sample.
 * Same id + same rate → same result (deterministic).
 */
export function shouldAuditSample(photoId: string, rate: number): boolean {
  if (rate <= 0) return false;
  if (rate >= 1) return true;

  // Deterministic hash → [0, 1) — use multiple mixing rounds for distribution
  let h = 0x811c9dc5;
  for (let i = 0; i < photoId.length; i++) {
    h ^= photoId.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  // Extra avalanche
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  const normalized = (h >>> 0) / 0xffffffff;
  return normalized < rate;
}

type ClassifyInput = {
  confidence: number;
  water_state: string;
  valid: boolean;
  reason: string;
};

type PreVerifyResult = {
  stamped: boolean;
  audit_sample: boolean;
};

/**
 * Apply pre-verification stamp to a photo in the database.
 * Returns whether the photo was stamped and whether it's an audit sample.
 */
export async function applyPreVerification(
  db: D1Database,
  photoId: string,
  classification: ClassifyInput,
  config: PreVerifyConfig,
  seedId: string,
): Promise<PreVerifyResult> {
  if (!shouldPreVerify(classification.confidence, config, classification.valid)) {
    return { stamped: false, audit_sample: false };
  }

  const isAudit = shouldAuditSample(seedId, config.auditSampleRate);

  await db
    .prepare(
      `UPDATE photo_evidence
       SET pre_verified = 1, water_state = ?, audit_sample = ?
       WHERE id = ?`,
    )
    .bind(classification.water_state, isAudit ? 1 : 0, photoId)
    .run();

  return { stamped: true, audit_sample: isAudit };
}
