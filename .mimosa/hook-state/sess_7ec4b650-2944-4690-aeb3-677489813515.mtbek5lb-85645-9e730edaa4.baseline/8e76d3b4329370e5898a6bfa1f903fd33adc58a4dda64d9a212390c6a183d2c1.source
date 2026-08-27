/**
 * Issue #104 — Pre-verify precision stat
 * Computes rolling precision from audit outcomes and overrides.
 */

export type PrecisionStat = {
  auditReviewed: number;
  overrides: number;
  precision: number | null;
};

export async function getPrecisionStat(db: D1Database): Promise<PrecisionStat> {
  // Get all photos that have been through audit or override
  const { results } = await db
    .prepare(
      `SELECT id, audit_sample, pre_verified, admin_status, superseded
       FROM photo_evidence
       WHERE (audit_sample = 1 AND admin_status != 'pending')
          OR (superseded = 1)`,
    )
    .bind()
    .all<{
      id: string;
      audit_sample: number;
      pre_verified: number;
      admin_status: string;
      superseded: number;
    }>();

  const rows = results ?? [];

  // Audit reviewed: audit_sample=1 and admin has made a decision
  const auditReviewed = rows.filter(
    (r) => r.audit_sample === 1 && r.admin_status !== "pending",
  ).length;

  // Overrides: any pre-verified item that was superseded (rejected by admin)
  const overrides = rows.filter((r) => r.superseded === 1).length;

  // Precision: confirmed audits / total reviewed audits
  let precision: number | null = null;
  if (auditReviewed > 0) {
    const confirmed = rows.filter(
      (r) => r.audit_sample === 1 && r.admin_status === "verified",
    ).length;
    precision = confirmed / auditReviewed;
  }

  return { auditReviewed, overrides, precision };
}
