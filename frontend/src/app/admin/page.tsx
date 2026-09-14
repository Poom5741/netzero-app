"use client";

import { useState, useEffect } from "react";
import {
  getOverviewKpis,
  getWorkQueueAlerts,
  getCreditChart,
  getGhgSources,
  getProvinceTable,
  type OverviewKpis,
  type WorkQueueAlerts,
  type CreditChartItem,
  type GhgSourceItem,
  type ProvinceTableItem,
} from "@/lib/api";

export default function AdminOverviewPage() {
  const [kpis, setKpis] = useState<OverviewKpis | null>(null);
  const [workQueue, setWorkQueue] = useState<WorkQueueAlerts | null>(null);
  const [creditChart, setCreditChart] = useState<CreditChartItem[]>([]);
  const [ghgSources, setGhgSources] = useState<GhgSourceItem[]>([]);
  const [provinces, setProvinces] = useState<ProvinceTableItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authed, setAuthed] = useState<boolean | null>(null);

  // Check auth
  useEffect(() => {
    const email = sessionStorage.getItem("nzc_admin_email");
    const pass = sessionStorage.getItem("nzc_admin_pass");
    if (!email || !pass) {
      window.location.href = "/admin/login";
      return;
    }
    setAuthed(true);
  }, []);

  useEffect(() => {
    if (!authed) return;
    let cancelled = false;
    setLoading(true);

    Promise.all([
      getOverviewKpis().catch(() => null),
      getWorkQueueAlerts().catch(() => null),
      getCreditChart().catch(() => []),
      getGhgSources().catch(() => []),
      getProvinceTable().catch(() => []),
    ]).then(([k, w, c, g, p]) => {
      if (cancelled) return;
      if (k) setKpis(k);
      if (w) setWorkQueue(w);
      setCreditChart(c);
      setGhgSources(g);
      setProvinces(p);
      setLoading(false);
    }).catch(() => {
      if (!cancelled) {
        setError("ไม่สามารถโหลดข้อมูลได้");
        setLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, [authed]);

  if (authed === null) return null;

  return (
    <main className="pt-20 lg:pt-24 px-4 lg:px-10 pb-10">
      <div className="max-w-[1400px]">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="font-headline-lg text-headline-lg text-on-surface">ภาพรวมระบบ</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            สรุปข้อมูลโครงการ NetZeroCarbon
          </p>
        </div>

        {loading && (
          <div className="neumorphic p-6 text-center rounded-xl">
            <div className="flex justify-center gap-2 mb-2">
              <div className="typing-dot w-3 h-3 rounded-full bg-primary" />
              <div className="typing-dot w-3 h-3 rounded-full bg-primary" />
              <div className="typing-dot w-3 h-3 rounded-full bg-primary" />
            </div>
            <p className="text-body-md text-on-surface-variant">กำลังโหลด...</p>
          </div>
        )}

        {error && (
          <div className="neumorphic p-6 text-center rounded-xl">
            <span className="material-symbols-outlined text-error text-4xl mb-2">error</span>
            <p className="text-body-md text-on-surface">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* KPI Tiles */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6" aria-label="ตัวชี้วัดหลัก">
              <KpiTile
                icon="group"
                label="เกษตรกรทั้งหมด"
                value={kpis?.totalFarmers ?? 0}
                unit="ราย"
                color="primary"
              />
              <KpiTile
                icon="landscape"
                label="แปลงทั้งหมด"
                value={kpis?.totalPlots ?? 0}
                unit="แปลง"
                color="tertiary"
              />
              <KpiTile
                icon="pending_actions"
                label="รอตรวจสอบภาพ"
                value={kpis?.pendingReviews ?? 0}
                unit="รายการ"
                color="secondary"
              />
              <KpiTile
                icon="co2"
                label="เครดิตคาร์บอน"
                value={kpis?.totalCredits ?? 0}
                unit="tCO2e"
                color="primary"
                decimals={2}
              />
            </section>

            {/* Work Queue Alerts */}
            {workQueue && (
              <section className="mb-6" aria-label="งานค้าง">
                <h2 className="text-headline-sm text-on-surface mb-3">งานค้างในระบบ</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <WorkQueueCard
                    icon="assignment"
                    label="ใบสมัครรอตรวจสอบ"
                    count={workQueue.pendingApplications}
                    href="/admin/applications"
                    urgency={workQueue.pendingApplications > 10 ? "high" : "normal"}
                  />
                  <WorkQueueCard
                    icon="photo_library"
                    label="ภาพรอตรวจ"
                    count={workQueue.photoQueue}
                    href="/admin/review"
                    urgency={workQueue.photoQueue > 20 ? "high" : "normal"}
                  />
                  <WorkQueueCard
                    icon="photo_camera"
                    label="แปลงไม่มีภาพ"
                    count={workQueue.missingPhotos}
                    href="/admin/farmers"
                    urgency={workQueue.missingPhotos > 5 ? "high" : "normal"}
                  />
                  <WorkQueueCard
                    icon="water"
                    label="SF_w Fallback"
                    count={workQueue.sfwFallback}
                    href="/admin/farmers"
                    urgency={workQueue.sfwFallback > 0 ? "medium" : "normal"}
                  />
                </div>
              </section>
            )}

            {/* Credit Chart (simple bar representation) */}
            {creditChart.length > 0 && (
              <section className="mb-6" aria-label="กราฟเครดิต">
                <h2 className="text-headline-sm text-on-surface mb-3">เครดิตคาร์บอนตามฤดู</h2>
                <div className="neumorphic rounded-2xl p-6">
                  <div className="flex items-end gap-3 h-48">
                    {creditChart.map((item, i) => {
                      const maxVal = Math.max(...creditChart.map((c) => c.estimated), 1);
                      const estHeight = (item.verified / maxVal) * 100;
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <span className="text-[11px] text-on-surface-variant font-medium">
                            {item.verified.toFixed(0)}
                          </span>
                          <div className="w-full flex flex-col gap-1 items-center" style={{ height: "140px", justifyContent: "flex-end" }}>
                            <div
                              className="w-full max-w-[40px] rounded-t-lg bg-primary"
                              style={{ height: `${estHeight}%`, minHeight: "4px" }}
                            />
                          </div>
                          <span className="text-[10px] text-on-surface-variant text-center truncate w-full" title={item.season}>
                            {item.season}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-4 mt-4 text-[12px] text-on-surface-variant">
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded bg-primary" /> ยืนยันแล้ว (tCO2e)
                    </span>
                  </div>
                </div>
              </section>
            )}

            {/* GHG Source Table */}
            {ghgSources.length > 0 && (
              <section className="mb-6" aria-label="แหล่งก๊าซเรือนกระจก">
                <h2 className="text-headline-sm text-on-surface mb-3">แหล่งก๊าซเรือนกระจก (GHG)</h2>
                <div className="neumorphic rounded-2xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-outline-variant/20">
                        <th className="px-4 py-3 text-label-md font-semibold text-on-surface">แหล่งที่มา</th>
                        <th className="px-4 py-3 text-label-md font-semibold text-on-surface text-right">ปริมาณ (tCO2e)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ghgSources.map((src, i) => (
                        <tr key={i} className="border-b border-outline-variant/10 last:border-0">
                          <td className="px-4 py-3 text-body-md text-on-surface">{src.source}</td>
                          <td className="px-4 py-3 text-body-md text-on-surface text-right font-mono">
                            {src.value.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Province / Sponsor Table */}
            {provinces.length > 0 && (
              <section className="mb-6" aria-label="ตารางจังหวัด">
                <h2 className="text-headline-sm text-on-surface mb-3">สรุปตามจังหวัด</h2>
                <div className="neumorphic rounded-2xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-outline-variant/20">
                        <th className="px-4 py-3 text-label-md font-semibold text-on-surface">จังหวัด</th>
                        <th className="px-4 py-3 text-label-md font-semibold text-on-surface">ผู้สนับสนุน</th>
                        <th className="px-4 py-3 text-label-md font-semibold text-on-surface text-right">แปลง</th>
                        <th className="px-4 py-3 text-label-md font-semibold text-on-surface text-right">เครดิต (tCO2e)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {provinces.map((prov, i) => (
                        <tr key={i} className="border-b border-outline-variant/10 last:border-0">
                          <td className="px-4 py-3 text-body-md text-on-surface font-medium">{prov.province}</td>
                          <td className="px-4 py-3 text-body-md text-on-surface-variant">{prov.sponsor}</td>
                          <td className="px-4 py-3 text-body-md text-on-surface text-right">{prov.plots}</td>
                          <td className="px-4 py-3 text-body-md text-on-surface text-right font-mono">
                            {prov.credits.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}

// ── KPI Tile Component ──────────────────────────────────────────────

function KpiTile({
  icon,
  label,
  value,
  unit,
  color,
  decimals = 0,
}: {
  icon: string;
  label: string;
  value: number;
  unit: string;
  color: "primary" | "secondary" | "tertiary";
  decimals?: number;
}) {
  const colorMap = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
    tertiary: "bg-tertiary/10 text-tertiary",
  };

  return (
    <div className="neumorphic rounded-2xl p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
        <span className="material-symbols-outlined text-[24px]">{icon}</span>
      </div>
      <div>
        <p className="text-label-md text-on-surface-variant">{label}</p>
        <p className="text-headline-md text-on-surface font-bold">
          {value.toFixed(decimals)} <span className="text-label-sm font-normal text-on-surface-variant">{unit}</span>
        </p>
      </div>
    </div>
  );
}

// ── Work Queue Card Component ───────────────────────────────────────

function WorkQueueCard({
  icon,
  label,
  count,
  href,
  urgency,
}: {
  icon: string;
  label: string;
  count: number;
  href: string;
  urgency: "normal" | "medium" | "high";
}) {
  const urgencyStyles = {
    normal: "border-outline-variant/20",
    medium: "border-tertiary/40",
    high: "border-error/40 bg-error-container/5",
  };

  return (
    <a
      href={href}
      className={`neumorphic rounded-lg p-4 block border-l-4 transition-all hover:shadow-md ${urgencyStyles[urgency]}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="material-symbols-outlined text-on-surface-variant text-[20px]">{icon}</span>
        {urgency === "high" && (
          <span className="w-2 h-2 rounded-full bg-error animate-pulse" />
        )}
      </div>
      <p className="text-body-lg text-on-surface font-bold">{count}</p>
      <p className="text-label-sm text-on-surface-variant">{label}</p>
    </a>
  );
}
