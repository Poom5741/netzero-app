import { describe, expect, it } from "vitest";
import { getReports, logReportDownload } from "../../src/admin/reports";
import { getSettings, updateSettings } from "../../src/admin/settings";
import { getSponsors } from "../../src/admin/sponsors";

function mockD1Multi(prepareResults: Record<string, unknown>[][]) {
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
              run: async () => ({ success: true }),
            };
          }
          return {
            first: async () => row,
            all: async () => ({ results: [row] }),
            run: async () => ({ success: true }),
          };
        },
      };
    },
  };
}

// ── Sponsors ──────────────────────────────────────────────────────

describe("getSponsors", () => {
  it("returns sponsor list with area and plot info", async () => {
    const db = mockD1Multi([
      [
        {
          id: "user-1",
          name: "SCG Sustainability",
          email: "scg@test.com",
          areas: '["สุพรรณบุรี"]',
          plot_count: 25,
          credit_total: 500.5,
        },
        {
          id: "user-2",
          name: "PTT Green",
          email: "ptt@test.com",
          areas: '["ชัยนาท","อุทัยธานี"]',
          plot_count: 18,
          credit_total: 350.2,
        },
      ],
    ]) as unknown as D1Database;
    const result = await getSponsors(db);
    expect(result.length).toBe(2);
    expect(result[0].name).toBe("SCG Sustainability");
    expect(result[0].areas).toEqual(["สุพรรณบุรี"]);
    expect(result[0].plot_count).toBe(25);
  });

  it("returns empty array when no sponsors", async () => {
    const db = mockD1Multi([[]]) as unknown as D1Database;
    const result = await getSponsors(db);
    expect(result).toEqual([]);
  });
});

// ── Settings ──────────────────────────────────────────────────────

describe("getSettings", () => {
  it("returns settings with permissions, users, constants, notifications, general", async () => {
    const db = mockD1Multi([
      [{ id: "u1", email: "admin@test.com", role: "admin", name: "Admin" }],
      [
        { key: "u_d", value: "15" },
        { key: "cf", value: "0.89" },
      ],
    ]) as unknown as D1Database;
    const result = await getSettings(db);
    expect(result.users.length).toBe(1);
    expect(result.users[0].email).toBe("admin@test.com");
    expect(result.constants.u_d).toBe(15);
    expect(result.constants.cf).toBe(0.89);
  });
});

describe("updateSettings", () => {
  it("returns success on valid tab update", async () => {
    const db = mockD1Sequence([
      { key: "u_d", value: "15" },
      { success: true },
    ]) as unknown as D1Database;
    const result = await updateSettings(db, "constants", { u_d: 20 });
    expect(result.success).toBe(true);
  });
});

// ── Reports ───────────────────────────────────────────────────────

describe("getReports", () => {
  it("returns 6 report catalogue items", async () => {
    const db = mockD1Multi([[]]) as unknown as D1Database;
    const result = await getReports(db);
    expect(result.length).toBe(6);
    expect(result[0].id).toBeDefined();
    expect(result[0].name).toBeDefined();
    expect(result[0].format).toBeDefined();
  });

  it("each report has required fields", async () => {
    const db = mockD1Multi([[]]) as unknown as D1Database;
    const result = await getReports(db);
    for (const report of result) {
      expect(report.id).toBeTruthy();
      expect(report.name).toBeTruthy();
      expect(report.description).toBeTruthy();
      expect(report.format).toBeTruthy();
      expect(typeof report.ready).toBe("boolean");
    }
  });
});

describe("logReportDownload", () => {
  it("writes audit log entry for report download", async () => {
    const db = mockD1Sequence([{ success: true }]) as unknown as D1Database;
    const result = await logReportDownload(db, "admin-1", "EX-2042");
    expect(result.success).toBe(true);
  });
});
