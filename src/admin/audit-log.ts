/**
 * Issue #106 — Automation audit log
 *
 * Every machine decision (stamp/refusal/flag), every override, and every
 * promotion writes to automation_audit_log. Captures actor type (machine/admin),
 * confidence, reason, and timestamp.
 */

export type AuditEntryInput = {
  photoId: string;
  actorType: "machine" | "admin";
  action: string;
  confidence: number | null;
  reason: string | null;
  /** T068 — optional before/after values for field-level audit (AD-AUTH-03) */
  previousValue?: string | null;
  newValue?: string | null;
  fieldName?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  /** T094 — specific reviewer user ID (AD-REV-03) */
  actorId?: string | null;
};

export type AuditEntry = {
  id: string;
  photo_evidence_id: string;
  actor_type: string;
  actor_id: string | null;
  action: string;
  confidence: number | null;
  reason: string | null;
  field_name: string | null;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
};

export async function writeAuditEntry(db: D1Database, entry: AuditEntryInput): Promise<void> {
  const id = `audit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const createdAt = new Date().toISOString();

  await db
    .prepare(
      `INSERT INTO automation_audit_log (id, photo_evidence_id, actor_type, actor_id, action, confidence, reason, field_name, old_value, new_value, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      id,
      entry.photoId,
      entry.actorType,
      entry.actorId ?? null,
      entry.action,
      entry.confidence,
      entry.reason,
      entry.fieldName ?? null,
      entry.previousValue ?? null,
      entry.newValue ?? null,
      createdAt,
    )
    .run();
}

export async function getDecisionHistory(db: D1Database, photoId: string): Promise<AuditEntry[]> {
  const { results } = await db
    .prepare(
      `SELECT id, photo_evidence_id, actor_type, actor_id, action, confidence, reason, field_name, old_value, new_value, created_at
       FROM automation_audit_log WHERE photo_evidence_id = ? ORDER BY created_at ASC`,
    )
    .bind(photoId)
    .all<AuditEntry>();
  return results ?? [];
}
