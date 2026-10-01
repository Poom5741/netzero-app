import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DataTable, type TableColumn, type TableRowData } from "../ui/data-table";

const HERE = dirname(fileURLToPath(import.meta.url));
const SOURCE = readFileSync(join(HERE, "../ui/data-table.tsx"), "utf8");

const COLS: TableColumn[] = [
  { key: "name", header: "Name" },
  { key: "tons", header: "tCO2e", align: "right" },
];

const ROWS = [
  { name: "CPA1001", tons: "8.65" },
  { name: "CPA1002", tons: "3.89" },
];

describe("T-203 DataTable (admin GAP B :982-985)", () => {
  it("wraps the table in the artifact container: border-subtle, --radius-card, surface-card", () => {
    const { container } = render(<DataTable columns={COLS} rows={ROWS} />);
    const box = container.firstElementChild as HTMLElement;
    const style = box.getAttribute("style") ?? "";
    expect(style).toContain("border: 1px solid var(--border-subtle)");
    expect(style).toContain("border-radius: var(--radius-card)");
    expect(style).toContain("background: var(--surface-card)");
    expect(style).toContain("overflow: hidden");
    const table = box.firstElementChild as HTMLElement;
    expect(table.style.width).toBe("100%");
    expect(table.style.borderCollapse).toBe("collapse");
    expect(table.style.fontSize).toBe("var(--text-sm)");
  });

  it("th uses grey-50 bg, 11px 14px padding, text-xs semibold muted, subtle underline, nowrap", () => {
    const { container } = render(<DataTable columns={COLS} rows={ROWS} />);
    const ths = container.querySelectorAll("th");
    const th = ths[0] as HTMLElement;
    expect(th.getAttribute("style")).toContain("background: var(--grey-50)");
    expect(th.style.padding).toBe("11px 14px");
    expect(th.style.fontSize).toBe("var(--text-xs)");
    expect(th.style.fontWeight).toBe("var(--weight-semibold)");
    expect(th.style.color).toBe("var(--text-muted)");
    expect(th.style.borderBottom).toBe("1px solid var(--border-subtle)");
    expect(th.style.whiteSpace).toBe("nowrap");
    expect(th.style.textAlign).toBe("left");
    expect((ths[1] as HTMLElement).style.textAlign).toBe("right");
  });

  it("dense flag switches cell padding to 8px 12px in th and td", () => {
    const { container } = render(<DataTable columns={COLS} rows={ROWS} dense />);
    const th = container.querySelector("th") as HTMLElement;
    const td = container.querySelector("td") as HTMLElement;
    expect(th.style.padding).toBe("8px 12px");
    expect(td.style.padding).toBe("8px 12px");
  });

  it("td borders: grey-100 between rows, none on the last; body colour; tabular-nums on right columns", () => {
    const { container } = render(<DataTable columns={COLS} rows={ROWS} />);
    const tds = container.querySelectorAll("td");
    expect((tds[0] as HTMLElement).style.borderBottom).toBe("1px solid var(--grey-100)");
    expect((tds[2] as HTMLElement).style.borderBottomStyle).toBe("none");
    expect((tds[0] as HTMLElement).style.color).toBe("var(--text-body)");
    expect((tds[0] as HTMLElement).style.fontVariantNumeric).toBe("normal");
    expect((tds[1] as HTMLElement).style.fontVariantNumeric).toBe("tabular-nums");
  });

  it("rows: white bg class; onRowClick adds pointer + navy-50 hover class and fires with (row, index)", () => {
    const onRowClick = vi.fn();
    const clickable = render(<DataTable columns={COLS} rows={ROWS} onRowClick={onRowClick} />);
    const row = clickable.container.querySelector("tbody tr") as HTMLElement;
    expect(row.className).toContain("bg-[var(--white)]");
    expect(row.className).toContain("cursor-pointer");
    expect(row.className).toContain("hover:bg-[var(--navy-50)]");
    fireEvent.click(row);
    expect(onRowClick).toHaveBeenCalledWith(ROWS[0], 0);
    clickable.unmount();

    const plain = render(<DataTable columns={COLS} rows={ROWS} />);
    const staticRow = plain.container.querySelector("tbody tr") as HTMLElement;
    expect(staticRow.className).toContain("cursor-default");
    expect(staticRow.className).not.toContain("cursor-pointer");
  });

  it("rowKey provides stable React keys (source passes rowKey through)", () => {
    const rowKey = vi.fn((row: TableRowData) => String(row.name));
    render(<DataTable columns={COLS} rows={ROWS} rowKey={rowKey} />);
    expect(rowKey).toHaveBeenCalledTimes(2);
  });

  it("source is CSS-var-only: no raw hex; hover colour is a var utility class", () => {
    expect(SOURCE).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(SOURCE).toContain("hover:bg-[var(--navy-50)]");
  });
});
