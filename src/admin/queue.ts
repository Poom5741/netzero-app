type QueueFilters = { ai_status?: string };

type QueueItem = {
  id: string;
  plot_id: string;
  ai_status: string;
  ai_label: string;
  ai_reason: string | null;
  ai_confidence: number;
  admin_status: string;
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
  const sortOrder = { flag: 0, reject: 1 };
  return rows.sort((a, b) => {
    const aO = sortOrder[a.ai_status as keyof typeof sortOrder] ?? 2;
    const bO = sortOrder[b.ai_status as keyof typeof sortOrder] ?? 2;
    return aO - bO;
  });
}
