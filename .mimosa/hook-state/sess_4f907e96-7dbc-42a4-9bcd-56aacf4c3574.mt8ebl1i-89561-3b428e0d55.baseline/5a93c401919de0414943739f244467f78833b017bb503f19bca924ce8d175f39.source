"use client";

import { formatWithCommas } from "@/lib/sponsor";

interface KpiCardProps {
  title: string;
  value: number;
  suffix: string;
  icon: string;
  trend?: string;
  color?: string;
  formatValue?: (n: number) => string;
}

const colorMap: Record<string, { bg: string; text: string; glow: string }> = {
  primary: {
    bg: "bg-primary/10",
    text: "text-primary",
    glow: "bg-primary/10 group-hover:bg-primary/20",
  },
  secondary: {
    bg: "bg-secondary-container",
    text: "text-on-secondary-container",
    glow: "bg-secondary/10 group-hover:bg-secondary/20",
  },
  tertiary: {
    bg: "bg-tertiary-container",
    text: "text-tertiary",
    glow: "bg-tertiary/10 group-hover:bg-tertiary/20",
  },
};

export function KpiCard({ title, value, suffix, icon, trend, color = "primary", formatValue }: KpiCardProps) {
  const palette = colorMap[color] ?? colorMap.primary;
  const displayValue = formatValue ? formatValue(value) : formatWithCommas(value);

  return (
    <div className="neumorphic p-6 flex flex-col justify-between h-48 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
      <div className={`absolute -right-8 -top-8 w-32 h-32 ${palette.glow} rounded-full blur-2xl transition-colors`} />
      <div className="flex justify-between items-start">
        <h3 className="text-headline-md text-on-surface">{title}</h3>
        <div className={`w-10 h-10 rounded-full ${palette.bg} flex items-center justify-center`}>
          <span className={`material-symbols-outlined text-[20px] ${palette.text}`}>
            {icon}
          </span>
        </div>
      </div>
      <div className="mt-auto">
        <div className="flex items-baseline gap-2">
          <span className="text-display-lg text-primary count-animate">{displayValue}</span>
          <span className="text-body-md text-on-surface-variant font-medium">{suffix}</span>
        </div>
        {trend && (
          <p className="text-label-md text-outline mt-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-[14px] text-primary">trending_up</span>
            {trend}
          </p>
        )}
      </div>
    </div>
  );
}
