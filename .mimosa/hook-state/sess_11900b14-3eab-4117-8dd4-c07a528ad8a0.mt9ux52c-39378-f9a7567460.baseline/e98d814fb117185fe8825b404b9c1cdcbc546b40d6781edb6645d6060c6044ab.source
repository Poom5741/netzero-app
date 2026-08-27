/**
 * Issue #50 — Demo seed script tests.
 * Verifies the demo script exists and produces valid output.
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { buildSQLFile, DEMO_FARMERS, DEMO_PLOTS, DEMO_USERS } from "../../demo/seed-demo";

describe("Demo field test script", () => {
  const FIELD_TEST_PATH = resolve("demo/field-test.md");

  it("field-test.md exists", () => {
    expect(existsSync(FIELD_TEST_PATH)).toBe(true);
  });

  it("field-test.md contains setup instructions", () => {
    const content = readFileSync(FIELD_TEST_PATH, "utf-8");
    expect(content).toContain("Prerequisites");
    expect(content).toContain("bun run dev");
    expect(content).toContain("bun run seed");
  });

  it("field-test.md contains test scenarios", () => {
    const content = readFileSync(FIELD_TEST_PATH, "utf-8");
    expect(content).toContain("Scenario 1");
    expect(content).toContain("Scenario 2");
  });
});

describe("Demo seed script", () => {
  it("exports seed data constants", () => {
    expect(DEMO_FARMERS.length).toBeGreaterThanOrEqual(1);
    expect(DEMO_PLOTS.length).toBeGreaterThanOrEqual(1);
    expect(DEMO_USERS.length).toBeGreaterThanOrEqual(2);
  });

  it("each farmer has required fields", () => {
    for (const f of DEMO_FARMERS) {
      expect(f.id).toBeTruthy();
      expect(f.full_name).toBeTruthy();
      expect(f.phone).toBeTruthy();
    }
  });

  it("each plot references a valid farmer", () => {
    const farmerIds = DEMO_FARMERS.map((f) => f.id);
    for (const p of DEMO_PLOTS) {
      expect(farmerIds).toContain(p.farmer_id);
    }
  });

  it("has admin and sponsor users", () => {
    const roles = DEMO_USERS.map((u) => u.role);
    expect(roles).toContain("admin");
    expect(roles).toContain("sponsor");
  });

  it("buildSQLFile produces valid SQL", () => {
    const sql = buildSQLFile();
    expect(sql).toContain("INSERT");
    expect(sql).toContain("farmers");
    expect(sql).toContain("plots");
    expect(sql).toContain("users");
    expect(sql.length).toBeGreaterThan(100);
  });

  it("SQL file has correct number of INSERT statements", () => {
    const sql = buildSQLFile();
    const farmerInserts = (sql.match(/INSERT.*farmers/g) ?? []).length;
    const plotInserts = (sql.match(/INSERT.*plots/g) ?? []).length;
    const userInserts = (sql.match(/INSERT.*users/g) ?? []).length;
    expect(farmerInserts).toBe(DEMO_FARMERS.length);
    expect(plotInserts).toBe(DEMO_PLOTS.length);
    expect(userInserts).toBe(DEMO_USERS.length);
  });
});
