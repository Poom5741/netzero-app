import { describe, expect, it } from "vitest";
import {
  confirmMessage,
  getMessageLifecycle,
  recordRawMessage,
  updateDraft,
} from "../../src/chat/audit";

function mockDB() {
  const calls: { sql: string; args: unknown[] }[] = [];
  const rows: Map<string, Record<string, unknown>> = new Map();
  return {
    calls,
    rows,
    prepare(sql: string) {
      return {
        bind(...args: unknown[]) {
          calls.push({ sql, args });
          const id = args[0] as string;
          if (sql.includes("INSERT")) {
            // args: [id, farmer_id, raw_text] for farmer_messages INSERT
            rows.set(id, { id, raw_text: args[2] ?? args[1], confirmed: 0 });
          }
          if (sql.includes("UPDATE") && sql.includes("draft_json")) {
            const row = rows.get(id);
            if (row) row.draft_json = args[1];
          }
          if (sql.includes("UPDATE") && sql.includes("confirmed = 1")) {
            const row = rows.get(id);
            if (row) row.confirmed = 1;
          }
          return {
            run: async () => ({ success: true }),
            first: async () => {
              if (sql.includes("SELECT")) {
                return rows.get(id) ?? null;
              }
              return null;
            },
          };
        },
      };
    },
  };
}

describe("recordRawMessage", () => {
  it("inserts raw text into farmer_messages", async () => {
    const db = mockDB();
    const id = await recordRawMessage("f1", "ใส่ปุ๋ย 16-16-16", db as any);
    expect(id).toBeDefined();
    expect(id.startsWith("msg_")).toBe(true);
    expect(db.calls.length).toBe(1);
    expect(db.calls[0]?.sql).toContain("INSERT INTO farmer_messages");
  });
});

describe("updateDraft", () => {
  it("updates draft_json for an existing message", async () => {
    const db = mockDB();
    await recordRawMessage("f1", "ใส่ปุ๋ย 16-16-16", db as any);
    const msgId = db.calls[0]?.args[0] as string;

    await updateDraft(msgId, { type: "fertilizer", formula: "16-16-16" }, db as any);
    expect(db.calls.length).toBe(2);
    expect(db.calls[1]?.sql).toContain("draft_json");
  });
});

describe("confirmMessage", () => {
  it("sets confirmed=1 for a message", async () => {
    const db = mockDB();
    await recordRawMessage("f1", "ใส่ปุ๋ย", db as any);
    const msgId = db.calls[0]?.args[0] as string;

    await confirmMessage(msgId, db as any);
    expect(db.calls.length).toBe(2);
    expect(db.calls[1]?.sql).toContain("confirmed = 1");
  });
});

describe("getMessageLifecycle", () => {
  it("returns the full lifecycle of a message", async () => {
    const db = mockDB();
    const id = await recordRawMessage("f1", "ใส่ปุ๋ย", db as any);
    await updateDraft(id, { type: "fertilizer" }, db as any);
    await confirmMessage(id, db as any);

    const lifecycle = await getMessageLifecycle(id, db as any);
    expect(lifecycle).toBeDefined();
    expect(lifecycle?.raw_text).toBe("ใส่ปุ๋ย");
    expect(lifecycle?.confirmed).toBe(1);
  });
});
