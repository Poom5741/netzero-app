import type { ReactNode } from "react";

/**
 * T-207 — Field (artifact shared component).
 * Source of truth: admin-design-spec.md GAP B "### Field" (:1004-1007,
 * artifact chunk lines 976-1023): wrapper flex, flexDirection column, gap
 * --space-2; label --text-sm semibold --text-heading; required asterisk
 * colour --status-danger, marginLeft 4px; error text --text-xs
 * --status-danger; hint --text-xs --text-subtle.
 * Props label/htmlFor/required/error/hint/children per inventory (:568-573).
 * Colours are artifact CSS vars only (R-006).
 */

export interface FieldProps {
  label?: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}

export function Field({ label, htmlFor, required = false, error, hint, children, className }: FieldProps) {
  return (
    <div className={className} style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
      {label ? (
        <label
          htmlFor={htmlFor}
          style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)", color: "var(--text-heading)" }}
        >
          {label}
          {required ? (
            <span aria-hidden="true" style={{ color: "var(--status-danger)", marginLeft: "4px" }}>
              *
            </span>
          ) : null}
        </label>
      ) : null}
      {children}
      {error ? (
        <span role="alert" style={{ fontSize: "var(--text-xs)", color: "var(--status-danger)" }}>
          {error}
        </span>
      ) : null}
      {hint ? (
        <span style={{ fontSize: "var(--text-xs)", color: "var(--text-subtle)" }}>{hint}</span>
      ) : null}
    </div>
  );
}
