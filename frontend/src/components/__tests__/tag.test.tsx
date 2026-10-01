import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Tag, type TagTone } from "../ui/tag";

const HERE = dirname(fileURLToPath(import.meta.url));
const SOURCE = readFileSync(join(HERE, "../ui/tag.tsx"), "utf8");

const TONES: Array<{ tone: TagTone; bg: string; fg: string; bd: string }> = [
  { tone: "teal", bg: "var(--teal-50)", fg: "var(--teal-800)", bd: "var(--teal-200)" },
  { tone: "navy", bg: "var(--navy-50)", fg: "var(--navy-800)", bd: "var(--navy-200)" },
  { tone: "neutral", bg: "var(--grey-100)", fg: "var(--grey-700)", bd: "var(--grey-200)" },
  { tone: "solid", bg: "var(--teal-600)", fg: "var(--white)", bd: "transparent" },
  { tone: "onDark", bg: "rgba(255,255,255,0.12)", fg: "var(--white)", bd: "var(--border-on-dark)" },
];

describe("T-202 Tag (admin GAP B :954-966)", () => {
  it("renders the five artifact tones with the exact bg/fg/bd vars", () => {
    for (const t of TONES) {
      const { container, unmount } = render(<Tag tone={t.tone}>T</Tag>);
      const el = container.firstElementChild as HTMLElement;
      const style = el.getAttribute("style") ?? "";
      expect(style.replace(/\s/g, "")).toContain(("background: " + t.bg).replace(/\s/g, ""));
      expect(style).toContain("color: " + t.fg);
      expect(style).toContain("border: 1px solid " + t.bd);
      expect(el.getAttribute("data-tone")).toBe(t.tone);
      unmount();
    }
  });

  it("expresses the artifact geometry: 28px pill, 0.02em tracking, nowrap", () => {
    const { container } = render(<Tag>Geometry</Tag>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.height).toBe("28px");
    expect(el.style.padding).toBe("0 var(--space-3)");
    expect(el.style.borderRadius).toBe("var(--radius-pill)");
    expect(el.style.fontSize).toBe("var(--text-xs)");
    expect(el.style.fontWeight).toBe("var(--weight-semibold)");
    expect(el.style.letterSpacing).toBe("0.02em");
    expect(el.style.whiteSpace).toBe("nowrap");
    expect(el.style.gap).toBe("var(--space-2)");
  });

  it("renders an optional leading icon before the children", () => {
    const { container } = render(<Tag icon={<i data-icon="x" />}>Body</Tag>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.textContent).toBe("Body");
    expect(el.querySelector("[data-icon]")).not.toBeNull();
  });

  it("source is CSS-var-only: no raw hex anywhere in tag.tsx", () => {
    expect(SOURCE).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
  });
});
