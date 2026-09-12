import { describe, expect, it, vi } from "vitest";
import { handleFlowApi } from "../../src/line/flow";

/**
 * Minimal D1 mock that returns configurable results per SQL pattern.
 */
function mockDb(opts: {
  plots?: Array<{ id: string; plot_code: string; area_rai: number }>;
} = {}) {
  const plots = opts.plots ?? [];
  return {
    prepare: vi.fn().mockImplementation((sql: string) => {
      if (sql.includes("plots") && sql.includes("SELECT")) {
        return {
          bind: vi.fn().mockReturnValue({
            all: vi.fn().mockResolvedValue({ results: plots }),
            first: vi.fn().mockResolvedValue(plots[0] ?? null),
          }),
        };
      }
      if (sql.includes("UPDATE")) {
        return { bind: vi.fn().mockReturnValue({ run: vi.fn().mockResolvedValue({}) }) };
      }
      if (sql.includes("INSERT")) {
        return { bind: vi.fn().mockReturnValue({ run: vi.fn().mockResolvedValue({}) }) };
      }
      return { bind: vi.fn().mockReturnValue({ first: vi.fn().mockResolvedValue(null), run: vi.fn().mockResolvedValue({}) }) };
    }),
  } as unknown as D1Database;
}

const baseCtx = (overrides: Record<string, unknown> = {}) => ({
  db: mockDb(),
  dummyToken: "mock-value",
  dummyKey: "mock-value",
  userId: "U123",
  linkId: "link-1",
  farmerId: "farmer-1",
  state: "welcome" as const,
  selectedPlotId: null,
  text: "ยอมรับ",
  ...overrides,
});

describe("POOM-187: post-consent flow", () => {
  it("after 'ยอมรับ', stays in welcome (shows consent bubble on explicit registration trigger)", async () => {
    const ctx = baseCtx();
    const result = await handleFlowApi(ctx);

    // In the new expanded flow, "ยอมรับ" in welcome state is a generic word;
    // the registration trigger is "ลงทะเบียน" or "ผูกบัญชี"
    expect(result.newState).toBe("welcome");
  });

  it("after 'ลงทะเบียน', transitions to consent (PDPA step)", async () => {
    const ctx = baseCtx({ text: "ลงทะเบียน" });
    const result = await handleFlowApi(ctx);

    expect(result.newState).toBe("consent");
  });

  it("after consent_accept, transitions to phone for phone lookup", async () => {
    const ctx = baseCtx({ state: "consent", text: "ยอมรับ" });
    const result = await handleFlowApi(ctx);

    expect(result.newState).toBe("phone");
    expect(result.reply).toContain("เบอร์โทรศัพท์");
  });

  it("after consent_reject, stays in consent", async () => {
    const ctx = baseCtx({ state: "consent", text: "ไม่ยินยอม" });
    const result = await handleFlowApi(ctx);

    expect(result.newState).toBe("consent");
  });

  it("non-consent input in welcome stays in welcome", async () => {
    const ctx = baseCtx({ text: "สวัสดี" });
    const result = await handleFlowApi(ctx);

    expect(result.newState).toBe("welcome");
  });
});
