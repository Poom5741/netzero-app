import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

describe("globals.css design system", () => {
  const css = readFileSync(resolve(__dirname, "../globals.css"), "utf-8");

  it("defines Material Symbols icon base class", () => {
    expect(css).toContain(".material-symbols-outlined");
    expect(css).toContain("font-family: var(--font-icon)");
  });

  it("defines sidebar offset classes for Tailwind v4", () => {
    // Main provides dashboard-main and dashboard-header classes
    expect(css).toContain(".dashboard-main");
    expect(css).toContain(".dashboard-header");
    expect(css).toContain("padding-left: 288px");
  });

  it("defines safe area utilities", () => {
    expect(css).toContain(".pt-safe");
    expect(css).toContain(".pb-safe");
    expect(css).toContain("env(safe-area-inset-top");
  });

  it("defines neumorphic utilities with white background", () => {
    expect(css).toContain(".neumorphic");
    expect(css).toContain("--color-surface-container-lowest");
  });
});
