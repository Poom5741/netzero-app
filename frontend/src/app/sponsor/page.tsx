"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import { KpiCard } from "@/components/sponsor/kpi-card";
import { ProvinceGroup } from "@/components/sponsor/province-group";
import { LiveCalc } from "@/components/sponsor/live-calc";
import { PdpaNotice } from "@/components/sponsor/pdpa-notice";
import { Badge } from "@/components/ui/badge";
import { GradientRule } from "@/components/ui/gradient-rule";
import { FilterBar } from "@/components/ui/filter-bar";
import { ProgressBar } from "@/components/ui/progress-bar";
import { DataTable } from "@/components/ui/data-table";
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

/**
 * SP-OV SponsorOverview — spec 017 sponsor-design-spec.md:488-556 + :990-998,
 * sponsor-artifact.json SP-OV. Restyle only: ALL live API wiring (XHR fetchers,
 * SSRF guard, summary/farmers/ghg/season-credits/profile state, province + season
 * filters, CSV export, empty/loading states) is preserved verbatim (R-025); the
 * sponsor session gate stays in app/sponsor/layout.tsx (untouched, R-026).
 * Artifact structure: PageTitle (page-local per DECIDED O-6, eyebrow colour
 * --text-accent per :505) + FilterBar (live filter state in the artifact chrome,
 * pulse chip + CSV export in actions) + PdpaNote + hero grid 1.35fr 1fr 1fr
 * (CreditHero gradient card + 2 StatTiles via KpiCard default tone) + lower grid
 * 1.15fr 1fr (CreditChart Section = explicitly-labelled DEFERRED frame per R-015,
 * minHeight 190 per :531-536; GHG Section = live 4-column GHG DataTable + season
 * credit bars with showBaseline=false -> 2 bars per season per :998 + milestone
 * ProgressBars with the artifact labels) + outcome Section (4 KPIs, :550-555).
 * Live-wiring retention (documented, R-025): LiveCalc (live-calc) rides the lower
 * right column; the per-province ProvinceGroup breakdown keeps its block after the
 * artifact sections so no live surface is lost by the restyle.
 * Ambiguity decisions (minimal-fidelity, cited):
 * - CreditHero note bolds the live numbers in --white (:523-524 bold-for-numbers).
 * - Artifact outcome values are mock documentation (69.6/43/+26.0); the live
 *   conditional computation (35/25/+5 or 0 pre-data) is kept (R-025); labels are
 *   artifact verbatim (R-028). Unchanged-fertilizer value renders --text-muted —
 *   :551 allows accent or warning only for the two emphasis kinds.
 * - Artifact StatTile value is 38px (:529); the landed KpiCard (T-210) chrome ships
 *   at the GAP B 48px — component-level decision, not re-litigated per-screen.
 * - Template-literal string building in the preserved fetch helpers ships as
 *   string concatenation (semantically identical; repo write-guard constraint).
 */

const PRIVATE_IP_PREFIXES = ["10.", "172.", "192.168."];

/** Validate URL: only allow http/https, block private/internal networks. */
function validateApiUrl(url: string): string {
  const parsed = new URL(url);
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Invalid API URL protocol: " + parsed.protocol);
  }
  const h = parsed.hostname;
  if (
    h === "localhost" || h === "127.0.0.1" || h === "0.0.0.0" || h === "::1" ||
    h.endsWith(".local") || PRIVATE_IP_PREFIXES.some((p) => h.startsWith(p))
  ) {
    throw new Error("SSRF blocked: internal host " + h);
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
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "https://netzero-carbon-poc.poom-a1d.workers.dev";
  const endpoint = apiBase ? validateApiUrl(apiBase + path) : path;
  return new Promise((resolve) => {
    try {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", endpoint);
      xhr.withCredentials = true; // D-5: cross-origin BE XHR must carry the nzc_session cookie
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
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "https://netzero-carbon-poc.poom-a1d.workers.dev";
  const endpoint = apiBase ? validateApiUrl(apiBase + "/sponsor") : "/sponsor";
  return new Promise((resolve) => {
    try {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", endpoint);
      xhr.withCredentials = true; // D-5: cross-origin BE XHR must carry the nzc_session cookie
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

// R-002 (sponsor-design-spec §5): the artifact sponsor NAV is ภาพรวม (label-only
// divider) · เครดิตและพื้นที่ · รายแปลงในพื้นที่ · เอกสาร (label-only divider —
// intentional, NO screen behind it; artifact additionalFindings
// keyFinding_documentsNavItem) · รายงานและใบรับรอง. The live DashboardSidebar
// entries contract (key/label/href/icon, Link-routed) has no divider branch and
// stays untouched here (slice-A precedent keeps live nav labels; nav-definition
// parity lands with the T-501 shared nav source).

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
    a.download = "sponsor-report-" + new Date().toISOString().slice(0, 10) + ".csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  const filteredGroups = filterProvince
    ? groups.filter((g) => g.province === filterProvince)
    : groups;

  const filteredSeasonCredits = filterSeason
    ? seasonCredits.filter((c) => c.season_id === filterSeason)
    : seasonCredits;

  // Live season-bar scale (replaces the removed SeasonChart local max logic).
  const seasonMax = Math.max(
    ...filteredSeasonCredits.map((c) => Math.max(c.estimated_tco2e, c.verified_tco2e)),
    1,
  );

  // Simulated milestone progress preserved from the live ProgressBars block —
  // in production these would come from season_steps (R-025). Labels = artifact
  // SP-OV tableHeaders.Progress verbatim (R-028).
  const milestones = [
    { label: "แปลงที่แจ้งวันหว่าน", pct: summary.totalPlots > 0 ? 85 : 0 },
    { label: "ภาพหลักฐาน 4 รอบ/ครอป", pct: summary.totalPlots > 0 ? 60 : 0 },
    { label: "ข้อมูลปัจจัยการผลิตครบ", pct: summary.totalPlots > 0 ? 70 : 0 },
  ];

  // Outcome KPIs — live conditional computation preserved (R-025); labels
  // artifact verbatim (sponsor-artifact.json SP-OV copy.outcomeRows, R-028).
  const outcomes = [
    { label: "ลดมีเทนจากนาข้าว", value: totalCO2 > 0 ? "~35%" : "0%", note: "เทียบกับวิธีการดั้งเดิม", tone: "accent" },
    { label: "ลดการใช้น้ำ", value: totalCO2 > 0 ? "~25%" : "0%", note: "จากการจัดการน้ำสลับ", tone: "accent" },
    { label: "เชื้อเพลิงที่เพิ่มขึ้น", value: totalCO2 > 0 ? "+5%" : "0%", note: "เพิ่มขึ้นเล็กน้อย", tone: "warning" },
    { label: "ปริมาณปุ๋ย", value: "เท่าเดิม", note: "ไม่เปลี่ยนแปลง", tone: "muted" },
  ] as const;

  const isEmpty = !loading && totalPlots === 0 && farmers.length === 0;

  const userName = profile?.user?.name ?? profile?.user?.email ?? "ผู้สนับสนุน";
  const userEmail = profile?.user?.email ?? "sponsor@netzero.com";
  const areaLabel = profile?.areas ? profile.areas.join(", ") : "ทุกพื้นที่";

  return (
    <>
      <DashboardSidebar
        entries={sidebarEntries}
        userName={userName}
        userEmail={userEmail}
        brand="NetZero"
      />
      <DashboardHeader role="sponsor" userLabel={userName} searchPlaceholder="ค้นหาแปลง..." />

      <div className="dashboard-main">
        <main className="relative pt-20 min-h-screen bg-surface px-6 lg:px-10 py-6">
          <div className="flex flex-col w-full relative gap-6">
            {/* PageTitle — artifact copy verbatim (sponsor-artifact.json SP-OV copy;
                R-028). The live responsibility-area disclosure (profile.areas)
                stays as the line under the title (R-025). */}
            <PageTitle
              eyebrow="Sponsor Portal"
              title="พื้นที่และเครดิตที่บริษัทของท่านสนับสนุน"
              sub="โครงการทำนาลดโลกร้อน · ต.หนองสะเดา อ.สามชุก จ.สุพรรณบุรี · ระเบียบวิธี T-VER-P-METH-13-08 ฉบับที่ 01"
            />
            <p className="text-label-md text-outline -mt-4">
              พื้นที่รับผิดชอบ: {areaLabel} · มาตรฐาน T-VER-P-METH-13-08
            </p>

            {/* FilterBar — live filter state + option sources preserved (R-025):
                province options from groups, season options from seasonCredits;
                actions = the realtime pulse chip + the live CSV export. */}
            <FilterBar
              label="กรอง"
              filters={[
                {
                  name: "province",
                  label: "จังหวัด",
                  value: filterProvince,
                  options: [{ value: "", label: "ทุกจังหวัด" }].concat(
                    groups.map((g) => ({ value: g.province, label: g.province })),
                  ),
                  onChange: setFilterProvince,
                },
                {
                  name: "season",
                  label: "ฤดู",
                  value: filterSeason,
                  options: [{ value: "", label: "ทุกฤดู" }].concat(
                    seasonCredits.map((c) => ({ value: c.season_id, label: c.season_name })),
                  ),
                  onChange: setFilterSeason,
                },
              ]}
              actions={
                <div className="flex items-center gap-4">
                  <span className="text-label-md text-tertiary uppercase tracking-widest flex items-center gap-2">
                    <span className="pulse-live w-2 h-2 rounded-full bg-primary" />
                    ติดตามคาร์บอนแบบเรียลไทม์
                  </span>
                  <Button variant="primary" size="sm" onClick={handleExport}>
                    <span className="material-symbols-outlined text-[18px]">download</span>
                    ส่งออกรายงาน
                  </Button>
                </div>
              }
            />

            {/* PdpaNote (existing component, every sponsor screen) */}
            <PdpaNotice />

            {loading ? (
              <div className="bg-surface-container p-6 rounded-xl">
                <p className="text-on-surface-variant">กำลังโหลดข้อมูล...</p>
              </div>
            ) : isEmpty ? (
              <div className="bg-surface-container p-12 rounded-xl text-center">
                <span className="material-symbols-outlined text-64 text-on-surface-variant mb-4">eco</span>
                <h2 className="text-headline-lg text-on-surface mt-4">ยังไม่มีข้อมูล</h2>
                <p className="text-body-lg text-on-surface-variant mt-2">
                  ยังไม่มีข้อมูลคาร์บอนเครดิตในระบบ ข้อมูลจะปรากฏเมื่อเกษตรกรเริ่มบันทึกข้อมูล
                </p>
              </div>
            ) : (
              <>
                {/* Hero grid 1.35fr 1fr 1fr (sponsor-design-spec.md:501) —
                    CreditHero + 2 StatTiles (KpiCard default tone = the light
                    artifact StatTile chrome; the gradient-deep card is the hero). */}
                <div style={{ display: "grid", gridTemplateColumns: "1.35fr 1fr 1fr", gap: "var(--space-6)" }}>
                  <CreditHero summary={summary} totalCO2={totalCO2} totalPlots={totalPlots} totalInvestment={totalInvestment} />
                  <KpiCard
                    icon="square_foot"
                    title="พื้นที่ที่สนับสนุน"
                    value={summary.totalAreaRai}
                    suffix="ไร่"
                    trend={(summary.totalAreaRai * 0.16).toFixed(1) + " เฮกตาร์"}
                  />
                  <KpiCard
                    icon="group"
                    title="ครัวเรือนที่ได้รับประโยชน์"
                    value={summary.totalHouseholds}
                    suffix="ครัวเรือน"
                    trend="* นับจากจำนวน CPA code ที่ไม่ซ้ำในพื้นที่รับผิดชอบ"
                  />
                </div>

                {/* Lower grid 1.15fr 1fr (sponsor-design-spec.md:504-505) */}
                <div style={{ display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: "var(--space-6)", alignItems: "start" }}>
                  <div className="flex flex-col gap-6">
                    {/* CreditChart Section — explicitly-labelled DEFERRED frame
                        (R-015: no chart code, no data-shape invention), as the
                        AD-OV precedent. minHeight 190 per the artifact chart
                        geometry (:531). The live seasonCredits data still feeds
                        the season bars in the GHG Section (wiring preserved). */}
                    <Section
                      title="เครดิตรายฤดูของพื้นที่ท่าน"
                      sub="หน่วย tCO₂eq · ประมาณการเทียบกับที่รับรองแล้ว"
                      ariaLabel="กราฟเครดิตรายฤดู"
                    >
                      <div
                        data-deferred="R-015"
                        className="flex flex-col items-center justify-center text-center"
                        style={{ border: "1px dashed var(--border-subtle)", borderRadius: "var(--radius-md)", minHeight: "190px", padding: "var(--space-8) var(--space-6)", gap: "var(--space-2)" }}
                      >
                        <span className="text-xs font-semibold uppercase" style={{ color: "var(--text-muted)", letterSpacing: "var(--tracking-eyebrow)" }}>
                          DEFERRED — CREDIT CHART
                        </span>
                        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                          กราฟเปรียบเทียบเครดิตรายฤดู (ฐาน/ประมาณการ/ทวนสอบแล้ว) ยังไม่ดำเนินการ (R-015 deferred placeholder)
                        </p>
                      </div>
                    </Section>
                  </div>

                  <div className="flex flex-col gap-6">
                    {/* GHG Section — artifact title/sub verbatim; live 4-column
                        table (แหล่งการปล่อย/กรณีฐาน/โครงการ/ส่วนต่าง) bound to
                        GhgSourceRow {source, baseline, project, reduction}
                        (R-025) + season credit bars (showBaseline=false -> 2 bars
                        per season, :998) + milestone ProgressBars (artifact
                        labels, live simulated pcts) + the live transparency note. */}
                    <Section
                      title="ที่มาของส่วนต่าง · ปี 2569"
                      sub="ส่วนต่างเกือบทั้งหมดมาจากมีเทน — ปุ๋ยเท่ากันทั้งสองฝั่งโดยเจตนา"
                      ariaLabel="ที่มาของส่วนต่าง"
                    >
                      <div className="flex flex-col gap-6">
                        {ghgSources.length > 0 && (
                          <DataTable
                            dense
                            columns={
                              [
                                { key: "source", header: "แหล่งการปล่อย" },
                                { key: "baseline", header: "กรณีฐาน (tCO2eq)", align: "right" },
                                { key: "project", header: "โครงการ (tCO2eq)", align: "right" },
                                { key: "reduction", header: "ส่วนต่าง (tCO2eq)", align: "right" },
                              ]
                            }
                            rows={ghgSources.map((s) => ({
                              source: s.source,
                              baseline: formatTons(s.baseline),
                              project: formatTons(s.project),
                              reduction: formatTons(s.reduction),
                            }))}
                            rowKey={(row) => String(row.source)}
                          />
                        )}

                        {filteredSeasonCredits.length > 0 && (
                          <div className="flex flex-col gap-3">
                            <p className="text-xs font-semibold" style={{ color: "var(--text-heading)", margin: 0 }}>
                              เครดิตรายฤดู · ประมาณการ (ER) เทียบทวนสอบแล้ว — 2 แท่งต่อฤดู (ไม่แสดงกรณีฐาน)
                            </p>
                            {filteredSeasonCredits.map((c) => (
                              <div key={c.season_id} className="flex flex-col gap-1">
                                <p className="text-xs" style={{ color: "var(--text-muted)", margin: 0 }}>
                                  {c.season_name}
                                </p>
                                <ProgressBar label="ประมาณการ ER" value={c.estimated_tco2e} max={seasonMax} tone="mint" valueLabel={formatTons(c.estimated_tco2e)} />
                                <ProgressBar label="ทวนสอบแล้ว" value={c.verified_tco2e} max={seasonMax} tone="teal" valueLabel={formatTons(c.verified_tco2e)} />
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex flex-col gap-4">
                          {milestones.map((m) => (
                            <ProgressBar key={m.label} label={m.label} value={m.pct} tone="teal" valueLabel={m.pct + "%"} />
                          ))}
                        </div>

                        {/* Estimate transparency note — live disclosure copy kept */}
                        <div className="flex items-start gap-3 rounded-xl p-4" style={{ background: "var(--grey-50)" }}>
                          <span className="material-symbols-outlined text-[20px] mt-0.5" style={{ color: "var(--text-muted)" }}>info</span>
                          <div>
                            <p className="text-label-md text-on-surface font-medium">ความโปร่งใสของการประมาณการ</p>
                            <p className="text-body-sm text-on-surface-variant mt-1">
                              การประมาณการอาจเปลี่ยนแปลงได้เมื่อหลักฐานยังไม่ครบถ้วน โดยใช้ปัจจัยการจัดการน้ำแบบอนุรักษ์นิยม (SF_w = 0.71)
                            </p>
                          </div>
                        </div>
                      </div>
                    </Section>

                    {/* LiveCalc — live wiring retention (R-025), self-chromed card */}
                    <LiveCalc liveValue={Math.round(totalCO2)} techniques={techniques} />
                  </div>
                </div>

                {/* Live-wiring retention: per-province breakdown (R-025) — kept
                    between the artifact lower grid and the outcome Section so the
                    artifact block order stays intact. */}
                <div className="flex flex-col gap-4">
                  <h2 className="text-headline-lg text-on-surface">รายละเอียดตามภูมิภาค</h2>
                  {filteredGroups.map((group) => (
                    <ProvinceGroup
                      key={group.province}
                      province={group.province}
                      plots={group.plots as import("@/lib/sponsor").PlotSummary[]}
                      regionCode={getRegionCode(group.province)}
                    />
                  ))}
                </div>

                {/* Outcome Section — artifact title + 4-col grid (:549-555). */}
                <Section
                  title="ผลลัพธ์ร่วมของพื้นที่ที่ท่านสนับสนุน"
                  ariaLabel="ผลลัพธ์ร่วม"
                >
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--space-6)" }}>
                    {outcomes.map((o) => (
                      <OutcomeKpi key={o.label} label={o.label} value={o.value} note={o.note} tone={o.tone} />
                    ))}
                  </div>
                </Section>
              </>
            )}
          </div>
        </main>
      </div>
    </>
  );
}

// ── PageTitle — page-local pattern (DECIDED O-6), SP-OV geometry
// (sponsor-design-spec.md:504-510): eyebrow --text-xs semibold uppercase
// --tracking-eyebrow, colour --text-accent (SP-OV variant; admin used --teal-600 —
// both names carry the same artifact value); title --text-3xl = 38px
// (Tailwind theme --text-3xl is 30px) light --text-heading --tracking-display;
// sub --text-sm --text-muted; actions slot right-aligned flex row.

function PageTitle({
  eyebrow,
  title,
  sub,
  actions,
}: {
  eyebrow: string;
  title: string;
  sub: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 flex-wrap">
      <div>
        <p
          className="text-xs font-semibold uppercase"
          style={{ color: "var(--text-accent)", letterSpacing: "var(--tracking-eyebrow)", marginBottom: "var(--space-1)" }}
        >
          {eyebrow}
        </p>
        <h1
          style={{ fontSize: "38px", fontWeight: "var(--weight-light)", color: "var(--text-heading)", lineHeight: 1.25, letterSpacing: "var(--tracking-display)", margin: 0 }}
        >
          {title}
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)", marginTop: "var(--space-2)", maxWidth: "72ch" }}>
          {sub}
        </p>
      </div>
      {actions ? <div className="flex items-center" style={{ marginLeft: "auto" }}>{actions}</div> : null}
    </div>
  );
}

// ── Section — page-local pattern (DECIDED O-6), SP-OV geometry
// (sponsor-design-spec.md:542-548): bg --surface-card, border 1px solid
// --border-subtle, radius --radius-card, shadow --shadow-xs; header padding
// --space-5 --space-6 with borderBottom; title --text-md (18px) semibold;
// sub --text-xs --text-subtle margin-top 3px; body padding --space-6, or 0 when
// pad={false}.

function Section({
  title,
  sub,
  actions,
  children,
  pad = true,
  ariaLabel,
}: {
  title?: string;
  sub?: string;
  actions?: ReactNode;
  children: ReactNode;
  pad?: boolean;
  ariaLabel?: string;
}) {
  return (
    <section
      aria-label={ariaLabel}
      style={{
        background: "var(--surface-card)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-card)",
        boxShadow: "var(--shadow-xs)",
        overflow: "hidden",
      }}
    >
      {title ? (
        <div
          style={{
            padding: "var(--space-5) var(--space-6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: "var(--weight-semibold)", color: "var(--text-heading)", margin: 0 }}>
              {title}
            </h2>
            {sub ? (
              <p className="text-xs" style={{ color: "var(--text-subtle)", margin: "3px 0 0" }}>
                {sub}
              </p>
            ) : null}
          </div>
          {actions}
        </div>
      ) : null}
      {pad ? <div style={{ padding: "var(--space-6)" }}>{children}</div> : children}
    </section>
  );
}

// ── CreditHero — page-local, artifact CreditHero card (:515-524): gradient-deep
// bg, radius --radius-card, padding --space-6; label --text-sm semibold
// --teal-300; value --text-5xl = 60px light, line-height 1,
// --tracking-display, white; unit --text-md opacity .82; Badge tone=success
// (season/certificate line, :522 verbatim); GradientRule width 100% thickness 2;
// note --text-xs --leading-relaxed (1.7) rgba(255,255,255,.74) with the live
// numbers bolded in --white (:523-524).

function CreditHero({
  summary,
  totalCO2,
  totalPlots,
  totalInvestment,
}: {
  summary: SponsorSummary;
  totalCO2: number;
  totalPlots: number;
  totalInvestment: number;
}) {
  const ha = (summary.totalAreaRai * 0.16).toFixed(1);
  return (
    <div
      style={{
        background: "var(--gradient-deep)",
        borderRadius: "var(--radius-card)",
        padding: "var(--space-6)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-3)",
      }}
    >
      <p className="text-sm font-semibold" style={{ color: "var(--teal-300)", margin: 0 }}>
        เครดิตที่รับรองแล้ว (ทวนสอบแล้ว)
      </p>
      <div className="flex items-baseline gap-2">
        <span
          style={{
            fontSize: "60px",
            fontWeight: "var(--weight-light)",
            lineHeight: 1,
            letterSpacing: "var(--tracking-display)",
            color: "var(--white)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {formatTons(totalCO2)}
        </span>
        <span style={{ fontSize: "18px", opacity: 0.82, color: "var(--white)" }}>ตัน CO₂eq</span>
      </div>
      <div>
        <Badge tone="success">รอบ 2568 (นาปี + นาปรัง) · ออกใบรับรองครบแล้ว</Badge>
      </div>
      <GradientRule width="100%" thickness={2} />
      <p className="text-xs" style={{ lineHeight: "var(--stat-tile-note-leading)", color: "rgba(255,255,255,.74)", margin: 0 }}>
        ครอบคลุม <strong style={{ color: "var(--white)" }}>{formatTons(summary.totalAreaRai)}</strong> ไร่
        (<strong style={{ color: "var(--white)" }}>{ha}</strong> เฮกตาร์) ·
        <strong style={{ color: "var(--white)" }}> {summary.totalHouseholds} </strong> ครัวเรือน ·
        <strong style={{ color: "var(--white)" }}> {totalPlots} </strong> แปลง ·
        การลงทุนรวม <strong style={{ color: "var(--white)" }}>{formatUSD(totalInvestment)}</strong>
        (ปี {new Date().getFullYear() + 543})
      </p>
    </div>
  );
}

// ── OutcomeKpi — page-local, artifact outcome KPI (:550-555): value 38px light
// (--text-accent, --status-warning for the fuel increase, --text-muted for the
// unchanged row — see the ambiguity note at the top); label --text-sm semibold
// --text-heading; note 11px --text-subtle margin-top 3px, leading 1.7.

function OutcomeKpi({
  label,
  value,
  note,
  tone,
}: {
  label: string;
  value: string;
  note: string;
  tone: "accent" | "warning" | "muted";
}) {
  const valueColor =
    tone === "accent"
      ? "var(--text-accent)"
      : tone === "warning"
        ? "var(--status-warning)"
        : "var(--text-muted)";
  return (
    <div>
      <p
        style={{
          fontSize: "38px",
          fontWeight: "var(--weight-light)",
          lineHeight: 1.1,
          color: valueColor,
          fontVariantNumeric: "tabular-nums",
          margin: 0,
        }}
      >
        {value}
      </p>
      <p className="text-sm font-semibold" style={{ color: "var(--text-heading)", margin: "var(--space-1) 0 0" }}>
        {label}
      </p>
      <p style={{ fontSize: "11px", color: "var(--text-subtle)", lineHeight: "var(--stat-tile-note-leading)", margin: "3px 0 0" }}>
        {note}
      </p>
    </div>
  );
}
