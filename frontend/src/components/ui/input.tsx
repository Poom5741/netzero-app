import { InputHTMLAttributes, CSSProperties, forwardRef, useId } from "react";

/**
 * T-210 — Input restyled to artifact geometry (admin-design-spec.md GAP B
 * "### Input", :1023-1063; artifact chunk components/forms/Input.jsx):
 * width 100%, height --field-height (46px), padding 0 --space-4,
 * fontFamily --font-sans, fontSize --text-base, color --text-body,
 * background --white, border invalid ? --status-danger : focus ?
 * --border-accent : --border-default, borderRadius --radius-field (8px,
 * sponsor-artifact.json alias for --radius-sm), boxShadow focus ?
 * --focus-ring : none (GAP B prose names the token "--ring-focus"; the
 * token set defines the identical value as --focus-ring, which is what
 * Map C landed — T1-CTL-05), outline none, transition
 * --transition-control.
 *
 * Border/box-shadow states are Tailwind arbitrary-var utility classes (the
 * ui/data-table.tsx pattern — inline values would override state classes);
 * invalid wins the border over focus per the GAP B ternary. Public API is
 * unchanged: label?, error?, all InputHTMLAttributes, forwardRef, aria
 * wiring. Label/error inks follow the artifact Field (GAP B :1004-1007):
 * label --text-sm semibold --text-heading, error --text-xs
 * --status-danger. Colours are artifact CSS vars only (R-006).
 */

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const inputStyle: CSSProperties = {
  height: "var(--field-height)",
  padding: "0 var(--space-4)",
  fontFamily: "var(--font-sans)",
  fontSize: "var(--text-base)",
  transition: "var(--transition-control)",
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    const autoId = useId();
    const inputId = id || autoId;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block mb-1"
            style={{
              fontSize: "var(--text-sm)",
              fontWeight: "var(--weight-semibold)",
              color: "var(--text-heading)",
            }}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-describedby={error ? `${inputId}-error` : undefined}
          aria-invalid={error ? true : undefined}
          style={inputStyle}
          className={[
            "w-full",
            // retained a11y floor (44px) — sits under the 46px --field-height
            "touch-target",
            "bg-[var(--white)]",
            "text-[var(--text-body)]",
            "placeholder:text-[var(--text-subtle)]",
            "border rounded-[var(--radius-field)]",
            error
              ? "border-[var(--status-danger)] focus:border-[var(--status-danger)]"
              : "border-[var(--border-default)] focus:border-[var(--border-accent)]",
            "focus:outline-none focus:shadow-[var(--focus-ring)]",
            className,
          ].join(" ")}
          {...props}
        />
        {error && (
          <p
            id={`${inputId}-error`}
            className="mt-1"
            role="alert"
            style={{ fontSize: "var(--text-xs)", color: "var(--status-danger)" }}
          >
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
