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
  token: "test-token",
  apiKey: "test-key",
  userId: "U123",
  linkId: "link-1",
  farmerId: "farmer-1",
  state: "welcome" as const,
  selectedPlotId: null,
  text: "ยอมรับ",
  ...overrides,
});

describe("POOM-187: post-consent flow", () => {
  it("after 'ยอมรับ', transitions to select_plot (not phone)", async () => {
    const ctx = baseCtx();
    const result = await handleFlowApi(ctx);

    expect(result.newState).toBe("select_plot");
    expect(result.reply).not.toContain("ติดต่อเจ้าหน้าที่");
  });

  it("after consent, reply mentions plots or guides to next step", async () => {
    const ctx = baseCtx({
      db: mockDb({
        plots: [
          { id: "p1", plot_code: "NA-001", area_rai: 10 },
          { id: "p2", plot_code: "NA-002", area_rai: 5 },
        ],
      }),
    });
    const result = await handleFlowApi(ctx);

    // Should list plots
    expect(result.reply).toContain("NA-001");
    expect(result.reply).toContain("NA-002");
    expect(result.newState).toBe("select_plot");
  });

  it("after consent with single plot, auto-selects it and moves to chat", async () => {
    const ctx = baseCtx({
      db: mockDb({
        plots: [{ id: "p1", plot_code: "NA-001", area_rai: 10 }],
      }),
    });
    const result = await handleFlowApi(ctx);

    expect(result.newState).toBe("chat");
    expect(result.selectedPlotId).toBe("p1");
    expect(result.reply).toContain("NA-001");
  });

  it("after consent with no plots, gives helpful guidance (not dead end)", async () => {
    const ctx = baseCtx({ db: mockDb({ plots: [] }) });
    const result = await handleFlowApi(ctx);

    expect(result.reply).not.toContain("ติดต่อเจ้าหน้าที่");
    // Should acknowledge and provide some path forward
    expect(result.reply.length).toBeGreaterThan(10);
  });

  it("non-consent input in welcome stays in welcome", async () => {
    const ctx = baseCtx({ text: "สวัสดี" });
    const result = await handleFlowApi(ctx);

    expect(result.newState).toBe("welcome");
  });
});
