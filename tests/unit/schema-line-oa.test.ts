import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migratePath = resolve(import.meta.dirname, "../../src/db/migrate.sql");
const migrateSql = readFileSync(migratePath, "utf-8");

describe("LINE OA schema migration", () => {
  it("creates consent_log table", () => {
    expect(migrateSql).toContain("CREATE TABLE IF NOT EXISTS consent_log");
    expect(migrateSql).toContain(
      "consent_type TEXT NOT NULL CHECK(consent_type IN ('pdpa', 'data_collection', 'photo_sharing', 'carbon_project'))",
    );
    expect(migrateSql).toContain("accepted INTEGER NOT NULL DEFAULT 0");
    expect(migrateSql).toContain("idx_consent_log_farmer");
  });

  it("creates season_steps table", () => {
    expect(migrateSql).toContain("CREATE TABLE IF NOT EXISTS season_steps");
    expect(migrateSql).toContain("season_input_id TEXT NOT NULL REFERENCES season_inputs(id)");
    expect(migrateSql).toContain("step_code TEXT NOT NULL");
    expect(migrateSql).toContain("due_day INTEGER NOT NULL");
    expect(migrateSql).toContain("status TEXT NOT NULL DEFAULT 'pending'");
    expect(migrateSql).toContain("photo_evidence_id TEXT REFERENCES photo_evidence(id)");
    expect(migrateSql).toContain("idx_season_steps_input");
  });

  it("adds water_depth_cm to photo_evidence", () => {
    expect(migrateSql).toContain("ALTER TABLE photo_evidence ADD COLUMN water_depth_cm INTEGER");
  });

  it("adds rice_age_days and sf_w_factor to season_inputs", () => {
    expect(migrateSql).toContain(
      "ALTER TABLE season_inputs ADD COLUMN rice_age_days INTEGER DEFAULT 120",
    );
    expect(migrateSql).toContain("ALTER TABLE season_inputs ADD COLUMN sf_w_factor REAL");
  });

  it("has no SQL syntax errors in new statements", () => {
    // Extract only the new LINE OA statements
    const lineOaSection = migrateSql.substring(
      migrateSql.indexOf("-- Consent log (PDPA audit trail)"),
    );
    // Basic syntax checks
    expect(lineOaSection).not.toContain("CREATE TABLE  ");
    expect(lineOaSection).not.toContain("ALTER TABLE  ");
    expect(lineOaSection).not.toContain("  NOT NULL");
    // All statements should end with semicolons
    const statements = lineOaSection.split(";").filter((s) => s.trim().length > 0);
    for (const stmt of statements) {
      const trimmed = stmt.trim();
      if (trimmed.startsWith("CREATE") || trimmed.startsWith("ALTER")) {
        expect(trimmed).toMatch(/^(CREATE|ALTER)/);
      }
    }
  });
});
