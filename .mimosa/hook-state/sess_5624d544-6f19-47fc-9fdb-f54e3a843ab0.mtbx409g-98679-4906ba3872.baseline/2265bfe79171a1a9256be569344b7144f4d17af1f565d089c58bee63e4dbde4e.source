/**
 * Issue #127 — Admin queue digest cron logic.
 * Computes queue digest stats for admin notifications.
 */

export interface QueueDigest {
  queueLength: number;
  precisionStat: string;
  trustDistribution: {
    high: number;
    medium: number;
    low: number;
  };
}

/**
 * Get queue digest statistics.
 */
export async function getQueueDigest(db: D1Database): Promise<QueueDigest> {
  // Count pending photos in queue
  const queueResult = await db
    .prepare("SELECT COUNT(*) as count FROM photo_evidence WHERE admin_status = 'pending'")
    .first<{ count: number }>();
  const queueLength = queueResult?.count ?? 0;

  // Compute precision stat (verified / (verified + rejected))
  const statsResult = await db
    .prepare(
      `SELECT 
         SUM(CASE WHEN admin_status = 'verified' THEN 1 ELSE 0 END) as verified,
         SUM(CASE WHEN admin_status = 'rejected' THEN 1 ELSE 0 END) as rejected
       FROM photo_evidence
       WHERE admin_status IN ('verified', 'rejected')`,
    )
    .first<{ verified: number; rejected: number }>();
  
  const verified = statsResult?.verified ?? 0;
  const rejected = statsResult?.rejected ?? 0;
  const total = verified + rejected;
  const precision = total > 0 ? ((verified / total) * 100).toFixed(0) : "N/A";
  const precisionStat = total > 0 ? `Precision: ${precision}%` : "Precision: N/A";

  // Trust distribution
  const trustResult = await db
    .prepare(
      `SELECT 
         SUM(CASE WHEN trust_score > 0.7 THEN 1 ELSE 0 END) as high,
         SUM(CASE WHEN trust_score >= 0.3 AND trust_score <= 0.7 THEN 1 ELSE 0 END) as medium,
         SUM(CASE WHEN trust_score < 0.3 THEN 1 ELSE 0 END) as low
       FROM farmer_trust`,
    )
    .first<{ high: number; medium: number; low: number }>();

  const trustDistribution = {
    high: trustResult?.high ?? 0,
    medium: trustResult?.medium ?? 0,
    low: trustResult?.low ?? 0,
  };

  return {
    queueLength,
    precisionStat,
    trustDistribution,
  };
}

/**
 * Format digest message for LINE push.
 */
export function formatDigestMessage(digest: QueueDigest): string {
  const { queueLength, precisionStat, trustDistribution } = digest;
  return `📊 Admin Queue Digest\n\nQueue: ${queueLength} photos pending\n${precisionStat}\n\nTrust Distribution:\n• High: ${trustDistribution.high}\n• Medium: ${trustDistribution.medium}\n• Low: ${trustDistribution.low}`;
}
