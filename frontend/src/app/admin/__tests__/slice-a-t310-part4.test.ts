/**
 * T-310 — Tier-1 assertions, slice A part 4 (AD-CHART shell + slice A
 * close-out), 017-admin-sponsor-design-parity (R-006, R-028, R-029).
 *
 * Technique (feedback-loop.md §2, as parts 1-3): readFileSync on the
 * raw page sources + exact string/regex assertions. NO rendered DOM,
 * NO jsdom cascade/computed-style (R-009). Covers T-309: the route
 * exists, PageTitle copy verbatim, all six deferred chart types
 * labelled on data-deferred frames (source-level count: the 7 artifact
 * chart slots of :378-380 + the deferred area stat block = 8
 * DeferredChartFrame call sites), row geometry (:708-710) and
 * per-type minHeight (:697-707), the GHG DataTable wired to the SAME
 * live getter as admin/page.tsx (admin/page.tsx:11,:56 —
 * lib/api.ts:176-180, endpoint /api/admin/overview/ghg-sources), and
 * zero data fetches beyond that getter; plus hex/TW_ARB cleanliness
 * of the new source (R-006) with a non-vacuity break-check.
 */
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const HERE = dirname(fileURLToPath(import.meta.url)); // src/app/admin/__tests__
const ADMIN_DIR = resolve(HERE, "..");
const SRC_DIR = resolve(ADMIN_DIR, "..", "..");
const CHARTS_SRC = readFileSync(join(ADMIN_DIR, "charts/page.tsx"), "utf8");
const OVERVIEW_SRC = readFileSync(join(ADMIN_DIR, "page.tsx"), "utf8");
const API_SRC = readFileSync(join(SRC_DIR, "lib/api.ts"), "utf8");

// Same corrected HEX_RAW detector shape as literal-freedom.test.ts:
// 3-8 digit hex not inside var()/url() and not preceded/followed by a
// hex-or-identifier char.
const HEX_RAW =
  /(?<![0-9a-fA-FisVar]|var\()#[0-9a-fA-F]{3,8}(?![0-9a-fA-FisVar])/g;
const TW_ARB =
  /bg-\[#|text-\[#|border-\[#|ring-\[#|from-\[#|to-\[#|via-\[#|shadow-\[#/g;

function hexFindings(src: string): string[] {
  return Array.from(src.matchAll(HEX_RAW), (m) => m[0]);
}

describe("T-310 slice A part 4 — detector non-vacuity", () => {
  it("HEX_RAW regex actually fires on a planted literal (not a no-op)", () => {
    const planted = "style={{ color: \"#52ECCA\" }}";
    expect(hexFindings(planted)).toEqual(["#52ECCA"]);
  });
});

describe("T-310 — AD-CHART /admin/charts shell (T-309)", () => {
  it("route exists and carries the artifact PageTitle copy verbatim (R-028)", () => {
    expect(CHARTS_SRC).toContain("\"use client\"");
    expect(CHARTS_SRC).toContain("<PageTitle");
    expect(CHARTS_SRC).toContain("แดชบอร์ดกราฟ");
    expect(CHARTS_SRC).toContain("สรุปเครดิตและผลการดำเนินโครงการ");
  });

  it("FilterBar wired from ui/filter-bar (T-309 wording governs; spec :374 FilterBarLite is not in the codebase)", () => {
    expect(CHARTS_SRC).toContain("import { FilterBar } from \"@/components/ui/filter-bar\"");
    expect(CHARTS_SRC).toContain("<FilterBar");
  });

  it("all six deferred chart types labelled on data-deferred frames (R-015)", () => {
    // Frame chrome: every instance renders the AD-OV deferred marker.
    expect(CHARTS_SRC).toContain("data-deferred=\"R-015\"");
    const labels = [
      "DEFERRED — GAUGE",
      "DEFERRED — DONUT",
      "DEFERRED — CREDIT CHART",
      "DEFERRED — BAR SERIES",
      "DEFERRED — TREEMAP",
      "DEFERRED — BUBBLES",
    ];
    for (const label of labels) {
      expect(CHARTS_SRC).toContain(label);
    }
    // 8 call sites: the 7 artifact chart slots (Rows 1-3, :378-380,
    // BarSeries twice) + the deferred area stat block. 8 labelled
    // frames total; no chart implementation ships in the shell.
    expect((CHARTS_SRC.match(/<DeferredChartFrame/g) ?? []).length).toBe(8);
    expect((CHARTS_SRC.match(/label="DEFERRED — /g) ?? []).length).toBe(8);
    expect(CHARTS_SRC).not.toMatch(/<svg/);
    expect(CHARTS_SRC).not.toContain("viewBox");
  });

  it("row geometry per :708-710 and per-type minHeight per :697-707", () => {
    expect(CHARTS_SRC).toContain("gridTemplateColumns: \"1.1fr 1fr 1.3fr\"");
    expect(CHARTS_SRC).toContain("gridTemplateColumns: \"1.2fr 1fr\"");
    expect(CHARTS_SRC).toContain("gridTemplateColumns: \"1fr 1fr 1fr\"");
    expect((CHARTS_SRC.match(/gap: "var\(--space-5\)"/g) ?? []).length).toBe(3);
    expect(CHARTS_SRC).toContain("minHeight={168}");
    expect(CHARTS_SRC).toContain("minHeight={190}");
    expect(CHARTS_SRC).toContain("minHeight={180}");
    expect(CHARTS_SRC).toContain("minHeight={200}");
  });

  it("GHG DataTable wired to the SAME live getter as admin/page.tsx (live, not mocked)", () => {
    expect(CHARTS_SRC).toContain("from \"@/lib/api\"");
    expect(CHARTS_SRC).toMatch(/getGhgSources\(\)\.catch\(\(\) => \[\]\)/);
    expect(OVERVIEW_SRC).toContain("getGhgSources()");
    expect(API_SRC).toContain("/api/admin/overview/ghg-sources");
    expect(CHARTS_SRC).toContain("แหล่งก๊าซเรือนกระจก (GHG)");
    expect(CHARTS_SRC).toContain("แหล่งที่มา");
    expect(CHARTS_SRC).toContain("ปริมาณ (tCO2e)");
    expect(CHARTS_SRC).toMatch(/ghgSources\.map\(\(src\) => \(\{ source: src\.source, value: src\.value\.toFixed\(2\) \}\)\)/);
  });

  it("zero data fetches beyond the GHG getter (R-015 shell)", () => {
    expect(CHARTS_SRC).not.toContain("fetch(");
    const getters = CHARTS_SRC.match(/get[A-Z][A-Za-z]*\(/g) ?? [];
    expect(getters).toEqual(["getGhgSources("]);
  });

  it("admin session gate pattern as the overview page (admin surface)", () => {
    expect(CHARTS_SRC).toContain("useAdminSessionGate");
    expect(CHARTS_SRC).toContain("if (authed === null) return null;");
  });

  it("hex-clean and TW_ARB-clean source (R-006)", () => {
    expect(hexFindings(CHARTS_SRC)).toEqual([]);
    expect(CHARTS_SRC.match(TW_ARB)).toEqual(null);
  });
});
