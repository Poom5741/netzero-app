import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge, type BadgeTone } from "../ui/badge";

const HERE = dirname(fileURLToPath(import.meta.url));
const SOURCE = readFileSync(join(HERE, "../ui/badge.tsx"), "utf8");

const TONES: Array<{ tone: BadgeTone; bg: string; fg: string; dot: string }> = [
  { tone: "success", bg: "var(--status-success-soft)", fg: "var(--teal-800)", dot: "var(--status-success)" },
  { tone: "warning", bg: "var(--status-warning-soft)", fg: "var(--status-warning-strong)", dot: "var(--status-warning)" },
  { tone: "danger", bg: "var(--status-danger-soft)", fg: "var(--status-danger-strong)", dot: "var(--status-danger)" },
  { tone: "info", bg: "var(--status-info-soft)", fg: "var(--navy-800)", dot: "var(--status-info)" },
  { tone: "neutral", bg: "var(--grey-100)", fg: "var(--grey-700)", dot: "var(--grey-500)" },
];

describe("T-201 Badge (admin GAP B :941-953)", () => {
  it("renders the five artifact tones with the exact bg/fg/dot vars", () => {
    for (const t of TONES) {
      const { container, unmount } = render(<Badge tone={t.tone}>S</Badge>);
      const el = container.firstElementChild as HTMLElement;
      const style = el.getAttribute("style") ?? "";
      expect(style).toContain("background: " + t.bg);
      expect(style).toContain("color: " + t.fg);
      expect(el.getAttribute("data-tone")).toBe(t.tone);
      const dotEl = el.firstElementChild as HTMLElement;
      expect(dotEl.getAttribute("style")).toContain("background: " + t.dot);
      unmount();
    }
  });

  it("expresses the artifact geometry: 24px pill, 0 --space-3 padding, --text-xs semibold", () => {
    const { container } = render(<Badge>Height</Badge>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.height).toBe("24px");
    expect(el.style.padding).toBe("0 var(--space-3)");
    expect(el.style.borderRadius).toBe("var(--radius-pill)");
    expect(el.style.fontSize).toBe("var(--text-xs)");
    expect(el.style.fontWeight).toBe("var(--weight-semibold)");
    expect(el.style.gap).toBe("var(--space-2)");
    expect(el.style.display).toBe("inline-flex");
  });

  it("renders a 6px --radius-circle dot by default and omits it when dot is false", () => {
    const on = render(<Badge>D</Badge>);
    const dotEl = (on.container.firstElementChild as HTMLElement).firstElementChild as HTMLElement;
    expect(dotEl.style.width).toBe("6px");
    expect(dotEl.style.height).toBe("6px");
    expect(dotEl.style.borderRadius).toBe("var(--radius-circle)");
    on.unmount();
    const off = render(<Badge dot={false}>D</Badge>);
    const el = off.container.firstElementChild as HTMLElement;
    expect(el.textContent).toBe("D");
    expect(el.children.length).toBe(0);
  });

  it("source is CSS-var-only: no raw hex; warning/danger fg use the GAP B ink aliases", () => {
    expect(SOURCE).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(SOURCE).toContain("var(--status-warning-strong)");
    expect(SOURCE).toContain("var(--status-danger-strong)");
  });
});
