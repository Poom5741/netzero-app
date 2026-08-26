/**
 * Issue #106 — Automation audit log + decision history view
 *
 * Every machine decision (stamp/refusal/flag), every override, and every
 * promotion writes to an automation audit trail capturing actor type,
 * confidence, reason, and timestamp.
 */
import { describe, expect, it } from "vitest";
import {
  writeAuditEntry,
  getDecisionHistory,
  type AuditEntry,
} from "../../src/admin/audit-log";

function mockD1() {
  const store: Record<string, unknown>[] = [];
  return {
    store,
    prepare(sql: string) {
      return {
        bind(...args: unknown[]) {
          if (sql.includes("INSERT INTO automation_audit_log")) {
            const cols = ["id", "photo_evidence_id", "actor_type", "action", "confidence", "reason", "created_at"];
            const row: Record<string, unknown> = {};
            cols.forEach((col, i) => { row[col] = args[i] ?? null; });
            store.push(row);
            return { run: async () => ({ success: true }), first: async () => null };
          }
          if (sql.includes("SELECT") && sql.includes("automation_audit_log")) {
            const photoId = args[0] as string;
            const filtered = store.filter((r) => r.photo_evidence_id === photoId);
            return {
              run: async () => ({ success: true }),
              first: async () => filtered[0] ?? null,
              all: async () => ({ results: filtered }),
            };
          }
          return { run: async () => ({ success: true }), first: async () => null, all: async () => ({ results: [] }) };
        },
      };
    },
  };
}

describe("writeAuditEntry", () => {
  it("writes a machine decision entry", async () => {
    const db = mockD1();
    await writeAuditEntry(db as unknown as D1Database, {
      photoId: "photo-1",
      actorType: "machine",
      action: "pre_verified",
      confidence: 0.95,
      reason: "เห็นน้ำขังชัดเจน",
    });

    expect(db.store.length).toBe(1);
    expect(db.store[0]?.actor_type).toBe("machine");
    expect(db.store[0]?.action).toBe("pre_verified");
    expect(db.store[0]?.confidence).toBe(0.95);
    expect(db.store[0]?.reason).toBe("เห็นน้ำขังชัดเจน");
    expect(db.store[0]?.created_at).toBeDefined();
  });

  it("writes an admin override entry", async () => {
    const db = mockD1();
    await writeAuditEntry(db as unknown as D1Database, {
      photoId: "photo-1",
      actorType: "admin",
      action: "superseded",
      confidence: null,
      reason: "ภาพไม่ชัดเจน",
    });

    expect(db.store.length).toBe(1);
    expect(db.store[0]?.actor_type).toBe("admin");
    expect(db.store[0]?.action).toBe("superseded");
  });
});

describe("getDecisionHistory", () => {
  it("returns all entries for a photo in chronological order", async () => {
    const db = mockD1();

    await writeAuditEntry(db as unknown as D1Database, {
      photoId: "photo-1",
      actorType: "machine",
      action: "pre_verified",
      confidence: 0.95,
      reason: "เห็นน้ำขังชัดเจน",
    });
    await writeAuditEntry(db as unknown as D1Database, {
      photoId: "photo-1",
      actorType: "admin",
      action: "promoted",
      confidence: null,
      reason: "confirmed by admin",
    });
    // Different photo — should not appear
    await writeAuditEntry(db as unknown as D1Database, {
      photoId: "photo-2",
      actorType: "machine",
      action: "flagged",
      confidence: 0.55,
      reason: "low confidence",
    });

    const history = await getDecisionHistory(db as unknown as D1Database, "photo-1");
    expect(history.length).toBe(2);
    expect(history[0]?.action).toBe("pre_verified");
    expect(history[1]?.action).toBe("promoted");
  });

  it("returns empty array for photo with no entries", async () => {
    const db = mockD1();
    const history = await getDecisionHistory(db as unknown as D1Database, "photo-nonexistent");
    expect(history).toEqual([]);
  });

  it("each entry has required fields", async () => {
    const db = mockD1();
    await writeAuditEntry(db as unknown as D1Database, {
      photoId: "photo-1",
      actorType: "machine",
      action: "refused",
      confidence: 0.1,
      reason: "ไม่พบท่อวัด กรุณาถ่ายให้เห็นท่อ",
    });

    const history = await getDecisionHistory(db as unknown as D1Database, "photo-1");
    expect(history.length).toBe(1);
    const entry = history[0]!;
    expect(entry.photo_evidence_id).toBe("photo-1");
    expect(entry.actor_type).toBe("machine");
    expect(entry.action).toBe("refused");
    expect(entry.confidence).toBe(0.1);
    expect(entry.reason).toBe("ไม่พบท่อวัด กรุณาถ่ายให้เห็นท่อ");
    expect(entry.created_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});
