"use client";

import type { CSSProperties, ReactNode } from "react";

/**
 * T-204 — FilterBar (artifact shared component).
 * Source of truth: admin-design-spec.md GAP B "### FilterBar" (:986-989,
 * artifact chunk lines 702-774): wrapper flex, align center, gap --space-3,
 * flexWrap wrap; per-filter label --text-xs semibold --text-subtle; each
 * filter is a label wrapping a select inside a box minWidth 148px, padding
 * 6px 14px, --radius-md, border active --border-accent else --border-subtle,
 * background active --surface-accent-soft else --white, boxShadow active
 * none else --shadow-xs, cursor pointer; inner select no border/bg/outline,
 * --font-sans --text-sm semibold, color active --teal-800 else
 * --text-heading; actions slot marginLeft auto. A filter is active when its
 * value is non-empty. Optional leading group label per Shared Component
 * Inventory (:517-523).
 * Colours are artifact CSS vars only (R-006).
 */

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterSelect {
  /** Stable key for the filter box (falls back to label). */
  name?: string;
  label: string;
  /** Current value; "" renders the inactive state. */
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
}

export interface FilterBarProps {
  filters: FilterSelect[];
  actions?: ReactNode;
  /** Optional leading group label (inventory :517). */
  label?: string;
  className?: string;
  style?: CSSProperties;
}

const filterLabelStyle = {
  fontSize: "var(--text-xs)",
  fontWeight: "var(--weight-semibold)",
  color: "var(--text-subtle)",
} as const;

export function FilterBar({ filters, actions, label, className, style }: FilterBarProps) {
  return (
    <div
      role="group"
      className={className}
      style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", flexWrap: "wrap", ...style }}
    >
      {label ? <span style={filterLabelStyle}>{label}</span> : null}
      {filters.map((f) => {
        const active = f.value !== "";
        return (
          <label
            key={f.name ?? f.label}
            style={{
              minWidth: "148px",
              padding: "6px 14px",
              borderRadius: "var(--radius-md)",
              border: "1px solid " + (active ? "var(--border-accent)" : "var(--border-subtle)"),
              background: active ? "var(--surface-accent-soft)" : "var(--white)",
              boxShadow: active ? "none" : "var(--shadow-xs)",
              cursor: "pointer",
            }}
          >
            <span style={filterLabelStyle}>{f.label}</span>
            <select
              name={f.name}
              value={f.value}
              onChange={(e) => f.onChange(e.target.value)}
              style={{
                border: "none",
                background: "transparent",
                outline: "none",
                fontFamily: "var(--font-sans)",
                fontSize: "var(--text-sm)",
                fontWeight: "var(--weight-semibold)",
                color: active ? "var(--teal-800)" : "var(--text-heading)",
              }}
            >
              {f.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        );
      })}
      {actions ? <div style={{ marginLeft: "auto" }}>{actions}</div> : null}
    </div>
  );
}
