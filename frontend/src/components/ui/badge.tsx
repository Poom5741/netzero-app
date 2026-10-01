import type { CSSProperties, ReactNode } from "react";

/**
 * T-201 — Badge (artifact shared component).
 * Source of truth: admin-design-spec.md GAP B "### Badge" (:941-953):
 * TONES map success/warning/danger/info/neutral (bg/fg/dot) + geometry
 * (inline-flex, gap --space-2, height 24px, padding 0 --space-3,
 * --radius-pill, --text-xs, --weight-semibold; 6x6px dot, --radius-circle).
 * Colours are artifact CSS vars only (R-006: no raw hex in component source).
 * The GAP B warning/danger fg values (two raw ink values, tabulated in the
 * globals.css token comment) carry no artifact token name; they are
 * referenced as --status-warning-strong / --status-danger-strong (landed
 * artifact-exact in globals.css).
 */

export type BadgeTone = "success" | "warning" | "danger" | "info" | "neutral";

export interface BadgeProps {
  tone?: BadgeTone;
  /** 6x6px status dot before the label (artifact default: true). */
  dot?: boolean;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

const BADGE_TONES: Record<BadgeTone, { bg: string; fg: string; dot: string }> = {
  success: { bg: "var(--status-success-soft)", fg: "var(--teal-800)", dot: "var(--status-success)" },
  warning: { bg: "var(--status-warning-soft)", fg: "var(--status-warning-strong)", dot: "var(--status-warning)" },
  danger: { bg: "var(--status-danger-soft)", fg: "var(--status-danger-strong)", dot: "var(--status-danger)" },
  info: { bg: "var(--status-info-soft)", fg: "var(--navy-800)", dot: "var(--status-info)" },
  neutral: { bg: "var(--grey-100)", fg: "var(--grey-700)", dot: "var(--grey-500)" },
};

export function Badge({ tone = "neutral", dot = true, children, className, style }: BadgeProps) {
  const t = BADGE_TONES[tone];
  return (
    <span
      data-tone={tone}
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--space-2)",
        height: "24px",
        padding: "0 var(--space-3)",
        borderRadius: "var(--radius-pill)",
        fontSize: "var(--text-xs)",
        fontWeight: "var(--weight-semibold)",
        background: t.bg,
        color: t.fg,
        ...style,
      }}
    >
      {dot ? (
        <span
          aria-hidden="true"
          style={{
            width: "6px",
            height: "6px",
            flex: "0 0 6px",
            borderRadius: "var(--radius-circle)",
            background: t.dot,
          }}
        />
      ) : null}
      {children}
    </span>
  );
}
