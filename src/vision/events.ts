type EventInput = {
  model_version: string;
  input_tokens: number;
  output_tokens: number;
  cost_usd: number;
  quota_limit?: number;
  cost_limit_usd?: number;
};

type EventResult = { recorded: boolean; error?: string };

export async function recordVisionEvent(
  db: D1Database,
  farmerId: string,
  input: EventInput,
): Promise<EventResult> {
  if (input.quota_limit != null) {
    const countRow = await db
      .prepare(
        `SELECT COUNT(*) as cnt FROM ai_events
         WHERE farmer_id = ? AND event_type = 'vision'`,
      )
      .bind(farmerId)
      .first<{ cnt: number }>();

    if (countRow && countRow.cnt >= input.quota_limit) {
      return { recorded: false, error: "Vision event quota exceeded" };
    }
  }

  if (input.cost_limit_usd != null) {
    const costRow = await db
      .prepare(
        `SELECT COALESCE(SUM(cost_usd), 0) as total FROM ai_events
         WHERE farmer_id = ?`,
      )
      .bind(farmerId)
      .first<{ total: number }>();

    if (costRow && costRow.total >= input.cost_limit_usd) {
      return { recorded: false, error: "cost quota exceeded" };
    }
  }

  await db
    .prepare(
      `INSERT INTO ai_events (id, farmer_id, event_type, model_version,
        input_tokens, output_tokens, cost_usd)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      crypto.randomUUID(),
      farmerId,
      "vision",
      input.model_version,
      input.input_tokens,
      input.output_tokens,
      input.cost_usd,
    )
    .run();

  return { recorded: true };
}
