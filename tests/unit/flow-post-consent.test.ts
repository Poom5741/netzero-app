import { describe, expect, it, vi } from "vitest";
import { handleFlowApi } from "../../src/line/flow";

/**
 * Minimal D1 mock that returns configurable results per SQL pattern.
 * Handles consent_log INSERT and COUNT queries for the 4-type consent flow.
 */
function mockDb(opts: {
  plots?: Array<{ id: string; plot_code: string; area_rai: number }>;
  consentCount?: number;
} = {}) {
  const plots = opts.plots ?? [];
  const consentCount = opts.consentCount ?? 0;
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
      if (sql.includes("INSERT INTO consent_log")) {
        return {
          bind: vi.fn().mockReturnValue({
            run: vi.fn().mockResolvedValue({ success: true }),
          }),
        };
      }
      if (sql.includes("COUNT") && sql.includes("consent_log")) {
        return {
          bind: vi.fn().mockReturnValue({
            first: vi.fn().mockResolvedValue({ cnt: consentCount }),
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
  token: "mock-value",
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

  it("after consent_accept_all with all consents recorded, transitions to phone", async () => {
    // Mock returns 4 consent types accepted -> hasAllConsents = true
    const ctx = baseCtx({
      state: "consent",
      text: "consent_accept_all",
      db: mockDb({ consentCount: 4 }),
    });
    const result = await handleFlowApi(ctx);

    expect(result.newState).toBe("phone");
    expect(result.reply).toContain("เบอร์โทรศัพท์");
  });

  it("after consent_accept_all with incomplete consents, stays in consent", async () => {
    // Mock returns 2 consent types accepted -> hasAllConsents = false
    const ctx = baseCtx({
      state: "consent",
      text: "consent_accept_all",
      db: mockDb({ consentCount: 2 }),
    });
    const result = await handleFlowApi(ctx);

    expect(result.newState).toBe("consent");
    expect(result.reply).toContain("4 ข้อ");
  });

  it("after individual consent_pdpa, records and stays in consent", async () => {
    const ctx = baseCtx({
      state: "consent",
      text: "consent_pdpa",
      db: mockDb({ consentCount: 1 }),
    });
    const result = await handleFlowApi(ctx);

    expect(result.newState).toBe("consent");
    expect(result.reply).toContain("บันทึก");
  });

  it("after individual consent with all 4 accepted, transitions to phone", async () => {
    const ctx = baseCtx({
      state: "consent",
      text: "consent_carbon_project",
      db: mockDb({ consentCount: 4 }),
    });
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
