import type { CSSProperties } from "react";

/**
 * T-208 — GradientRule (artifact brand component).
 * Source of truth: admin-design-spec.md Shared Component Inventory
 * "### GradientRule" (:609-611) + sponsor-design-spec.md:383-386:
 * background var(--gradient-rule); borderRadius var(--radius-pill); props
 * width (default 72), thickness (default 3), orientation
 * horizontal|vertical; vertical orientation swaps the two dimensions and
 * rotates the 90deg gradient to vertical (transform rotate(90deg), which
 * keeps the background on the --gradient-rule token). Usage evidence:
 * sponsor :458 width=120, sponsor :523 width="100%" thickness=2 (so width
 * accepts number or string). Decorative: aria-hidden.
 * Colours are artifact CSS vars only (R-006).
 */

export interface GradientRuleProps {
  width?: number | string;
  thickness?: number | string;
  orientation?: "horizontal" | "vertical";
  className?: string;
  style?: CSSProperties;
}

export function GradientRule({
  width = 72,
  thickness = 3,
  orientation = "horizontal",
  className,
  style,
}: GradientRuleProps) {
  const vertical = orientation === "vertical";
  return (
    <div
      aria-hidden="true"
      className={className}
      style={{
        width: vertical ? thickness : width,
        height: vertical ? width : thickness,
        background: "var(--gradient-rule)",
        borderRadius: "var(--radius-pill)",
        transform: vertical ? "rotate(90deg)" : undefined,
        ...style,
      }}
    />
  );
}
