import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Button } from "../ui/button";

/**
 * T-209 — Button tests rewritten against the artifact (R-031/R-007).
 * Source of truth: admin-design-spec.md GAP B "### Button" (:909-940).
 * The three stale assertions (`.claymorphic`, `.neumorphic`,
 * `bg-gradient-to-b`+`text-on-error` — dead utility CSS removed from the
 * component) were rewritten to the artifact geometry they were standing in
 * for: tone classes, size geometry, pill radius. Tier-1 technique: rendered
 * class/style-attribute assertions + raw-source assertions; no jsdom
 * computed cascade (feedback-loop.md §1, T-212).
 */

const HERE = dirname(fileURLToPath(import.meta.url));
const SOURCE = readFileSync(join(HERE, "../ui/button.tsx"), "utf8");

describe("Button", () => {
  it("renders with default variant", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button")).toHaveTextContent("Click me");
  });

  it("primary tone: action-primary bg, text-on-accent fg, GAP B hover/active steps", () => {
    render(<Button variant="primary">Primary</Button>);
    const btn = screen.getByRole("button");
    // GAP B :912 TONES primary row (replaces the dead `.claymorphic` claim)
    expect(btn).toHaveClass("bg-[var(--action-primary)]");
    expect(btn).toHaveClass("text-[var(--text-on-accent)]");
    expect(btn).toHaveClass("hover:bg-[var(--action-primary-hover)]");
    expect(btn).toHaveClass("active:bg-[var(--action-primary-active)]");
    expect(btn).toHaveClass("hover:shadow-[var(--shadow-accent)]"); // :936 shadow-accent on primary hover
  });

  it("secondary tone: action-secondary bg, text-on-dark fg, hover/active per GAP B", () => {
    render(<Button variant="secondary">Secondary</Button>);
    const btn = screen.getByRole("button");
    // GAP B :913 (replaces the dead `.neumorphic` claim)
    expect(btn).toHaveClass("bg-[var(--action-secondary)]");
    expect(btn).toHaveClass("text-[var(--text-on-dark)]");
    expect(btn).toHaveClass("hover:bg-[var(--action-secondary-hover)]");
    expect(btn).toHaveClass("active:bg-[var(--navy-950)]");
  });

  it("outline tone: transparent bg, border-default, navy-50/navy-100 states", () => {
    render(<Button variant="outline">Outline</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toHaveClass("bg-transparent");
    expect(btn).toHaveClass("text-[var(--text-heading)]");
    expect(btn).toHaveClass("border-[var(--border-default)]");
    expect(btn).toHaveClass("hover:bg-[var(--navy-50)]");
    expect(btn).toHaveClass("active:bg-[var(--navy-100)]");
  });

  it("ghost tone: text-accent fg, teal-50/teal-100 states", () => {
    render(<Button variant="ghost">Ghost</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toHaveClass("bg-transparent");
    expect(btn).toHaveClass("text-[var(--text-accent)]");
    expect(btn).toHaveClass("hover:bg-[var(--teal-50)]");
    expect(btn).toHaveClass("active:bg-[var(--teal-100)]");
  });

  it("onDark tone: GAP B rgba(255,255,255,.14/.24/.3) steps + border-on-dark", () => {
    render(<Button variant="onDark">On dark</Button>);
    const btn = screen.getByRole("button");
    // GAP B :919-924 onDark row — rgba literals come straight from GAP B
    expect(btn).toHaveClass("bg-[rgba(255,255,255,0.14)]");
    expect(btn).toHaveClass("text-[var(--text-on-dark)]");
    expect(btn).toHaveClass("border-[var(--border-on-dark)]");
    expect(btn).toHaveClass("hover:bg-[rgba(255,255,255,0.24)]");
    expect(btn).toHaveClass("active:bg-[rgba(255,255,255,0.3)]");
  });

  it("danger (API-compat tone, not in GAP B): artifact status-danger ink", () => {
    render(<Button variant="danger">Danger</Button>);
    const btn = screen.getByRole("button");
    // Replaces the dead `bg-gradient-to-b` + `text-on-error` assertions:
    // the gradient was claymorphic-era CSS with no artifact meaning.
    expect(btn).toHaveClass("bg-[var(--status-danger)]");
    expect(btn).toHaveClass("text-[var(--text-on-accent)]");
  });

  it("pill radius --radius-control, semibold, 0.01em tracking, GAP B transition (inline geometry)", () => {
    render(<Button>Geo</Button>);
    const btn = screen.getByRole("button");
    const style = btn.getAttribute("style") ?? "";
    expect(style).toContain("border-radius: var(--radius-control)");
    expect(style).toContain("font-weight: var(--weight-semibold)");
    expect(style).toContain("letter-spacing: 0.01em");
    expect(style).toContain("gap: var(--space-2)");
    expect(style).toContain("transition: var(--transition-control)");
    expect(style).toContain("transform var(--duration-instant) var(--ease-standard)");
  });

  it.each([
    ["sm", "var(--control-height-sm)", "var(--space-4)", "var(--text-sm)"],
    ["md", "var(--control-height-md)", "var(--space-6)", "var(--text-base)"],
    ["lg", "var(--control-height-lg)", "var(--space-8)", "var(--text-md)"],
  ] as const)("size %s: height/padding/font-size per GAP B SIZES map", (size, height, px, fs) => {
    render(
      <Button size={size} variant="ghost">
        {size}
      </Button>,
    );
    const style = screen.getByRole("button").getAttribute("style") ?? "";
    expect(style).toContain(`height: ${height}`);
    expect(style).toContain(`padding: 0 ${px}`);
    expect(style).toContain(`font-size: ${fs}`);
  });

  it("press scale var(--press-scale) class present (GAP B :936)", () => {
    render(<Button>Press</Button>);
    expect(screen.getByRole("button")).toHaveClass(
      "active:[transform:scale(var(--press-scale))]",
    );
  });

  it("source keeps the artifact token names, not dead utility CSS (R-031)", () => {
    expect(SOURCE).toContain("var(--radius-control)");
    expect(SOURCE).not.toContain("claymorphic");
    expect(SOURCE).not.toContain("neumorphic");
    expect(SOURCE).not.toContain("bg-gradient-to-b");
    expect(SOURCE).not.toMatch(/#[0-9a-fA-F]{3,8}/); // R-006
  });

  it("renders disabled state", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("renders loading state", () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
    expect(screen.getByRole("button")).toContainHTML("svg");
  });

  it("applies touch-target minimum size", () => {
    render(<Button>Touch</Button>);
    expect(screen.getByRole("button")).toHaveClass("touch-target");
  });
});
