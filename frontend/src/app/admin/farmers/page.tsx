"use client";

import { useAdminSessionGate } from "@/lib/use-session-gate";
import { useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import {
  createFarmer,
  getFarmers,
  getFarmerDetail,
  API_BASE,
  type FarmerDetail,
  type FarmerListItem,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";

/**
 * AD-FAR FarmersScreen — spec 017 admin-design-spec.md:349-370 + :1035,
 * drawer geometry :681-696. Restyle only: ALL live API wiring, hooks,
 * state and session gating are preserved verbatim (R-025): getFarmers,
 * createFarmer (+ the full CreateFarmerForm, unchanged), getFarmerDetail,
 * useAdminSessionGate, loadFarmers/handleCreated. Artifact structure:
 * page-local PageTitle (DECIDED O-6) with verbatim Thai copy (R-028),
 * outline import/export actions + PdpaNote, 760px slide-over drawer
 * (--gradient-deep header, 5 verbatim tabs, --surface-sunken body).
 * Live-field deltas (R-025 outranks inventing columns, disclosed in the
 * task report): the artifact 11-column table needs ผู้สนับสนุน / ไร่ /
 * ภาพหลักฐาน / BE / PE / ER which have no FarmerListItem field — the live
 * set is CPA / ชื่อ-นามสกุล / พื้นที่ / แปลงย่อย / ความน่าเชื่อถือ
 * (TrustBadge restyled onto ui/badge). Drawer 4 stats bind to live
 * plots/documents/photos counts + trust score.
 */

type TabKey = "plots" | "credit" | "nitrogen" | "photos" | "audit";

// Drawer tabs — artifact labels verbatim (admin-design-spec.md:368).
const TAB_DEFS: Array<{ key: TabKey; label: string }> = [
  { key: "plots", label: "แปลงและเอกสาร" },
  { key: "credit", label: "การคำนวณเครดิต" },
  { key: "nitrogen", label: "ที่มาของไนโตรเจน" },
  { key: "photos", label: "ภาพหลักฐาน" },
  { key: "audit", label: "ประวัติการแก้ไข" },
];

const PHOTO_TYPE_LABELS: Record<string, string> = {
  prepare: "เตรียมพื้นที่",
  wetdry: "น้ำขัง/แห้ง",
  harvest: "เก็บเกี่ยว",
};

const N_STEP_LABELS: Record<string, string> = {
  base: "ปุ๋ยพื้นฐาน",
  tillering: "ปุ๋ยแตกกอ",
  panicle: "ปุ๋ยออกรวง",
};

const ACTION_LABELS: Record<string, string> = {
  verified: "อนุมัติ",
  rejected: "ปฏิเสธ",
  superseded: "แทนที่",
  promoted: "ยกระดับ",
  reject_application: "ปฏิเสธใบสมัคร",
  approve_application: "อนุมัติใบสมัคร",
};

// TrustBadge restyled onto ui/badge — identical 70/40 thresholds and
// rounding as the removed page-local TrustBadge (semantics match; see
// report). Artifact สถานะหลักฐาน column has no live source, so the live
// trust score is the badge column instead (R-025, disclosed).
function trustBadge(score: number): ReactNode {
  const pct = Math.round(score * 100);
  const tone = pct >= 70 ? "success" : pct >= 40 ? "warning" : "danger";
  return <Badge tone={tone}>{pct}%</Badge>;
}

// ── Farmer List Page ──────────────────────────────────────────────

export default function FarmersPage() {
  const [farmers, setFarmers] = useState<FarmerListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFarmerId, setSelectedFarmerId] = useState<string | null>(null);
  const authed = useAdminSessionGate();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const loadFarmers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setFarmers(await getFarmers());
    } catch {
      setError("ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authed) return;
    queueMicrotask(() => void loadFarmers());
  }, [authed, loadFarmers]);

  const handleCreated = () => {
    setShowCreateForm(false);
    setNotice("เพิ่มเกษตรกรเรียบร้อยแล้ว");
    void loadFarmers();
  };

  if (authed === null) return null;

  return (
    <main className="pt-14 lg:pt-14 px-4 lg:px-10 pb-10">
      <div className="max-w-[1400px] flex flex-col" style={{ gap: "var(--space-6)" }}>
        {/* PageTitle — artifact copy verbatim (R-028; spec :356-358).
            Artifact outline actions have no live behaviour (R-015:
            rendered disabled, no invented handlers); the live create
            action is preserved beside them. */}
        <PageTitle
          eyebrow="ทะเบียนเกษตรกร"
          title="ดูราย CPA code · รายพื้นที่ · รายบริษัทผู้สนับสนุน"
          actions={
            <div className="flex items-center" style={{ gap: "var(--space-2)" }}>
              <Button variant="outline" size="sm" disabled title="ยังไม่เปิดใช้งาน">
                นำเข้าเป็นชุด (AD-13)
              </Button>
              <Button variant="outline" size="sm" disabled title="ยังไม่เปิดใช้งาน">
                ส่งออกราย CPA code
              </Button>
              <Button size="sm" onClick={() => { setNotice(null); setShowCreateForm(true); }}>
                <span className="material-symbols-outlined text-[18px]">person_add</span>
                เพิ่มเกษตรกร
              </Button>
            </div>
          }
        />

        {/* PdpaNote — verbatim (R-028; spec :359, geometry :626-629). */}
        <div
          className="flex items-start"
          style={{ background: "var(--status-info-soft)", padding: "var(--space-4) var(--space-5)", borderRadius: "var(--radius-md)", gap: "var(--space-2)" }}
        >
          <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: "16px", color: "var(--status-info)" }}>info</span>
          <p className="text-xs" style={{ color: "var(--text-body)", margin: 0 }}>
            ตารางนี้แสดงชื่อได้เพราะเป็นบัญชีแอดมิน · ทุกไฟล์ที่ส่งออกและทุกหน้าที่ลูกค้าเห็น ใช้ CPA code แทนชื่อเสมอ (PDPA · CS-02)
          </p>
        </div>

        {notice && (
          <div role="status" className="mb-4 rounded-xl bg-primary/10 px-4 py-3 text-body-md text-primary">
            {notice}
          </div>
        )}

        {showCreateForm && (
          <CreateFarmerForm onCancel={() => setShowCreateForm(false)} onCreated={handleCreated} />
        )}

        {loading && (
          <div className="card p-6 text-center rounded-2xl">
            <div className="flex justify-center gap-2 mb-2">
              <div className="typing-dot w-3 h-3 rounded-full bg-primary" />
              <div className="typing-dot w-3 h-3 rounded-full bg-primary" />
              <div className="typing-dot w-3 h-3 rounded-full bg-primary" />
            </div>
            <p className="text-body-md text-on-surface-variant">กำลังโหลด...</p>
          </div>
        )}

        {error && (
          <div className="card p-6 text-center rounded-2xl">
            <span className="material-symbols-outlined text-error text-4xl mb-2">error</span>
            <p className="text-body-md text-on-surface">{error}</p>
          </div>
        )}

        {!loading && !error && farmers.length === 0 && (
          <div className="card p-6 text-center rounded-2xl">
            <span className="material-symbols-outlined text-outline text-4xl mb-2">inbox</span>
            <p className="text-body-md text-on-surface-variant">ไม่มีเกษตรกรในระบบ</p>
          </div>
        )}

          {/* Live columns (R-025): CPA code mono 12px bold / ชื่อ-นามสกุล /
              พื้นที่ / แปลงย่อย / ความน่าเชื่อถือ badge. Artifact ผู้สนับสนุน
              (Tag navy) / ไร่ / ภาพหลักฐาน / BE / PE / ER have no
              FarmerListItem source — omitted, disclosed in report. */}
        {!loading && !error && farmers.length > 0 && (
          <DataTable
            columns={[{
              key: "cpa",
              header: "CPA code",
            }, {
              key: "name",
              header: "ชื่อ-นามสกุล",
            }, {
              key: "area",
              header: "พื้นที่",
            }, {
              key: "plots",
              header: "แปลงย่อย",
              align: "right",
            }, {
              key: "trust",
              header: "ความน่าเชื่อถือ",
            }]}
            rows={farmers.map((f) => ({
              cpa: f.cpa_code ? (
                <span className="font-mono" style={{ fontSize: "12px", fontWeight: "var(--weight-bold)" }}>{f.cpa_code}</span>
              ) : (
                <span style={{ color: "var(--text-muted)" }}>-</span>
              ),
              name: (
                <span>
                  <span className="block" style={{ fontWeight: "var(--weight-medium)" }}>{f.full_name}</span>
                  <span className="block" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{f.phone}</span>
                </span>
              ),
              area: f.addr_district || f.addr_province
                ? "อ." + (f.addr_district ?? "-") + " จ." + (f.addr_province ?? "-")
                : "-",
              plots: f.plot_count,
              trust: trustBadge(f.trust_score),
            }))}
            rowKey={(_row, i) => farmers[i].id}
            onRowClick={(_row, i) => setSelectedFarmerId(farmers[i].id)}
          />
        )}

        {/* AD-FAR slide-over drawer (spec :361-370, :681-696). */}
        {selectedFarmerId && (
          <FarmerDrawer
            farmerId={selectedFarmerId}
            onClose={() => setSelectedFarmerId(null)}
          />
        )}
      </div>
    </main>
  );
}

// ── AD-FAR slide-over drawer (admin-design-spec.md:681-696). ──
// Overlay rgba(6,30,92,.42) (:681); width min(760px, 94vw) on
// --surface-sunken with --shadow-xl (:682-683); header --gradient-deep
// padding --space-6 --space-8 (:684) with mono teal-300 CPA code, 24px
// light white name, address line, 4 live stats; tab bar padding
// 0 --space-8, buttons 13px 11px, active 2px --teal-600 / --teal-700,
// inactive --text-muted (:685-688); content --space-6 --space-8
// --space-16 (:689).

function FarmerDrawer({
  farmerId,
  onClose,
}: {
  farmerId: string;
  onClose: () => void;
}) {
  const [detail, setDetail] = useState<FarmerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("plots");

  useEffect(() => {
    queueMicrotask(() => setLoading(true));
    getFarmerDetail(farmerId)
      .then(setDetail)
      .catch(() => setDetail(null))
      .finally(() => setLoading(false));
  }, [farmerId]);

  const pct = detail ? Math.round(detail.trust_score * 100) : 0;

  return (
    <div className="fixed inset-0 z-[100] flex">
      {/* Backdrop */}
      <div className="absolute inset-0" style={{ background: "rgba(6,30,92,.42)" }} onClick={onClose} />

      {/* Slide-over panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="รายละเอียดเกษตรกร"
        className="absolute right-0 top-0 h-full flex flex-col"
        style={{ width: "min(760px, 94vw)", background: "var(--surface-sunken)", boxShadow: "var(--shadow-xl)" }}
      >
        {/* Header — --gradient-deep (:684). The onDark chip bg
            rgba(255,255,255,.12) is the artifact Tag onDark literal
            (GAP B :961), cited per R-006. */}
        <div className="relative" style={{ background: "var(--gradient-deep)", padding: "var(--space-6) var(--space-8)" }}>
          <button
            onClick={onClose}
            aria-label="ปิด"
            className="absolute rounded-full flex items-center justify-center"
            style={{ top: "var(--space-4)", right: "var(--space-4)", width: "32px", height: "32px", background: "rgba(255,255,255,.12)", color: "var(--white)", cursor: "pointer", border: "1px solid var(--border-on-dark)" }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>close</span>
          </button>
          {loading ? (
            <div className="animate-pulse rounded-lg" style={{ height: "88px", background: "rgba(255,255,255,.12)" }} />
          ) : (
            <>
              <p className="font-mono" style={{ color: "var(--teal-300)", fontSize: "12px", fontWeight: "var(--weight-semibold)", letterSpacing: "0.02em", margin: 0 }}>
                {detail?.cpa_code ?? "ไม่มี CPA"}
              </p>
              <h2 style={{ fontSize: "24px", fontWeight: "var(--weight-light)", color: "var(--white)", lineHeight: 1.25, margin: "var(--space-1) 0 0" }}>
                {detail?.full_name}
              </h2>
              <p style={{ color: "var(--white)", opacity: 0.75, fontSize: "var(--text-sm)", margin: "var(--space-1) 0 0" }}>
                {detail ? "อ." + detail.district + " จ." + detail.province : ""}
              </p>
              {/* 4 stats — live bindings (R-025): plots/documents/photos
                  counts + trust score (artifact mock stats have no live
                  source; disclosed in report). */}
              <div className="grid grid-cols-4" style={{ gap: "var(--space-4)", marginTop: "var(--space-4)" }}>
                {[
                  ["แปลงย่อย", detail ? String(detail.plots.length) : "-"],
                  ["เอกสาร", detail ? String(detail.documents.length) : "-"],
                  ["ภาพหลักฐาน", detail ? String(detail.photos.length) : "-"],
                  ["ความน่าเชื่อถือ", detail ? pct + "%" : "-"],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p style={{ color: "var(--white)", opacity: 0.66, fontSize: "var(--text-xs)", margin: 0 }}>{label}</p>
                    <p style={{ color: "var(--white)", fontSize: "20px", fontWeight: "var(--weight-semibold)", fontVariantNumeric: "tabular-nums", margin: 0 }}>{value}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Tab bar (:685-688). */}
        <div className="flex overflow-x-auto" style={{ padding: "0 var(--space-8)", borderBottom: "1px solid var(--border-subtle)" }}>
          {TAB_DEFS.map((tab) => {
            const active = tab.key === activeTab;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="whitespace-nowrap"
                style={{
                  padding: "13px 11px",
                  fontSize: "var(--text-sm)",
                  fontWeight: active ? "var(--weight-semibold)" : "var(--weight-medium)",
                  color: active ? "var(--teal-700)" : "var(--text-muted)",
                  borderBottom: "2px solid " + (active ? "var(--teal-600)" : "transparent"),
                  background: "transparent",
                  cursor: "pointer",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab content (:689). */}
        <div className="flex-1 overflow-y-auto" style={{ padding: "var(--space-6) var(--space-8) var(--space-16)" }}>
          {loading && (
            <div className="text-center py-10">
              <div className="flex justify-center gap-2 mb-2">
                <div className="typing-dot w-3 h-3 rounded-full bg-primary" />
                <div className="typing-dot w-3 h-3 rounded-full bg-primary" />
                <div className="typing-dot w-3 h-3 rounded-full bg-primary" />
              </div>
              <p className="text-body-md text-on-surface-variant">กำลังโหลด...</p>
            </div>
          )}

          {!loading && detail && activeTab === "plots" && (
            <PlotsTab detail={detail} />
          )}
          {!loading && detail && activeTab === "credit" && (
            <CreditTab detail={detail} />
          )}
          {!loading && detail && activeTab === "nitrogen" && (
            <NitrogenTab detail={detail} />
          )}
          {!loading && detail && activeTab === "photos" && (
            <PhotosTab detail={detail} />
          )}
          {!loading && detail && activeTab === "audit" && (
            <AuditTab detail={detail} />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Tab 1: แปลงและเอกสาร — plots DataTable + live documents table.
// Artifact 8-item document checklist grid is fixture data with no live
// source; live documents render as a dense DataTable instead (R-025).

function PlotsTab({ detail }: { detail: FarmerDetail }) {
  return (
    <div className="flex flex-col" style={{ gap: "var(--space-6)" }}>
      <div className="flex flex-col" style={{ gap: "var(--space-3)" }}>
        <h3 className="text-sm font-semibold" style={{ color: "var(--text-heading)", margin: 0 }}>แปลงที่ดิน</h3>
        {detail.plots.length === 0 ? (
          <p className="text-body-md text-on-surface-variant">ไม่มีแปลงในระบบ</p>
        ) : (
          <DataTable
            dense
            columns={[{
              key: "code", header: "แปลง",
            }, {
              key: "deed", header: "โฉนด",
            }, {
              key: "rai", header: "ไร่", align: "right",
            }, {
              key: "season", header: "ฤดู",
            }, {
              key: "carbon", header: "คาร์บอน (tCO2e)", align: "right",
            }]}
            rows={detail.plots.map((p) => ({
              code: <span className="font-mono" style={{ fontSize: "12px" }}>{p.plot_code}</span>,
              deed: p.deed_no,
              rai: p.area_rai,
              season: p.season_name ?? "-",
              carbon: p.carbon_total != null ? p.carbon_total.toFixed(2) : "-",
            }))}
            rowKey={(_row, i) => detail.plots[i].id}
          />
        )}
      </div>

      <div className="flex flex-col" style={{ gap: "var(--space-3)" }}>
        <h3 className="text-sm font-semibold" style={{ color: "var(--text-heading)", margin: 0 }}>เอกสาร</h3>
        {detail.documents.length === 0 ? (
          <p className="text-body-md text-on-surface-variant">ไม่มีเอกสาร</p>
        ) : (
          <DataTable
            dense
            columns={[{
              key: "type", header: "เอกสาร",
            }, {
              key: "status", header: "สถานะ",
            }]}
            rows={detail.documents.map((d) => ({
              type: d.doc_type,
              status: d.review_status === "approved"
                ? <Badge tone="success">ผ่าน</Badge>
                : d.review_status === "rejected"
                  ? <Badge tone="danger">ปฏิเสธ</Badge>
                  : <Badge tone="warning">รอตรวจสอบ</Badge>,
            }))}
            rowKey={(_row, i) => detail.documents[i].id}
          />
        )}
      </div>
    </div>
  );
}

// ── Tab 2: การคำนวณเครดิต — live carbonTrace as a dense DataTable.
// Artifact CalcTrace is a two-column BL/PJ layout over fixture plots;
// the live trace is a flat step list, so the table follows the AD-OV
// dense pattern (R-025, disclosed in report). */}

function CreditTab({ detail }: { detail: FarmerDetail }) {
  if (detail.carbonTrace.length === 0) {
    return <p className="text-body-md text-on-surface-variant">ไม่มีข้อมูลการคำนวณ</p>;
  }

  return (
    <div className="flex flex-col" style={{ gap: "var(--space-3)" }}>
      <h3 className="text-sm font-semibold" style={{ color: "var(--text-heading)", margin: 0 }}>การคำนวณเครดิต</h3>
      <DataTable
        dense
        columns={[{
          key: "step", header: "#", align: "right", width: 48,
        }, {
          key: "label", header: "ขั้นตอน",
        }, {
          key: "value", header: "ค่า",
        }]}
        rows={detail.carbonTrace.map((entry) => ({
          step: entry.step,
          label: entry.label,
          value: <span className="font-mono" style={{ fontSize: "12px", fontWeight: "var(--weight-semibold)" }}>{entry.value}</span>,
        }))}
        rowKey={(_row, i) => "trace-" + i}
      />
    </div>
  );
}

// ── Tab 3: ที่มาของไนโตรเจน — formula render + N calculation. The
// artifact urea/photo badges have no live fields (R-025, disclosed).

function NitrogenTab({ detail }: { detail: FarmerDetail }) {
  if (detail.nitrogenEntries.length === 0) {
    return <p className="text-body-md text-on-surface-variant">ไม่มีข้อมูลปุ๋ย</p>;
  }

  return (
    <div className="flex flex-col" style={{ gap: "var(--space-3)" }}>
      <h3 className="text-sm font-semibold" style={{ color: "var(--text-heading)", margin: 0 }}>แหล่งไนโตรเจน</h3>
      <DataTable
        dense
        columns={[{
          key: "step", header: "ขั้นตอน",
        }, {
          key: "formula", header: "สูตร",
        }, {
          key: "rate", header: "อัตรา (กก./ไร่)", align: "right",
        }, {
          key: "n", header: "ไนโตรเจน (กก./ไร่)", align: "right",
        }]}
        rows={detail.nitrogenEntries.map((entry) => ({
          step: N_STEP_LABELS[entry.step] ?? entry.step,
          formula: <span className="font-mono" style={{ fontSize: "12px" }}>{entry.formula}</span>,
          rate: entry.rate_kg_per_rai,
          n: entry.nitrogen_kg_per_rai,
        }))}
        rowKey={(_row, i) => "n-" + i}
      />
    </div>
  );
}

// ── Tab 4: ภาพหลักฐาน — 4-up grid (spec :369, :696): repeat(4, 1fr),
// gap --space-3; tiles 4/3 on --photo-scene with pipe overlay + water
// rgba(56,120,160,.72) (AD-REV :686 rgba, cited); approved/not-yet via
// Badge on the live admin_status. Photo src reuses the established
// API_BASE + /api/photo/id endpoint (review-card.tsx) with a scene
// fallback on error.

function PhotosTab({ detail }: { detail: FarmerDetail }) {
  if (detail.photos.length === 0) {
    return <p className="text-body-md text-on-surface-variant">ไม่มีภาพหลักฐาน</p>;
  }

  return (
    <div className="grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--space-3)" }}>
      {detail.photos.map((photo) => (
        <DrawerPhotoTile key={photo.id} photo={photo} />
      ))}
    </div>
  );
}

function DrawerPhotoTile({ photo }: { photo: FarmerDetail["photos"][number] }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="flex flex-col" style={{ gap: "var(--space-1)" }}>
      <div
        className="relative overflow-hidden"
        style={{ aspectRatio: "4 / 3", background: "var(--photo-scene)", borderRadius: "var(--radius-sm)" }}
      >
        {!failed && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={API_BASE + "/api/photo/" + photo.id}
            alt={"ภาพหลักฐาน " + (photo.photo_type ?? photo.id)}
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => setFailed(true)}
          />
        )}
        {/* Pipe overlay scaled for the 4-up grid (artifact gives no
            drawer-pipe geometry; AD-REV :685 ratios kept). */}
        <div
          aria-hidden="true"
          className="absolute"
          style={{
            left: "50%",
            top: "22%",
            width: "20px",
            height: "88px",
            borderRadius: "3px",
            background: "var(--white)",
            transform: "translateX(-50%)",
            overflow: "hidden",
          }}
        >
          <div
            aria-hidden="true"
            style={{ position: "absolute", inset: photo.water_state === "flooded" ? "4% 0 0 0" : "58% 0 0 0", background: "rgba(56,120,160,.72)" }}
          />
        </div>
        <div className="absolute top-2 right-2">
          {photo.admin_status === "verified" ? (
            <Badge tone="success">อนุมัติแล้ว</Badge>
          ) : photo.admin_status === "rejected" ? (
            <Badge tone="danger">ปฏิเสธ</Badge>
          ) : (
            <Badge tone="warning">รอตรวจ</Badge>
          )}
        </div>
      </div>
      <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", margin: 0 }}>
        {PHOTO_TYPE_LABELS[photo.photo_type ?? ""] ?? "-"}
        {photo.taken_at ? " · " + photo.taken_at.slice(0, 10) : ""}
      </p>
    </div>
  );
}

// ── Tab 5: ประวัติการแก้ไข — live audit log as a dense DataTable
// (artifact audit log table, spec :370). ──

function AuditTab({ detail }: { detail: FarmerDetail }) {
  if (detail.auditLog.length === 0) {
    return <p className="text-body-md text-on-surface-variant">ไม่มีประวัติ</p>;
  }

  return (
    <div className="flex flex-col" style={{ gap: "var(--space-3)" }}>
      <h3 className="text-sm font-semibold" style={{ color: "var(--text-heading)", margin: 0 }}>ประวัติการแก้ไข</h3>
      <DataTable
        dense
        columns={[{
          key: "action", header: "การดำเนินการ",
        }, {
          key: "detail", header: "รายละเอียด",
        }, {
          key: "actor", header: "โดย",
        }, {
          key: "time", header: "เวลา",
        }]}
        rows={detail.auditLog.map((entry) => ({
          action: ACTION_LABELS[entry.action] ?? entry.action,
          detail: entry.field_name
            ? entry.field_name + ": " + (entry.old_value ?? "-") + " → " + (entry.new_value ?? "-")
            : "-",
          actor: entry.actor_type === "admin" ? "แอดมิน" : "ระบบ",
          time: new Date(entry.created_at).toLocaleString("th-TH"),
        }))}
        rowKey={(_row, i) => detail.auditLog[i].id}
      />
    </div>
  );
}

// ── CreateFarmerForm — live createFarmer wiring preserved VERBATIM from
// the pre-restyle page (R-025: live-only feature, no artifact mapping). ──

function CreateFarmerForm({ onCancel, onCreated }: { onCancel: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    gender: "unspecified" as "male" | "female" | "unspecified",
    addr_province: "",
    addr_district: "",
    addr_subdistrict: "",
    addr_village: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const update = (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const phone = form.phone.replace(/[\s-]/g, "");
    if (!form.full_name.trim()) {
      setError("กรุณาระบุชื่อเกษตรกร");
      return;
    }
    if (!/^0\d{9}$/.test(phone)) {
      setError("เบอร์โทรศัพท์ไม่ถูกต้อง (ต้องขึ้นต้นด้วย 0 และมีความยาว 10 หลัก)");
      return;
    }

    setSaving(true);
    try {
      const result = await createFarmer({ ...form, phone });
      if (!result.ok) {
        const body = result.data as { message?: string; details?: { message?: string } };
        if (result.status === 409) {
          setError("เบอร์โทรศัพท์นี้ถูกใช้งานแล้ว");
        } else if (result.status === 400) {
          setError(body.details?.message ?? body.message ?? "ข้อมูลไม่ถูกต้อง");
        } else {
          setError("ไม่สามารถเพิ่มเกษตรกรได้ กรุณาลองใหม่");
        }
        return;
      }
      onCreated();
    } catch {
      setError("ไม่สามารถเชื่อมต่อได้ กรุณาลองใหม่");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="card mb-6 rounded-2xl p-5" aria-labelledby="create-farmer-title">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 id="create-farmer-title" className="text-headline-md font-semibold text-on-surface">เพิ่มเกษตรกร</h2>
          <p className="mt-1 text-body-sm text-on-surface-variant">กรอกชื่อและเบอร์โทรศัพท์เพื่อให้เกษตรกรผูกบัญชีผ่าน LINE</p>
        </div>
        <button type="button" onClick={onCancel} className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container-high" aria-label="ปิดฟอร์ม">
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      {error && <div role="alert" className="mb-4 rounded-xl bg-error/10 px-4 py-3 text-body-sm text-error">{error}</div>}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-label-md text-on-surface">
          ชื่อ-นามสกุล <span aria-hidden="true">*</span>
          <input value={form.full_name} onChange={update("full_name")} required maxLength={100} className="mt-1 w-full rounded-xl border border-outline-variant bg-surface-container-low px-3 py-3 text-body-md" />
        </label>
        <label className="text-label-md text-on-surface">
          เบอร์โทรศัพท์ <span aria-hidden="true">*</span>
          <input value={form.phone} onChange={update("phone")} required inputMode="tel" pattern="0[0-9]{9}" maxLength={12} placeholder="0812345678" className="mt-1 w-full rounded-xl border border-outline-variant bg-surface-container-low px-3 py-3 text-body-md" />
        </label>
        <label className="text-label-md text-on-surface">
          เพศ
          <select value={form.gender} onChange={update("gender")} className="mt-1 w-full rounded-xl border border-outline-variant bg-surface-container-low px-3 py-3 text-body-md">
            <option value="unspecified">ไม่ระบุ</option>
            <option value="male">ชาย</option>
            <option value="female">หญิง</option>
          </select>
        </label>
        {(["addr_province", "addr_district", "addr_subdistrict", "addr_village"] as const).map((field) => (
          <label key={field} className="text-label-md text-on-surface">
            {{ addr_province: "จังหวัด", addr_district: "อำเภอ", addr_subdistrict: "ตำบล", addr_village: "หมู่บ้าน" }[field]}
            <input value={form[field]} onChange={update(field)} maxLength={50} className="mt-1 w-full rounded-xl border border-outline-variant bg-surface-container-low px-3 py-3 text-body-md" />
          </label>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel}>ยกเลิก</Button>
        <Button type="submit" loading={saving}>บันทึกเกษตรกร</Button>
      </div>
    </form>
  );
}

// ── PageTitle — page-local pattern (DECIDED O-6, decision.json), same
// geometry as admin/page.tsx (admin-design-spec.md:504-510). ──

function PageTitle({
  eyebrow,
  title,
  actions,
}: {
  eyebrow: string;
  title: string;
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
      </div>
      {actions ? <div style={{ marginLeft: "auto" }}>{actions}</div> : null}
    </div>
  );
}
