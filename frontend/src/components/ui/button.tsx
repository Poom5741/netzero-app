import { ButtonHTMLAttributes, CSSProperties, forwardRef } from "react";

/**
 * T-209 — Button restyled to artifact geometry (admin-design-spec.md GAP B
 * "### Button", :909-940; artifact chunk components/core/Button.jsx lines
 * 354-428, TONES map line 300, SIZES map line 337).
 *
 * TONES (GAP B :911-924): primary bg --action-primary / fg --text-on-accent,
 * hover --action-primary-hover, active --action-primary-active; secondary
 * --action-secondary / --text-on-dark, hover --action-secondary-hover,
 * active --navy-950; outline transparent + border --border-default, fg
 * --text-heading, hover --navy-50, active --navy-100; ghost fg --text-accent,
 * hover --teal-50, active --teal-100; onDark rgba(255,255,255,.14) bg /
 * --text-on-dark fg / --border-on-dark border, hover rgba(255,255,255,.24),
 * active rgba(255,255,255,.3) (GAP B gives onDark as rgba literals — no
 * tokens exist for those steps, so they stay rgba here per R-006's GAP-B
 * rgba allowance). `danger` is NOT an artifact tone; it is kept for the
 * existing public API (consumers: admin/applications, admin-review) and is
 * rendered with the artifact status ink --status-danger + --text-on-accent,
 * no GAP B hover/active steps exist for it.
 *
 * SIZES (GAP B :926-934): sm h --control-height-sm px --space-4 fs --text-sm;
 * md h --control-height-md px --space-6 fs --text-base; lg h
 * --control-height-lg px --space-8 fs --text-md.
 *
 * Geometry (GAP B :936): inline-flex center, gap --space-2,
 * borderRadius --radius-control (999px pill; --radius-control is the
 * sponsor-artifact.json name, aliasing --radius-pill per Map C),
 * fontWeight --weight-semibold, letterSpacing 0.01em, cursor pointer,
 * --shadow-accent on primary hover, transform scale(--press-scale) on press,
 * transition var(--transition-control) + transform
 * var(--duration-instant) var(--ease-standard).
 *
 * Hover/active colours and the press scale are Tailwind arbitrary-var
 * utility classes (the established pattern from ui/data-table.tsx: an
 * inline background would override the hover class). Colours are artifact
 * CSS vars only (R-006: no raw hex in component source).
 */

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "onDark"
  | "danger";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

/** Static base geometry — GAP B :936. */
const baseStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "var(--space-2)",
  borderRadius: "var(--radius-control)",
  fontWeight: "var(--weight-semibold)",
  letterSpacing: "0.01em",
  cursor: "pointer",
  transition:
    "var(--transition-control), transform var(--duration-instant) var(--ease-standard)",
};

/**
 * TONE classes (GAP B :911-924). Background/colour live in classes so the
 * hover/active classes can override them (inline bg would win the cascade).
 */
const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--action-primary)] text-[var(--text-on-accent)] " +
    "hover:bg-[var(--action-primary-hover)] active:bg-[var(--action-primary-active)] " +
    "hover:shadow-[var(--shadow-accent)]",
  secondary:
    "bg-[var(--action-secondary)] text-[var(--text-on-dark)] " +
    "hover:bg-[var(--action-secondary-hover)] active:bg-[var(--navy-950)]",
  outline:
    "bg-transparent text-[var(--text-heading)] border border-[var(--border-default)] " +
    "hover:bg-[var(--navy-50)] active:bg-[var(--navy-100)]",
  ghost:
    "bg-transparent text-[var(--text-accent)] " +
    "hover:bg-[var(--teal-50)] active:bg-[var(--teal-100)]",
  onDark:
    "bg-[rgba(255,255,255,0.14)] text-[var(--text-on-dark)] border border-[var(--border-on-dark)] " +
    "hover:bg-[rgba(255,255,255,0.24)] active:bg-[rgba(255,255,255,0.3)]",
  danger:
    // API-compat tone — --status-danger is the artifact danger ink
    // (admin-artifact.json --status-danger); no GAP B hover steps exist for it.
    "bg-[var(--status-danger)] text-[var(--text-on-accent)]",
};

/** SIZE geometry (GAP B :926-934, SIZES map line 337). */
const sizeStyles: Record<ButtonSize, CSSProperties> = {
  sm: {
    height: "var(--control-height-sm)",
    padding: "0 var(--space-4)",
    fontSize: "var(--text-sm)",
  },
  md: {
    height: "var(--control-height-md)",
    padding: "0 var(--space-6)",
    fontSize: "var(--text-base)",
  },
  lg: {
    height: "var(--control-height-lg)",
    padding: "0 var(--space-8)",
    fontSize: "var(--text-md)",
  },
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, className = "", children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        style={{ ...baseStyle, ...sizeStyles[size] }}
        className={[
          "touch-target",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          // press scale — GAP B :936 transform scale(var(--press-scale))
          "active:[transform:scale(var(--press-scale))]",
          variantClasses[variant],
          className,
        ].join(" ")}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
