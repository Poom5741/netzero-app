import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Field } from "../ui/field";

const HERE = dirname(fileURLToPath(import.meta.url));
const SOURCE = readFileSync(join(HERE, "../ui/field.tsx"), "utf8");

describe("T-207 Field (admin GAP B :1004-1007)", () => {
  it("wrapper: flex column with --space-2 gap", () => {
    const { container } = render(
      <Field label="Plot size">
        <input aria-label="plot" />
      </Field>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.display).toBe("flex");
    expect(el.style.flexDirection).toBe("column");
    expect(el.style.gap).toBe("var(--space-2)");
  });

  it("label: text-sm semibold heading colour; htmlFor wires to the control", () => {
    const { container } = render(
      <Field label="Plot size" htmlFor="plot-input">
        <input id="plot-input" aria-label="plot" />
      </Field>,
    );
    const label = container.querySelector("label") as HTMLLabelElement;
    expect(label.htmlFor).toBe("plot-input");
    expect(label.style.fontSize).toBe("var(--text-sm)");
    expect(label.style.fontWeight).toBe("var(--weight-semibold)");
    expect(label.style.color).toBe("var(--text-heading)");
  });

  it("required flag renders the danger asterisk with 4px left margin", () => {
    const { container } = render(
      <Field label="ER amount" required>
        <input aria-label="er" />
      </Field>,
    );
    const star = container.querySelector("label span") as HTMLElement;
    expect(star.textContent).toBe("*");
    expect(star.style.color).toBe("var(--status-danger)");
    expect(star.style.marginLeft).toBe("4px");
  });

  it("error renders as an alert with text-xs danger colour, before hint", () => {
    const { container } = render(
      <Field label="ER amount" error="Required" hint="tonnes CO2e">
        <input aria-label="er" />
      </Field>,
    );
    const err = container.querySelector("[role=alert]") as HTMLElement;
    expect(err.textContent).toBe("Required");
    expect(err.style.fontSize).toBe("var(--text-xs)");
    expect(err.style.color).toBe("var(--status-danger)");
    const hint = err.nextElementSibling as HTMLElement;
    expect(hint.textContent).toBe("tonnes CO2e");
    expect(hint.style.fontSize).toBe("var(--text-xs)");
    expect(hint.style.color).toBe("var(--text-subtle)");
  });

  it("hint alone renders without an error node; no label rendered when label omitted", () => {
    const solo = render(
      <Field hint="tonnes CO2e">
        <input aria-label="er" />
      </Field>,
    );
    expect(solo.container.querySelector("label")).toBeNull();
    expect(solo.container.querySelector("[role=alert]")).toBeNull();
    expect(solo.container.textContent).toContain("tonnes CO2e");
  });

  it("source is CSS-var-only: no raw hex anywhere in field.tsx", () => {
    expect(SOURCE).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
  });
});
