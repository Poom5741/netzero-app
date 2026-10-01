/**
 * T1-COL / T1-CTL token-definition suite — 017-admin-sponsor-design-parity
 * (T-103, R-029).
 *
 * Mechanism (feedback-loop.md §2.1): readFileSync on
 * frontend/src/app/globals.css + exact name/value regex assertions for the
 * Map C alias tokens landed by T-101. Values are the artifact values from
 * admin-artifact.json + sponsor-artifact.json (verified identical in both),
 * as tabulated in feedback-loop.md §2.1 (T1-COL-01…54, T1-CTL-01…08).
 *
 * Mutation break-checks (feedback-loop.md:616-669) are included as
 * string-mutation assertions so the suite itself proves the checks are not
 * vacuous:
 *   - --surface-inverse value sensitivity (T1-COL-40)      [:616-628]
 *   - raw hex added back turns literal-freedom red         [:630-644]
 *   - sidebar bg-token revert is caught by the detectors   [:645-656]
 * The shell-geometry width check [:657-664] targets geometry that does not
 * exist until T-211 (Phase 2) and is intentionally not fabricated here.
 *
 * Hard constraints honoured: readFileSync + regex on raw source only; no
 * jsdom cascade/computed-style assertions; no rendered DOM; no new deps.
 */
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const HERE = dirname(fileURLToPath(import.meta.url)); // frontend/src/components/__tests__
const FRONTEND_ROOT = resolve(HERE, "../..", ".."); // frontend/
const GLOBALS_CSS = join(FRONTEND_ROOT, "src", "app", "globals.css");
const CSS = readFileSync(GLOBALS_CSS, "utf8");

/** Escape regex specials; allow optional whitespace after commas (CSS style). */
function tokenRe(value: string): RegExp {
  const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/,/g, ",\\s*");
  return new RegExp(escaped, "i");
}

function defines(token: string, value: string): boolean {
  return new RegExp(`--${token}:\\s*${tokenRe(value).source}`, "i").test(CSS);
}

type Row = { id: string; token: string; value: string };

// T1-COL-01…11 — artifact navy ramp (admin-artifact.json tokens)
const NAVY: Row[] = [
  { id: "T1-COL-01", token: "navy-50", value: "#EEF2FB" },
  { id: "T1-COL-02", token: "navy-100", value: "#D6E0F4" },
  { id: "T1-COL-03", token: "navy-200", value: "#AEC2E8" },
  { id: "T1-COL-04", token: "navy-300", value: "#7C9AD8" },
  { id: "T1-COL-05", token: "navy-400", value: "#5279CB" },
  { id: "T1-COL-06", token: "navy-500", value: "#2C5EB8" },
  { id: "T1-COL-07", token: "navy-600", value: "#1C489F" },
  { id: "T1-COL-08", token: "navy-700", value: "#123787" },
  { id: "T1-COL-09", token: "navy-800", value: "#0B2A72" },
  { id: "T1-COL-10", token: "navy-900", value: "#061E5C" },
  { id: "T1-COL-11", token: "navy-950", value: "#030E2E" },
];

// T1-COL-12…22 — artifact teal ramp (--teal-400 = #24C4B2 in both artifacts)
const TEAL: Row[] = [
  { id: "T1-COL-12", token: "teal-50", value: "#E7FCF7" },
  { id: "T1-COL-13", token: "teal-100", value: "#C6F9EE" },
  { id: "T1-COL-14", token: "teal-200", value: "#8FF3DE" },
  { id: "T1-COL-15", token: "teal-300", value: "#52ECCA" },
  { id: "T1-COL-16", token: "teal-400", value: "#24C4B2" },
  { id: "T1-COL-17", token: "teal-500", value: "#0AA8A3" },
  { id: "T1-COL-18", token: "teal-600", value: "#028E91" },
  { id: "T1-COL-19", token: "teal-700", value: "#027276" },
  { id: "T1-COL-20", token: "teal-800", value: "#01565F" },
  { id: "T1-COL-21", token: "teal-900", value: "#013B45" },
  { id: "T1-COL-22", token: "teal-950", value: "#012730" },
];

// T1-COL-23…33 — artifact cool-grey ramp
const GREY: Row[] = [
  { id: "T1-COL-23", token: "grey-50", value: "#F2F2F2" },
  { id: "T1-COL-24", token: "grey-100", value: "#EDEFF3" },
  { id: "T1-COL-25", token: "grey-200", value: "#DDE1E8" },
  { id: "T1-COL-26", token: "grey-300", value: "#C2C8D2" },
  { id: "T1-COL-27", token: "grey-400", value: "#9AA3B2" },
  { id: "T1-COL-28", token: "grey-500", value: "#737E91" },
  { id: "T1-COL-29", token: "grey-600", value: "#566277" },
  { id: "T1-COL-30", token: "grey-700", value: "#3C4A5C" },
  { id: "T1-COL-31", token: "grey-800", value: "#273343" },
  { id: "T1-COL-32", token: "grey-900", value: "#1B2330" },
  { id: "T1-COL-33", token: "grey-950", value: "#141414" },
];

// T1-COL-34…54 — NZC aliases, surfaces, text, actions, status tones
const SEMANTIC: Row[] = [
  { id: "T1-COL-34", token: "nzc-navy", value: "#061E5C" },
  { id: "T1-COL-35", token: "nzc-teal", value: "#028E91" },
  { id: "T1-COL-36", token: "nzc-aqua", value: "#43D8B8" },
  { id: "T1-COL-37", token: "nzc-mint", value: "#52ECCA" },
  { id: "T1-COL-38", token: "nzc-off-white", value: "#F2F2F2" },
  { id: "T1-COL-39", token: "nzc-space-grey", value: "#273343" },
  { id: "T1-COL-40", token: "surface-inverse", value: "#061E5C" },
  { id: "T1-COL-41", token: "surface-card", value: "#FFFFFF" },
  { id: "T1-COL-42", token: "surface-sunken", value: "#F2F2F2" },
  { id: "T1-COL-43", token: "text-heading", value: "#061E5C" },
  { id: "T1-COL-44", token: "text-body", value: "#273343" },
  { id: "T1-COL-45", token: "text-muted", value: "#566277" },
  { id: "T1-COL-46", token: "text-accent", value: "#028E91" },
  { id: "T1-COL-47", token: "action-primary", value: "#028E91" },
  { id: "T1-COL-48", token: "action-primary-hover", value: "#027276" },
  { id: "T1-COL-49", token: "action-primary-active", value: "#01565F" },
  { id: "T1-COL-50", token: "action-secondary", value: "#061E5C" },
  { id: "T1-COL-51", token: "action-secondary-hover", value: "#0B2A72" },
  { id: "T1-COL-52", token: "status-success", value: "#0AA8A3" },
  { id: "T1-COL-53", token: "status-danger", value: "#C8464F" },
  { id: "T1-COL-54", token: "status-warning", value: "#E2A33C" },
];

// T1-CTL-01…08 — control-dimension tokens
const CONTROL: Row[] = [
  { id: "T1-CTL-01", token: "control-height-sm", value: "36px" },
  { id: "T1-CTL-02", token: "control-height-md", value: "46px" },
  { id: "T1-CTL-03", token: "control-height-lg", value: "54px" },
  { id: "T1-CTL-04", token: "radius-pill", value: "999px" },
  { id: "T1-CTL-05", token: "focus-ring", value: "0 0 0 3px rgba(10,168,163,.32)" },
  { id: "T1-CTL-06", token: "shadow-accent", value: "0 12px 28px rgba(2,142,145,.24)" },
  {
    id: "T1-CTL-07",
    token: "gradient-deep",
    value: "linear-gradient(150deg,#061E5C 0%,#0B2A72 45%,#027276 100%)",
  },
  {
    id: "T1-CTL-08",
    token: "gradient-rule",
    value: "linear-gradient(90deg,#52ECCA 0%,#028E91 55%,#061E5C 100%)",
  },
];

describe("T1-COL token definitions in globals.css (Map C aliases, R-005)", () => {
  it.each([...NAVY, ...TEAL, ...GREY, ...SEMANTIC])(
    "$id — --$token defined with the artifact value",
    ({ token, value }) => {
      expect(defines(token, value)).toBe(true);
    },
  );
});

describe("T1-CTL control-dimension tokens in globals.css (R-005)", () => {
  it.each(CONTROL)(
    "$id — --$token defined with the artifact value",
    ({ token, value }) => {
      expect(defines(token, value)).toBe(true);
    },
  );
});

/*
 * Mutation break-checks (feedback-loop.md:616-669). These mutate IN-MEMORY
 * copies of source strings only — no repo file is written by any test.
 */
describe("T1 mutation break-checks (feedback-loop.md:616-669)", () => {
  it("T1-COL-40 --surface-inverse is value-sensitive: a value swap must go red (:616-628)", () => {
    const mutated = CSS.replace(
      /--surface-inverse:\s*#[0-9A-Fa-f]{3,8}/,
      "--surface-inverse: #FF0000",
    );
    expect(mutated).not.toBe(CSS); // mutation actually applied
    expect(defines("surface-inverse", "#061E5C")).toBe(true); // real css passes
    expect(
      new RegExp(`--surface-inverse:\\s*${tokenRe("#061E5C").source}`, "i").test(mutated),
    ).toBe(false); // mutated css must fail
  });

  it("adding one raw hex back turns literal-freedom red (:630-644)", () => {
    // Verbatim detectors, as in literal-freedom.test.ts (kept self-contained
    // so test files never import each other).
    const HEX_RAW = /(?<![0-9a-fA-FisVar]|var\()#[0-9a-fA-F]{3,8}(?![0-9a-fA-FisVar]|,)/g;
    const TW_ARB = /bg-\[#|text-\[#|border-\[#|ring-\[#|from-\[#|to-\[#|via-\[#|shadow-\[#/g;
    const buttonSrc = readFileSync(
      join(FRONTEND_ROOT, "src", "components", "ui", "button.tsx"),
      "utf8",
    );
    const injected = buttonSrc + '\nclassName="bg-[#FF0000]"';
    const hexHits = injected.match(HEX_RAW) ?? [];
    const twHits = injected.match(TW_ARB) ?? [];
    expect(hexHits).toContain("#FF0000");
    expect(twHits.some((hit) => hit.startsWith("bg-["))).toBe(true);
    // Sanity: the pristine file does not contain the injected literal.
    expect((buttonSrc.match(HEX_RAW) ?? []).map((v) => v.toUpperCase())).not.toContain(
      "#FF0000",
    );
  });

  it("sidebar bg-token revert: swapping raw-hex utilities for tokens clears the detectors, and a raw-hex regression is flagged (:645-656)", () => {
    const HEX_RAW = /(?<![0-9a-fA-FisVar]|var\()#[0-9a-fA-F]{3,8}(?![0-9a-fA-FisVar]|,)/g;
    const sidebarPath = join(
      FRONTEND_ROOT,
      "src",
      "components",
      "dashboard",
      "dashboard-sidebar.tsx",
    );
    const sidebarSrc = readFileSync(sidebarPath, "utf8");
    // Today the rail still uses raw-hex arbitrary classes (T-211 restyles them);
    // prove the detector measures exactly token-vs-hex by mutating a copy.
    const tokenized = sidebarSrc
      .split("bg-[#061E5C]")
      .join("bg-inverse-surface")
      .split("bg-[#028E91]")
      .join("bg-primary");
    expect(tokenized).not.toBe(sidebarSrc); // the raw-hex classes exist today
    const hexValues = (s: string) => (s.match(HEX_RAW) ?? []).map((v) => v.toUpperCase());
    expect(hexValues(tokenized)).not.toContain("#061E5C");
    expect(hexValues(tokenized)).not.toContain("#028E91");
    // Break direction: reintroducing a raw-hex bg utility must be flagged.
    const broken = tokenized + '\nclassName="bg-[#FF0000]"';
    expect(hexValues(broken)).toContain("#FF0000");
  });
});
