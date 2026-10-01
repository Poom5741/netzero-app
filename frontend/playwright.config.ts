import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    // TIER2_BASE_URL points the parity suites at a fresh, externally managed dev
    // server (e.g. next dev -p 3100 in a throwaway worktree) instead of whatever
    // long-lived process occupies :3000 — a stale dev server decays (.next chunks)
    // and makes Tier-2 nondeterministic. When unset the historical dev-server
    // flow (webServer block, reuseExistingServer) is unchanged.
    baseURL: process.env.TIER2_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
      // The *-parity suites assert >=1024px desktop chrome (017 design-table rows);
      // the rail is `hidden lg:flex` below 1024px by design (R-003), so these
      // contracts are out of the mobile project's scope. New parity specs must be
      // added here consciously. Config-level ignore, not test.skip(): the specs
      // stay single-source and mobile never runs them.
      testIgnore: [
        "e2e/admin-shell-parity.spec.ts",
        "e2e/controls-parity.spec.ts",
        "e2e/data-chrome-parity.spec.ts",
      ],
    },
  ],
  webServer: process.env.TIER2_BASE_URL
    ? undefined
    : {
        command: "npm run dev",
        url: "http://localhost:3000",
        reuseExistingServer: true,
        env: {
          NEXT_PUBLIC_STANDALONE: "1",
        },
      },
});
