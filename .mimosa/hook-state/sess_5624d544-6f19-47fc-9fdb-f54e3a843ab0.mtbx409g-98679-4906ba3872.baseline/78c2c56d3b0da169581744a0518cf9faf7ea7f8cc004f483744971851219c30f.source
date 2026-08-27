import { randomBytes } from "node:crypto";

function generateId(): string {
  const buf = randomBytes(8);
  return `msg_${Array.from(buf, (b) => b.toString(16).padStart(2, "0")).join("")}`;
}

export async function recordRawMessage(
  farmerId: string,
  rawText: string,
  db: D1Database,
): Promise<string> {
  const id = generateId();
  await db
    .prepare(
      `INSERT INTO farmer_messages (id, farmer_id, raw_text, confirmed, message_type)
       VALUES (?, ?, ?, 0, 'chat')`,
    )
    .bind(id, farmerId, rawText)
    .run();
  return id;
}

export async function updateDraft(
  messageId: string,
  draftJson: Record<string, unknown>,
  db: D1Database,
): Promise<void> {
  await db
    .prepare(`UPDATE farmer_messages SET draft_json = ? WHERE id = ?`)
    .bind(JSON.stringify(draftJson), messageId)
    .run();
}

export async function confirmMessage(messageId: string, db: D1Database): Promise<void> {
  await db.prepare(`UPDATE farmer_messages SET confirmed = 1 WHERE id = ?`).bind(messageId).run();
}

export async function getMessageLifecycle(
  messageId: string,
  db: D1Database,
): Promise<Record<string, unknown> | null> {
  return db.prepare(`SELECT * FROM farmer_messages WHERE id = ?`).bind(messageId).first();
}
