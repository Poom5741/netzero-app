"use client";

import { useAdminSessionGate } from "@/lib/use-session-gate";
import { useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import {
  getApplications,
  approveApplication,
  rejectApplication,
  type ApplicationItem,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Tag } from "@/components/ui/tag";
import { Checkbox } from "@/components/ui/checkbox";

/**
 * AD-APP ApplicationsScreen — T-305 (admin-design-spec.md:395-411, :1037;
 * admin-artifact.json screens/5). Restyle only: the admin session gate
 * (R-026), status tabs, live getApplications/approveApplication/
 * rejectApplication wiring, and all handlers are preserved verbatim
 * (R-016/R-025). Artifact structure: page-local PageTitle (DECIDED O-6)
 * with artifact Thai copy verbatim (R-028) + 2-column split — left
 * application DataTable (9 artifact columns :403), right 400px detail
 * panel (:397) = application header + 8-row metadata list + approval
 * checklist. Live-field deltas, disclosed (R-025 — no fixture swap, no
 * invented semantics): CPA code / สถานะการถือครอง / ไร่ have no
 * ApplicationItem field and render "-"; the artifact MockNote (:399)
 * documents 4 SAMPLE rows and stays design documentation (not rendered —
 * this page renders live API data); the checklist enumerates only the
 * live-derivable gates (เอกสาร + consent). Row selection is
 * presentation-only state; nothing else was added.
 */
type TabKey = "pending" | "verified" | "rejected" | "all";

const tabs: { key: TabKey; label: string }[] = [
  { key: "pending", label: "รอตรวจสอบ" },
  { key: "verified", label: "อนุมัติแล้ว" },
  { key: "rejected", label: "ปฏิเสธแล้ว" },
  { key: "all", label: "ทั้งหมด" },
];

export default function ApplicationsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("pending");
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const authed = useAdminSessionGate();
  const [approving, setApproving] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetchApplications = useCallback(async (tab: TabKey) => {
    setLoading(true);
    setError(null);
    try {
      const status = tab === "all" ? undefined : tab;
      const data = await getApplications(status);
      setApplications(Array.isArray(data) ? data : []);
    } catch {
      setError("ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authed) queueMicrotask(() => fetchApplications(activeTab));
  }, [authed, activeTab, fetchApplications]);

  const handleApprove = async (id: string) => {
    setApproving(id);
    try {
      const result = await approveApplication(id);
      if (result.ok) {
        fetchApplications(activeTab);
      }
    } catch {
      setError("ไม่สามารถอนุมัติได้");
    } finally {
      setApproving(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectReason.trim()) return;
    try {
      const result = await rejectApplication(id, rejectReason);
      if (result.ok) {
        setRejectingId(null);
        setRejectReason("");
        fetchApplications(activeTab);
      }
    } catch {
      setError("ไม่สามารถปฏิเสธได้");
    }
  };

  if (authed === null) return null;

  const selected: ApplicationItem | null =
    applications.find((a) => a.id === selectedId) ?? applications[0] ?? null;

  const isReady = (app: ApplicationItem) => app.doc_count >= app.docs_needed;

  return (
    <main className="pt-14 lg:pt-14 px-4 lg:px-10 pb-10">
      <div className="max-w-[1400px] flex flex-col" style={{ gap: "var(--space-6)" }}>
        {/* PageTitle — artifact copy verbatim (R-028; :399-401). */}
        <PageTitle
          eyebrow="AD-10 · ใบสมัครรอตรวจ"
          title="ตรวจและอนุมัติใบสมัครเข้าร่วมโครงการ"
          sub="ชุดเอกสารที่บังคับเปลี่ยนตามสถานะการถือครอง (R-09) — เจ้าของ · เจ้าของร่วม · ผู้เช่า · ผู้รับมอบอำนาจ"
        />

        {/* Status tabs — legacy behaviour preserved verbatim (R-016). */}
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setSelectedId(null); }}
              className={activeTab === tab.key
                ? "px-4 py-2 rounded-full text-label-md font-medium whitespace-nowrap transition-colors bg-primary text-on-primary"
                : "px-4 py-2 rounded-full text-label-md font-medium whitespace-nowrap transition-colors bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"}
            >
              {tab.label}
            </button>
          ))}
        </div>

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

        {!loading && !error && applications.length === 0 && (
          <div className="card p-6 text-center rounded-xl">
            <span className="material-symbols-outlined text-outline text-4xl mb-2">inbox</span>
            <p className="text-body-md text-on-surface-variant">ไม่มีรายการในขณะนี้</p>
          </div>
        )}

        {!loading && !error && applications.length > 0 && (
          <div className="grid items-start" style={{ gridTemplateColumns: "minmax(0, 1fr) 400px", gap: "var(--space-6)" }}>
            {/* Left — application DataTable, 9 artifact columns (:403).
                CPA code / สถานะการถือครอง / ไร่ have no live field → "-" and
                ตำบล binds the live district field (closest live area field;
                R-025 — disclosed in report). */}
            <DataTable
              dense
              columns={[
                { key: "id", header: "เลขที่ใบสมัคร" },
                { key: "cpa", header: "CPA code" },
                { key: "name", header: "ชื่อ-นามสกุล" },
                { key: "district", header: "ตำบล" },
                { key: "hold", header: "สถานะการถือครอง" },
                { key: "rai", header: "ไร่", align: "right" },
                { key: "docs", header: "เอกสาร", align: "right" },
                { key: "age", header: "ค้าง", align: "right" },
                { key: "status", header: "สถานะ" },
              ]}
              rows={applications.map((app) => ({
                id: <span className="font-mono" style={{ fontSize: "12px" }}>{app.id}</span>,
                cpa: "-",
                name: app.farmer_name,
                district: app.district,
                hold: <Tag tone="neutral">-</Tag>,
                rai: "-",
                docs: app.doc_count + "/" + app.docs_needed,
                age: ageLabel(app.created_at),
                status: isReady(app)
                  ? <Badge tone="success">พร้อมอนุมัติ</Badge>
                  : <Badge tone="danger">เอกสารไม่ครบ</Badge>,
              }))}
              rowKey={(_row, i) => applications[i].id}
              onRowClick={(_row, i) => setSelectedId(applications[i].id)}
            />

            {/* Right — detail panel (spec :404). */}
            {selected ? (
              <Section
                title={selected.id}
                actions={isReady(selected)
                  ? <Badge tone="success">พร้อมอนุมัติ</Badge>
                  : <Badge tone="danger">เอกสารไม่ครบ</Badge>}
              >
                <div className="flex flex-col" style={{ gap: "var(--space-5)" }}>
                  <div>
                    <p className="text-body-lg font-semibold" style={{ color: "var(--text-heading)", margin: 0 }}>
                      {selected.farmer_name}
                    </p>
                    <p className="text-sm" style={{ color: "var(--text-muted)", marginTop: "var(--space-1)" }}>
                      สถานะ: {tabStatusText(selected.status)}
                    </p>
                  </div>

                  {/* Metadata list — 8 live rows (R-025). The artifact hold
                      type header row has no live field and is not rendered. */}
                  <div style={{ border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
                    {metadataRows(selected).map(([label, value], i) => (
                      <div
                        key={label}
                        className="flex items-center justify-between"
                        style={{
                          padding: "9px 12px",
                          fontSize: "var(--text-xs)",
                          borderBottom: i === metadataRows(selected).length - 1 ? "none" : "1px solid var(--grey-100)",
                        }}
                      >
                        <span style={{ color: "var(--text-muted)" }}>{label}</span>
                        <span style={{ color: "var(--text-body)", textAlign: "right" }}>{value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Approval checklist — live-derivable gates only
                      (R-025; the artifact does not enumerate the checklist). */}
                  <div className="flex flex-col" style={{ gap: "var(--space-3)" }}>
                    <p className="text-sm font-semibold" style={{ color: "var(--text-heading)", margin: 0 }}>เช็กลิสต์ก่อนอนุมัติ</p>
                    <Checkbox
                      disabled
                      checked={isReady(selected)}
                      label={"เอกสารครบตามที่กำหนด (" + selected.doc_count + "/" + selected.docs_needed + ")"}
                    />
                    <Checkbox
                      disabled
                      checked={selected.consent_count >= 4}
                      label={"ความยินยอมครบ 4 รายการ (" + selected.consent_count + "/4)"}
                    />
                  </div>

                  {activeTab === "pending" && (
                    <div className="flex" style={{ gap: "var(--space-3)" }}>
                      <Button
                        variant="primary"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleApprove(selected.id)}
                        disabled={approving === selected.id}
                        loading={approving === selected.id}
                      >
                        อนุมัติ
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        className="flex-1"
                        onClick={() => setRejectingId(selected.id)}
                      >
                        ปฏิเสธ
                      </Button>
                    </div>
                  )}

                  {rejectingId === selected.id && (
                    <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "var(--space-4)" }}>
                      <label className="text-label-md block mb-1" style={{ color: "var(--text-heading)" }}>เหตุผลที่ปฏิเสธ</label>
                      <div className="flex" style={{ gap: "var(--space-2)" }}>
                        <input
                          type="text"
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="กรุณาระบุเหตุผล..."
                          className="flex-1 px-3 py-2 rounded-xl bg-surface-container-low text-body-md text-on-surface placeholder:text-on-surface-variant/50 outline-none"
                        />
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleReject(selected.id)}
                          disabled={!rejectReason.trim()}
                        >
                          ยืนยันปฏิเสธ
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setRejectingId(null); setRejectReason(""); }}
                        >
                          ยกเลิก
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Section>
            ) : (
              <div
                className="flex items-center justify-center text-center"
                style={{ border: "1px dashed var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "var(--space-10) var(--space-6)", color: "var(--text-muted)", fontSize: "var(--text-sm)" }}
              >
                เลือกใบสมัครจากรายการด้านซ้ายเพื่อตรวจสอบ
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

// ── Live status text — the tab vocabulary applied to the live status key. ──
function tabStatusText(status: string): string {
  if (status === "pending") return "รอตรวจสอบ";
  if (status === "verified") return "อนุมัติแล้ว";
  if (status === "rejected") return "ปฏิเสธแล้ว";
  return status;
}

// ── Detail metadata — 8 live rows (:404) bound to ApplicationItem. ──
function metadataRows(app: ApplicationItem): Array<[string, ReactNode]> {
  return [
    ["เลขที่ใบสมัคร", app.id],
    ["ชื่อ-นามสกุล", app.farmer_name],
    ["เบอร์โทร", app.phone],
    ["จังหวัด", app.province],
    ["อำเภอ/ตำบล", app.district],
    ["LINE ID", app.line_user_id],
    ["วันที่ส่งใบสมัคร", app.created_at ? app.created_at.slice(0, 10) : "-"],
    [
      "เอกสาร / Consent",
      app.doc_count + "/" + app.docs_needed + " · " + app.consent_count + "/4",
    ],
  ];
}

// ── PageTitle — page-local pattern (DECIDED O-6, decision.json). ──
// Geometry: admin-design-spec.md:504-510 (same as admin/page.tsx).

function PageTitle({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string;
  title: string;
  sub: string;
}) {
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
      <p className="text-sm" style={{ color: "var(--text-muted)", marginTop: "var(--space-2)", maxWidth: "72ch" }}>
        {sub}
      </p>
    </div>
  );
}

// ── Section — page-local pattern (DECIDED O-6). ──
// Geometry: admin-design-spec.md:512-518 (same as admin/page.tsx).

function Section({
  title,
  actions,
  children,
  pad = true,
}: {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
  pad?: boolean;
}) {
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
// ── ค้าง column — days since created_at (live field); module scope so the
// impure Date.now call stays out of the render body (react-hooks/purity). ──
function ageLabel(created: string): string {
  const t = Date.parse(created);
  if (Number.isNaN(t)) return "-";
  const days = Math.floor((Date.now() - t) / 86400000);
  if (days < 1) return "วันนี้";
  return days + " วัน";
}

