import { test } from "@playwright/test";

// T-601 explicit-unverified register. Every design below CANNOT be verified
// against the static export without fabricating API data, which R-025
// forbids; each ships as a DECLARED skip so the blocker is named in the
// run report and the design can never silently pass.

test.describe("T2-TILE StatTile — explicitly unverified on static export", function () {
  test.skip(true, "T2-TILE-01..04: the StatTile locator from feedback-loop 2.6.4 ([data-testid=stat-tile]) does not exist in the landed DOM, and KPI tiles render exclusively from API-fetched data; fabricating KPI payloads to force a render would violate R-025. The shared card tokens surface only on data-backed screens.");
  test("T2-TILE-01: stat tile radius --radius-card 16px", function () {});
  test("T2-TILE-02: stat tile surface --surface-card white", function () {});
  test("T2-TILE-03: dark stat tile surface --surface-inverse", function () {});
  test("T2-TILE-04: dark stat tile value colour --text-on-dark", function () {});
});

test.describe("T2-PB ProgressBar — explicitly unverified on static export", function () {
  test.skip(true, "T2-PB-01..03: ProgressBar instances render only inside data-backed sections (SP-OV season bars, AD-REPORT T-VER panel); every backing fetch fails on the static export and R-025 forbids value mocks, so no bar ever enters the DOM. Geometry is Tier-1-verified in source (ui/progress-bar.tsx).");
  test("T2-PB-01: track pill radius --radius-pill", function () {});
  test("T2-PB-02: track colour --grey-100", function () {});
  test("T2-PB-03: teal fill --teal-600", function () {});
});

test.describe("GHG DataTable headers — explicitly unverified on static export", function () {
  test.skip(true, "GHG table headers render only when getGhgSources() yields rows; on the static export the fetch fails to the empty state and the whole Section is absent (R-025 forbids seeding rows). Header presence is covered by the Tier-1 source suite.");
  test("GHG header cells present when data renders", function () {});
});
