"use client";

import { useAdminSessionGate } from "@/lib/use-session-gate";
import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { getReports, downloadReport, type ReportItem } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Tag } from "@/components/ui/tag";
import { ProgressBar } from "@/components/ui/progress-bar";

/**
 * AD-REPORT ReportsScreen — T-306 (admin-design-spec.md:412-426, :1038;
 * admin-artifact.json screens/6). Restyle only: the admin session gate
 * (R-026), live getReports/downloadReport wiring, and the downloading
 * state are preserved verbatim (R-017/R-025). Artifact structure:
 * page-local PageTitle (DECIDED O-6) with artifact copy verbatim (R-028)
 * + 2-column split (380px right panel :413) — left report DataTable
 * (4 artifact columns :421), right T-VER submission panel (3
 * ProgressBars + warning banner + download buttons + locked submit) and
 * the selected-report detail (5 kv pairs + download). Live-field deltas,
 * disclosed (R-025): ขอบเขต / ใครดาวน์โหลดได้ have no ReportItem field
 * → "-"; the T-VER percentages are the artifact-documented fixture
 * values (tverProgress: baseline 71, docs 88) with no live API — the
 * photos bar ("computed%" in the artifact) has no computable source and
 * renders empty rather than invented; the panel's three download
 * buttons have no live file mapping and render locked (disabled, as the
 * artifact locks its submit button); the detail download button IS live
 * (handleDownload). Row selection is presentation-only state.
 */

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const authed = useAdminSessionGate();
  const [downloading, setDownloading] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!authed) return;
    queueMicrotask(() => setLoading(true));
    getReports()
      .then((data) => { setReports(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => { setError("ไม่สามารถโหลดข้อมูลได้"); setLoading(false); });
  }, [authed]);

  const handleDownload = async (reportId: string) => {
    setDownloading(reportId);
    try {
      await downloadReport(reportId);
      // In a real implementation, this would trigger a file download
    } catch {
      setError("ไม่สามารถดาวน์โหลดรายงานได้");
    } finally {
      setDownloading(null);
    }
  };

  if (authed === null) return null;

  const selected: ReportItem | null = reports.find((r) => r.id === selectedId) ?? reports[0] ?? null;

  return (
    <main className="pt-14 lg:pt-14 px-4 lg:px-10 pb-10">
      <div className="max-w-[1400px] flex flex-col" style={{ gap: "var(--space-6)" }}>
        {/* PageTitle — artifact copy verbatim (R-028; :416-417). */}
        <PageTitle eyebrow="AD-07 · ส่งออกรายงาน" title="รายงานและไฟล์สำหรับยื่นขึ้นทะเบียน" />

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

        {!loading && !error && reports.length === 0 && (
          <div className="card p-6 text-center rounded-xl">
            <span className="material-symbols-outlined text-outline text-4xl mb-2">inbox</span>
            <p className="text-body-md text-on-surface-variant">ไม่มีรายงาน</p>
          </div>
        )}

        {!loading && !error && reports.length > 0 && (
          <div className="grid items-start" style={{ gridTemplateColumns: "minmax(0, 1fr) 380px", gap: "var(--space-6)" }}>
            {/* Left — report DataTable, 4 artifact columns (:421). Scope and
                who-download columns have no live field → "-" (R-025). */}
            <DataTable
              columns={[
                { key: "name", header: "รายงาน" },
                { key: "format", header: "รูปแบบ" },
                { key: "scope", header: "ขอบเขต" },
                { key: "who", header: "ใครดาวน์โหลดได้" },
              ]}
              rows={reports.map((r) => ({
                name: (
                  <span className="flex flex-col" style={{ gap: "2px" }}>
                    <span style={{ color: "var(--text-heading)", fontWeight: "var(--weight-semibold)" }}>{r.name}</span>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {r.description}
                      {r.ready ? "" : " · ยังไม่พร้อม"}
                    </span>
                  </span>
                ),
                format: <Tag tone="teal">{r.format}</Tag>,
                scope: "-",
                who: "-",
              }))}
              rowKey={(_row, i) => reports[i].id}
              onRowClick={(_row, i) => setSelectedId(reports[i].id)}
            />

            {/* Right — T-VER submission panel + selected report detail. */}
            <div className="flex flex-col" style={{ gap: "var(--space-6)" }}>
              <Section title="ชุดยื่น T-VER">
                <div className="flex flex-col" style={{ gap: "var(--space-4)" }}>
                  {/* 3 ProgressBars (:423). Values are the artifact-documented
                      fixture numbers (tverProgress baseline 71 / docs 88 —
                      no live API, R-025); photos ("computed%") has no
                      computable live source and renders empty, not invented. */}
                  <ProgressBar label="ข้อมูลฐาน 3 ปี" value={71} valueLabel="71%" tone="teal" />
                  <ProgressBar label="เอกสารครบ" value={88} valueLabel="88%" tone="teal" />
                  <ProgressBar label="ภาพครบ" value={0} valueLabel="—" tone="grey" />

                  {/* Warning banner (:423) — in-page disclosure that the
                      panel is artifact-referenced pending a live T-VER API. */}
                  <div
                    className="flex items-start"
                    style={{ gap: "var(--space-2)", background: "var(--status-warning-soft)", borderRadius: "var(--radius-md)", padding: "var(--space-3) var(--space-4)" }}
                  >
                    <span className="material-symbols-outlined" style={{ color: "var(--status-warning)", fontSize: "18px" }} aria-hidden="true">warning</span>
                    <p className="text-xs" style={{ color: "var(--status-warning-strong)", margin: 0 }}>
                      ยังไม่มี API เชื่อมต่อ — ค่าเปอร์เซ็นต์เป็นค่าอ้างอิงจาก artifact (AD-07)
                    </p>
                  </div>

                  {/* 3 download buttons + locked submit (:423, :1038). The
                      download buttons have no live file mapping (R-025) and
                      render locked like the artifact submit button. */}
                  <div className="flex flex-col" style={{ gap: "var(--space-2)" }}>
                    <Button variant="outline" size="sm" disabled>ดาวน์โหลดไฟล์ยื่น — ข้อมูลฐาน 3 ปี</Button>
                    <Button variant="outline" size="sm" disabled>ดาวน์โหลดไฟล์ยื่น — เอกสาร</Button>
                    <Button variant="outline" size="sm" disabled>ดาวน์โหลดไฟล์ยื่น — ภาพถ่าย</Button>
                    <Button variant="primary" size="sm" disabled>
                      <span className="material-symbols-outlined text-[16px]" aria-hidden="true">lock</span>
                      ยื่นชุดขึ้นทะเบียน
                    </Button>
                  </div>
                </div>
              </Section>

              {selected && (
                <Section title={selected.id}>
                  {/* Selected-report detail — 5 live kv pairs (:424) + the
                      live download button (handleDownload preserved). */}
                  <div className="flex flex-col" style={{ gap: "var(--space-4)" }}>
                    <div style={{ border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
                      {detailRows(selected).map(([label, value], i) => (
                        <div
                          key={label}
                          className="flex items-center justify-between"
                          style={{
                            padding: "9px 12px",
                            fontSize: "var(--text-xs)",
                            borderBottom: i === detailRows(selected).length - 1 ? "none" : "1px solid var(--grey-100)",
                          }}
                        >
                          <span style={{ color: "var(--text-muted)" }}>{label}</span>
                          <span style={{ color: "var(--text-body)", textAlign: "right" }}>{value}</span>
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(selected.id)}
                      disabled={!selected.ready || downloading === selected.id}
                      loading={downloading === selected.id}
                    >
                      <span className="material-symbols-outlined text-[16px]" aria-hidden="true">download</span>
                      ดาวน์โหลด
                    </Button>
                  </div>
                </Section>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

// ── Selected-report detail — 5 live kv pairs (:424). ──
function detailRows(r: ReportItem): Array<[string, ReactNode]> {
  return [
    ["รหัสรายงาน", r.id],
    ["ชื่อรายงาน", r.name],
    ["รูปแบบไฟล์", r.format],
    ["คำอธิบาย", r.description],
    ["สถานะ", r.ready ? "พร้อมดาวน์โหลด" : "ยังไม่พร้อม"],
  ];
}

// ── PageTitle — page-local pattern (DECIDED O-6). ──
// Geometry: admin-design-spec.md:504-510 (same as admin/page.tsx).

function PageTitle({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
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
  );
}

// ── Section — page-local pattern (DECIDED O-6). ──
// Geometry: admin-design-spec.md:512-518 (same as admin/page.tsx).

function Section({ title, actions, children, pad = true }: { title: string; actions?: ReactNode; children: ReactNode; pad?: boolean }) {
  return (
    <section
      style={{
        background: "var(--surface-card)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-card)",
        boxShadow: "var(--shadow-xs)",
        overflow: "hidden",
      }}
    >
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
      {pad ? <div style={{ padding: "var(--space-6)" }}>{children}</div> : children}
    </section>
  );
}
