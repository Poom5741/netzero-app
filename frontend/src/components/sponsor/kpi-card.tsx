"use client";

import { formatWithCommas } from "@/lib/sponsor";

interface KpiCardProps {
  title: string;
  value: number;
  suffix: string;
  icon: string;
  trend?: string;
  color?: string;
  variant?: "elevated" | "flat" | "accent";
  formatValue?: (n: number) => string;
}

const colorMap: Record<string, { bg: string; text: string; valueText: string }> = {
  primary: {
    bg: "bg-primary/10",
    text: "text-primary",
    valueText: "text-primary",
  },
  secondary: {
    bg: "bg-secondary-container",
    text: "text-on-secondary-container",
    valueText: "text-on-surface",
  },
  tertiary: {
    bg: "bg-tertiary-container",
    text: "text-on-tertiary-container",
    valueText: "text-on-surface",
  },
};

export function KpiCard({ title, value, suffix, icon, trend, color = "primary", variant = "flat", formatValue }: KpiCardProps) {
  const palette = colorMap[color] ?? colorMap.primary;
  const displayValue = formatValue ? formatValue(value) : formatWithCommas(value);

  const variantStyles = {
    elevated: "bg-surface-container-lowest shadow-[5px_5px_15px_#D1D9E6,-5px_-5px_15px_#FFFFFF]",
    flat: "bg-surface-container-low/50",
    accent: "bg-gradient-to-br from-primary to-primary-container text-white",
  };

  const iconBg = variant === "accent" ? "bg-white/20 text-white" : palette.bg;
  const titleColor = variant === "accent" ? "text-white/90" : "text-on-surface";
  const valueColor = variant === "accent" ? "text-white" : palette.valueText;
  const suffixColor = variant === "accent" ? "text-white/70" : "text-on-surface-variant";
  const trendColor = variant === "accent" ? "text-white/80" : "text-outline";

  return (
    <div className={`${variantStyles[variant]} p-6 rounded-2xl flex flex-col justify-between h-48 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300`}>
      <div className="flex justify-between items-start">
        <h3 className={`font-headline-md text-headline-md ${titleColor}`}>{title}</h3>
        <div className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center ${variant === "accent" ? "text-white" : palette.text}`}>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
            {icon}
          </span>
        </div>
      </div>
      <div className="mt-auto">
        <div className="flex items-baseline gap-2">
          <span className={`font-display-lg text-display-lg ${valueColor} counter-animate`} data-target={value}>{displayValue}</span>
          <span className={`font-body-md text-body-md ${suffixColor} font-medium`}>{suffix}</span>
        </div>
        {trend && (
          <p className={`font-label-md text-label-md ${trendColor} mt-1 flex items-center gap-2`}>
            <span className="material-symbols-outlined text-[14px] text-primary">trending_up</span>
            {trend}
          </p>
        )}
      </div>
    </div>
  );
}
