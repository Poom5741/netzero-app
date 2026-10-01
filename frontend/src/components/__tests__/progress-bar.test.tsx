import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProgressBar, type ProgressBarTone } from "../ui/progress-bar";

const HERE = dirname(fileURLToPath(import.meta.url));
const SOURCE = readFileSync(join(HERE, "../ui/progress-bar.tsx"), "utf8");

const FILLS: Array<[ProgressBarTone, string]> = [
  ["teal", "var(--teal-600)"],
  ["mint", "var(--teal-400)"],
  ["navy", "var(--navy-700)"],
  ["grey", "var(--grey-300)"],
  ["warn", "var(--status-warning)"],
];

describe("T-205 ProgressBar (admin GAP B :994-999)", () => {
  it("implements the five artifact fill colours exactly", () => {
    for (const [tone, fill] of FILLS) {
      const { container, unmount } = render(<ProgressBar value={50} tone={tone} />);
      const track = container.firstElementChild?.firstElementChild as HTMLElement;
      const fillEl = track.firstElementChild as HTMLElement;
      expect(fillEl.getAttribute("style")).toContain("background: " + fill);
      unmount();
    }
  });

  it("row geometry: gap --space-4; 132px text-xs muted label; 76px right-aligned semibold tabular value", () => {
    const { container } = render(
      <ProgressBar value={25} label="Verified" valueLabel="25%" />
    );
    const row = container.firstElementChild as HTMLElement;
    expect(row.style.display).toBe("flex");
    expect(row.style.alignItems).toBe("center");
    expect(row.style.gap).toBe("var(--space-4)");
    const label = row.children[0] as HTMLElement;
    expect(label.style.flex).toBe("0 0 132px");
    expect(label.style.fontSize).toBe("var(--text-xs)");
    expect(label.style.color).toBe("var(--text-muted)");
    const value = row.children[2] as HTMLElement;
    expect(value.style.flex).toBe("0 0 76px");
    expect(value.style.textAlign).toBe("right");
    expect(value.style.fontSize).toBe("var(--text-sm)");
    expect(value.style.fontWeight).toBe("var(--weight-semibold)");
    expect(value.style.color).toBe("var(--text-heading)");
    expect(value.style.fontVariantNumeric).toBe("tabular-nums");
  });

  it("track: flex 1, 9px default height, grey-100 bg, pill radius, hidden overflow", () => {
    const { container } = render(<ProgressBar value={25} />);
    const track = container.firstElementChild?.firstElementChild as HTMLElement;
    expect(track.style.flex).toBe("1 1 0%"); // jsdom expands the flex shorthand
    expect(track.style.height).toBe("9px");
    expect(track.style.background).toBe("var(--grey-100)");
    expect(track.style.borderRadius).toBe("var(--radius-pill)");
    expect(track.style.overflow).toBe("hidden");
  });

  it("fill: percentage width, full height, pill radius, slow ease-out width transition; height prop overrides track", () => {
    const { container } = render(<ProgressBar value={25} max={100} />);
    const track = container.firstElementChild?.firstElementChild as HTMLElement;
    const fill = track.firstElementChild as HTMLElement;
    expect(fill.style.width).toBe("25%");
    expect(fill.style.height).toBe("100%");
    expect(fill.style.borderRadius).toBe("var(--radius-pill)");
    expect(fill.style.transition).toBe("width var(--duration-slow) var(--ease-out)");

    const tall = render(<ProgressBar value={250} max={100} height={14} />);
    const tallTrack = (tall.container.firstElementChild as HTMLElement).firstElementChild as HTMLElement;
    expect(tallTrack.style.height).toBe("14px");
    expect(((tallTrack.firstElementChild) as HTMLElement).style.width).toBe("100%");
  });

  it("label and value slots render only when provided (aria mirrors the label)", () => {
    const bare = render(<ProgressBar value={10} />);
    const bareRow = bare.container.firstElementChild as HTMLElement;
    expect(bareRow.children.length).toBe(1);
    bare.unmount();
    const labelled = render(<ProgressBar value={10} label="ER" />);
    expect(labelled.container.firstElementChild?.getAttribute("aria-label")).toBe("ER");
  });

  it("source is CSS-var-only: no raw hex anywhere in progress-bar.tsx", () => {
    expect(SOURCE).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(SOURCE).toContain("var(--teal-400)");
  });
});
