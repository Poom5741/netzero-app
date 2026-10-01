"use client";

import { useAdminSessionGate } from "@/lib/use-session-gate";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import type { ReactNode } from "react";
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
import { KpiCard } from "@/components/sponsor/kpi-card";
import { DataTable } from "@/components/ui/data-table";

/**
 * AD-OV OverviewScreen — spec 017 admin-design-spec.md:293-320 +:1033,
 * admin-artifact.json AD-OV. Restyle only: ALL live API wiring, hooks,
 * state, and the season-filter logic are preserved verbatim (R-025).
 * Artifact structure: PageTitle (page-local pattern per DECIDED O-6,
 * decision.json — NOT a shared component) with the artifact Thai copy
 * verbatim (R-028) and the live season filter in its actions slot; KPI
 * StatTile row via the restyled KpiCard (T-210); work-queue Section with
 * artifact card titles bound to live counts; CreditChart = explicitly-
 * labelled DEFERRED placeholder frame (R-015 — no chart code, no data-
 * shape invention); GHG + Province DataTables via ui/data-table.tsx,
 * province rows navigating to /admin/farmers (spec :311).
 */
export default function AdminOverviewPage() {
  const [kpis, setKpis] = useState<OverviewKpis | null>(null);
  const [workQueue, setWorkQueue] = useState<WorkQueueAlerts | null>(null);
  const [creditChart, setCreditChart] = useState<CreditChartItem[]>([]);
  const [ghgSources, setGhgSources] = useState<GhgSourceItem[]>([]);
  const [provinces, setProvinces] = useState<ProvinceTableItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const authed = useAdminSessionGate();
  const [seasonFilter, setSeasonFilter] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    if (!authed) return;
    let cancelled = false;
    queueMicrotask(() => setLoading(true));

    Promise.all([
      getOverviewKpis(seasonFilter || undefined).catch(() => null),
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
  }, [authed, seasonFilter]);

  if (authed === null) return null;

  return (
    <main className="pt-14 lg:pt-14 px-4 lg:px-10 pb-10">
      <div className="max-w-[1400px] flex flex-col gap-6">
        {/* PageTitle — artifact copy verbatim; actions slot = live season
            filter (condition + options source unchanged, R-025). */}
        <PageTitle
          eyebrow="ภาพรวมโครงการ"
          title="โครงการทำนาลดโลกร้อน — ทุกพื้นที่"
          sub="ต.หนองสะเดา อ.สามชุก จ.สุพรรณบุรี และ จ.ชัยนาท · ระเบียบวิธี T-VER-P-METH-13-08 ฉบับที่ 01 · แนวทางการประเมินที่ 3 (ค่าแนะนำ)"
          actions={
            creditChart.length > 0 && (
              <div className="flex items-center gap-2">
                <label htmlFor="season-filter" className="text-label-md text-on-surface-variant whitespace-nowrap">
                  กรองตามฤดูกาล:
                </label>
                <select
                  id="season-filter"
                  value={seasonFilter}
                  onChange={(e) => setSeasonFilter(e.target.value)}
                  className="h-9 px-3 pr-8 rounded-lg border border-outline-variant bg-surface-container-low text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                >
                  <option value="">ทุกฤดูกาล</option>
                  {creditChart.map((item) => (
                    <option key={item.season} value={item.season}>
                      {item.season}
                    </option>
                  ))}
                </select>
              </div>
            )
          }
        />

        {loading && (
          <div className="card p-6 text-center rounded-xl">
            <div className="flex justify-center gap-2 mb-2">
              <div className="typing-dot w-3 h-3 rounded-full bg-primary" />
              <div className="typing-dot w-3 h-3 rounded-full bg-primary" />
              <div className="typing-dot w-3 h-3 rounded-full bg-primary" />
            </div>
            <p className="text-body-md text-on-surface-variant">กำลังโหลด...</p>
          </div>
        )}

        {error && (
          <div className="card p-6 text-center rounded-xl">
            <span className="material-symbols-outlined text-error text-4xl mb-2">error</span>
            <p className="text-body-md text-on-surface">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* KPI StatTiles — artifact StatTile chrome via the restyled
                KpiCard (T-210). Live labels/units/icons kept bound to the
                OverviewKpis fields (R-025): the artifact mock labels bind
                to FARMERS.length/totalRai/GHG_2569 mock globals
                (admin-artifact.json:403-431) that have no live counterpart
                — adopting them would mislabel real data. Credits tile = the
                one emphasis chrome StatTile defines: tone="dark" (the
                legacy variant="accent" alias), decimals preserved via
                formatValue. */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-label="ตัวชี้วัดหลัก">
              <KpiCard
                icon="group"
                title="เกษตรกรทั้งหมด"
                value={kpis?.totalFarmers ?? 0}
                suffix="ราย"
              />
              <KpiCard
                icon="landscape"
                title="แปลงทั้งหมด"
                value={kpis?.totalPlots ?? 0}
                suffix="แปลง"
              />
              <KpiCard
                icon="pending_actions"
                title="รอตรวจสอบภาพ"
                value={kpis?.pendingReviews ?? 0}
                suffix="รายการ"
              />
              <KpiCard
                icon="co2"
                title="เครดิตคาร์บอน"
                value={kpis?.totalCredits ?? 0}
                suffix="tCO2e"
                tone="dark"
                formatValue={(n) => n.toFixed(2)}
              />
            </section>

            {/* Work Queue — artifact section title (R-028); artifact card
                titles (admin-artifact.json:433-461) bound to the live
                WorkQueueAlerts counts, hrefs, and urgency thresholds
                (unchanged, R-025). Tone = artifact --status-*-soft tints
                (AD-OV tokensUsed) mapped from the live urgency value. */}
            {workQueue && (
              <Section title="คิวงานที่ต้องดำเนินการ" ariaLabel="งานค้าง">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <WorkQueueCard
                    icon="assignment"
                    title="ใบสมัครรอตรวจ (AD-10)"
                    count={workQueue.pendingApplications}
                    href="/admin/applications"
                    urgency={workQueue.pendingApplications > 10 ? "high" : "normal"}
                  />
                  <WorkQueueCard
                    icon="photo_library"
                    title="ภาพหลักฐานรอตรวจ"
                    count={workQueue.photoQueue}
                    href="/admin/applications"
                    urgency={workQueue.photoQueue > 20 ? "high" : "normal"}
                  />
                  <WorkQueueCard
                    icon="photo_camera"
                    title="แปลงที่หลักฐานยังไม่ครบ 4 ภาพ"
                    count={workQueue.missingPhotos}
                    href="/admin/farmers"
                    urgency={workQueue.missingPhotos > 5 ? "high" : "normal"}
                  />
                  <WorkQueueCard
                    icon="water"
                    title="แปลงที่ถอยไปใช้ SF_w = 0.71"
                    count={workQueue.sfwFallback}
                    href="/admin/farmers"
                    urgency={workQueue.sfwFallback > 0 ? "medium" : "normal"}
                  />
                </div>
              </Section>
            )}

            {/* CreditChart — DEFERRED placeholder frame (R-015: no chart
                code, no data-shape invention). The live creditChart data
                still feeds the season filter above (wiring preserved,
                R-025); only the hand-rolled bar rendering is removed.
                Section title from the artifact action label
                (admin-design-spec.md:306 "กราฟสรุปเครดิต"). */}
            <Section title="กราฟสรุปเครดิต" ariaLabel="กราฟเครดิต">
              <div
                data-deferred="R-015"
                className="flex flex-col items-center justify-center text-center"
                style={{ border: "1px dashed var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "var(--space-12, 48px) var(--space-6)", gap: "var(--space-2)" }}
              >
                <span className="text-xs font-semibold uppercase" style={{ color: "var(--text-muted)", letterSpacing: "var(--tracking-eyebrow)" }}>
                  DEFERRED — CREDIT CHART
                </span>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  กราฟเปรียบเทียบเครดิตรายฤดูกาลยังไม่ดำเนินการ (R-015 deferred placeholder)
                </p>
              </div>
            </Section>

            {/* GHG source DataTable (dense). Live shape GhgSourceItem =
                {source, value} (lib/api.ts:145-148): the artifact mock
                table is 6 rows x 5 cols (admin-design-spec.md:309) but its
                other columns have no live API source — rendering the two
                live columns only (R-025/R-015; noted in report). */}
            {ghgSources.length > 0 && (
              <Section title="แหล่งก๊าซเรือนกระจก (GHG)" ariaLabel="แหล่งก๊าซเรือนกระจก">
                <DataTable
                  dense
                  columns={[
                    { key: "source", header: "แหล่งที่มา" },
                    { key: "value", header: "ปริมาณ (tCO2e)", align: "right" },
                  ]}
                  rows={ghgSources.map((src) => ({ source: src.source, value: src.value.toFixed(2) }))}
                  rowKey={(row) => String(row.source)}
                />
              </Section>
            )}

            {/* Province DataTable — onRowClick navigates to AD-FAR
                (admin-design-spec.md:311); live ProvinceTableItem columns
                (lib/api.ts:150-155). */}
            {provinces.length > 0 && (
              <Section title="สรุปตามจังหวัด" ariaLabel="ตารางจังหวัด">
                <DataTable
                  columns={[
                    { key: "province", header: "จังหวัด" },
                    { key: "sponsor", header: "ผู้สนับสนุน" },
                    { key: "plots", header: "แปลง", align: "right" },
                    { key: "credits", header: "เครดิต (tCO2e)", align: "right" },
                  ]}
                  rows={provinces.map((prov) => ({ province: prov.province, sponsor: prov.sponsor, plots: prov.plots, credits: prov.credits.toFixed(2) }))}
                  rowKey={(row) => String(row.province)}
                  onRowClick={() => router.push("/admin/farmers")}
                />
              </Section>
            )}
          </>
        )}
      </div>
    </main>
  );
}

// ── PageTitle — page-local pattern (DECIDED O-6, decision.json: PageTitle
// and Section are PAGE-LOCAL patterns implemented per-screen from the
// Shared Component Inventory geometry, NOT shared components). ──
// Geometry: admin-design-spec.md:504-510. Eyebrow --text-xs semibold
// --teal-600 uppercase --tracking-eyebrow marginBottom --space-1; title
// --text-3xl light --text-heading leading-tight (artifact --text-3xl =
// 38px — literal because Tailwind theme --text-3xl is 30px;
// sponsor-design-spec.md:508); sub --text-sm --text-muted marginTop
// --space-2 maxWidth 72ch; actions slot marginLeft auto.

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
          style={{ color: "var(--teal-600)", letterSpacing: "var(--tracking-eyebrow)", marginBottom: "var(--space-1)" }}
        >
          {eyebrow}
        </p>
        <h1
          style={{ fontSize: "38px", fontWeight: "var(--weight-light)", color: "var(--text-heading)", lineHeight: 1.25, margin: 0 }}
        >
          {title}
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)", marginTop: "var(--space-2)", maxWidth: "72ch" }}>
          {sub}
        </p>
      </div>
      {actions ? <div style={{ marginLeft: "auto" }}>{actions}</div> : null}
    </div>
  );
}

// ── Section — page-local pattern (DECIDED O-6). ──
// Geometry: admin-design-spec.md:512-518. Container bg --surface-card,
// border 1px solid --border-subtle, radius --radius-card, shadow
// --shadow-xs, overflow hidden; header padding --space-4 --space-6, flex
// centre space-between, borderBottom --border-subtle; body padding
// --space-6 when pad=true.

function Section({
  title,
  actions,
  children,
  pad = true,
  ariaLabel,
}: {
  title?: string;
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
            padding: "var(--space-4) var(--space-6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-heading)", margin: 0 }}>
            {title}
          </h2>
          {actions}
        </div>
      ) : null}
      {pad ? <div style={{ padding: "var(--space-6)" }}>{children}</div> : children}
    </section>
  );
}

// ── Work Queue Card — page-local, artifact work-card chrome. ──
// Artifact workQueueCards (admin-artifact.json:433-461) with tone as the
// --status-*-soft tints listed in AD-OV tokensUsed; the live urgency
// thresholds map high→danger-soft / medium→warning-soft / normal→card.
// ui/badge is not used here: its text-pill pattern requires a label and
// the artifact card tags ("ค้าง 5 วัน" / "กระทบเครดิต") are mock values
// with no live data source (R-025/R-015) — noted in the task report.

function WorkQueueCard({
  icon,
  title,
  count,
  href,
  urgency,
}: {
  icon: string;
  title: string;
  count: number;
  href: string;
  urgency: "normal" | "medium" | "high";
}) {
  const bg =
    urgency === "high"
      ? "var(--status-danger-soft)"
      : urgency === "medium"
        ? "var(--status-warning-soft)"
        : "var(--surface-card)";
  return (
    <a
      href={href}
      className="block"
      style={{
        background: bg,
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-card)",
        padding: "var(--space-5) var(--space-6)",
      }}
    >
      <div className="flex items-center justify-between gap-2" style={{ marginBottom: "var(--space-2)" }}>
        <span className="material-symbols-outlined" style={{ color: "var(--text-muted)", fontSize: "20px" }} aria-hidden="true">
          {icon}
        </span>
        {urgency === "high" ? <span aria-hidden="true" style={{ width: "8px", height: "8px", borderRadius: "var(--radius-circle, 50%)", background: "var(--status-danger)" }} /> : null}
      </div>
      <p style={{ fontSize: "38px", fontWeight: "var(--weight-light)", lineHeight: 1.1, color: "var(--text-heading)", fontVariantNumeric: "tabular-nums", margin: 0 }}>
        {count}
      </p>
      <p className="text-sm" style={{ color: "var(--text-muted)", margin: 0, marginTop: "var(--space-1)" }}>
        {title}
      </p>
    </a>
  );
}
