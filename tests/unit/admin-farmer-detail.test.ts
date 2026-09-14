import { describe, expect, it } from "vitest";
import { getFarmerDetail, getFarmerAuditLog } from "../../src/admin/farmer-detail";

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

const FARMER_ROW = {
  id: "farmer-1",
  full_name: "สมชาย ใจดี",
  phone: "081-234-5678",
  addr_province: "สุพรรณบุรี",
  addr_district: "เมือง",
  cpa_code: "CPA1001",
};

const PLOT_ROW = {
  id: "plot-1",
  plot_code: "CPA1001/F01",
  deed_no: "12345",
  area_rai: 15.5,
  doc_type: "chanote",
  season_name: "ฤดู 1/2567",
  carbon_total: 12.5,
};

const DOC_ROW = {
  id: "doc-1",
  doc_type: "DOC-01",
  review_status: "approved",
  submitted_at: "2026-01-15T10:00:00Z",
};

const NITROGEN_ROW = {
  step: "base",
  formula: "46-0-0",
  rate_kg_per_rai: 15,
  nitrogen_kg_per_rai: 7,
};

const PHOTO_ROW = {
  id: "photo-1",
  photo_type: "wetdry",
  water_state: "flooded",
  ai_status: "pass",
  admin_status: "verified",
  taken_at: "2026-02-01T08:00:00Z",
};

const AUDIT_ROW = {
  id: "audit-1",
  action: "verified",
  actor_type: "admin",
  field_name: null,
  old_value: null,
  new_value: null,
  created_at: "2026-02-01T10:00:00Z",
};

describe("getFarmerDetail", () => {
  it("returns farmer with plots, documents, carbon trace, nitrogen, photos, and audit", async () => {
    const db = mockD1Multi([
      [FARMER_ROW],           // 0: farmer
      [PLOT_ROW],             // 1: plots
      [DOC_ROW],              // 2: documents
      [],                     // 3: carbon estimates (used for trace)
      [NITROGEN_ROW],         // 4: nitrogen/fertilizer
      [PHOTO_ROW],            // 5: photos
      [AUDIT_ROW],            // 6: audit log
    ]) as unknown as D1Database;
    const result = await getFarmerDetail(db, "farmer-1");

    expect(result).not.toBeNull();
    expect(result!.id).toBe("farmer-1");
    expect(result!.full_name).toBe("สมชาย ใจดี");
    expect(result!.cpa_code).toBe("CPA1001");
    expect(result!.plots.length).toBe(1);
    expect(result!.plots[0].plot_code).toBe("CPA1001/F01");
    expect(result!.documents.length).toBe(1);
    expect(result!.documents[0].doc_type).toBe("DOC-01");
    expect(result!.nitrogenEntries.length).toBe(1);
    expect(result!.nitrogenEntries[0].formula).toBe("46-0-0");
    expect(result!.photos.length).toBe(1);
    expect(result!.photos[0].ai_status).toBe("pass");
    expect(result!.auditLog.length).toBe(1);
    expect(result!.auditLog[0].action).toBe("verified");
  });

  it("returns null when farmer not found", async () => {
    const db = mockD1Multi([
      [],  // farmer not found
    ]) as unknown as D1Database;
    const result = await getFarmerDetail(db, "missing");
    expect(result).toBeNull();
  });

  it("builds carbon trace from estimates (12-step)", async () => {
    const estimateRow = {
      baseline_ch4: 100,
      project_ch4: 80,
      baseline_n2o: 20,
      project_n2o: 18,
      baseline_co2: 50,
      project_co2: 45,
      burning_emissions: 5,
      total_offset_tco2e: 22,
      sf_w: 0.85,
      sf_p: 0.92,
      sf_o: 0.95,
      nitrogen_total_kg_per_rai: 12,
    };
    const db = mockD1Multi([
      [FARMER_ROW],      // farmer
      [PLOT_ROW],        // plots
      [],                // documents
      [estimateRow],     // carbon estimates
      [],                // nitrogen
      [],                // photos
      [],                // audit
    ]) as unknown as D1Database;
    const result = await getFarmerDetail(db, "farmer-1");

    expect(result).not.toBeNull();
    expect(result!.carbonTrace.length).toBeGreaterThan(0);
    // Should contain SF_w factor
    const sfwEntry = result!.carbonTrace.find((e) => e.label.includes("SF_w"));
    expect(sfwEntry).toBeDefined();
    expect(sfwEntry!.value).toContain("0.85");
  });
});

describe("getFarmerAuditLog", () => {
  it("returns audit log entries for a farmer", async () => {
    const db = mockD1Multi([
      [AUDIT_ROW],
    ]) as unknown as D1Database;
    const result = await getFarmerAuditLog(db, "farmer-1");
    expect(result.length).toBe(1);
    expect(result[0].action).toBe("verified");
  });

  it("returns empty array when no audit entries", async () => {
    const db = mockD1Multi([[]]) as unknown as D1Database;
    const result = await getFarmerAuditLog(db, "farmer-1");
    expect(result).toEqual([]);
  });
});
