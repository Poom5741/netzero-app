"use client";

import { useAdminSessionGate } from "@/lib/use-session-gate";
import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import {
  getReviewQueue,
  reviewPhoto,
  getPrecisionStat,
  API_BASE,
  type PhotoReview,
  type PrecisionStat,
} from "@/lib/api";
import { PrecisionCard } from "@/components/admin-review/precision-card";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Tag } from "@/components/ui/tag";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { FilterBar } from "@/components/ui/filter-bar";

/**
 * AD-REV ReviewScreen — spec 017 admin-design-spec.md:321-352 + :1034,
 * geometry :681-696. Restyle only: ALL live API wiring, hooks, state and
 * session gating are preserved verbatim (R-025): getReviewQueue,
 * reviewPhoto (verified/rejected/retake), getPrecisionStat,
 * useAdminSessionGate, the status-filter predicate and batch-select
 * state. Artifact structure: page-local PageTitle (DECIDED O-6) with
 * verbatim Thai copy (R-028); dense queue + completeness DataTables
 * (ui/data-table); 4/3 photo viewer with pipe overlay + GPS badge;
 * 7-row metadata panel; reject flow (7 verbatim reason checkboxes +
 * textarea) and the two outline approve-row buttons.
 * Live-field deltas (R-025 outranks inventing columns, disclosed in the
 * task report): queue CPA column has no PhotoReview field (omitted;
 * artifact 8 columns -> live 7); completeness ไร่ / SF_w ที่ใช้จริง / ER
 * have no live source (omitted; live count + derived 4-photo rule from
 * the PageTitle sub copy instead).
 */

type StatusFilter = "all" | "pending" | "flag" | "pass" | "reject";

// FilterBar options — same keys/labels as the legacy statusTabs; "all"
// maps to the FilterBar inactive value "" at the boundary.
const STATUS_OPTIONS = [
  { value: "", label: "ทั้งหมด" },
  { value: "flag", label: "ถูกธง" },
  { value: "pending", label: "รอตรวจ" },
  { value: "pass", label: "AI ผ่าน" },
  { value: "reject", label: "ปฏิเสธ" },
];

// REJECT_REASONS — artifact fixture verbatim (admin-design-spec.md:340-348).
const REJECT_REASONS = [
  "มองไม่เห็นขีดระดับน้ำในท่อ",
  "ภาพเบลอ / มืดเกินไป",
  "พิกัดตกนอกขอบเขตแปลง",
  "เวลาถ่ายไม่อยู่ในช่วงกำหนดของรอบนี้",
  "รอบแห้งแต่ในภาพน้ำยังเต็มท่อ (หรือกลับกัน)",
  "ไม่ใช่ท่อวัดระดับน้ำของแปลงนี้",
  "ส่งภาพจากคลังภาพ ไม่ได้ถ่ายผ่านกล้องของระบบ",
];

// Round labels — reused verbatim from the established Thai labels in
// app/admin/farmers/page.tsx PhotosTab (live photo_type values).
const ROUND_LABELS: Record<string, string> = {
  prepare: "เตรียมพื้นที่",
  wetdry: "น้ำขัง/แห้ง",
  harvest: "เก็บเกี่ยว",
};

const ROUND_KEYS = ["prepare", "wetdry", "harvest"];

// Completeness chips — one artifact-style colour chip per live round.
const ROUND_CHIP: Record<string, string> = {
  prepare: "var(--teal-500)",
  wetdry: "var(--navy-500)",
  harvest: "var(--status-warning)",
};

const WATER_LABELS: Record<string, string> = { flooded: "น้ำขัง", dry: "แห้ง" };

function ageLabel(iso: string | null | undefined): string {
  if (!iso) return "-";
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "-";
  const days = Math.floor((Date.now() - t) / 86400000);
  if (days < 1) return "วันนี้";
  return days + " วัน";
}

function resultBadge(adminStatus: string): ReactNode {
  if (adminStatus === "verified") return <Badge tone="success">อนุมัติแล้ว</Badge>;
  if (adminStatus === "rejected") return <Badge tone="danger">ปฏิเสธแล้ว</Badge>;
  if (adminStatus === "retake") return <Badge tone="info">ตีกลับ</Badge>;
  return <Badge tone="warning">รอตรวจ</Badge>;
}

function completenessGroups(list: PhotoReview[]) {
  const byPlot = new Map<string, PhotoReview[]>();
  for (const r of list) {
    const arr = byPlot.get(r.plot_id);
    if (arr) arr.push(r);
    else byPlot.set(r.plot_id, [r]);
  }
  return Array.from(byPlot.entries()).map(([plot, arr]) => ({
    plot,
    count: arr.length,
    rounds: new Set(arr.map((r) => r.photo_type ?? "")),
    complete: arr.length >= 4,
  }));
}

export default function EvidencePage() {
  const [reviews, setReviews] = useState<PhotoReview[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [batchMode, setBatchMode] = useState(false);
  const [batchSelected, setBatchSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [precision, setPrecision] = useState<PrecisionStat | null>(null);
  const [rejectFlow, setRejectFlow] = useState<{ id: string | null; open: boolean; sel: number[]; note: string }>({ id: null, open: false, sel: [], note: "" });
  const authed = useAdminSessionGate();

  // Fetch queue + precision stats (unchanged, R-025).
  useEffect(() => {
    if (authed !== true) return;
    queueMicrotask(() => setLoading(true));

    Promise.all([
      getReviewQueue().catch(() => []),
      getPrecisionStat().catch(() => ({ auditReviewed: 0, overrides: 0, precision: null })),
    ]).then(([queue, stats]) => {
      setReviews(queue);
      setPrecision(stats);
      setLoading(false);
    }).catch(() => {
      setError("ไม่สามารถโหลดข้อมูลได้");
      setLoading(false);
    });
  }, [authed]);

  // Status-filter predicate unchanged (R-025).
  const filtered = statusFilter === "all"
    ? reviews
    : reviews.filter((r) => {
        if (statusFilter === "flag") return r.ai_status === "flag";
        if (statusFilter === "pending") return r.ai_status === "pending";
        if (statusFilter === "pass") return r.ai_status === "pass";
        if (statusFilter === "reject") return r.admin_status === "rejected";
        return true;
      });

  const selected = reviews.find((r) => r.id === selectedId) ?? null;
  const completenessRows = completenessGroups(filtered);

  const flowId = selected ? selected.id : null;
  const flow = rejectFlow.id === flowId ? rejectFlow : { id: flowId, open: false, sel: [], note: "" };
  const rejectOpen = flow.open;
  const rejectSel = flow.sel;
  const rejectNote = flow.note;

  function updateFlow(patch: Partial<{ open: boolean; sel: number[]; note: string }>) {
    setRejectFlow({ id: flowId, open: patch.open ?? flow.open, sel: patch.sel ?? flow.sel, note: patch.note ?? flow.note });
  }

  // Live review actions — unchanged (R-025).
  async function handleApprove(id: string, _reason?: string) {
    await reviewPhoto(id, "verified");
    setReviews((prev) => prev.map((r) => r.id === id ? { ...r, admin_status: "verified" } : r));
    setSelectedId(null);
  }

  async function handleReject(id: string, reason: string) {
    await reviewPhoto(id, "rejected", reason);
    setReviews((prev) => prev.map((r) => r.id === id ? { ...r, admin_status: "rejected" } : r));
    setSelectedId(null);
  }

  async function handleRetake(id: string, reason: string) {
    await reviewPhoto(id, "retake", reason);
    setReviews((prev) => prev.map((r) => r.id === id ? { ...r, admin_status: "retake" as string } : r));
    setSelectedId(null);
  }

  function handleBatchToggle(id: string) {
    setBatchSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function joinedReason(): string {
    return REJECT_REASONS.filter((_reason, i) => rejectSel.includes(i))
      .concat(rejectNote.trim() ? [rejectNote.trim()] : [])
      .join(" · ");
  }

  function submitReject() {
    if (!selected) return;
    const reason = joinedReason();
    if (!reason) return;
    void handleReject(selected.id, reason);
  }

  function submitRetake() {
    if (!selected) return;
    void handleRetake(selected.id, joinedReason() || "ตีกลับให้ถ่ายใหม่");
  }

  const canSubmitReject = rejectSel.length > 0 || rejectNote.trim() !== "";

  if (authed === null) return null;

  return (
    <main className="pt-14 lg:pt-14 px-4 lg:px-10 pb-10">
      <div className="max-w-[1400px] flex flex-col" style={{ gap: "var(--space-6)" }}>
        {/* PageTitle — artifact copy verbatim (R-028; spec :324-326). */}
        <PageTitle
          eyebrow="AD-01 · คิวตรวจภาพหลักฐาน"
          title="ตรวจภาพท่อวัดระดับน้ำและ metadata"
          sub="หนึ่งครอปต้องมี 4 ภาพ — เปียก 2 ครั้ง แห้ง 2 ครั้ง สลับกัน · ครบทั้ง 4 จึงใช้ SF_w = 0.55 ได้"
          actions={
            <Button
              variant={batchMode ? "primary" : "outline"}
              size="sm"
              onClick={() => { setBatchMode((m) => !m); setBatchSelected(new Set()); }}
            >
              {batchMode ? "จบการเลือก" + (batchSelected.size > 0 ? " (" + batchSelected.size + ")" : "") : "โหมดเลือกหลายรายการ"}
            </Button>
          }
        />

        {/* Precision stat — live-only aux info (getPrecisionStat, R-025);
            no AD-REV artifact mapping, component reused unchanged. */}
        {precision && (
          <div>
            <PrecisionCard
              auditReviewed={precision.auditReviewed}
              overrides={precision.overrides}
              precision={precision.precision}
            />
          </div>
        )}

        {/* Status filter — legacy FilterTabs restyled onto the artifact
            FilterBar component (ui/filter-bar); keys/labels unchanged. */}
        <FilterBar
          label="สถานะ"
          filters={[{
            name: "status",
            label: "สถานะ",
            value: statusFilter === "all" ? "" : statusFilter,
            options: STATUS_OPTIONS,
            onChange: (v) => setStatusFilter((v || "all") as StatusFilter),
          }]}
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
          <div className="grid items-start" style={{ gridTemplateColumns: "minmax(0, 1fr) 420px", gap: "var(--space-6)" }}>
            {/* Left — queue + completeness DataTables (spec :327-328, :682). */}
            <div className="flex flex-col min-w-0" style={{ gap: "var(--space-6)" }}>
              {filtered.length === 0 ? (
                <div className="card p-6 text-center rounded-xl">
                  <span className="material-symbols-outlined text-on-surface-variant text-4xl mb-2">photo_library</span>
                  <p className="text-body-md text-on-surface">ไม่มีภาพที่รอตรวจสอบ</p>
                </div>
              ) : (
                <>
                  {/* Queue — artifact columns :327; CPA column omitted (no
                      PhotoReview field, R-025 — disclosed in report). */}
                  <DataTable
                    dense
                    columns={[
                      { key: "id", header: "รหัสภาพ" },
                      { key: "plot", header: "แปลงย่อย" },
                      { key: "round", header: "รอบ" },
                      { key: "water", header: "ระดับน้ำที่กรอก" },
                      { key: "gps", header: "พิกัด" },
                      { key: "age", header: "อายุคำร้อง" },
                      { key: "result", header: "ผล" },
                    ]}
                    rows={filtered.map((r) => ({
                      id: <span className="font-mono" style={{ fontSize: "12px" }}>{r.id}</span>,
                      plot: r.plot_id,
                      round: <Tag tone="teal">{ROUND_LABELS[r.photo_type ?? ""] ?? "-"}</Tag>,
                      water: r.water_state ? WATER_LABELS[r.water_state] ?? r.water_state : "-",
                      gps: r.gps_lat != null && r.gps_lng != null ? <Badge tone="info">มีพิกัด</Badge> : <Badge tone="neutral">ไม่มีพิกัด</Badge>,
                      age: ageLabel(r.taken_at),
                      result: resultBadge(r.admin_status),
                    }))}
                    rowKey={(_row, i) => filtered[i].id}
                    onRowClick={(_row, i) => {
                      if (batchMode) handleBatchToggle(filtered[i].id);
                      else setSelectedId(filtered[i].id);
                    }}
                  />

                  {/* Completeness — derived from the live queue grouped by
                      plot (R-025): count + distinct-round chips + the 4-photo
                      rule from the artifact sub copy (:326). Artifact ไร่ /
                      SF_w ที่ใช้จริง / ER columns have no live source. */}
                  <DataTable
                    dense
                    columns={[
                      { key: "plot", header: "แปลงย่อย" },
                      { key: "count", header: "จำนวนภาพ", align: "right" },
                      { key: "rounds", header: "รอบภาพ" },
                      { key: "ok", header: "ครบ 4 ภาพ" },
                    ]}
                    rows={completenessRows.map((g) => ({
                      plot: g.plot,
                      count: g.count,
                      rounds: (
                        <span className="inline-flex items-center" style={{ gap: "var(--space-2)" }}>
                          {ROUND_KEYS.map((k) => (
                            <span
                              key={k}
                              title={ROUND_LABELS[k]}
                              aria-label={ROUND_LABELS[k]}
                              style={{
                                width: "10px",
                                height: "10px",
                                borderRadius: "var(--radius-circle)",
                                background: g.rounds.has(k) ? ROUND_CHIP[k] : "transparent",
                                border: "1px solid " + (g.rounds.has(k) ? ROUND_CHIP[k] : "var(--grey-300)"),
                              }}
                            />
                          ))}
                        </span>
                      ),
                      ok: g.complete ? <Badge tone="success">ครบ</Badge> : <Badge tone="warning">ยังไม่ครบ</Badge>,
                    }))}
                    rowKey={(row) => String(row.plot)}
                  />
                </>
              )}
            </div>

            {/* Right — photo viewer + metadata + approve/reject flows
                (spec :329-331, :683-697). */}
            <div className="flex flex-col" style={{ gap: "var(--space-6)" }}>
              {selected ? (
                <>
                  <PhotoScene review={selected} />
                  <MetadataPanel review={selected} />
                  {rejectOpen ? (
                    <div
                      style={{
                        background: "var(--status-danger-soft)",
                        border: "1px solid var(--status-danger-border)",
                        borderRadius: "var(--radius-md)",
                        padding: "var(--space-4) var(--space-5)",
                      }}
                    >
                      <p className="text-sm font-semibold" style={{ color: "var(--status-danger-strong)", margin: "0 0 var(--space-3)" }}>
                        เหตุผลในการปฏิเสธ
                      </p>
                      <div className="flex flex-col" style={{ gap: "var(--space-2)" }}>
                        {REJECT_REASONS.map((reason, i) => (
                          <Checkbox
                            key={reason}
                            label={reason}
                            checked={rejectSel.includes(i)}
                            onChange={(on) => updateFlow({ sel: on ? [...rejectSel, i] : rejectSel.filter((x) => x !== i) })}
                          />
                        ))}
                      </div>
                      <textarea
                        aria-label="หมายเหตุเพิ่มเติม"
                        placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)"
                        value={rejectNote}
                        onChange={(e) => updateFlow({ note: e.target.value })}
                        rows={3}
                        className="w-full resize-none"
                        style={{
                          marginTop: "var(--space-3)",
                          padding: "var(--space-3)",
                          fontSize: "var(--text-sm)",
                          color: "var(--text-body)",
                          background: "var(--white)",
                          border: "1px solid var(--border-default)",
                          borderRadius: "var(--radius-sm)",
                        }}
                      />
                      <div className="flex justify-end" style={{ gap: "var(--space-3)", marginTop: "var(--space-3)" }}>
                        <Button variant="outline" size="sm" onClick={() => updateFlow({ open: false, sel: [], note: "" })}>
                          ยกเลิก
                        </Button>
                        <Button variant="outline" size="sm" disabled={!canSubmitReject} onClick={submitRetake}>
                          ตีกลับให้ถ่ายใหม่
                        </Button>
                        <Button variant="danger" size="sm" disabled={!canSubmitReject} onClick={submitReject}>
                          ส่งการปฏิเสธ
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex" style={{ gap: "var(--space-3)" }}>
                      <Button variant="outline" className="flex-1" onClick={() => updateFlow({ open: true })}>
                        ตีกลับ
                      </Button>
                      <Button variant="outline" className="flex-1" onClick={() => { if (selected) void handleApprove(selected.id); }}>
                        อนุมัติและส่งเข้าคำนวณ
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div
                  className="flex items-center justify-center text-center"
                  style={{ border: "1px dashed var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "var(--space-10) var(--space-6)", color: "var(--text-muted)", fontSize: "var(--text-sm)" }}
                >
                  เลือกภาพจากคิวด้านซ้ายเพื่อตรวจสอบ
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

// ── PhotoScene — artifact photo viewer (spec :329, :683-688). ──
// aspect 4/3 on the --photo-scene token (artifact gradient :331 minted
// in globals.css, T-303); pipe 30x132px white at left 50% / top 22%,
// radius 4px, water fill rgba(56,120,160,.72) inset 4% (wet) / 58% (dry)
// — artifact rgba cited (:686); GPS+time badge rgba(0,0,0,.6) mono 10px
// padding 3px 7px radius 5px (:687); phase badge top-right (:688).
// Photo source preserved from review-card.tsx: API_BASE + /api/photo/id.

function PhotoScene({ review }: { review: PhotoReview }) {
  const [failed, setFailed] = useState(false);
  const wet = review.water_state === "flooded";
  return (
    <div
      className="relative overflow-hidden"
      style={{ aspectRatio: "4 / 3", background: "var(--photo-scene)", borderRadius: "var(--radius-md)" }}
    >
      {!failed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={API_BASE + "/api/photo/" + review.id}
          alt={"ภาพพื้นที่ " + review.plot_id}
          className="absolute inset-0 w-full h-full object-cover"
          onError={() => setFailed(true)}
        />
      )}
      <div
        aria-hidden="true"
        className="absolute"
        style={{
          left: "50%",
          top: "22%",
          width: "30px",
          height: "132px",
          borderRadius: "4px",
          background: "var(--white)",
          transform: "translateX(-50%)",
          overflow: "hidden",
        }}
      >
        <div
          aria-hidden="true"
          style={{ position: "absolute", inset: wet ? "4% 0 0 0" : "58% 0 0 0", background: "rgba(56,120,160,.72)" }}
        />
      </div>
      <div className="absolute top-3 right-3">
        <Tag tone="onDark">{ROUND_LABELS[review.photo_type ?? ""] ?? "รอบภาพ"}</Tag>
      </div>
      <div
        className="absolute bottom-3 left-3 font-mono"
        style={{ background: "rgba(0,0,0,.6)", color: "var(--white)", fontSize: "10px", padding: "3px 7px", borderRadius: "5px" }}
      >
        {review.gps_lat != null && review.gps_lng != null
          ? review.gps_lat.toFixed(4) + ", " + review.gps_lng.toFixed(4)
          : "ไม่มีพิกัด"}
        {review.taken_at ? " · " + review.taken_at.slice(0, 10) : ""}
      </div>
    </div>
  );
}

// ── MetadataPanel — 7 artifact rows (:330, :689-692): border
// --border-subtle, radius --radius-md, overflow hidden; row padding
// 9px 12px, --text-xs, borderBottom --grey-100 except last.
// Live bindings: พิกัด (gps), เวลาถ่าย (taken_at), ระดับน้ำ
// (water_state), สอดคล้อง (ai_status as the closest live field).
// ใช้กล้องระบบ / อยู่ในขอบเขต / อยู่ในช่วง have no live source —
// rendered as "-" (R-025; disclosed in report).

function consistencyValue(r: PhotoReview): string {
  if (r.ai_status === "pass") return "ผ่าน";
  if (r.ai_status === "flag") return "ถูกธง";
  if (r.ai_status === "pending") return "รอตรวจ";
  return "-";
}

function MetadataPanel({ review }: { review: PhotoReview }) {
  const rows: Array<[string, ReactNode]> = [
    ["ใช้กล้องระบบ", "-"],
    [
      "พิกัด",
      review.gps_lat != null && review.gps_lng != null ? (
        <span className="font-mono">{review.gps_lat.toFixed(4)}, {review.gps_lng.toFixed(4)}</span>
      ) : "-",
    ],
    ["อยู่ในขอบเขต", "-"],
    ["เวลาถ่าย", review.taken_at ? new Date(review.taken_at).toLocaleString("th-TH") : "-"],
    ["ระดับน้ำ", review.water_state ? WATER_LABELS[review.water_state] ?? review.water_state : "-"],
    ["สอดคล้อง", consistencyValue(review)],
    ["อยู่ในช่วง", "-"],
  ];
  return (
    <div
      aria-label="metadata ภาพ"
      style={{ border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", overflow: "hidden", background: "var(--surface-card)" }}
    >
      {rows.map(([label, value], i) => (
        <div
          key={label}
          className="flex items-center justify-between"
          style={{
            padding: "9px 12px",
            fontSize: "var(--text-xs)",
            borderBottom: i === rows.length - 1 ? "none" : "1px solid var(--grey-100)",
          }}
        >
          <span style={{ color: "var(--text-muted)" }}>{label}</span>
          <span style={{ color: "var(--text-body)" }}>{value}</span>
        </div>
      ))}
    </div>
  );
}

// ── PageTitle — page-local pattern (DECIDED O-6, decision.json), same
// geometry as admin/page.tsx (admin-design-spec.md:504-510). ──

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
