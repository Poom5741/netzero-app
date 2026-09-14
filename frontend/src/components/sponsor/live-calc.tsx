"use client";

import { formatWithCommas } from "@/lib/sponsor";

interface LiveCalcProps {
  liveValue: number;
  techniques: { name: string; pct: number }[];
}

export function LiveCalc({ liveValue, techniques }: LiveCalcProps) {
  return (
    <div className="mb-8">
      <h3 className="text-headline-md text-on-surface mb-4">การคำนวณแบบเรียลไทม์</h3>
      <div className="rounded-2xl p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 relative overflow-hidden">
        {/* Real-time counter display */}
        <div className="bg-white/60 backdrop-blur-sm p-5 rounded-xl mb-5 flex flex-col items-center justify-center h-36 relative overflow-hidden border border-primary/10">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary via-transparent to-transparent animate-pulse" style={{ animationDuration: "3s" }} />
          <span className="text-label-md text-on-surface-variant mb-2 relative z-10 font-medium">
            การสะสมเครือข่ายแบบเรียลไทม์
          </span>
          <div className="flex items-baseline gap-1 relative z-10">
            <span className="text-[56px] font-bold text-primary tracking-tighter counter-animate" data-target={liveValue}>
              {formatWithCommas(liveValue)}
            </span>
          </div>
          <span className="pulse-live text-[12px] text-primary bg-primary/10 px-3 py-1 rounded-full mt-2 relative z-10 font-medium">
            อัปเดตแบบเรียลไทม์
          </span>
        </div>

        {/* Technique breakdown */}
        <div className="space-y-3">
          {techniques.map((t, i) => (
            <div
              key={t.name}
              className={`flex justify-between items-center py-3 px-4 rounded-lg ${i < techniques.length - 1 ? "bg-surface-container-low/50" : "bg-surface-container-low/30"}`}
            >
              <span className="text-body-md text-on-surface-variant font-medium">{t.name}</span>
              <span className="text-label-md text-on-surface font-semibold tabular-nums">{t.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
