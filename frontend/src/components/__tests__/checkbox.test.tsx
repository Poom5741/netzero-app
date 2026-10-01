import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Checkbox } from "../ui/checkbox";

const HERE = dirname(fileURLToPath(import.meta.url));
const SOURCE = readFileSync(join(HERE, "../ui/checkbox.tsx"), "utf8");

function boxOf(container: HTMLElement): HTMLElement {
  return container.querySelector("span[aria-hidden]") as HTMLElement;
}

describe("T-206 Checkbox (admin GAP B :1000-1003)", () => {
  it("wrapper: inline-flex, gap --space-3, pointer cursor when enabled", () => {
    const { container } = render(<Checkbox label="Approve" />);
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.display).toBe("inline-flex");
    expect(wrapper.style.alignItems).toBe("center");
    expect(wrapper.style.gap).toBe("var(--space-3)");
    expect(wrapper.style.cursor).toBe("pointer");
    expect(wrapper.style.opacity).toBe("1");
  });

  it("disabled: opacity 0.55 and not-allowed cursor (GAP B values, not the 16px/0.5 inventory summary)", () => {
    const { container } = render(<Checkbox label="Approve" disabled />);
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.opacity).toBe("0.55");
    expect(wrapper.style.cursor).toBe("not-allowed");
    expect((container.querySelector("input") as HTMLInputElement).disabled).toBe(true);
  });

  it("visual box: 20px square, radius-xs, subtle border + white fill when off", () => {
    const { container } = render(<Checkbox label="X" />);
    const box = boxOf(container);
    expect(box.style.width).toBe("20px");
    expect(box.style.height).toBe("20px");
    expect(box.style.flex).toBe("0 0 20px");
    expect(box.style.borderRadius).toBe("var(--radius-xs)");
    expect(box.getAttribute("style")).toContain("border: 1px solid var(--border-default)");
    expect(box.style.background).toBe("var(--white)");
  });

  it("checked state: teal-600 border and fill, white checkmark at 13px", () => {
    const { container } = render(<Checkbox label="X" defaultChecked />);
    const box = boxOf(container);
    expect(box.getAttribute("style")).toContain("border: 1px solid var(--teal-600)");
    expect(box.style.background).toBe("var(--teal-600)");
    expect(box.style.color).toBe("var(--white)");
    expect(box.style.fontSize).toBe("13px");
    expect(box.textContent).toContain("✓");
  });

  it("input is visually hidden (absolute, opacity 0, 0x0) but remains the real control", () => {
    const { container } = render(<Checkbox label="X" />);
    const input = container.querySelector("input") as HTMLInputElement;
    const style = input.getAttribute("style") ?? "";
    expect(style).toContain("position: absolute");
    expect(style).toContain("opacity: 0");
    expect(style).toContain("width: 0px");
    expect(style).toContain("height: 0px");
  });

  it("clicking toggles an uncontrolled checkbox and reports each state via onChange", () => {
    const onChange = vi.fn();
    const { container } = render(<Checkbox label="X" onChange={onChange} />);
    const input = container.querySelector("input") as HTMLInputElement;
    fireEvent.click(input);
    expect(onChange).toHaveBeenNthCalledWith(1, true);
    expect(boxOf(container).style.background).toBe("var(--teal-600)");
    fireEvent.click(input);
    expect(onChange).toHaveBeenNthCalledWith(2, false);
    expect(boxOf(container).style.background).toBe("var(--white)");
  });

  it("controlled checked=true renders on without internal state drift", () => {
    const { container } = render(<Checkbox label="X" checked />);
    expect((container.querySelector("input") as HTMLInputElement).checked).toBe(true);
    expect(boxOf(container).textContent).toContain("✓");
  });

  it("label text uses text-sm body colour; source is CSS-var-only (no raw hex)", () => {
    const { container } = render(<Checkbox label="X" />);
    const label = container.querySelector("label > span:last-child") as HTMLElement;
    expect(label.style.fontSize).toBe("var(--text-sm)");
    expect(label.style.color).toBe("var(--text-body)");
    expect(SOURCE).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
  });
});
