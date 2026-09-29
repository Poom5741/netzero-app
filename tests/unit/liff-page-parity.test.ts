import { describe, expect, it } from "vitest";

/**
 * Artifact parity for the farmer-facing LIFF pages rendered by the Worker.
 *
 * The bot deep-links farmers to `https://liff.line.me/{LIFF_ID}`, which resolves
 * to `app.route("/liff", liffRoutes)` in `src/index.ts`. That page — not the
 * Next.js app — is the surface farmers actually see, so it is the one that must
 * match the Claude Design artifact.
 *
 * Artifact source: design-artifacts/2026-09-28/line-oa-farmer.html, decoded
 * module c087a24f-4179-4a49-849a-6c05aafd7d3a.js.
 *
 * These assertions read the HTML the Worker emits. They cannot verify LINE's
 * own client chrome; see matrix R-011.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

const SRC = join(process.cwd(), "src", "routes", "liff.ts");
const html = readFileSync(SRC, "utf8");

/** Artifact `--line-*` tokens. */
const ARTIFACT = {
  green: "#06C755",
  greenDark: "#04A344",
  chatBg: "#8FAAD0",
  chatInk: "#16202C",
  bubbleMe: "#A9E86B",
  bubbleYou: "#FFFFFF",
  hairline: "#EEF2F6",
  qrBorder: "#D6DFE9",
} as const;

/** Hex compare that ignores surrounding CSS punctuation. */
function usesColor(hex: string): boolean {
  const needle = hex.replace("#", "").toLowerCase();
  return new RegExp(`(?<![0-9a-f])${needle}(?![0-9a-f])`).test(html.toLowerCase());
}

describe("LIFF page artifact tokens", () => {
  it("paints the chat canvas with the artifact background #8FAAD0", () => {
    expect(usesColor(ARTIFACT.chatBg)).toBe(true);
  });

  it("uses the artifact ink #16202C for bot message text, not #333", () => {
    expect(usesColor(ARTIFACT.chatInk)).toBe(true);
    expect(usesColor("#333333")).toBe(false);
  });

  it("renders the user's own bubble in the artifact lime #A9E86B", () => {
    expect(usesColor(ARTIFACT.bubbleMe)).toBe(true);
  });

  it("uses the artifact hairline #EEF2F6 for the composer border", () => {
    expect(usesColor(ARTIFACT.hairline)).toBe(true);
  });

  it("uses the artifact quick-reply border #D6DFE9", () => {
    expect(usesColor(ARTIFACT.qrBorder)).toBe(true);
  });

  it("keeps the LINE green and its dark partner", () => {
    expect(usesColor(ARTIFACT.green)).toBe(true);
    expect(usesColor(ARTIFACT.greenDark)).toBe(true);
  });
});

describe("LIFF page artifact geometry", () => {
  it("caps the message bubble at the artifact 232px", () => {
    expect(html).toMatch(/max-width:\s*232px/);
  });

  it("uses the artifact 9px 12px bubble padding", () => {
    expect(html).toMatch(/padding:\s*9px 12px/);
  });

  it("uses the artifact 13px bubble radius with a 4px tail", () => {
    expect(html).toMatch(/border-radius:\s*13px/);
  });

  it("uses the artifact 13px font and 1.55 line-height in bubbles", () => {
    expect(html).toMatch(/font-size:\s*13px/);
    expect(html).toMatch(/line-height:\s*1\.55/);
  });

  it("uses the artifact system-divider pill on the chat background", () => {
    expect(html).toMatch(/rgba\(0,\s*0,\s*0,\s*0\.22\)/);
  });
});
