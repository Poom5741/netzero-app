/**
 * Issue #46 — Playwright config validation test.
 * Verifies the Playwright config file is well-formed.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const CONFIG_PATH = resolve("playwright.config.ts");

describe("Playwright config", () => {
  it("config file exists", () => {
    const content = readFileSync(CONFIG_PATH, "utf-8");
    expect(content.length).toBeGreaterThan(0);
  });

  it("has testDir pointing to tests/e2e", () => {
    const content = readFileSync(CONFIG_PATH, "utf-8");
    expect(content).toContain("tests/e2e");
  });

  it("configures a webServer", () => {
    const content = readFileSync(CONFIG_PATH, "utf-8");
    expect(content).toContain("webServer");
    expect(content).toContain("bun run dev");
  });

  it("has at least one browser project", () => {
    const content = readFileSync(CONFIG_PATH, "utf-8");
    expect(content).toContain("projects");
    expect(content).toContain("chromium");
  });

  it("uses defineConfig from @playwright/test", () => {
    const content = readFileSync(CONFIG_PATH, "utf-8");
    expect(content).toContain("@playwright/test");
    expect(content).toContain("defineConfig");
  });
});
