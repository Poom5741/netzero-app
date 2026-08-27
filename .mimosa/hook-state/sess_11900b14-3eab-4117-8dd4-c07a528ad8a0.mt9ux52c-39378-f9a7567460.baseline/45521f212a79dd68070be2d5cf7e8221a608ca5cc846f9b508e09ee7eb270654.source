import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";

const PKG_PATH = resolve("package.json");

describe("Deploy plumbing", () => {
  let pkg: { scripts: Record<string, string> };

  beforeAll(() => {
    pkg = JSON.parse(readFileSync(PKG_PATH, "utf-8"));
  });

  it("has db:init script", () => {
    expect(pkg.scripts["db:init"]).toBeDefined();
    expect(pkg.scripts["db:init"]).toContain("wrangler");
    expect(pkg.scripts["db:init"]).toContain("migrate.sql");
  });

  it("has db:seed script (as 'seed')", () => {
    expect(pkg.scripts.seed).toBeDefined();
    expect(pkg.scripts.seed).toContain("seed");
  });

  it("has dev script", () => {
    expect(pkg.scripts.dev).toBeDefined();
    expect(pkg.scripts.dev).toContain("wrangler");
  });

  it("has check scripts for lint, type, and test", () => {
    expect(pkg.scripts["check:lint"]).toBeDefined();
    expect(pkg.scripts["check:type"]).toBeDefined();
    expect(pkg.scripts["check:test"]).toBeDefined();
    expect(pkg.scripts.check).toBeDefined();
  });

  it("README exists with quickstart section", () => {
    const readme = readFileSync(resolve("README.md"), "utf-8");
    expect(readme).toContain("Quick Start");
    expect(readme).toContain("db:init");
    expect(readme).toContain("db:seed");
    expect(readme).toContain("bun run dev");
  });

  it("wrangler.toml exists with D1 binding", () => {
    const wrangler = readFileSync(resolve("wrangler.toml"), "utf-8");
    expect(wrangler).toContain("d1_databases");
    expect(wrangler).toContain('binding = "DB"');
    expect(wrangler).toContain("netzero");
  });

  it("migration file exists", () => {
    const migrate = readFileSync(resolve("src/db/migrate.sql"), "utf-8");
    expect(migrate.length).toBeGreaterThan(100);
    expect(migrate).toContain("CREATE TABLE");
  });
});
