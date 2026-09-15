import { describe, expect, it } from "vitest";

/**
 * Tests for POST /api/farmer and POST /api/plot routes.
 */

function mockD1(opts: { farmerExists?: boolean; phoneExists?: boolean; plotCodeExists?: boolean }) {
  const calls: { sql: string; args: unknown[] }[] = [];
  return {
    calls,
    prepare(sql: string) {
      return {
        bind(...args: unknown[]) {
          calls.push({ sql, args });
          if (sql.includes("SELECT id FROM farmers WHERE phone = ?")) {
            return {
              first: async () => (opts.phoneExists ? { id: "existing_farmer" } : null),
            };
          }
          if (sql.includes("SELECT id FROM farmers WHERE id = ?")) {
            return {
              first: async () => (opts.farmerExists !== false ? { id: args[0] } : null),
            };
          }
          // All INSERT/UPDATE queries return run
          return {
            run: async () => ({ success: true }),
            first: async () => null,
            all: async () => ({ results: [] }),
          };
        },
      };
    },
  };
}

describe("POST /api/farmer", () => {
  it("rejects when phone is missing", async () => {
    const db = mockD1({}) as unknown as D1Database;
    const { handleFarmerCreate } = await import("../../src/farmer/create");
    const result = await handleFarmerCreate(db, {
      full_name: "สมชาย ใจดี",
      phone: "",
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain("phone");
  });

  it("rejects when full_name is missing", async () => {
    const db = mockD1({}) as unknown as D1Database;
    const { handleFarmerCreate } = await import("../../src/farmer/create");
    const result = await handleFarmerCreate(db, {
      full_name: "",
      phone: "081-234-5678",
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain("full_name");
  });

  it("rejects when phone already exists", async () => {
    const db = mockD1({ phoneExists: true }) as unknown as D1Database;
    const { handleFarmerCreate } = await import("../../src/farmer/create");
    const result = await handleFarmerCreate(db, {
      full_name: "สมชาย ใจดี",
      phone: "081-234-5678",
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain("already exists");
  });

  it("creates farmer with auto-generated ID", async () => {
    const db = mockD1({}) as unknown as D1Database;
    const { handleFarmerCreate } = await import("../../src/farmer/create");
    const result = await handleFarmerCreate(db, {
      full_name: "สมชาย ใจดี",
      phone: "081-234-5678",
      gender: "male",
    });
    expect(result.success).toBe(true);
    expect(result.farmer_id).toBeDefined();
    expect(result.farmer_id).toMatch(/^farmer_/);
  });
});

describe("POST /api/plot", () => {
  it("rejects when farmer_id is missing", async () => {
    const db = mockD1({}) as unknown as D1Database;
    const { handlePlotCreate } = await import("../../src/farmer/create");
    const result = await handlePlotCreate(db, {
      farmer_id: "",
      deed_no: "12345",
      area_rai: 14.0,
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain("farmer_id");
  });

  it("rejects when deed_no is missing", async () => {
    const db = mockD1({}) as unknown as D1Database;
    const { handlePlotCreate } = await import("../../src/farmer/create");
    const result = await handlePlotCreate(db, {
      farmer_id: "farmer_1",
      deed_no: "",
      area_rai: 14.0,
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain("deed_no");
  });

  it("rejects when area_rai is missing or zero", async () => {
    const db = mockD1({}) as unknown as D1Database;
    const { handlePlotCreate } = await import("../../src/farmer/create");
    const result = await handlePlotCreate(db, {
      farmer_id: "farmer_1",
      deed_no: "12345",
      area_rai: 0,
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain("area_rai");
  });

  it("rejects when farmer does not exist", async () => {
    const db = mockD1({ farmerExists: false }) as unknown as D1Database;
    const { handlePlotCreate } = await import("../../src/farmer/create");
    const result = await handlePlotCreate(db, {
      farmer_id: "nonexistent",
      deed_no: "12345",
      area_rai: 14.0,
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain("Farmer not found");
  });

  it("creates plot with auto-generated plot_code", async () => {
    const db = mockD1({ farmerExists: true }) as unknown as D1Database;
    const { handlePlotCreate } = await import("../../src/farmer/create");
    const result = await handlePlotCreate(db, {
      farmer_id: "farmer_1",
      deed_no: "12345",
      area_rai: 14.0,
      doc_type: "chanote",
      tenure: "owner",
    });
    expect(result.success).toBe(true);
    expect(result.plot_id).toBeDefined();
    expect(result.plot_code).toBeDefined();
    expect(result.plot_code).toMatch(/-/);
  });

  it("generates plot_code with province prefix when provided", async () => {
    const db = mockD1({ farmerExists: true }) as unknown as D1Database;
    const { handlePlotCreate } = await import("../../src/farmer/create");
    const result = await handlePlotCreate(db, {
      farmer_id: "farmer_1",
      deed_no: "12345",
      area_rai: 14.0,
      addr_province: "สุพรรณบุรี",
    });
    expect(result.success).toBe(true);
    expect(result.plot_code).toContain("SPB");
  });
});
