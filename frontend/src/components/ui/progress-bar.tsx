import type { CSSProperties } from "react";

/**
 * T-205 — ProgressBar (artifact shared component).
 * Source of truth: admin-design-spec.md GAP B "### ProgressBar" (:994-999,
 * artifact chunk lines 775-839; props tuple + 9px default + fills + pill
 * radius per catalog :602-608): container flex, align center, gap --space-4;
 * label flex 0 0 132px, --text-xs, --text-muted; track flex 1, height prop
 * (default 9px), bg --grey-100 (GAP B value — the :607 catalog line says
 * --grey-200; GAP B is the designated geometry source of truth), pill
 * radius, overflow hidden; fill width pct%, height 100%, tone fill, pill
 * radius, transition width --duration-slow --ease-out; value label flex
 * 0 0 76px, right-aligned, --text-sm semibold --text-heading,
 * tabular-nums. Label/value slots render only when the props are provided.
 * Colours are artifact CSS vars only (R-006).
 */

export type ProgressBarTone = "teal" | "mint" | "navy" | "grey" | "warn";

export interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  valueLabel?: string;
  tone?: ProgressBarTone;
  height?: number | string;
  className?: string;
  style?: CSSProperties;
}

const PROGRESS_FILLS: Record<ProgressBarTone, string> = {
  teal: "var(--teal-600)",
  mint: "var(--teal-400)",
  navy: "var(--navy-700)",
  grey: "var(--grey-300)",
  warn: "var(--status-warning)",
};

export function ProgressBar({
  value,
  max = 100,
  label,
  valueLabel,
  tone = "teal",
  height = 9,
  className,
  style,
}: ProgressBarProps) {
  const pct = max === 0 ? 0 : Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-label={label}
      className={className}
      style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", ...style }}
    >
      {label !== undefined ? (
        <span style={{ flex: "0 0 132px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
          {label}
        </span>
      ) : null}
      <span
        style={{
          flex: 1,
          height,
          background: "var(--grey-100)",
          borderRadius: "var(--radius-pill)",
          overflow: "hidden",
        }}
      >
        <span
          style={{
            display: "block",
            width: pct + "%",
            height: "100%",
            background: PROGRESS_FILLS[tone],
            borderRadius: "var(--radius-pill)",
            transition: "width var(--duration-slow) var(--ease-out)",
          }}
        />
      </span>
      {valueLabel !== undefined ? (
        <span
          style={{
            flex: "0 0 76px",
            textAlign: "right",
            fontSize: "var(--text-sm)",
            fontWeight: "var(--weight-semibold)",
            color: "var(--text-heading)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {valueLabel}
        </span>
      ) : null}
    </div>
  );
}
