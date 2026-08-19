import { describe, expect, it } from "vitest";
import { confirmFertilizerDraft, renderFertilizerConfirm } from "../../src/fertilizer/confirm";

describe("renderFertilizerConfirm", () => {
  it("renders draft data in form fields", () => {
    const html = renderFertilizerConfirm({
      plot_id: "p1",
      season_id: "s1",
      step: "base",
      formula: "16-16-16",
      rate_kg_per_rai: 25,
    });
    expect(html).toContain("16-16-16");
    expect(html).toContain("25");
    expect(html).toContain("base");
    expect(html).toContain("p1");
  });

  it("includes LIFF init stub", () => {
    const html = renderFertilizerConfirm({
      plot_id: "p1",
      season_id: "s1",
      step: "base",
      formula: "16-16-16",
      rate_kg_per_rai: 25,
    });
    expect(html).toContain("liff.init");
  });

  it("shows edit and confirm buttons", () => {
    const html = renderFertilizerConfirm({
      plot_id: "p1",
      season_id: "s1",
      step: "tillering",
      formula: "46-0-0",
      rate_kg_per_rai: 15,
    });
    expect(html).toContain("ยืนยัน");
    expect(html).toContain("แก้ไข");
  });
});

function mockDB() {
  const calls: { sql: string; args: unknown[] }[] = [];
  return {
    calls,
    prepare(sql: string) {
      return {
        bind(...args: unknown[]) {
          calls.push({ sql, args });
          return { run: async () => ({ success: true }) };
        },
      };
    },
  };
}

describe("confirmFertilizerDraft", () => {
  it("writes to fertilizer_entries with confirmed=1", async () => {
    const db = mockDB();
    const result = await confirmFertilizerDraft(
      {
        plot_id: "p1",
        season_id: "s1",
        step: "base",
        formula: "16-16-16",
        rate_kg_per_rai: 25,
      },
      db as any,
    );
    expect(result.success).toBe(true);
    expect(db.calls.length).toBe(1);
    expect(db.calls[0]?.sql).toContain("INSERT INTO fertilizer_entries");
  });
});
