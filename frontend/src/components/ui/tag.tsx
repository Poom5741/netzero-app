import type { CSSProperties, ReactNode } from "react";

/**
 * T-202 — Tag (artifact shared component).
 * Source of truth: admin-design-spec.md GAP B "### Tag" (:954-966):
 * TONES map teal/navy/neutral/solid/onDark (bg/fg/bd) + geometry
 * (inline-flex, gap --space-2, height 28px, padding 0 --space-3,
 * --radius-pill, --text-xs, --weight-semibold, letterSpacing 0.02em,
 * border 1px solid t.bd, whiteSpace nowrap).
 * Colours are artifact CSS vars only (R-006). The onDark bg
 * rgba(255,255,255,.12) is the artifact literal (GAP B :961) — no token
 * exists for it and it contains no hex literal.
 * Optional leading icon prop per Shared Component Inventory (:558-561).
 */

export type TagTone = "teal" | "navy" | "neutral" | "solid" | "onDark";

export interface TagProps {
  tone?: TagTone;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

const TAG_TONES: Record<TagTone, { bg: string; fg: string; bd: string }> = {
  teal: { bg: "var(--teal-50)", fg: "var(--teal-800)", bd: "var(--teal-200)" },
  navy: { bg: "var(--navy-50)", fg: "var(--navy-800)", bd: "var(--navy-200)" },
  neutral: { bg: "var(--grey-100)", fg: "var(--grey-700)", bd: "var(--grey-200)" },
  solid: { bg: "var(--teal-600)", fg: "var(--white)", bd: "transparent" },
  onDark: { bg: "rgba(255,255,255,.12)", fg: "var(--white)", bd: "var(--border-on-dark)" },
};

export function Tag({ tone = "neutral", icon, children, className, style }: TagProps) {
  const t = TAG_TONES[tone];
  return (
    <span
      data-tone={tone}
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--space-2)",
        height: "28px",
        padding: "0 var(--space-3)",
        borderRadius: "var(--radius-pill)",
        fontSize: "var(--text-xs)",
        fontWeight: "var(--weight-semibold)",
        letterSpacing: "0.02em",
        border: "1px solid " + t.bd,
        whiteSpace: "nowrap",
        background: t.bg,
        color: t.fg,
        ...style,
      }}
    >
      {icon ? <span aria-hidden="true" style={{ display: "inline-flex" }}>{icon}</span> : null}
      {children}
    </span>
  );
}
