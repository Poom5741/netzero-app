/**
 * Playwright config for E2E journey tests against the deployed environment.
 * Run: npx playwright test --config=tests/e2e/remote.config.ts
 */
import { defineConfig } from "@playwright/test";

const FRONTEND_URL = "https://netzero-frontend.poom-a1d.workers.dev";
const BACKEND_URL = "https://netzero-carbon-poc.poom-a1d.workers.dev";

export default defineConfig({
  testDir: ".",
  testMatch: "journey-*.spec.ts",
  timeout: 60_000,
  retries: 1,
  workers: 1, // sequential to avoid auth state conflicts
  use: {
    baseURL: FRONTEND_URL,
    headless: true,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    viewport: { width: 1280, height: 800 }, // Desktop viewport — admin/sponsor dashboards are desktop-first
    ignoreHTTPSErrors: true,
    extraHTTPHeaders: {
      "Accept-Language": "th-TH,th;q=0.9,en-US;q=0.8,en;q=0.7",
    },
  },
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
  ],
  reporter: [
    ["list"],
    ["json", { outputFile: "../test-results/journey-results.json" }],
  ],
  metadata: {
    frontendURL: FRONTEND_URL,
    backendURL: BACKEND_URL,
  },
});
