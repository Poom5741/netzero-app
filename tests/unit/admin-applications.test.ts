import { describe, expect, it } from "vitest";
import { getApplications, approveApplication, rejectApplication } from "../../src/admin/applications";
import { writeAuditEntry } from "../../src/admin/audit-log";

function mockD1Sequence(rows: (Record<string, unknown> | null)[]) {
  let idx = 0;
  return {
    prepare(_sql: string) {
      const row = rows[idx % rows.length];
      idx++;
      return {
        bind(..._args: unknown[]) {
          if (row === null) {
            return {
              first: async () => null,
              all: async () => ({ results: [] }),
              run: async () => ({ success: true, changes: 0 }),
            };
          }
          return {
            first: async () => row,
            all: async () => ({ results: [row] }),
            run: async () => ({ success: true, changes: 1 }),
          };
        },
      };
    },
  };
}

function mockD1Multi(prepareResults: Record<string, unknown>[][] ) {
  let callIdx = 0;
  return {
    prepare(_sql: string) {
      const rows = prepareResults[callIdx] ?? [];
      callIdx++;
      return {
        bind(..._args: unknown[]) {
          return {
            first: async () => rows[0] ?? null,
            all: async () => ({ results: rows }),
            run: async () => ({ success: true, changes: rows.length }),
          };
        },
      };
    },
  };
}

describe("getApplications", () => {
  it("returns pending applications with doc counts", async () => {
    // H1 fix: single query returns everything including doc_count and consent_count
    const db = mockD1Multi([
      [
        {
          id: "link-1",
          farmer_id: "farmer-1",
          line_user_id: "U12345",
          full_name: "สมชาย ใจดี",
          phone: "081-234-5678",
          addr_province: "สุพรรณบุรี",
          addr_district: "เมือง",
          status: "pending",
          created_at: "2026-01-15T10:00:00Z",
          doc_count: 2,
          consent_count: 3,
        },
      ],
    ]) as unknown as D1Database;
    const result = await getApplications(db);
    expect(result.length).toBe(1);
    expect(result[0].farmer_name).toBe("สมชาย ใจดี");
    expect(result[0].doc_count).toBe(2);
    expect(result[0].docs_needed).toBe(3);
    expect(result[0].consent_count).toBe(3);
  });

  it("returns empty when no pending applications", async () => {
    const db = mockD1Multi([
      [],
    ]) as unknown as D1Database;
    const result = await getApplications(db);
    expect(result).toEqual([]);
  });
});

describe("approveApplication", () => {
  it("generates CPA code on approval", async () => {
    const db = {
      prepare(sql: string) {
        return {
          bind(..._args: unknown[]) {
            if (sql.includes("SELECT id, farmer_id FROM line_links")) {
              return { first: async () => ({ id: "link-1", farmer_id: "farmer-1" }) };
            }
            if (sql.includes("COUNT(*) as cnt FROM farmers")) {
              return { first: async () => ({ cnt: 10 }) };
            }
            return { first: async () => null, run: async () => ({ success: true, changes: 1 }) };
          },
        };
      },
      batch: async () => [{ changes: 1 }, { changes: 1 }],
    };
    const result = await approveApplication(db as unknown as D1Database, "link-1");
    expect(result.success).toBe(true);
    expect(result.cpa_code).toMatch(/^CPA\d{4}$/);
  });

  it("returns error when link not found", async () => {
    const db = mockD1Sequence([null]) as unknown as D1Database;
    const result = await approveApplication(db, "missing-link");
    expect(result.success).toBe(false);
    expect(result.error).toContain("not found");
  });

  it("retries on CPA code collision (C3 fix)", async () => {
    let batchCallCount = 0;
    const db = {
      prepare(sql: string) {
        return {
          bind(..._args: unknown[]) {
            if (sql.includes("SELECT id, farmer_id FROM line_links")) {
              return { first: async () => ({ id: "link-1", farmer_id: "farmer-1" }) };
            }
            if (sql.includes("COUNT(*) as cnt FROM farmers")) {
              return { first: async () => ({ cnt: 5 }) };
            }
            // Both UPDATE statements return prepared statements for batch
            return {
              first: async () => null,
              run: async () => ({ success: true, changes: 1 }),
            };
          },
        };
      },
      batch: async (stmts: unknown[]) => {
        batchCallCount++;
        // First batch attempt: simulate UNIQUE constraint collision
        if (batchCallCount === 1) {
          throw new Error("UNIQUE constraint failed");
        }
        // Second attempt succeeds
        return [{ changes: 1 }, { changes: 1 }];
      },
    };
    const result = await approveApplication(db as unknown as D1Database, "link-1");
    expect(result.success).toBe(true);
    expect(result.cpa_code).toBe("CPA0007"); // cnt=5, +1=6, attempt=1 → 7
    expect(batchCallCount).toBe(2);
  });
});

describe("rejectApplication", () => {
  it("rejects with reason", async () => {
    const db = mockD1Sequence([
      { id: "link-1" },  // link lookup
      { success: true }, // update link status
    ]) as unknown as D1Database;
    const result = await rejectApplication(db, "link-1", "เอกสารไม่ครบ");
    expect(result.success).toBe(true);
  });

  it("returns error when link not found", async () => {
    const db = mockD1Sequence([null]) as unknown as D1Database;
    const result = await rejectApplication(db, "missing", "test");
    expect(result.success).toBe(false);
    expect(result.error).toContain("not found");
  });

  it("requires reason", async () => {
    const db = mockD1Sequence([{ id: "link-1" }]) as unknown as D1Database;
    const result = await rejectApplication(db, "link-1", "");
    expect(result.success).toBe(false);
    expect(result.error).toContain("reason");
  });

  it("writes NULL photo_evidence_id for non-photo audit entries", async () => {
    // Track all SQL calls to verify the audit INSERT uses NULL
    const sqlCalls: string[] = [];
    const db = {
      prepare(sql: string) {
        sqlCalls.push(sql);
        return {
          bind(..._args: unknown[]) {
            return {
              first: async () => (sql.includes("SELECT id FROM line_links") ? { id: "link-1" } : null),
              all: async () => ({ results: [] }),
              run: async () => ({ success: true, changes: 1 }),
            };
          },
        };
      },
    } as unknown as D1Database;

    await rejectApplication(db, "link-1", "test reason");

    // Verify the audit INSERT uses NULL, not 'system'
    const auditInsert = sqlCalls.find((s) => s.includes("INSERT INTO automation_audit_log"));
    expect(auditInsert).toBeDefined();
    expect(auditInsert).toContain("NULL");
    expect(auditInsert).not.toContain("'system'");
  });
});
