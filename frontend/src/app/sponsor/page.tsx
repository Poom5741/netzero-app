"use client";

import { useEffect, useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import { KpiCard } from "@/components/sponsor/kpi-card";
import { ProvinceGroup } from "@/components/sponsor/province-group";
import { LiveCalc } from "@/components/sponsor/live-calc";
import { PdpaNotice } from "@/components/sponsor/pdpa-notice";
import {
  getFallbackData,
  generateExportCSV,
  formatUSD,
  formatTons,
  type ProvinceGroup as ProvinceGroupType,
  type SponsorSummary,
  type SponsorFarmerRow,
  type GhgSourceRow,
  type SeasonCreditRow,
  type SponsorProfile,
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
  totalAreaRai: 0,
  totalHouseholds: 0,
  paymentEstimateUSD: 0,
  methodologyBreakdown: { awd: 0, biochar: 0, fertilization: 0 },
};

function fetchJson<T>(path: string, fallback: T): Promise<T> {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE;
  const endpoint = apiBase ? validateApiUrl(`${apiBase}${path}`) : path;
  return new Promise((resolve) => {
    try {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", endpoint);
      xhr.onload = () => {
        try {
          resolve(xhr.status >= 200 && xhr.status < 300 ? (JSON.parse(xhr.responseText) as T) : fallback);
        } catch {
          resolve(fallback);
        }
      };
      xhr.onerror = () => resolve(fallback);
      xhr.send();
    } catch {
      resolve(fallback);
    }
  });
}

function fetchSponsorData(): Promise<ProvinceGroupType[]> {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE;
  const endpoint = apiBase ? validateApiUrl(`${apiBase}/sponsor`) : "/sponsor";
  return new Promise((resolve) => {
    try {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", endpoint);
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const data = JSON.parse(xhr.responseText);
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
  { key: "overview", label: "ภาพรวม", href: "/sponsor", icon: "dashboard", active: true },
  { key: "areas", label: "พื้นที่", href: "/sponsor/areas", icon: "landscape" },
  { key: "reports", label: "รายงานและใบรับรอง", href: "/sponsor/reports", icon: "description" },
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

/** Simple horizontal bar chart using CSS */
function SeasonChart({ credits }: { credits: SeasonCreditRow[] }) {
  if (credits.length === 0) {
    return (
      <div className="mb-8">
        <h3 className="font-headline-md text-headline-md text-on-surface mb-4">เครดิตตามฤดูกาล</h3>
        <div className="rounded-2xl p-8 bg-surface-container-low/50 text-center">
          <p className="text-on-surface-variant text-body-md">ยังไม่มีข้อมูลเครดิตตามฤดูกาล</p>
        </div>
      </div>
    );
  }
  const maxVal = Math.max(...credits.map((c) => Math.max(c.estimated_tco2e, c.verified_tco2e)), 1);
  return (
    <div className="mb-8">
      <h3 className="font-headline-md text-headline-md text-on-surface mb-4">เครดิตตามฤดูกาล</h3>
      <div className="rounded-2xl p-6 bg-gradient-to-br from-primary/5 to-transparent border border-primary/10">
        <div className="space-y-4">
          {credits.map((c) => (
            <div key={c.season_id} className="flex items-center gap-4">
              <span className="text-label-md text-on-surface-variant w-28 truncate font-medium" title={c.season_name}>{c.season_name}</span>
              <div className="flex-1 flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-surface-variant/50 h-3.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-primary/60 to-primary-container/60 h-full rounded-full transition-all" style={{ width: `${(c.estimated_tco2e / maxVal) * 100}%` }} />
                  </div>
                  <span className="text-label-sm text-on-surface-variant w-20 text-right tabular-nums">{formatTons(c.estimated_tco2e)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-surface-variant/50 h-3.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-primary to-primary-container h-full rounded-full transition-all" style={{ width: `${(c.verified_tco2e / maxVal) * 100}%` }} />
                  </div>
                  <span className="text-label-sm text-primary w-20 text-right font-medium tabular-nums">{formatTons(c.verified_tco2e)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-6 mt-5 pt-4 border-t border-primary/10 text-label-sm text-on-surface-variant">
          <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 rounded-full bg-gradient-to-r from-primary/60 to-primary-container/60 inline-block" /> ประมาณการ</span>
          <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 rounded-full bg-gradient-to-r from-primary to-primary-container inline-block" /> ตรวจสอบแล้ว</span>
        </div>
      </div>
    </div>
  );
}

/** GHG emission source breakdown table */
function GhgSourceTable({ sources }: { sources: GhgSourceRow[] }) {
  if (sources.length === 0) return null;
  return (
    <div className="mb-8">
      <h3 className="font-headline-md text-headline-md text-on-surface mb-4">แหล่งการปล่อยก๊าซเรือนกระจก</h3>
      <div className="rounded-2xl overflow-hidden bg-surface-container-low/50">
        <div className="overflow-x-auto">
          <table className="w-full text-body-md">
            <thead>
              <tr className="border-b border-surface-variant/30">
                <th className="text-left px-5 py-3.5 text-label-md text-on-surface-variant font-semibold">แหล่ง</th>
                <th className="text-right px-5 py-3.5 text-label-md text-on-surface-variant font-semibold">พื้นฐาน (tCO2e)</th>
                <th className="text-right px-5 py-3.5 text-label-md text-on-surface-variant font-semibold">โครงการ (tCO2e)</th>
                <th className="text-right px-5 py-3.5 text-label-md text-primary font-semibold">การลด (tCO2e)</th>
              </tr>
            </thead>
            <tbody>
              {sources.map((s) => (
                <tr key={s.source} className="border-b border-surface-variant/20 last:border-0 hover:bg-surface-container-low/30 transition-colors">
                  <td className="px-5 py-3.5 text-on-surface">
                    {s.source}
                    {s.source.toLowerCase().includes("methane") || s.source.toLowerCase().includes("ch") || s.source.toLowerCase().includes("ch4") ? (
                      <span className="block text-label-sm text-outline mt-0.5">แหล่งหลักของความแตกต่างคาร์บอนเครดิต</span>
                    ) : null}
                    {s.source.toLowerCase().includes("fertil") ? (
                      <span className="block text-label-sm text-outline mt-0.5">ไม่มีการเปลี่ยนแปลงระหว่างพื้นฐานและโครงการ</span>
                    ) : null}
                  </td>
                  <td className="px-5 py-3.5 text-right text-on-surface-variant tabular-nums">{formatTons(s.baseline)}</td>
                  <td className="px-5 py-3.5 text-right text-on-surface-variant tabular-nums">{formatTons(s.project)}</td>
                  <td className="px-5 py-3.5 text-right text-primary font-medium tabular-nums">{formatTons(s.reduction)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/** Progress bars for season milestones */
function ProgressBars({ summary }: { summary: SponsorSummary }) {
  // Simulated milestone progress — in production these would come from season_steps
  const milestones = [
    { label: "วันหว่าน", pct: summary.totalPlots > 0 ? 85 : 0 },
    { label: "การถ่ายภาพ", pct: summary.totalPlots > 0 ? 60 : 0 },
    { label: "ข้อมูล Inputs", pct: summary.totalPlots > 0 ? 70 : 0 },
  ];
  return (
    <div className="mb-8">
      <h3 className="font-headline-md text-headline-md text-on-surface mb-4">ความคืบหน้าฤดูกาล</h3>
      <div className="rounded-2xl p-6 bg-surface-container-low/50">
        <div className="space-y-5">
          {milestones.map((m) => (
            <div key={m.label}>
              <div className="flex justify-between mb-2">
                <span className="text-body-md text-on-surface-variant font-medium">{m.label}</span>
                <span className="text-label-md text-primary font-semibold tabular-nums">{m.pct}%</span>
              </div>
              <div className="w-full bg-surface-variant/50 h-3 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-primary to-primary-container h-full rounded-full transition-all" style={{ width: `${m.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Impact metrics cards */
function ImpactMetrics({ summary }: { summary: SponsorSummary }) {
  const metrics = [
    { label: "การลดมีเทน", value: summary.totalCO2Tons > 0 ? "~35%" : "0%", icon: "water_drop", desc: "เทียบกับวิธีการดั้งเดิม", accent: true },
    { label: "การประหยัดน้ำ", value: summary.totalCO2Tons > 0 ? "~25%" : "0%", icon: "local_drink", desc: "จากการจัดการน้ำสลับ", accent: true },
    { label: "เชื้อเพลิง", value: summary.totalCO2Tons > 0 ? "+5%" : "0%", icon: "local_gas_station", desc: "เพิ่มขึ้นเล็กน้อย", accent: false },
    { label: "ปุ๋ย", value: "เท่าเดิม", icon: "science", desc: "ไม่เปลี่ยนแปลง", accent: false },
  ];
  return (
    <div className="mb-8">
      <h3 className="font-headline-md text-headline-md text-on-surface mb-4">ผลกระทบด้านสิ่งแวดล้อม</h3>
      <div className="space-y-3">
        {metrics.map((m) => (
          <div key={m.label} className={`flex items-center gap-4 p-4 rounded-xl ${m.accent ? "bg-primary/5 border border-primary/10" : "bg-surface-container-low/50"}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${m.accent ? "bg-primary text-white" : "bg-surface-container text-primary"}`}>
              <span className="material-symbols-outlined text-[20px]">{m.icon}</span>
            </div>
            <div className="flex-1">
              <p className="text-label-md text-on-surface-variant font-medium">{m.label}</p>
              <p className="text-label-sm text-outline">{m.desc}</p>
            </div>
            <p className={`text-headline-sm font-bold tabular-nums ${m.accent ? "text-primary" : "text-on-surface"}`}>{m.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SponsorDashboardPage() {
  const [groups, setGroups] = useState<ProvinceGroupType[]>([]);
  const [summary, setSummary] = useState<SponsorSummary>(EMPTY_SUMMARY);
  const [farmers, setFarmers] = useState<SponsorFarmerRow[]>([]);
  const [ghgSources, setGhgSources] = useState<GhgSourceRow[]>([]);
  const [seasonCredits, setSeasonCredits] = useState<SeasonCreditRow[]>([]);
  const [profile, setProfile] = useState<SponsorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterProvince, setFilterProvince] = useState("");
  const [filterSeason, setFilterSeason] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [data, summaryData, farmersData, ghgData, creditData, profileData] = await Promise.all([
          fetchSponsorData(),
          fetchJson<SponsorSummary>("/sponsor/summary", EMPTY_SUMMARY),
          fetchJson<{ farmers: SponsorFarmerRow[] }>("/sponsor/farmers", { farmers: [] }),
          fetchJson<{ sources: GhgSourceRow[] }>("/sponsor/ghg-sources", { sources: [] }),
          fetchJson<{ credits: SeasonCreditRow[] }>("/sponsor/season-credits", { credits: [] }),
          fetchJson<SponsorProfile>("/sponsor/me", null as unknown as SponsorProfile),
        ]);
        if (!cancelled) {
          setGroups(data);
          setSummary(summaryData);
          setFarmers(farmersData.farmers ?? []);
          setGhgSources(ghgData.sources ?? []);
          setSeasonCredits(creditData.credits ?? []);
          setProfile(profileData);
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

  const filteredGroups = filterProvince
    ? groups.filter((g) => g.province === filterProvince)
    : groups;

  const filteredSeasonCredits = filterSeason
    ? seasonCredits.filter((c) => c.season_id === filterSeason)
    : seasonCredits;

  const isEmpty = !loading && totalPlots === 0 && farmers.length === 0;

  const userName = profile?.user?.name ?? profile?.user?.email ?? "ผู้สนับสนุน";
  const userEmail = profile?.user?.email ?? "sponsor@netzerocarbon.com";
  const areaLabel = profile?.areas ? profile.areas.join(", ") : "ทุกพื้นที่";

  return (
    <>
      <DashboardSidebar
        entries={sidebarEntries}
        userName={userName}
        userEmail={userEmail}
        brand="NetZero"
      />
      <DashboardHeader userLabel={userName} searchPlaceholder="ค้นหาแปลง..." />

      <div className="dashboard-main">
        <main className="relative pt-20 min-h-screen bg-surface px-6 lg:px-10 py-6">
          <div className="flex flex-col w-full relative">
            {/* PDPA CS-02 Notice */}
            <PdpaNotice />

            {/* Header Section */}
            <div className="flex flex-col mb-6 relative z-10 gap-4">
              <div className="w-full">
                <p className="text-label-md text-tertiary uppercase tracking-widest mb-1 flex items-center gap-2">
                  <span className="pulse-live w-2 h-2 rounded-full bg-primary" />
                  ติดตามคาร์บอนแบบเรียลไทม์
                </p>
                <h1 className="text-display-lg text-on-surface whitespace-nowrap">แดชบอร์ดผู้สนับสนุน</h1>
                <p className="text-body-lg text-on-surface-variant max-w-[672px] mt-2">
                  ตรวจสอบผลกระทบของคุณแบบเรียลไทม์ ติดตามการลดการปล่อยก๊าซเรือนกระจกจากแปลงเกษตรที่ได้รับการสนับสนุน
                </p>
                <p className="text-label-md text-outline mt-1">พื้นที่รับผิดชอบ: {areaLabel} · มาตรฐาน T-VER-P-METH-13-08</p>
              </div>
              <div className="mt-4 md:mt-0 flex gap-4 flex-wrap">
                <select
                  value={filterProvince}
                  onChange={(e) => setFilterProvince(e.target.value)}
                  className="rounded-full border border-surface-variant bg-surface-container px-4 py-2 text-label-md text-on-surface"
                >
                  <option value="">ทุกจังหวัด</option>
                  {groups.map((g) => (
                    <option key={g.province} value={g.province}>{g.province}</option>
                  ))}
                </select>
                <select
                  value={filterSeason}
                  onChange={(e) => setFilterSeason(e.target.value)}
                  className="rounded-full border border-surface-variant bg-surface-container px-4 py-2 text-label-md text-on-surface"
                >
                  <option value="">ทุกฤดู</option>
                  {seasonCredits.map((c) => (
                    <option key={c.season_id} value={c.season_id}>{c.season_name}</option>
                  ))}
                </select>
                <Button
                  variant="primary"
                  size="sm"
                  className="rounded-full"
                  onClick={handleExport}
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  ส่งออกรายงาน
                </Button>
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
                {/* Hero KPI: Verified Credits */}
                <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 p-6 rounded-2xl mb-6 relative z-10">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="material-symbols-outlined text-primary text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                    <h2 className="text-headline-lg text-on-surface">คาร์บอนเครดิตที่ยืนยันแล้ว</h2>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-display-xl text-primary font-bold">{formatTons(totalCO2)}</span>
                    <span className="text-body-lg text-on-surface-variant">ตัน CO₂eq</span>
                  </div>
                  <p className="text-label-md text-outline mt-1">
                    ครอบคลุม {summary.totalAreaRai} ไร่ ({(summary.totalAreaRai * 0.16).toFixed(1)} เฮกตาร์) / {summary.totalHouseholds} ครัวเรือน / {totalPlots} แปลง
                  </p>
                  <p className="text-label-sm text-outline mt-1">
                    ฤดูปลูก: นาปี (พ.ย. – เม.ย.) · ช่วงรับรอง: ปีรายงานปัจจุบัน · การประมาณการอาจเปลี่ยนแปลงเมื่อหลักฐานไม่ครบถ้วน
                  </p>
                </div>

                {/* Household methodology note */}
                <p className="text-label-sm text-outline mb-4 -mt-4 relative z-10">
                  * จำนวนครัวเรือนนับจากจำนวน CPA code ที่ไม่ซ้ำในพื้นที่รับผิดชอบ
                </p>

                {/* KPI Cards Row — varied variants */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 relative z-10">
                  <KpiCard
                    title="CO₂ ที่ลดทั้งหมด"
                    value={Math.round(totalCO2)}
                    suffix="ตัน"
                    icon="eco"
                    color="primary"
                    variant="accent"
                    trend={loading ? "กำลังโหลด..." : undefined}
                  />
                  <KpiCard
                    title="แปลงที่ได้รับการสนับสนุน"
                    value={totalPlots}
                    suffix="แปลง"
                    icon="landscape"
                    color="secondary"
                    variant="elevated"
                    trend={loading ? "กำลังโหลด..." : `ครอบคลุม ${groups.length} จังหวัด`}
                  />
                  <KpiCard
                    title="พื้นที่ทั้งหมด"
                    value={summary.totalAreaRai}
                    suffix="ไร่"
                    icon="square_foot"
                    color="secondary"
                    variant="flat"
                    trend={`${(summary.totalAreaRai * 0.16).toFixed(1)} เฮกตาร์ · ${summary.totalHouseholds} ครัวเรือน`}
                  />
                  <KpiCard
                    title="การลงทุนทั้งหมด"
                    value={totalInvestment}
                    suffix=""
                    icon="payments"
                    color="tertiary"
                    variant="flat"
                    trend={`ปี ${new Date().getFullYear() + 543}`}
                    formatValue={formatUSD}
                  />
                </div>

                {/* Bento Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
                  {/* Left Column: Regional Breakdown + GHG + Season Chart */}
                  <div className="lg:col-span-8 flex flex-col gap-6">
                    <h2 className="text-headline-lg text-on-surface">รายละเอียดตามภูมิภาค</h2>
                    {loading ? (
                      <div className="bg-surface-container p-6 rounded-xl">
                        <p className="text-on-surface-variant">กำลังโหลดข้อมูล...</p>
                      </div>
                    ) : (
                      filteredGroups.map((group) => (
                        <ProvinceGroup
                          key={group.province}
                          province={group.province}
                          plots={group.plots as import("@/lib/sponsor").PlotSummary[]}
                          regionCode={getRegionCode(group.province)}
                        />
                      ))
                    )}

                    <GhgSourceTable sources={ghgSources} />

                    {/* Estimate transparency note */}
                    <div className="bg-surface-container-lowest p-4 rounded-xl">
                      <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-outline text-[20px] mt-0.5">info</span>
                        <div>
                          <p className="text-label-md text-on-surface font-medium">ความโปร่งใสของการประมาณการ</p>
                          <p className="text-body-sm text-on-surface-variant mt-1">
                            การประมาณการอาจเปลี่ยนแปลงได้เมื่อหลักฐานยังไม่ครบถ้วน โดยใช้ปัจจัยการจัดการน้ำแบบอนุรักษ์นิยม (SF_w = 0.71)
                          </p>
                        </div>
                      </div>
                    </div>

                    <SeasonChart credits={filteredSeasonCredits} />
                  </div>

                  {/* Right Column: Live Calc + Progress + Impact */}
                  <div className="lg:col-span-4 flex flex-col gap-6">
                    <LiveCalc liveValue={Math.round(totalCO2)} techniques={techniques} />
                    <ProgressBars summary={summary} />
                    <ImpactMetrics summary={summary} />
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
