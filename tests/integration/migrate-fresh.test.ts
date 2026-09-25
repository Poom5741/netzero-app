import { Database } from "bun:sqlite";
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Regression test for BUG-008-B2: `npm run db:init` must initialize a FRESH
 * local D1 cleanly. Fresh-init is the only supported mode of migrate.sql
 * (CREATE TABLE statements fail on existing databases by design), so every
 * statement in the file must succeed on an empty database — no
 * "duplicate column", no "Cannot add a UNIQUE column", no reordering hacks.
 */

function splitStatements(sql: string): string[] {
  const stripped = sql
    .split("\n")
    .map((line) => {
      const i = line.indexOf("--");
      return i >= 0 ? line.slice(0, i) : line;
    })
    .join("\n");
  return stripped
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function applyMigration(db: Database): string[] {
  const sql = readFileSync(join(import.meta.dir, "../../src/db/migrate.sql"), "utf8");
  const failures: string[] = [];
  for (const [i, stmt] of splitStatements(sql).entries()) {
    try {
      db.run(stmt);
    } catch (err) {
      failures.push(`stmt#${i + 1}: ${(err as Error).message} :: ${stmt.slice(0, 100)}`);
    }
  }
  return failures;
}

function columns(db: Database, table: string): string[] {
  return db
    .query<{ name: string }, [string]>(`PRAGMA table_info(${table})`)
    .all()
    .map((r) => r.name);
}

describe("migrate.sql fresh-database init (BUG-008-B2)", () => {
  test("every statement applies cleanly to a fresh database", () => {
    const db = new Database(":memory:");
    const failures = applyMigration(db);
    if (failures.length > 0) console.error(`MIGRATION FAILURES:\n${failures.join("\n")}`);
    expect(failures).toEqual([]);
    db.close();
  });

  test("schema contains the columns runtime code depends on", () => {
    const db = new Database(":memory:");
    expect(applyMigration(db)).toEqual([]);
    expect(columns(db, "users")).toContain("otp_secret");
    expect(columns(db, "users")).toContain("sponsor_id");
    expect(columns(db, "users")).toContain("areas");
    expect(columns(db, "farmers")).toContain("cpa_code");
    expect(columns(db, "photo_evidence")).toEqual(
      expect.arrayContaining([
        "photo_type",
        "water_state",
        "pre_verified",
        "audit_sample",
        "superseded",
        "water_depth_cm",
        "step_code",
      ]),
    );
    expect(columns(db, "season_inputs")).toContain("rice_age_days");
    expect(columns(db, "season_inputs")).toContain("sf_w_factor");
    expect(columns(db, "automation_audit_log")).toEqual(
      expect.arrayContaining(["entity_type", "entity_id", "field_name", "old_value", "new_value"]),
    );
    db.close();
  });

  test("farmers.cpa_code uniqueness is enforced via a unique index", () => {
    const db = new Database(":memory:");
    expect(applyMigration(db)).toEqual([]);
    const idx = db
      .query<{ name: string; unique: number }, [string]>("PRAGMA index_list(farmers)")
      .all()
      .find((r) => r.name === "idx_farmers_cpa_code");
    expect(idx?.unique).toBe(1);
    db.query(
      "INSERT INTO farmers (id, full_name, phone, cpa_code) VALUES ('f1', 'A', '0111', 'CPA-001')",
    ).run();
    expect(() =>
      db
        .query(
          "INSERT INTO farmers (id, full_name, phone, cpa_code) VALUES ('f2', 'B', '0222', 'CPA-001')",
        )
        .run(),
    ).toThrow();
    db.query(
      "INSERT INTO farmers (id, full_name, phone, cpa_code) VALUES ('f3', 'C', '0333', NULL)",
    ).run();
    db.query(
      "INSERT INTO farmers (id, full_name, phone, cpa_code) VALUES ('f4', 'D', '0444', NULL)",
    ).run();
    db.close();
  });
});
