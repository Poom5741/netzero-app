import { describe, expect, it, vi } from "vitest";

vi.mock("../../src/chat/ai", () => ({
  chatWithAi: vi.fn().mockResolvedValue({ type: "reply", text: "คำตอบจาก AI" }),
}));

import { handleFlowApi } from "../../src/line/flow";

/**
 * Mock D1 — routes SQL to appropriate mock handlers.
 */
function mockD1(opts: {
  farmer?: { id: string; full_name: string } | null;
  linkStatus?: string;
  plots?: Array<{ id: string; plot_code: string; area_rai: number }>;
  seasonInput?: { season_id: string } | null;
}) {
  const farmerRow = opts.farmer ?? null;
  const plots = opts.plots ?? [];
  const linkStatus = opts.linkStatus ?? "pending";
  const seasonInput = opts.seasonInput ?? null;

  return {
    prepare: vi.fn().mockImplementation((sql: string) => {
      if (sql.includes("farmers") && sql.includes("SELECT") && sql.includes("phone")) {
        return { bind: vi.fn().mockReturnValue({ first: vi.fn().mockResolvedValue(farmerRow) }) };
      }
      if (sql.includes("farmers") && sql.includes("SELECT") && sql.includes("full_name")) {
        return { bind: vi.fn().mockReturnValue({ first: vi.fn().mockResolvedValue(farmerRow) }) };
      }
      if (sql.includes("line_links") && sql.includes("SELECT") && sql.includes("status")) {
        return { bind: vi.fn().mockReturnValue({ first: vi.fn().mockResolvedValue({ status: linkStatus }) }) };
      }
      if (sql.includes("season_inputs") && sql.includes("SELECT")) {
        return { bind: vi.fn().mockReturnValue({ first: vi.fn().mockResolvedValue(seasonInput) }) };
      }
      if (sql.includes("season_id") && sql.includes("SELECT")) {
        return { bind: vi.fn().mockReturnValue({ first: vi.fn().mockResolvedValue(seasonInput) }) };
      }
      if (sql.includes("plots") && sql.includes("SELECT")) {
        return { bind: vi.fn().mockReturnValue({ all: vi.fn().mockResolvedValue({ results: plots }), first: vi.fn().mockResolvedValue(plots[0] ?? null) }) };
      }
      if (sql.includes("UPDATE")) {
        return { bind: vi.fn().mockReturnValue({ run: vi.fn().mockResolvedValue({ success: true }) }) };
      }
      if (sql.includes("INSERT")) {
        return { bind: vi.fn().mockReturnValue({ run: vi.fn().mockResolvedValue({ success: true }) }) };
      }
      return { bind: vi.fn().mockReturnValue({ first: vi.fn().mockResolvedValue(null), all: vi.fn().mockResolvedValue({ results: [] }), run: vi.fn().mockResolvedValue({ success: true }) }) };
    }),
  } as unknown as D1Database;
}

const baseCtx = (overrides: Record<string, unknown> = {}) => ({
  db: mockD1({ farmer: { id: "f-1", full_name: "สมชาย ใจดี" } }),
  token: "test-token",
  apiKey: "test-key",
  userId: "U123",
  linkId: "link-1",
  farmerId: "f-1",
  state: "phone",
  selectedPlotId: null,
  text: "0812345678",
  ...overrides,
});

describe("Post-phone flow (POOM-190)", () => {
  it("after phone lookup, returns greeting with name + action options (not dead end)", async () => {
    const db = mockD1({ farmer: { id: "f-1", full_name: "สมชาย ใจดี" } });
    const result = await handleFlowApi(baseCtx({ db, state: "phone", text: "0812345678" }));

    // Should NOT be the old dead-end message (only waiting, no actions)
    expect(result.reply).not.toMatch(/^⏳.*รอการยืนยัน.*$/s);
    // Should greet by name
    expect(result.reply).toContain("สมชาย ใจดี");
    // Should offer actions
    expect(result.reply).toContain("บันทึก");
    expect(result.reply).toContain("ถ่ายรูป");
    // Should transition to "identified" state
    expect(result.newState).toBe("identified");
  });

  it("in identified state, 'บันทึก' routes to /summary guidance", async () => {
    const db = mockD1({ farmer: { id: "f-1", full_name: "สมชาย ใจดี" } });
    const result = await handleFlowApi(baseCtx({ db, state: "identified", text: "บันทึก" }));

    expect(result.reply).toContain("/summary");
    expect(result.newState).toBe("identified");
  });

  it("in identified state, 'ถ่ายรูป' routes to /upload guidance", async () => {
    const db = mockD1({ farmer: { id: "f-1", full_name: "สมชาย ใจดี" } });
    const result = await handleFlowApi(baseCtx({ db, state: "identified", text: "ถ่ายรูป" }));

    expect(result.reply).toContain("/upload");
    expect(result.newState).toBe("identified");
  });

  it("in identified state, 'ดูสถานะ' shows season status", async () => {
    const db = mockD1({
      farmer: { id: "f-1", full_name: "สมชาย ใจดี" },
      seasonInput: { season_id: "2568-napi" },
    });
    const result = await handleFlowApi(baseCtx({ db, state: "identified", text: "ดูสถานะ" }));

    expect(result.reply).toContain("สถานะ");
    expect(result.newState).toBe("identified");
  });

  it("in identified state, free-text transitions to active (chat) state", async () => {
    const db = mockD1({
      farmer: { id: "f-1", full_name: "สมชาย ใจดี" },
      plots: [{ id: "p-1", plot_code: "N-001", area_rai: 10 }],
    });
    const result = await handleFlowApi(baseCtx({ db, state: "identified", text: "อากาศวันนี้เป็นอย่างไร" }));

    // Free-text should move to active/chat state and get AI response
    expect(result.newState).toBe("chat");
  });
});
