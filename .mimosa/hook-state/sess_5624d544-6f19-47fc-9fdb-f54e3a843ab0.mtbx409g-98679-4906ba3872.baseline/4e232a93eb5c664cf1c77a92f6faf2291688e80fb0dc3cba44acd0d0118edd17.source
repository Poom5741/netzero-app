type QueueFilters = { ai_status?: string };

type QueueItem = {
  id: string;
  plot_id: string;
  ai_status: string;
  ai_label: string;
  ai_reason: string | null;
  ai_confidence: number;
  admin_status: string;
  photo_type?: string | null;
  pre_verified?: number;
  audit_sample?: number;
  water_state?: string | null;
};

export async function getReviewQueue(
  db: D1Database,
  filters: QueueFilters = {},
): Promise<QueueItem[]> {
  let query = "SELECT * FROM photo_evidence";
  const conditions: string[] = [];

  if (filters.ai_status) {
    conditions.push("ai_status = ?");
  }

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(" AND ")}`;
  }

  query +=
    " ORDER BY CASE WHEN ai_status = 'flag' THEN 0 WHEN ai_status = 'reject' THEN 1 ELSE 2 END";

  const bindValues = filters.ai_status ? [filters.ai_status] : [];

  const { results } = await db
    .prepare(query)
    .bind(...bindValues)
    .all<QueueItem>();
  const rows = results ?? [];

  // Two-tier filtering: exclude auto-stamped photos that are NOT audit samples
  const filtered = rows.filter((r) => {
    // If pre_verified=1 and audit_sample is NOT 1, exclude from queue
    if (r.pre_verified === 1 && r.audit_sample !== 1) return false;
    return true;
  });

  const sortOrder = { flag: 0, reject: 1 };
  return filtered.sort((a, b) => {
    const aO = sortOrder[a.ai_status as keyof typeof sortOrder] ?? 2;
    const bO = sortOrder[b.ai_status as keyof typeof sortOrder] ?? 2;
    return aO - bO;
  });
}
