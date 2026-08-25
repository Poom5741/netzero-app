import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";

const MIGRATION_PATH = resolve("src/db/migrate.sql");

describe("D1 schema migration", () => {
  let sql: string;

  beforeAll(() => {
    sql = readFileSync(MIGRATION_PATH, "utf-8");
  });

  it("migration file exists and is non-empty", () => {
    expect(sql.length).toBeGreaterThan(100);
  });

  it("creates farmers table", () => {
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS farmers");
    expect(sql).toContain("phone TEXT UNIQUE NOT NULL");
  });

  it("creates plots table with farmer_id FK", () => {
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS plots");
    expect(sql).toContain("farmer_id TEXT NOT NULL REFERENCES farmers(id)");
    expect(sql).toContain("plot_code TEXT UNIQUE NOT NULL");
  });

  it("creates line_links table", () => {
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS line_links");
    expect(sql).toContain("line_user_id TEXT UNIQUE NOT NULL");
  });

  it("creates photo_evidence table with GPS fields", () => {
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS photo_evidence");
    expect(sql).toContain("gps_lat REAL NOT NULL");
    expect(sql).toContain("gps_lng REAL NOT NULL");
    expect(sql).toContain("ai_status TEXT");
    expect(sql).toContain("admin_status TEXT");
  });

  it("creates fertilizer_entries with nitrogen auto-calc fields", () => {
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS fertilizer_entries");
    expect(sql).toContain("percent_n REAL");
    expect(sql).toContain("nitrogen_kg_per_rai REAL");
    expect(sql).toContain("is_urea INTEGER");
  });

  it("creates season_inputs with status lifecycle", () => {
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS season_inputs");
    expect(sql).toContain("status TEXT CHECK(status IN ('draft', 'open', 'closed', 'approved'))");
  });

  it("creates farmer_messages audit trail", () => {
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS farmer_messages");
    expect(sql).toContain("raw_text TEXT NOT NULL");
    expect(sql).toContain("draft_json TEXT");
    expect(sql).toContain("confirmed INTEGER DEFAULT 0");
  });

  it("creates carbon_estimates with versioning", () => {
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS carbon_estimates");
    expect(sql).toContain("version INTEGER DEFAULT 1");
    expect(sql).toContain("status TEXT CHECK(status IN ('draft', 'superseded', 'final'))");
    expect(sql).toContain("total_offset_tco2e REAL");
  });

  it("creates ai_events for quota tracking", () => {
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS ai_events");
    expect(sql).toContain("input_tokens INTEGER DEFAULT 0");
    expect(sql).toContain("output_tokens INTEGER DEFAULT 0");
  });

  it("creates users table for admin/sponsor", () => {
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS users");
    expect(sql).toContain("role TEXT CHECK(role IN ('admin', 'sponsor'))");
  });

  it("creates indexes for query performance", () => {
    expect(sql).toContain("CREATE INDEX IF NOT EXISTS idx_plots_farmer");
    expect(sql).toContain("CREATE INDEX IF NOT EXISTS idx_photo_evidence_plot");
    expect(sql).toContain("CREATE INDEX IF NOT EXISTS idx_carbon_estimates_plot");
    expect(sql).toContain("CREATE INDEX IF NOT EXISTS idx_users_email");
  });

  it("migration is idempotent (uses IF NOT EXISTS)", () => {
    const createTables = sql.match(/CREATE TABLE/g) || [];
    const ifNotExists = sql.match(/IF NOT EXISTS/g) || [];
    expect(ifNotExists.length).toBeGreaterThanOrEqual(createTables.length);
  });
});
