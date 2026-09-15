import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  testMatch: "spec-comparison.spec.ts",
  timeout: 30_000,
  use: {
    headless: true,
  },
  // No web server needed - these tests use synthetic images, not web pages
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
});
