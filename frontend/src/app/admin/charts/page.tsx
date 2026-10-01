"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useAdminSessionGate } from "@/lib/use-session-gate";
import { getGhgSources, type GhgSourceItem } from "@/lib/api";
import { FilterBar } from "@/components/ui/filter-bar";
import { DataTable } from "@/components/ui/data-table";

/**
 * AD-CHART ChartsScreen — T-309, spec 017 admin-design-spec.md:371-394
 * (structure) + :697-711 (chart dimensions) + :1036/:1041 (gap rows:
 * no dedicated route existed). Shell ONLY per T-309 (R-015, E4):
 * PageTitle + FilterBar + the three-row desktop grid geometry + the
 * GHG DataTable. No chart implementations ship on this page.
 *
 * R-015 (no data-shape invention): the six deferred chart types render
 * as explicitly-labelled DEFERRED placeholder frames, following the
 * AD-OV CreditChart deferred-frame precedent (admin/page.tsx:215-228:
 * data-deferred attribute + Thai/EN label). The artifact layout has 7
 * chart slots across 6 chart types — Row 1 area stat + Gauge + Donut
 * (:378), Row 2 CreditChart + BarSeries (:379), Row 3 Treemap +
 * Bubbles + BarSeries (:380), BarSeries appearing in both Rows 2 and
 * 3 — so 8 data-deferred frames ship here (7 chart slots + the area
 * stat block). Chart frames carry the artifact minHeight per type
 * (:697-711): Gauge 168, Donut 190, CreditChart 190, BarSeries 180,
 * Treemap 190, Bubbles 200.
 *
 * Ambiguity decisions (minimal-fidelity, cited):
 * - Area stat block (58px number, :697-699): zero fetches are allowed
 *   and no single-value live getter is in scope, so the whole block
 *   ships as a deferred frame; the 58px stat typography lands with the
 *   chart implementation slice.
 * - FilterBarLite (:374) does not exist in the codebase; the T-309
 *   wording governs — ui/filter-bar.tsx FilterBar is used directly.
 * - Filter options: with zero fetches the season list cannot be live,
 *   so the filter renders with the artifact default option "ทุกฤดูกาล"
 *   (the AD-OV season-filter copy). Filter state is inert — no fetch
 *   reaction; the GHG table is fetched once on session gate.
 * - GHG artifact detail "8 columns, by season" (:381) has no live API
 *   source: live GhgSourceItem = {source, value} (lib/api.ts:145-148),
 *   so the same two live columns as the AD-OV GHG section ship
 *   (admin/page.tsx:236-246 precedent), fed by the same live getter
 *   as the overview page (admin/page.tsx:11,:56) — wired live, not
 *   mocked.
 */

export default function AdminChartsPage() {
  const [ghgSources, setGhgSources] = useState<GhgSourceItem[]>([]);
  const [season, setSeason] = useState("");
  const authed = useAdminSessionGate();

  useEffect(() => {
    if (!authed) return;
    let cancelled = false;
    getGhgSources().catch(() => []).then((rows) => {
      if (!cancelled) setGhgSources(rows);
    });
    return () => { cancelled = true; };
  }, [authed]);

  if (authed === null) return null;

  return (
    <main className="pt-14 lg:pt-14 px-4 lg:px-10 pb-10">
      <div className="max-w-[1400px] flex flex-col gap-6">
        {/* PageTitle — artifact copy verbatim (:374-375, R-028). No sub
            line is specified for AD-CHART, so the optional sub slot is
            omitted. */}
        <PageTitle
          eyebrow="แดชบอร์ดกราฟ"
          title="สรุปเครดิตและผลการดำเนินโครงการ"
        />

        {/* FilterBar — artifact Props filters/onFilter (:373). Shell
            only: inert local state, no data plumbing (R-015). */}
        <FilterBar
          label="กรองตามฤดูกาล:"
          filters={[
            {
              name: "season",
              label: "ฤดูกาล",
              value: season,
              options: [{ value: "", label: "ทุกฤดูกาล" }],
              onChange: (v) => setSeason(v),
            },
          ]}
        />

        {/* Row 1 — grid 1.1fr 1fr 1.3fr, gap --space-5 (:708). The
            area stat block is deferred per the header note. */}
        <div
          className="grid"
          style={{ gridTemplateColumns: "1.1fr 1fr 1.3fr", gap: "var(--space-5)", alignItems: "start" }}
        >
          <DeferredChartFrame
            label="DEFERRED — AREA STAT"
            note="บล็อกตัวเลขสรุปพื้นที่รอข้อมูลจริง (R-015 deferred placeholder)"
          />
          <DeferredChartFrame
            label="DEFERRED — GAUGE"
            note="กราฟวงแหวนค่าเป้าหมายยังไม่ดำเนินการ (R-015 deferred placeholder)"
            minHeight={168}
          />
          <DeferredChartFrame
            label="DEFERRED — DONUT"
            note="กราฟโดนัทสัดส่วนเครดิตยังไม่ดำเนินการ (R-015 deferred placeholder)"
            minHeight={190}
          />
        </div>

        {/* Row 2 — grid 1.2fr 1fr, gap --space-5 (:709). */}
        <div
          className="grid"
          style={{ gridTemplateColumns: "1.2fr 1fr", gap: "var(--space-5)", alignItems: "start" }}
        >
          <DeferredChartFrame
            label="DEFERRED — CREDIT CHART"
            note="กราฟเปรียบเทียบเครดิตรายฤดูกาลยังไม่ดำเนินการ (R-015 deferred placeholder)"
            minHeight={190}
          />
          <DeferredChartFrame
            label="DEFERRED — BAR SERIES"
            note="กราฟแท่งเครดิตรายผู้สนับสนุนยังไม่ดำเนินการ (R-015 deferred placeholder)"
            minHeight={180}
          />
        </div>

        {/* Row 3 — grid 1fr 1fr 1fr, gap --space-5 (:710). BarSeries
            second artifact slot (photo rounds, :380). */}
        <div
          className="grid"
          style={{ gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--space-5)", alignItems: "start" }}
        >
          <DeferredChartFrame
            label="DEFERRED — TREEMAP"
            note="กราฟทรีแมปสัดส่วนพื้นที่ปลูกข้าวยังไม่ดำเนินการ (R-015 deferred placeholder)"
            minHeight={190}
          />
          <DeferredChartFrame
            label="DEFERRED — BUBBLES"
            note="กราฟฟองค่า ER รายเกษตรกรยังไม่ดำเนินการ (R-015 deferred placeholder)"
            minHeight={200}
          />
          <DeferredChartFrame
            label="DEFERRED — BAR SERIES"
            note="กราฟแท่งจำนวนภาพรายรอบเก็บหลักฐานยังไม่ดำเนินการ (R-015 deferred placeholder)"
            minHeight={180}
          />
        </div>

        {/* GHG source DataTable — bottom row (:381). Same live getter,
            same two live columns, and same catch-to-empty wiring as the
            AD-OV overview section (admin/page.tsx:56,:236-246); the
            artifact extra columns have no live source (R-025/R-015). */}
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
      </div>
    </main>
  );
}

// ── PageTitle — page-local pattern (DECIDED O-6, decision.json: PageTitle
// and Section are PAGE-LOCAL patterns implemented per-screen; the
// admin/page.tsx:274-316 precedent). Geometry: admin-design-spec.md:504-510;
// sub is optional here — AD-CHART specifies no sub line.

function PageTitle({
  eyebrow,
  title,
  sub,
  actions,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
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
        {sub ? (
          <p className="text-sm" style={{ color: "var(--text-muted)", marginTop: "var(--space-2)", maxWidth: "72ch" }}>
            {sub}
          </p>
        ) : null}
      </div>
      {actions ? <div style={{ marginLeft: "auto" }}>{actions}</div> : null}
    </div>
  );
}

// ── Section — page-local pattern (DECIDED O-6); admin/page.tsx:318-360
// precedent. Geometry: admin-design-spec.md:512-518.

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

// ── DeferredChartFrame — AD-OV CreditChart deferred-frame chrome
// (admin/page.tsx:218-227) parameterised: data-deferred attribute +
// Thai/EN label, with the artifact minHeight per chart type
// (admin-design-spec.md:697-711).

function DeferredChartFrame({
  label,
  note,
  minHeight,
}: {
  label: string;
  note: string;
  minHeight?: number;
}) {
  return (
    <div
      data-deferred="R-015"
      className="flex flex-col items-center justify-center text-center"
      style={{
        border: "1px dashed var(--border-subtle)",
        borderRadius: "var(--radius-md)",
        padding: "var(--space-12, 48px) var(--space-6)",
        gap: "var(--space-2)",
        minHeight: minHeight !== undefined ? minHeight + "px" : undefined,
      }}
    >
      <span
        className="text-xs font-semibold uppercase"
        style={{ color: "var(--text-muted)", letterSpacing: "var(--tracking-eyebrow)" }}
      >
        {label}
      </span>
      <p className="text-sm" style={{ color: "var(--text-muted)", margin: 0 }}>
        {note}
      </p>
    </div>
  );
}
