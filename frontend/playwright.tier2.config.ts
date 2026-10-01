import { defineConfig, devices } from "@playwright/test";

// T-601 — Tier-2 computed-CSS suite config. Deliberately SEPARATE from the
// existing playwright.config.ts (that file keeps owning the dev-server
// behaviour specs; this one is additive, nothing existing changes).
//
// Why: feedback-loop.md 2.6 + tasks.md T-601 pin Tier-2 to the STATIC
// EXPORT chrome — the same artifact that ships to Cloudflare
// (next.config.ts STATIC_EXPORT=1 -> out/). The dev server and its /api
// rewrites are out of scope, and R-025 forbids asserting API-backed
// values, so this suite runs against the exported site with no backend;
// pages render their static/loading chrome only.
//
// Serving choice (documented per task): the export is served by the
// zero-dependency node server e2e/tier2-static-server.mjs on
// 127.0.0.1:4177 (clean-URL static files). Build the export first:
//   STATIC_EXPORT=1 npm run build   (from frontend/)
// then:
//   npx playwright test -c playwright.tier2.config.ts
//
// Projects: chromium desktop only — the artifact is desktop-exact
// >=1024px (feedback-loop 2.6); the sub-1024 side of the single R-003
// boundary is covered inside the specs via viewport overrides
// (1024/1023 pair). mobile-chrome stays owned by the existing
// mobile-accessibility.spec.ts guard.

export default defineConfig({
  testDir: "./e2e",
  testMatch: /admin-shell-parity\.spec\.ts|controls-parity\.spec\.ts|data-chrome-parity\.spec\.ts/,
  fullyParallel: true,
  workers: 2,
  forbidOnly: true,
  retries: 0,
  reporter: [["list"]],
  outputDir: "test-results/tier2",
  use: {
    baseURL: "http://127.0.0.1:4177",
    viewport: { width: 1280, height: 720 },
    screenshot: "off",
    trace: "off",
  },
  expect: { timeout: 10000 },
  projects: [
    {
      name: "chromium-desktop",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "node e2e/tier2-static-server.mjs",
    url: "http://127.0.0.1:4177/",
    reuseExistingServer: true,
    timeout: 30000,
  },
});
