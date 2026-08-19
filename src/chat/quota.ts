type QuotaResult = {
  allowed: boolean;
  reason?: string;
};

/**
 * Check whether a farmer is under their AI token quota.
 */
export async function checkQuota(
  farmerId: string,
  limit: number,
  db: D1Database,
): Promise<QuotaResult> {
  const row = await db
    .prepare(
      "SELECT COALESCE(SUM(input_tokens + output_tokens), 0) AS total FROM ai_events WHERE farmer_id = ?",
    )
    .bind(farmerId)
    .first<{ total: number }>();

  const used = row?.total ?? 0;
  if (used > limit) {
    return { allowed: false, reason: `quota exceeded: ${used}/${limit} tokens` };
  }
  return { allowed: true };
}

/**
 * Record an AI usage event for quota tracking.
 */
export async function recordAiEvent(
  farmerId: string,
  eventType: string,
  modelVersion: string,
  inputTokens: number,
  outputTokens: number,
  costUsd: number,
  db: D1Database,
): Promise<void> {
  const id = `ae_${Date.now()}`;
  await db
    .prepare(
      "INSERT INTO ai_events (id, farmer_id, event_type, model_version, input_tokens, output_tokens, cost_usd) VALUES (?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(id, farmerId, eventType, modelVersion, inputTokens, outputTokens, costUsd)
    .run();
}
