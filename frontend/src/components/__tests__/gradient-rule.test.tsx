import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GradientRule } from "../ui/gradient-rule";

const HERE = dirname(fileURLToPath(import.meta.url));
const SOURCE = readFileSync(join(HERE, "../ui/gradient-rule.tsx"), "utf8");

describe("T-208 GradientRule (admin :609-611; sponsor :383-386)", () => {
  it("defaults: 72px wide, 3px thick, --gradient-rule background, pill radius", () => {
    const { container } = render(<GradientRule />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.width).toBe("72px");
    expect(el.style.height).toBe("3px");
    expect(el.style.background).toBe("var(--gradient-rule)");
    expect(el.style.borderRadius).toBe("var(--radius-pill)");
  });

  it("width/thickness props: number px and string percentages (sponsor uses width 120 and 100 percent)", () => {
    const px = render(<GradientRule width={120} thickness={2} />);
    const pxEl = px.container.firstElementChild as HTMLElement;
    expect(pxEl.style.width).toBe("120px");
    expect(pxEl.style.height).toBe("2px");
    px.unmount();
    const full = render(<GradientRule width="100%" thickness={2} />);
    const fullEl = full.container.firstElementChild as HTMLElement;
    expect(fullEl.style.width).toBe("100%");
  });

  it("vertical orientation swaps dimensions and rotates the gradient to vertical", () => {
    const { container } = render(<GradientRule orientation="vertical" />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.width).toBe("3px");
    expect(el.style.height).toBe("72px");
    expect(el.style.transform).toBe("rotate(90deg)");
    expect(el.style.background).toBe("var(--gradient-rule)");
  });

  it("decorative (aria-hidden) and CSS-var-only source", () => {
    const { container } = render(<GradientRule />);
    expect(container.firstElementChild?.getAttribute("aria-hidden")).toBe("true");
    expect(SOURCE).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
  });
});
