"use client";

import { useState } from "react";
import type { CSSProperties, ReactNode } from "react";

/**
 * T-206 — Checkbox (artifact shared component).
 * Source of truth: admin-design-spec.md GAP B "### Checkbox" (:1000-1003,
 * artifact chunk lines 912-975): wrapper inline-flex, align center, gap
 * --space-3, cursor not-allowed when disabled else pointer, opacity 0.55
 * when disabled else 1; input visually hidden (absolute, opacity 0, 0x0);
 * visual box 20px (flex 0 0 20px), --radius-xs (4px), border 1px solid
 * on --teal-600 else --border-default, background on --teal-600 else
 * --white, checkmark white via var(--white) (R-006), fontSize
 * 13px, transition --transition-control; label text --text-sm --text-body.
 * The GAP B border shorthand omits width/style; 1px solid is used (noted).
 * Props checked/defaultChecked/disabled/onChange per inventory (:584-589);
 * GAP B geometry (20px / 0.55) supersedes the inventory summary (16px / 0.5).
 */

export interface CheckboxProps {
  label?: ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
  style?: CSSProperties;
}

export function Checkbox({
  label,
  checked,
  defaultChecked = false,
  disabled = false,
  onChange,
  className,
  style,
}: CheckboxProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultChecked);
  const isControlled = checked !== undefined;
  const on = isControlled ? checked : uncontrolled;
  return (
    <label
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--space-3)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.55 : 1,
        ...style,
      }}
    >
      <input
        type="checkbox"
        checked={isControlled ? checked : undefined}
        defaultChecked={isControlled ? undefined : defaultChecked}
        disabled={disabled}
        onChange={(e) => {
          if (!isControlled) setUncontrolled(e.target.checked);
          if (onChange) onChange(e.target.checked);
        }}
        style={{ position: "absolute", opacity: 0, width: 0, height: 0 }}
      />
      <span
        aria-hidden="true"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "20px",
          height: "20px",
          flex: "0 0 20px",
          borderRadius: "var(--radius-xs)",
          border: "1px solid " + (on ? "var(--teal-600)" : "var(--border-default)"),
          background: on ? "var(--teal-600)" : "var(--white)",
          color: "var(--white)",
          fontSize: "13px",
          transition: "var(--transition-control)",
        }}
      >
        {on ? "✓" : ""}
      </span>
      {label ? (
        <span style={{ fontSize: "var(--text-sm)", color: "var(--text-body)" }}>{label}</span>
      ) : null}
    </label>
  );
}
