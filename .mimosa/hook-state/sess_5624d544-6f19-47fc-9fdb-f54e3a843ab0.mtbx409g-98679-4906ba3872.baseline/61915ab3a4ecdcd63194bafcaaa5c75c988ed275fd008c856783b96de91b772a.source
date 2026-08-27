import { describe, expect, it } from "vitest";
import { generateRetakeMessage } from "../../src/vision/reject";

function mockD1() {
  const calls: { sql: string; args: unknown[] }[] = [];
  return {
    calls,
    prepare(sql: string) {
      return {
        bind(...args: unknown[]) {
          calls.push({ sql, args });
          return {
            first: async () => ({
              farmer_id: "farmer-1",
              plot_id: "plot-1",
              ai_status: "reject",
              ai_reason: "No crop visible in photo",
            }),
            run: async () => ({ success: true }),
          };
        },
      };
    },
  };
}

describe("generateRetakeMessage", () => {
  it("produces a retake message with reason when photo is rejected", async () => {
    const db = mockD1() as unknown as D1Database;
    const result = await generateRetakeMessage(db, "photo-1");

    expect(result).not.toBeNull();
    expect(result?.message_type).toBe("chat");
    expect(result?.raw_text).toContain("ตีกลับ");
    expect(result?.raw_text).toContain("No crop visible");
  });

  it("returns null when photo is not rejected", async () => {
    const dbPass = {
      prepare(sql: string) {
        return {
          bind(..._args: unknown[]) {
            if (sql.includes("SELECT")) {
              return {
                first: async () => ({
                  farmer_id: "farmer-1",
                  plot_id: "plot-1",
                  ai_status: "pass",
                }),
              };
            }
            return { run: async () => ({ success: true }) };
          },
        };
      },
    } as unknown as D1Database;

    const result = await generateRetakeMessage(dbPass, "photo-1");
    expect(result).toBeNull();
  });

  it("inserts into farmer_messages table", async () => {
    const mock = mockD1();
    const db = mock as unknown as D1Database;
    await generateRetakeMessage(db, "photo-1");

    const insertCall = mock.calls.find((c: { sql: string; args: unknown[] }) =>
      c.sql.includes("INSERT INTO farmer_messages"),
    );
    expect(insertCall).toBeDefined();
    expect(insertCall?.args).toContain("farmer-1");
  });

  it("returns null when photo not found", async () => {
    const db = {
      prepare(_sql: string) {
        return {
          bind(..._args: unknown[]) {
            return { first: async () => null };
          },
        };
      },
    } as unknown as D1Database;

    const result = await generateRetakeMessage(db, "missing");
    expect(result).toBeNull();
  });
});
