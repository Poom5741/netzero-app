import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FilterBar, type FilterSelect } from "../ui/filter-bar";

const HERE = dirname(fileURLToPath(import.meta.url));
const SOURCE = readFileSync(join(HERE, "../ui/filter-bar.tsx"), "utf8");

function makeFilter(overrides: Partial<FilterSelect> = {}): FilterSelect {
  return {
    name: "season",
    label: "Season",
    value: "",
    options: [
      { value: "", label: "All seasons" },
      { value: "2568", label: "Napi 2568" },
    ],
    onChange: () => {},
    ...overrides,
  };
}

describe("T-204 FilterBar (admin GAP B :986-989)", () => {
  it("wraps filters in a flex row: gap --space-3, wrap, center", () => {
    const { container } = render(<FilterBar filters={[makeFilter()]} />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.display).toBe("flex");
    expect(el.style.alignItems).toBe("center");
    expect(el.style.gap).toBe("var(--space-3)");
    expect(el.style.flexWrap).toBe("wrap");
  });

  it("filter box: minWidth 148px, 6px 14px padding, radius-md, white/shadow-xs when inactive", () => {
    const { container } = render(<FilterBar filters={[makeFilter()]} />);
    const box = container.querySelector("label") as HTMLElement;
    expect(box.style.minWidth).toBe("148px");
    expect(box.style.padding).toBe("6px 14px");
    expect(box.style.borderRadius).toBe("var(--radius-md)");
    expect(box.getAttribute("style")).toContain("border: 1px solid var(--border-subtle)");
    expect(box.style.background).toBe("var(--white)");
    expect(box.style.boxShadow).toBe("var(--shadow-xs)");
    expect(box.style.cursor).toBe("pointer");
  });

  it("active filter (non-empty value): accent border, accent-soft bg, no shadow, teal-800 select text", () => {
    const { container } = render(<FilterBar filters={[makeFilter({ value: "2568" })]} />);
    const box = container.querySelector("label") as HTMLElement;
    expect(box.getAttribute("style")).toContain("border: 1px solid var(--border-accent)");
    expect(box.style.background).toBe("var(--surface-accent-soft)");
    expect(box.style.boxShadow).toBe("none");
    const select = box.querySelector("select") as HTMLSelectElement;
    expect(select.style.color).toBe("var(--teal-800)");
  });

  it("inner select: borderless, transparent, font-sans text-sm semibold, heading colour when inactive", () => {
    const { container } = render(<FilterBar filters={[makeFilter()]} />);
    const select = container.querySelector("select") as HTMLSelectElement;
    expect(select.style.borderStyle).toBe("none");
    expect(select.style.background).toBe("transparent");
    expect(select.style.outline).toBe("none");
    expect(select.style.fontFamily).toBe("var(--font-sans)");
    expect(select.style.fontSize).toBe("var(--text-sm)");
    expect(select.style.fontWeight).toBe("var(--weight-semibold)");
    expect(select.style.color).toBe("var(--text-heading)");
  });

  it("changing the select flips the box to active and reports the value via onChange", () => {
    const onChange = vi.fn();
    const { container } = render(<FilterBar filters={[makeFilter({ onChange })]} />);
    const select = container.querySelector("select") as HTMLSelectElement;
    fireEvent.change(select, { target: { value: "2568" } });
    expect(onChange).toHaveBeenCalledWith("2568");
  });

  it("actions slot gets marginLeft auto; optional leading label uses the subtle label style", () => {
    const { container } = render(
      <FilterBar filters={[makeFilter()]} label="Filters" actions={<button type="button">Reset</button>} />
    );
    const wrapper = container.firstElementChild as HTMLElement;
    const actions = wrapper.lastElementChild as HTMLElement;
    expect(actions.tagName).toBe("DIV");
    expect(actions.style.marginLeft).toBe("auto");
    const lead = container.querySelector("div > span") as HTMLElement;
    expect(lead.textContent).toBe("Filters");
    expect(lead.style.fontSize).toBe("var(--text-xs)");
    expect(lead.style.fontWeight).toBe("var(--weight-semibold)");
    expect(lead.style.color).toBe("var(--text-subtle)");
  });

  it("source is CSS-var-only: no raw hex anywhere in filter-bar.tsx", () => {
    expect(SOURCE).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
  });
});
