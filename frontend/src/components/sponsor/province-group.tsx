"use client";

import { formatTons } from "@/lib/sponsor";
import type { PlotSummary } from "@/lib/sponsor";

interface ProvinceGroupProps {
  province: string;
  plots: PlotSummary[];
  regionCode: string;
}

const PROGRESS_MAX = 20;

export function ProvinceGroup({ province, plots, regionCode }: ProvinceGroupProps) {
  const totalCO2 = plots.reduce((sum, p) => sum + (p.total_offset_tco2e ?? 0), 0);

  return (
    <div className="bg-surface-container p-6 rounded-xl shadow-inner relative">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-surface-container-lowest shadow-sm flex items-center justify-center text-primary font-bold text-[20px]">
            {regionCode}
          </div>
          <div>
            <h3 className="text-headline-md text-on-surface">{province}</h3>
            <p className="text-label-md text-on-surface-variant">{plots.length} แปลง</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-headline-md text-primary">{formatTons(totalCO2)} ตัน CO₂</p>
          <p className="text-label-md text-outline">การลดที่ได้รับการตรวจสอบ</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plots.map((plot) => {
          const pct = Math.min(100, ((plot.total_offset_tco2e ?? 0) / PROGRESS_MAX) * 100);
          return (
            <div
              key={plot.plot_id}
              className="bg-surface-container-lowest p-4 rounded-lg shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-primary text-[20px]">landscape</span>
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-label-md text-on-surface truncate">
                  {plot.plot_code} ({plot.farmer_name})
                </h4>
                <div
                  className="w-full bg-surface-variant h-2 rounded-full mt-2 mb-1 overflow-hidden"
                  role="progressbar"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${plot.plot_code} progress`}
                >
                  <div className="bg-primary h-full rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <div className="flex justify-between text-[12px] text-on-surface-variant">
                  <span>{Math.round(pct)}% เป้าหมาย</span>
                  <span>{formatTons(plot.total_offset_tco2e ?? 0)} ตัน</span>
                </div>
                {/* Water-state tallies */}
                {plot.water_state_tallies && (plot.water_state_tallies.flooded > 0 || plot.water_state_tallies.dry > 0) && (
                  <div className="flex gap-2 mt-1 text-[11px] text-on-surface-variant">
                    <span>น้ำขัง: {plot.water_state_tallies.flooded}</span>
                    <span>แห้ง: {plot.water_state_tallies.dry}</span>
                  </div>
                )}
                {/* Provenance counts */}
                {plot.provenance_counts && (plot.provenance_counts.machine > 0 || plot.provenance_counts.human > 0) && (
                  <div className="flex gap-2 mt-1 text-[11px] text-on-surface-variant">
                    <span>AI: {plot.provenance_counts.machine}</span>
                    <span>มนุษย์: {plot.provenance_counts.human}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
