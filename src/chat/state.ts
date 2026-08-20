/**
 * Conversation state manager — tracks what the farmer is currently doing.
 * Stored in D1 farmer_messages as pending drafts.
 */

export type ConversationState = {
  farmerId: string;
  pendingDraft?: {
    category: "fertilizer" | "season_input";
    data: Record<string, unknown>;
    text: string;
    createdAt: number;
  };
};

const STATE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Get the pending draft for a farmer (if any and not expired).
 */
export async function getPendingDraft(
  db: D1Database,
  farmerId: string,
): Promise<ConversationState["pendingDraft"] | null> {
  const row = await db
    .prepare(
      `SELECT draft_json FROM farmer_messages
       WHERE farmer_id = ? AND message_type = 'chat' AND confirmed = 0 AND draft_json IS NOT NULL
       ORDER BY created_at DESC LIMIT 1`,
    )
    .bind(farmerId)
    .first<{ draft_json: string }>();

  if (!row) return null;

  try {
    const draft = JSON.parse(row.draft_json);
    if (draft.type !== "draft") return null;
    // Check if expired
    if (Date.now() - (draft.createdAt || 0) > STATE_TTL_MS) return null;
    return draft;
  } catch {
    return null;
  }
}

/**
 * Save a pending draft for a farmer.
 */
export async function savePendingDraft(
  db: D1Database,
  farmerId: string,
  draft: { category: string; data: Record<string, unknown>; text: string },
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO farmer_messages (id, farmer_id, raw_text, draft_json, message_type, confirmed)
       VALUES (?, ?, ?, ?, 'draft', 0)`,
    )
    .bind(
      crypto.randomUUID(),
      farmerId,
      `[pending] ${draft.text}`,
      JSON.stringify({ ...draft, type: "draft", createdAt: Date.now() }),
    )
    .run();
}

/**
 * Mark a draft as confirmed.
 */
export async function confirmDraft(
  db: D1Database,
  farmerId: string,
): Promise<{ category: string; data: Record<string, unknown> } | null> {
  const row = await db
    .prepare(
      `SELECT id, draft_json FROM farmer_messages
       WHERE farmer_id = ? AND message_type = 'draft' AND confirmed = 0
       ORDER BY created_at DESC LIMIT 1`,
    )
    .bind(farmerId)
    .first<{ id: string; draft_json: string }>();

  if (!row) return null;

  const draft = JSON.parse(row.draft_json);
  await db
    .prepare(`UPDATE farmer_messages SET confirmed = 1 WHERE id = ?`)
    .bind(row.id)
    .run();

  return { category: draft.category, data: draft.data };
}

/**
 * Reject a pending draft.
 */
export async function rejectDraft(
  db: D1Database,
  farmerId: string,
): Promise<boolean> {
  const row = await db
    .prepare(
      `SELECT id FROM farmer_messages
       WHERE farmer_id = ? AND message_type = 'draft' AND confirmed = 0
       ORDER BY created_at DESC LIMIT 1`,
    )
    .bind(farmerId)
    .first<{ id: string }>();

  if (!row) return false;

  await db
    .prepare(`DELETE FROM farmer_messages WHERE id = ?`)
    .bind(row.id)
    .run();

  return true;
}
