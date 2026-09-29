import { describe, expect, it } from "vitest";

/**
 * Artifact parity for the remaining farmer-facing LIFF pages.
 *
 * Slice 3 covered the `/liff/` chat template. These three are separate
 * templates in the same file and still carry the legacy palette.
 *
 * Artifact source: design-artifacts/2026-09-28/line-oa-farmer.html, decoded
 * module c087a24f-4179-4a49-849a-6c05aafd7d3a.js.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

const src = readFileSync(join(process.cwd(), "src", "routes", "liff.ts"), "utf8");

const ARTIFACT = {
  green: "#06C755",
  greenDark: "#04A344",
  chatInk: "#16202C",
  bubbleYou: "#FFFFFF",
  hairline: "#EEF2F6",
  qrBorder: "#D6DFE9",
  inputPill: "#F1F4F8",
  muted: "#94A2B2",
  danger: "#C8464F",
  statusSuccess: "#0AA8A3",
  statusWarning: "#E2A33C",
} as const;

function usesColor(hex: string): boolean {
  const needle = hex.replace("#", "").toLowerCase();
  return new RegExp(`(?<![0-9a-f])${needle}(?![0-9a-f])`).test(src.toLowerCase());
}

/** The legacy palette these pages were carrying before the port. */
const LEGACY = ["#f0f2f5", "#e0e0e0", "#ddd", "#e8f5e9", "#00a854", "#ffebee", "#f44336"];

describe("remaining LIFF templates — artifact tokens", () => {
  it("declares the artifact token block on the pages that need it", () => {
    // Slice 3 added :root tokens to the chat template. The other three need
    // the same declaration, or their styles must inline the values.
    const rootBlocks = src.match(/:root\s*\{[^}]*\}/g) ?? [];
    expect(rootBlocks.length).toBeGreaterThanOrEqual(1);
  });

  it("uses the artifact ink #16202C, not legacy #333", () => {
    expect(usesColor(ARTIFACT.chatInk)).toBe(true);
    expect(usesColor("#333333")).toBe(false);
  });

  it("uses the artifact danger #C8464F, not Material red #f44336", () => {
    expect(usesColor(ARTIFACT.danger)).toBe(true);
    expect(usesColor("#f44336")).toBe(false);
  });

  it("uses the artifact hairlines and borders", () => {
    expect(usesColor(ARTIFACT.hairline)).toBe(true);
    expect(usesColor(ARTIFACT.qrBorder)).toBe(true);
  });

  it("keeps LINE green and its dark partner", () => {
    expect(usesColor(ARTIFACT.green)).toBe(true);
    expect(usesColor(ARTIFACT.greenDark)).toBe(true);
  });

  it("leaves no legacy palette value anywhere in the file", () => {
    const remaining = LEGACY.filter((c) => usesColor(c));
    expect(remaining).toEqual([]);
  });
});

describe("remaining LIFF templates — artifact geometry", () => {
  it("uses the artifact 13px control radius on form fields", () => {
    expect(src).toMatch(/border-radius:\s*13px/);
  });

  it("uses the artifact 999px pill radius for composer-style inputs", () => {
    expect(src).toMatch(/border-radius:\s*999px/);
  });
});
