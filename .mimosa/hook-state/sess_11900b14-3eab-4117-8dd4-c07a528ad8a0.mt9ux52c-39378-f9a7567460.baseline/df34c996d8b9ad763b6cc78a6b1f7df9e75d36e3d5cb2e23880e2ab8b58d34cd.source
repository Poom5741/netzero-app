import { describe, expect, it } from "vitest";
import { seedData } from "../../src/db/seed";

describe("seed.ts module", () => {
  it("exports seedData function", () => {
    expect(typeof seedData).toBe("function");
  });

  it("seedData returns expected record counts", async () => {
    const mockDB = createMockDB();
    const result = await seedData(mockDB as never);
    expect(result.farmers).toBe(3);
    expect(result.plots).toBeGreaterThanOrEqual(3);
    expect(result.lineLinks).toBeGreaterThanOrEqual(1);
    expect(result.users).toBe(2);
  });

  it("creates a magic-link test-farmer with phone 0999999999", async () => {
    const mockDB = createMockDB();
    const result = await seedData(mockDB as never);
    const testFarmer = result.farmerPhones.find((p) => p === "0999999999");
    expect(testFarmer).toBeDefined();
  });

  it("creates admin and sponsor users", async () => {
    const mockDB = createMockDB();
    const result = await seedData(mockDB as never);
    expect(result.userRoles).toContain("admin");
    expect(result.userRoles).toContain("sponsor");
  });
});

function createMockDB() {
  const inserts: { table: string; values: unknown[] }[] = [];
  return {
    inserts,
    prepare: (sql: string) => ({
      bind: (...args: unknown[]) => {
        const tableMatch = sql.match(/INSERT INTO (\w+)/i);
        const table = tableMatch?.[1] ?? "unknown";
        inserts.push({ table, values: args });
        return {
          run: async () => ({ success: true }),
          first: async () => null,
        };
      },
    }),
    exec: async (_sql: string) => ({ success: true }),
  };
}
