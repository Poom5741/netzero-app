"use client";

import type { CSSProperties, ReactNode } from "react";

/**
 * T-203 — DataTable (artifact shared component).
 * Source of truth: admin-design-spec.md GAP B "### DataTable" (:982-985,
 * artifact chunk lines 638-701): container border 1px solid --border-subtle,
 * --radius-card, overflow hidden, bg --surface-card; table width 100%,
 * borderCollapse collapse, --text-sm; th bg --grey-50, padding dense 8px 12px
 * / normal 11px 14px, --text-xs semibold --text-muted, borderBottom
 * --border-subtle, nowrap, textAlign from column; tr cursor per onRowClick,
 * bg --white, hover bg --navy-50 (Tailwind arbitrary-var utility classes —
 * an inline background would override the hover); td padding as th,
 * borderBottom none on last row else 1px solid --grey-100, color --text-body,
 * fontVariantNumeric tabular-nums on right-aligned columns.
 * Colours are artifact CSS vars only (R-006).
 * Note: GAP B states textAlign for th; td mirrors the column alignment so
 * tabular-nums numerals align under their headers (noted in report).
 */

export type TableColumnAlign = "left" | "center" | "right";

export interface TableColumn {
  key: string;
  header: ReactNode;
  align?: TableColumnAlign;
  width?: number | string;
}

export type TableRowData = Record<string, ReactNode>;

export interface DataTableProps {
  columns: TableColumn[];
  rows: TableRowData[];
  rowKey?: (row: TableRowData, index: number) => string;
  onRowClick?: (row: TableRowData, index: number) => void;
  dense?: boolean;
  className?: string;
  style?: CSSProperties;
}

const cellPadding = (dense: boolean): string => (dense ? "8px 12px" : "11px 14px");

export function DataTable({ columns, rows, rowKey, onRowClick, dense = false, className, style }: DataTableProps) {
  const padding = cellPadding(dense);
  return (
    <div
      className={className}
      style={{
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-card)",
        overflow: "hidden",
        background: "var(--surface-card)",
        ...style,
      }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--text-sm)" }}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                style={{
                  textAlign: col.align ?? "left",
                  background: "var(--grey-50)",
                  padding,
                  fontSize: "var(--text-xs)",
                  fontWeight: "var(--weight-semibold)",
                  color: "var(--text-muted)",
                  borderBottom: "1px solid var(--border-subtle)",
                  whiteSpace: "nowrap",
                  width: col.width,
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={rowKey ? rowKey(row, i) : i}
              onClick={onRowClick ? () => onRowClick(row, i) : undefined}
              className={
                "bg-[var(--white)] " +
                (onRowClick ? "cursor-pointer hover:bg-[var(--navy-50)]" : "cursor-default")
              }
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  style={{
                    padding,
                    borderBottom: i === rows.length - 1 ? "none" : "1px solid var(--grey-100)",
                    color: "var(--text-body)",
                    textAlign: col.align ?? "left",
                    fontVariantNumeric: col.align === "right" ? "tabular-nums" : "normal",
                  }}
                >
                  {row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
