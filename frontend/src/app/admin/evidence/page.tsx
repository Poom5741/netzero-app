"use client";

import { useState, useEffect } from "react";
import { getReviewQueue, reviewPhoto, getPrecisionStat, type PhotoReview, type PrecisionStat } from "@/lib/api";
import { ReviewCard } from "@/components/admin-review/review-card";
import { ReviewDetailPanel } from "@/components/admin-review/review-detail-panel";
import { PrecisionCard } from "@/components/admin-review/precision-card";
import { FilterTabs, type FilterTab } from "@/components/admin-review/filter-tabs";

type StatusFilter = "all" | "pending" | "flag" | "pass" | "reject";

const statusTabs: FilterTab[] = [
  { key: "all", label: "ทั้งหมด" },
  { key: "flag", label: "ถูกธง" },
  { key: "pending", label: "รอตรวจ" },
  { key: "pass", label: "AI ผ่าน" },
  { key: "reject", label: "ปฏิเสธ" },
];

export default function EvidencePage() {
  const [reviews, setReviews] = useState<PhotoReview[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [batchMode, setBatchMode] = useState(false);
  const [batchSelected, setBatchSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [precision, setPrecision] = useState<PrecisionStat | null>(null);
  const [authed, setAuthed] = useState<boolean | null>(null);

  // Auth check
  useEffect(() => {
    const email = sessionStorage.getItem("nzc_admin_email");
    const pass = sessionStorage.getItem("nzc_admin_pass");
    if (!email || !pass) {
      window.location.href = "/admin/login";
      return;
    }
    queueMicrotask(() => setAuthed(true));
  }, []);

  // Fetch queue + precision stats
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

  if (authed === null) return null;

  return (
    <main className="pt-14 lg:pt-14 px-4 lg:px-10 pb-10">
      <div className="max-w-[1400px]">
        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">ตรวจสอบภาพ</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              ภาพหลักฐานจากแปลงเกษตรกร · AI ตรวจแล้ว รอตรวจสอบจากเจ้าหน้าที่
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => { setBatchMode((m) => !m); setBatchSelected(new Set()); }}
              className={`px-4 py-2 rounded-lg text-label-md transition-colors ${
                batchMode
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              {batchMode ? "จบการเลือก" : "โหมดเลือกหลายรายการ"}
            </button>
          </div>
        </div>

        {/* Precision + stats */}
        {precision && (
          <div className="mb-6">
            <PrecisionCard
              auditReviewed={precision.auditReviewed}
              overrides={precision.overrides}
              precision={precision.precision}
            />
          </div>
        )}

        {/* Filter tabs */}
        <div className="mb-6">
          <FilterTabs
            tabs={statusTabs}
            activeKey={statusFilter}
            onChange={(k) => setStatusFilter(k as StatusFilter)}
          />
        </div>

        {/* Loading / error states */}
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

        {!loading && !error && filtered.length === 0 && (
          <div className="card p-6 text-center rounded-xl">
            <span className="material-symbols-outlined text-on-surface-variant text-4xl mb-2">photo_library</span>
            <p className="text-body-md text-on-surface">ไม่มีภาพที่รอตรวจสอบ</p>
          </div>
        )}

        {/* Photo grid */}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filtered.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                selected={selectedId === review.id}
                onSelect={setSelectedId}
                batchMode={batchMode}
                batchSelected={batchSelected.has(review.id)}
              />
            ))}
          </div>
        )}

        {/* Detail panel */}
        {selected && (
          <ReviewDetailPanel
            review={selected}
            onApprove={handleApprove}
            onReject={handleReject}
            onRetake={handleRetake}
            onClose={() => setSelectedId(null)}
          />
        )}
      </div>
    </main>
  );
}
