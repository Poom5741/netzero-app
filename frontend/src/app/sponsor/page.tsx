"use client";

import { useEffect, useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { KpiCard } from "@/components/sponsor/kpi-card";
import { ProvinceGroup } from "@/components/sponsor/province-group";
import { LiveCalc } from "@/components/sponsor/live-calc";
import {
  getFallbackData,
  generateExportCSV,
  formatUSD,
  type ProvinceGroup as ProvinceGroupType,
  type SponsorSummary,
  type SponsorFarmerRow,
} from "@/lib/sponsor";

const PRIVATE_IP_PREFIXES = ["10.", "172.", "192.168."];

/** Validate URL: only allow http/https, block private/internal networks. */
function validateApiUrl(url: string): string {
  const parsed = new URL(url);
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error(`Invalid API URL protocol: ${parsed.protocol}`);
  }
  const h = parsed.hostname;
  if (
    h === "localhost" || h === "127.0.0.1" || h === "0.0.0.0" || h === "::1" ||
    h.endsWith(".local") || PRIVATE_IP_PREFIXES.some((p) => h.startsWith(p))
  ) {
    throw new Error(`SSRF blocked: internal host ${h}`);
  }
  return url;
}

const EMPTY_SUMMARY: SponsorSummary = {
  totalCO2Tons: 0,
  totalPlots: 0,
  totalFarmers: 0,
  paymentEstimateUSD: 0,
  methodologyBreakdown: { awd: 0, biochar: 0, fertilization: 0 },
};

async function fetchJson<T>(path: string, fallback: T): Promise<T> {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE;
  if (!apiBase) return fallback;
  try {
    const endpoint = validateApiUrl(`${apiBase}${path}`);
    const res = await fetch(endpoint);
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

function fetchSponsorData(): Promise<ProvinceGroupType[]> {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE;
  if (!apiBase) return Promise.resolve(getFallbackData());
  return new Promise((resolve) => {
    try {
      const endpoint = validateApiUrl(`${apiBase}/sponsor/`);
      const xhr = new XMLHttpRequest();
      xhr.open("GET", endpoint);
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const data = JSON.parse(xhr.responseText);
          // Backend wraps in { provinces: [...] }
          resolve(data.provinces ?? data);
        } else {
          resolve(getFallbackData());
        }
      };
      xhr.onerror = () => resolve(getFallbackData());
      xhr.send();
    } catch {
      resolve(getFallbackData());
    }
  });
}

const sidebarEntries = [
  { key: "admin", label: "แดชบอร์ดตรวจสอบ", href: "/admin", icon: "fact_check" },
  { key: "sponsor", label: "แดชบอร์ดผู้สนับสนุน", href: "/sponsor", icon: "volunteer_activism", active: true },
];

const regionCodeMap: Record<string, string> = {
  "พระนครศรีอยุธยา": "AY",
  "สุพรรณบุรี": "SP",
  "นครปฐม": "NP",
  "เชียงใหม่": "CM",
  "ชลบุรี": "CC",
  "นครราชสีมา": "NK",
  "อุบลราชธานี": "UB",
  "ขอนแก่น": "KK",
};

function getRegionCode(province: string): string {
  if (regionCodeMap[province]) return regionCodeMap[province];
  return province.slice(0, 2).toUpperCase();
}

export default function SponsorDashboardPage() {
  const [groups, setGroups] = useState<ProvinceGroupType[]>([]);
  const [summary, setSummary] = useState<SponsorSummary>(EMPTY_SUMMARY);
  const [farmers, setFarmers] = useState<SponsorFarmerRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [data, summaryData, farmersData] = await Promise.all([
          fetchSponsorData(),
          fetchJson<SponsorSummary>("/sponsor/summary", EMPTY_SUMMARY),
          fetchJson<{ farmers: SponsorFarmerRow[] }>("/sponsor/farmers", { farmers: [] }),
        ]);
        if (!cancelled) {
          setGroups(data);
          setSummary(summaryData);
          setFarmers(farmersData.farmers ?? []);
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const totalCO2 = summary.totalCO2Tons;
  const totalPlots = summary.totalPlots;
  const totalInvestment = summary.paymentEstimateUSD;

  const techniques = [
    { name: "AWD (การจัดการน้ำสลับ)", pct: summary.methodologyBreakdown.awd },
    { name: "Biochar (ถ่านชีวภาพ)", pct: summary.methodologyBreakdown.biochar },
    { name: "การใส่ปุ๋ย (Fertilization)", pct: summary.methodologyBreakdown.fertilization },
  ];

  const handleExport = () => {
    const csv = generateExportCSV(groups);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sponsor-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  const isEmpty = !loading && totalPlots === 0 && farmers.length === 0;

  return (
    <>
      <DashboardSidebar
        entries={sidebarEntries}
        userName="ผู้ดูแลระบบ"
        userEmail="admin@netzerocarbon.com"
        brand="NetZero"
      />
      <DashboardHeader userLabel="ผู้ดูแลระบบ" searchPlaceholder="ค้นหาทั่วโลก..." />

      <div className="lg:pl-72">
        <main className="relative pt-20 min-h-screen bg-surface px-6 lg:px-10 py-6">
          <div className="flex flex-col w-full relative">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 relative z-10">
              <div>
                <p className="text-label-md text-tertiary uppercase tracking-widest mb-1 flex items-center gap-2">
                  <span className="pulse-live w-2 h-2 rounded-full bg-primary" />
                  ติดตามคาร์บอนแบบเรียลไทม์
                </p>
                <h1 className="text-display-lg text-on-surface">แดชบอร์ดผู้สนับสนุน</h1>
                <p className="text-body-lg text-on-surface-variant max-w-2xl mt-2">
                  ตรวจสอบผลกระทบของคุณแบบเรียลไทม์ ติดตามการลดการปล่อยก๊าซเรือนกระจกจากแปลงเกษตรที่ได้รับการสนับสนุน
                </p>
              </div>
              <div className="mt-4 md:mt-0 flex gap-4">
                <button
                  type="button"
                  className="touch-target px-6 rounded-full bg-surface-container-high text-on-surface hover:bg-surface-variant transition-colors flex items-center gap-2 text-sm font-medium shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                  Q3 2024
                </button>
                <button
                  type="button"
                  onClick={handleExport}
                  className="touch-target px-6 rounded-full bg-tertiary text-on-tertiary shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),0_4px_12px_rgba(171,53,0,0.4)] hover:scale-105 transition-transform flex items-center gap-2 text-sm font-medium relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-full" />
                  <span className="material-symbols-outlined text-[18px] relative z-10">download</span>
                  <span className="relative z-10">ส่งออกรายงาน</span>
                </button>
              </div>
            </div>

            {isEmpty ? (
              <div className="bg-surface-container p-12 rounded-xl text-center">
                <span className="material-symbols-outlined text-64 text-on-surface-variant mb-4">eco</span>
                <h2 className="text-headline-lg text-on-surface mt-4">ยังไม่มีข้อมูล</h2>
                <p className="text-body-lg text-on-surface-variant mt-2">
                  ยังไม่มีข้อมูลคาร์บอนเครดิตในระบบ ข้อมูลจะปรากฏเมื่อเกษตรกรเริ่มบันทึกข้อมูล
                </p>
              </div>
            ) : (
              <>
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 relative z-10">
                  <KpiCard
                    title="CO₂ ที่ลดทั้งหมด"
                    value={Math.round(totalCO2)}
                    suffix="ตัน"
                    icon="eco"
                    color="primary"
                    trend={loading ? "กำลังโหลด..." : undefined}
                  />
                  <KpiCard
                    title="แปลงที่ได้รับการสนับสนุน"
                    value={totalPlots}
                    suffix="แปลง"
                    icon="landscape"
                    color="secondary"
                    trend={loading ? "กำลังโหลด..." : `Across ${groups.length} จังหวัด • ${summary.totalFarmers} เกษตรกร`}
                  />
                  <KpiCard
                    title="การลงทุนทั้งหมด"
                    value={totalInvestment}
                    suffix=""
                    icon="payments"
                    color="tertiary"
                    trend="ปี 2024"
                    formatValue={formatUSD}
                  />
                </div>

                {/* Bento Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
                  {/* Regional Breakdown (8 cols) */}
                  <div className="lg:col-span-8 flex flex-col gap-6">
                    <h2 className="text-headline-lg text-on-surface">รายละเอียดตามภูมิภาค</h2>
                    {loading ? (
                      <div className="bg-surface-container p-6 rounded-xl">
                        <p className="text-on-surface-variant">กำลังโหลดข้อมูล...</p>
                      </div>
                    ) : (
                      groups.map((group) => (
                        <ProvinceGroup
                          key={group.province}
                          province={group.province}
                          plots={group.plots as import("@/lib/sponsor").PlotSummary[]}
                          regionCode={getRegionCode(group.province)}
                        />
                      ))
                    )}
                  </div>

                  {/* Live Calculation + Map (4 cols) */}
                  <div className="lg:col-span-4 flex flex-col gap-6">
                    <LiveCalc liveValue={Math.round(totalCO2)} techniques={techniques} />

                    {/* Map */}
                    <div className="neumorphic overflow-hidden flex flex-col h-64">
                      <div className="p-4 pb-0">
                        <h3 className="font-headline-md text-[18px] text-on-surface">การกระจายโครงการ</h3>
                      </div>
                      <div className="flex-1 w-full bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAVG86o0n-MoR-4dNoH0sh1Yu4QC9LeHaXXbgBA3RlmKu5F-1um9QCDuROM2VrrwHp1gy04UagLdUBHlpsDm3qnbdTXbvJ_aGU6NqA2LOsg3OgWzelFWVd-w9E-SFtJAcqyFxPQQWzIvQy6SIFx7n4qa_Ay7IQB9ik_5wmVOa4pPJa8661GwOK3fo-eRNZ9yHQrQvm0RWtJ2sWxmMOvXJLDBqJ59nsyxvZdQiBMX3jVGtQEyA3EjG3LbA')" }} />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
