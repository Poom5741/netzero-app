import { test, expect } from "@playwright/test";
import { mockAdminSession, tokenColor } from "./tier2-parity-utils";

// T-601 Tier-2 — artifact Button computed geometry on statically-rendered
// instances + login split-panel chrome. Static instance inventory (verified
// in source before this suite was written): /admin/farmers renders two
// disabled outline sm Buttons + one primary sm Button with no data;
// /sponsor overview renders a primary sm Button in the FilterBar actions
// slot. md/lg/secondary instances exist only behind data fetches or
// post-save states (-> declared skips below). No API-backed value is
// asserted (R-025); the session mock is a render-enabler only.

test.describe("T2-BTN artifact Button on static toolbar instances", function () {
  test.beforeEach(async function ({ page }) {
    await mockAdminSession(page);
    await page.goto("/admin/farmers");
    await expect(page.getByRole("button", { name: "เพิ่มเกษตรกร" })).toBeVisible();
  });

  test("T2-BTN-01: buttons use the 999px pill radius (--radius-control)", async function ({ page }) {
    await expect(page.getByRole("button", { name: "เพิ่มเกษตรกร" })).toHaveCSS("border-radius", "999px");
    await expect(page.getByRole("button", { name: "นำเข้าเป็นชุด (AD-13)" })).toHaveCSS("border-radius", "999px");
  });

  // T2-BTN-02 — design-table row says 36px (--control-height-sm); the LANDED
  // chrome layers the WCAG touch-target floor (globals.css .touch-target,
  // min-height/min-width 44px) over every Button, so the used height of an
  // sm button in a real browser is 44px. Both facts pinned: the floor (what
  // the user actually gets) and the floor mechanism itself.
  test("T2-BTN-02: sm used height is the 44px touch-target floor", async function ({ page }) {
    const btn = page.getByRole("button", { name: "เพิ่มเกษตรกร" });
    await expect(btn).toHaveCSS("height", "44px");
    await expect(btn).toHaveCSS("min-height", "44px");
  });

  test("T2-BTN-05: primary button background is the action-primary token", async function ({ page }) {
    await expect(page.getByRole("button", { name: "เพิ่มเกษตรกร" })).toHaveCSS(
      "background-color",
      await tokenColor(page, "--action-primary")
    );
  });

  // T2-BTN-07 — the design-table row expected --border-accent; landed GAP B
  // maps the outline base border to --border-default (button.tsx TONES).
  // Pinned to the landed token wiring so any silent flip fails.
  test("T2-BTN-07: outline border rides the landed border-default token", async function ({ page }) {
    await expect(page.getByRole("button", { name: "นำเข้าเป็นชุด (AD-13)" })).toHaveCSS(
      "border-top-color",
      await tokenColor(page, "--border-default")
    );
  });

  test("T2-BTN-08: primary hover steps to action-primary-hover", async function ({ page }) {
    const btn = page.getByRole("button", { name: "เพิ่มเกษตรกร" });
    await btn.hover();
    await expect(btn).toHaveCSS("background-color", await tokenColor(page, "--action-primary-hover"));
  });

  test("T2-BTN-03: md 46px control height (declared unverified)", async function () {
    test.skip(true, "T2-BTN-03 (md 46px): no statically-rendered md Button exists in the export chrome — every static instance is sm (farmers toolbar, sponsor FilterBar actions); md sizing is Tier-1-verified in button.tsx and forcing an md render would need API data or form flows (R-025).");
  });

  test("T2-BTN-04: lg 54px control height (declared unverified)", async function () {
    test.skip(true, "T2-BTN-04 (lg 54px): zero lg-size Button usages exist anywhere in frontend/src (verified by grep); nothing in the static export can render one.");
  });

  test("T2-BTN-06: secondary background (declared unverified)", async function () {
    test.skip(true, "T2-BTN-06 (secondary): the only secondary Button instance (summary/page.tsx) renders solely in the post-save state, reachable only after a successful API save (R-025).");
  });
});

test.describe("T2-LOGIN split-panel chrome (admin + sponsor login)", function () {
  const routes = ["/admin/login", "/sponsor/login"];

  for (const route of routes) {
    test("T2-LOGIN-01/02 + panel geometry on " + route, async function ({ page }) {
      await page.goto(route);
      const grid = page.locator("div.grid").first();
      await expect(grid).toBeVisible();

      // T2-LOGIN-02 — split container fills the viewport (minHeight 100vh).
      await expect(grid).toHaveCSS("min-height", "720px");

      // split ratio 1.05fr : 0.95fr via resolved column track widths.
      const cols = await grid.evaluate(function (el) {
        return getComputedStyle(el).gridTemplateColumns;
      });
      const widths = cols.split(" ").map(function (v) {
        return parseFloat(v);
      });
      expect(widths).toHaveLength(2);
      expect(widths[0] * 0.95).toBeCloseTo(widths[1] * 1.05, 0);

      // left panel rides --gradient-deep (150deg navy-900 -> navy-800 ->
      // action-primary-hover); asserted on the computed background-image
      // stops, so the suite stays hex-free.
      const left = page.locator("div.grid > div").first();
      const bg = await left.evaluate(function (el) {
        return getComputedStyle(el).backgroundImage;
      });
      expect(bg).toContain("linear-gradient(150deg");
      expect(bg).toContain(await tokenColor(page, "--navy-900"));
      expect(bg).toContain(await tokenColor(page, "--navy-800"));
      expect(bg).toContain(await tokenColor(page, "--action-primary-hover"));

      // right panel: white surface, form centred at 392px.
      const right = page.locator("div.grid > div").nth(1);
      await expect(right).toHaveCSS("background-color", "rgb(255, 255, 255)");
      await expect(right.locator("div").first()).toHaveCSS("max-width", "392px");

      // legacy LoginForm wiring preserved verbatim (R-026): inputs + submit
      // button compute to the spec-006 44px height; the artifact pill
      // Button geometry is verified on the farmers toolbar
      // (T2-BTN-01/02/05/07/08 above).
      await expect(page.locator("#email")).toHaveCSS("height", "44px");
      await expect(page.locator("#password")).toHaveCSS("height", "44px");
      await expect(page.getByRole("button", { name: "เข้าสู่ระบบ" })).toHaveCSS("height", "44px");
    });
  }
});
