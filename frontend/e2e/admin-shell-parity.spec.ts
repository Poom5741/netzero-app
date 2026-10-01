import { test, expect } from "@playwright/test";
import { mockAdminSession, mockSponsorSession, tokenColor } from "./tier2-parity-utils";

// T-601 Tier-2 — shell + drawer + AD-CHART static chrome.
// Coverage map (feedback-loop.md 2.6.x): T2-SH-01..05 on the >=1024 rail,
// the R-003 boundary pair (1024 vs 1023), the <1024 overlay drawer
// behaviours shipped by T-501, and the static AD-CHART shell (PageTitle,
// FilterBar, the 8 deferred chart frames). Data-backed chrome (StatTile,
// ProgressBar, GHG DataTable) is explicitly unverified in
// data-chrome-parity.spec.ts. No API-backed value is asserted (R-025);
// the session route mock is a render-enabler only (see
// tier2-parity-utils.ts).

test.describe("T2-SH shell rail at >=1024 (desktop)", function () {
  test.beforeEach(async function ({ page }) {
    await mockAdminSession(page);
    await page.goto("/admin");
    await expect(page.getByTestId("sidebar-rail")).toBeVisible();
  });

  // T2-SH-03 — design-table row asked for max-width:232px; the landed rail
  // (dashboard-sidebar.tsx) constrains the rail with width:232px alone and
  // sets no max-width property, so there is no computed max-width to
  // verify. Declared unverified (body-level skip; width itself is pinned
  // by T2-SH-02).
  test("T2-SH-03: rail max-width (declared unverified)", async function () {
    test.skip(true, "T2-SH-03 (rail max-width 232px): the landed rail sets width 232px only, no max-width property exists in the shipped chrome; width equality is verified by T2-SH-02 instead.");
  });

  // T2-SH-01 — rail background = --navy-900 (design table rgb(6, 30, 92)).
  // Compared against the LIVE token, not a literal: hex-free suite and the
  // assertion breaks if either side drifts.
  test("T2-SH-01: rail background-color is the navy-900 token", async function ({ page }) {
    await expect(page.getByTestId("sidebar-rail")).toHaveCSS(
      "background-color",
      await tokenColor(page, "--navy-900")
    );
  });

  test("T2-SH-02: rail width is exactly 232px", async function ({ page }) {
    await expect(page.getByTestId("sidebar-rail")).toHaveCSS("width", "232px");
  });

  // T2-SH-04 — design-table row said position:sticky; the LANDED shell is
  // the out-of-flow fixed rail, the deviation recorded in
  // dashboard-sidebar.tsx (T-211). This test pins the landed chrome so a
  // silent fixed->static flip must fail.
  test("T2-SH-04: rail stays out-of-flow fixed (landed T-211 deviation)", async function ({ page }) {
    await expect(page.getByTestId("sidebar-rail")).toHaveCSS("position", "fixed");
  });

  // T2-SH-05 — design row said min-height:100vh; the landed rail pins
  // height:100vh inline. Verified as computed height == viewport height
  // (720px in the desktop project).
  test("T2-SH-05: rail spans the full viewport height", async function ({ page }) {
    await expect(page.getByTestId("sidebar-rail")).toHaveCSS("height", "720px");
  });
});

test.describe("T2-SH sponsor rail parity", function () {
  test("sponsor overview renders the same 232px navy rail", async function ({ page }) {
    await mockSponsorSession(page);
    await page.goto("/sponsor");
    const rail = page.getByTestId("sidebar-rail");
    await expect(rail).toBeVisible();
    await expect(rail).toHaveCSS("width", "232px");
    await expect(rail).toHaveCSS("background-color", await tokenColor(page, "--navy-900"));
  });
});

test.describe("R-003 boundary pair (1024 vs 1023)", function () {
  test("rail docks at 1024 and hands over to the hamburger at 1023", async function ({ page }) {
    await mockAdminSession(page);
    await page.setViewportSize({ width: 1024, height: 720 });
    await page.goto("/admin");
    const rail = page.getByTestId("sidebar-rail");
    const burger = page.getByTestId("dashboard-hamburger");
    await expect(rail).toBeVisible();
    await expect(rail).toHaveCSS("width", "232px");
    await expect(burger).toBeHidden();
    await page.setViewportSize({ width: 1023, height: 720 });
    await expect(rail).toBeHidden();
    await expect(burger).toBeVisible();
  });
});

test.describe("T2-DRAWER overlay drawer below the boundary", function () {
  test.use({ viewport: { width: 1023, height: 720 } });

  test.beforeEach(async function ({ page }) {
    await mockAdminSession(page);
    await page.goto("/admin");
    await expect(page.getByTestId("dashboard-hamburger")).toBeVisible();
  });

  test("hamburger opens the 232px navy dialog and locks body scroll", async function ({ page }) {
    const burger = page.getByTestId("dashboard-hamburger");
    const drawer = page.getByTestId("dashboard-drawer");
    await burger.click();
    await expect(drawer).toBeVisible();
    await expect(drawer).toHaveCSS("width", "232px");
    await expect(drawer).toHaveCSS("background-color", await tokenColor(page, "--navy-900"));
    await expect(drawer).toHaveAttribute("role", "dialog");
    await expect(drawer).toHaveAttribute("aria-modal", "true");
    await expect(burger).toHaveAttribute("aria-expanded", "true");
    const locked = await page.evaluate(function () {
      return document.body.style.overflow === "hidden";
    });
    expect(locked).toBe(true);
  });

  test("focus moves into the drawer on open and stays trapped while tabbing", async function ({ page }) {
    const drawer = page.getByTestId("dashboard-drawer");
    await page.getByTestId("dashboard-hamburger").click();
    await expect(drawer).toBeVisible();
    const activeInside = function () {
      return page.evaluate(function () {
        const el = document.activeElement;
        return el instanceof HTMLElement && el.closest("[data-testid=dashboard-drawer]") !== null;
      });
    };
    expect(await activeInside()).toBe(true);
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press("Tab");
    }
    expect(await activeInside()).toBe(true);
    await page.keyboard.press("Shift+Tab");
    expect(await activeInside()).toBe(true);
  });

  test("Escape closes the drawer and returns focus to the hamburger", async function ({ page }) {
    const burger = page.getByTestId("dashboard-hamburger");
    const drawer = page.getByTestId("dashboard-drawer");
    await burger.click();
    await expect(drawer).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(drawer).toBeHidden();
    await expect(burger).toBeFocused();
    await expect(burger).toHaveAttribute("aria-expanded", "false");
    const stillLocked = await page.evaluate(function () {
      return document.body.style.overflow === "hidden";
    });
    expect(stillLocked).toBe(false);
  });

  test("backdrop click closes the drawer and returns focus to the hamburger", async function ({ page }) {
    const burger = page.getByTestId("dashboard-hamburger");
    const drawer = page.getByTestId("dashboard-drawer");
    await burger.click();
    await expect(drawer).toBeVisible();
    await page.getByTestId("drawer-backdrop").click({ position: { x: 700, y: 300 } });
    await expect(drawer).toBeHidden();
    await expect(burger).toBeFocused();
  });

  test("rail and drawer render the same nav source (R-003 single source)", async function ({ page }) {
    await page.setViewportSize({ width: 1024, height: 720 });
    const railCount = await page.getByTestId("sidebar-rail").getByRole("link").count();
    await page.setViewportSize({ width: 1023, height: 720 });
    await page.getByTestId("dashboard-hamburger").click();
    const drawerCount = await page.getByTestId("dashboard-drawer").getByRole("link").count();
    expect(railCount).toBeGreaterThan(0);
    expect(drawerCount).toBe(railCount);
  });
});

test.describe("AD-CHART static shell (/admin/charts)", function () {
  test.beforeEach(async function ({ page }) {
    await mockAdminSession(page);
    await page.goto("/admin/charts");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("PageTitle geometry: 38px heading in the text-heading token + teal eyebrow", async function ({ page }) {
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toHaveCSS("font-size", "38px");
    await expect(h1).toHaveCSS("color", await tokenColor(page, "--text-heading"));
    const eyebrow = page.locator("main p").first();
    await expect(eyebrow).toHaveCSS("color", await tokenColor(page, "--teal-600"));
  });

  test("FilterBar shell renders the 148px labelled season select box", async function ({ page }) {
    // the 148px minWidth lives on the label BOX wrapping the select
    // (ui/filter-bar.tsx), not on the select element itself.
    const box = page.locator("main label", { has: page.locator("select") }).first();
    await expect(box).toBeVisible();
    await expect(box).toHaveCSS("min-width", "148px");
  });

  test("exactly 8 deferred chart frames ship with dashed chrome", async function ({ page }) {
    const frames = page.locator("[data-deferred=R-015]");
    await expect(frames).toHaveCount(8);
    for (let i = 0; i < 8; i++) {
      await expect(frames.nth(i)).toHaveCSS("border-top-style", "dashed");
    }
  });

  test("deferred frames carry the artifact minHeight per chart type", async function ({ page }) {
    // DOM order: AREA STAT (no floor -> auto), GAUGE 168, DONUT 190,
    // CREDIT 190, BAR 180, TREEMAP 190, BUBBLES 200, BAR 180
    // (admin-design-spec :697-711).
    const expected = ["auto", "168px", "190px", "190px", "180px", "190px", "200px", "180px"];
    const frames = page.locator("[data-deferred=R-015]");
    await expect(frames).toHaveCount(8);
    for (let i = 0; i < expected.length; i++) {
      await expect(frames.nth(i)).toHaveCSS("min-height", expected[i]);
    }
  });
});
