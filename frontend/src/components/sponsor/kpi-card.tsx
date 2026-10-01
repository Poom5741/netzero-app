"use client";

import { CSSProperties } from "react";
import { formatWithCommas } from "@/lib/sponsor";

/**
 * T-210 — KpiCard restyled to artifact StatTile geometry
 * (admin-design-spec.md GAP B "### StatTile", :840-912; artifact chunk
 * components/data/StatTile.jsx).
 *
 * Container: bg tone==="dark" ? --surface-inverse : --surface-card; border
 * 1px solid tone==="dark" ? --border-on-dark : --border-subtle; radius
 * --radius-card; padding --space-5 --space-6; flex column gap --space-2.
 * Label: --text-sm semibold, dark -> --teal-300 else --text-heading.
 * Value: 48px light, line-height 1, letter-spacing --tracking-display,
 * tabular-nums, dark -> --white else --text-heading; unit + note beside /
 * below the value. Note: --text-xs, line-height 1.7 (artifact
 * --leading-relaxed; minted as --stat-tile-note-leading because a :root
 * --leading-relaxed override would change the existing Tailwind utility),
 * dark -> rgba(255,255,255,.66) else --text-subtle (the .66 white is a GAP
 * B rgba literal with no token — kept per R-006's GAP-B rgba allowance).
 *
 * Legacy props preserved (sponsor dashboard + tests): title/value/suffix/
 * icon/trend/color/variant/formatValue. `variant="accent"` — the old
 * gradient card — maps to the artifact's inverse chrome (tone="dark"); it
 * is the only StatTile emphasis the artifact defines. The claymorphic
 * elevated shadow (raw hex) and the neumorphic flat surfaces are gone
 * (R-031: dead CSS not re-added). `tone` adds the artifact prop.
 * Colours are artifact CSS vars only (R-006).
 */

interface KpiCardProps {
  title: string;
  value: number;
  suffix: string;
  icon: string;
  trend?: string;
  color?: string;
  variant?: "elevated" | "flat" | "accent";
  /** Artifact StatTile chrome: "dark" renders the inverse tile. */
  tone?: "default" | "dark";
  formatValue?: (n: number) => string;
}

export function KpiCard({
  title,
  value,
  suffix,
  icon,
  trend,
  variant = "flat",
  tone,
  formatValue,
}: KpiCardProps) {
  const dark = tone ? tone === "dark" : variant === "accent"; // accent = legacy dark alias
  // color stays in the props interface for consumer compatibility but no
  // longer tints anything: StatTile defines exactly one chrome per tone.
  const displayValue = formatValue ? formatValue(value) : formatWithCommas(value);

  const containerStyle: CSSProperties = {
    background: dark ? "var(--surface-inverse)" : "var(--surface-card)",
    border: dark
      ? "1px solid var(--border-on-dark)"
      : "1px solid var(--border-subtle)",
    borderRadius: "var(--radius-card)",
    padding: "var(--space-5) var(--space-6)",
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-2)",
  };

  const labelStyle: CSSProperties = {
    fontSize: "var(--text-sm)",
    fontWeight: "var(--weight-semibold)",
    color: dark ? "var(--teal-300)" : "var(--text-heading)",
  };

  const valueStyle: CSSProperties = {
    fontSize: "var(--stat-tile-value-size)", // GAP B --text-4xl = 48px
    fontWeight: "var(--weight-light)",
    lineHeight: 1,
    letterSpacing: "var(--tracking-display)",
    fontVariantNumeric: "tabular-nums",
    color: dark ? "var(--white)" : "var(--text-heading)",
  };

  const suffixStyle: CSSProperties = {
    fontSize: "var(--text-md)",
    fontWeight: "var(--weight-medium)",
    color: dark ? "var(--text-on-dark)" : "var(--text-muted)",
  };

  const noteStyle: CSSProperties = {
    fontSize: "var(--text-xs)",
    lineHeight: "var(--stat-tile-note-leading)", // artifact --leading-relaxed = 1.7
    color: dark ? "rgba(255,255,255,.66)" : "var(--text-subtle)",
  };

  const iconStyle: CSSProperties = dark
    ? { background: "rgba(255,255,255,0.14)", color: "var(--teal-300)" } // GAP B onDark surface steps
    : { background: "var(--teal-50)", color: "var(--teal-600)" };

  return (
    <div style={containerStyle} className="min-w-0 relative">
      <div className="flex min-w-0 justify-between items-start gap-3">
        <h3 style={labelStyle} className="min-w-0 break-words">
          {title}
        </h3>
        <div
          className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center"
          style={iconStyle}
          aria-hidden="true"
        >
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {icon}
          </span>
        </div>
      </div>
      <div className="mt-auto">
        <div className="flex items-baseline gap-2">
          <span style={valueStyle} className="counter-animate" data-target={value}>
            {displayValue}
          </span>
          {suffix ? (
            <span style={suffixStyle}>{suffix}</span>
          ) : null}
        </div>
        {trend && (
          <p style={noteStyle} className="mt-1 flex items-center gap-2">
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "14px", color: dark ? "var(--teal-300)" : "var(--teal-500)" }}
              aria-hidden="true"
            >
              trending_up
            </span>
            {trend}
          </p>
        )}
      </div>
    </div>
  );
}
