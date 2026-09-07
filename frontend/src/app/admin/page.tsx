"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { FilterTabs, type FilterTab } from "@/components/admin-review/filter-tabs";
import { ReviewCard } from "@/components/admin-review/review-card";
import { ReviewDetailPanel } from "@/components/admin-review/review-detail-panel";
import { PrecisionCard } from "@/components/admin-review/precision-card";
import { Button } from "@/components/ui/button";
import { getReviewQueue, reviewPhoto, getPrecisionStat, apiRequest, type PhotoReview, type PrecisionStat } from "@/lib/api";

type GateStatus = "idle" | "approved" | "blocked";
type GateResult = { success: boolean; missing?: string[] } | null;

const sidebarEntries = [
  { key: "review", label: "ตรวจสอบภาพ", href: "/admin", icon: "rate_review", active: true },
];

const filterTabs: FilterTab[] = [
  { key: "all", label: "ทั้งหมด" },
  { key: "pending", label: "รอตรวจสอบ" },
  { key: "flagged", label: "ถูกธง" },
  { key: "verified", label: "ผ่านแล้ว" },
  { key: "rejected", label: "ปฏิเสธแล้ว" },
];

// Backend ai_status vocabulary is flag/pass/reject/pending — not the tab keys
const filterToApiStatus: Record<string, string | undefined> = {
  all: undefined,
  pending: "pending",
  flagged: "flag",
  verified: "pass",
  rejected: "reject",
};

export default function AdminReviewPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [queue, setQueue] = useState<PhotoReview[]>([]);
  const [precision, setPrecision] = useState<PrecisionStat>({ auditReviewed: 0, overrides: 0, precision: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef<Set<string>>(new Set());
  const [gateStatus, setGateStatus] = useState<GateStatus>("idle");
  const [gateResult, setGateResult] = useState<GateResult>(null);
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [batchMode, setBatchMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBatchConfirm, setShowBatchConfirm] = useState<"approve" | "reject" | null>(null);
  const [pendingAction, setPendingAction] = useState<{ type: "approve" | "reject"; id: string; reason?: string } | null>(null);
  const [undoCountdown, setUndoCountdown] = useState(5);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Check auth on mount
  useEffect(() => {
    const email = sessionStorage.getItem("nzc_admin_email");
    const pass = sessionStorage.getItem("nzc_admin_pass");
    if (!email || !pass) {
      window.location.href = "/admin/login";
      return;
    }
    setAuthed(true);
  }, []);

  const fetchQueue = useCallback(async (filter: string, force = false) => {
    // Prevent duplicate calls for same filter (unless forced refresh)
    if (!force && fetchedRef.current.has(filter)) {
      return;
    }
    fetchedRef.current.add(filter);

    setLoading(true);
    setError(null);
    try {
      const data = await getReviewQueue(filterToApiStatus[filter]);
      setQueue(data);
    } catch {
      setError("ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueue(activeFilter);
    // Fetch precision stat once on mount
    getPrecisionStat().then(setPrecision).catch(() => {});
  }, [activeFilter, fetchQueue]);

  const selectedReview = queue.find((r) => r.id === selectedId) ?? null;

  const executeAction = async (action: { type: "approve" | "reject"; id: string; reason?: string }) => {
    try {
      if (action.type === "approve") {
        await reviewPhoto(action.id, "verified");
      } else {
        await reviewPhoto(action.id, "rejected", action.reason!);
      }
      setSelectedId(null);
      fetchedRef.current.clear();
      fetchQueue(activeFilter, true);
    } catch {
      setError(action.type === "approve" ? "ไม่สามารถอนุมัติได้ กรุณาลองใหม่" : "ไม่สามารถปฏิเสธได้ กรุณาลองใหม่");
    }
  };

  const handleApprove = (id: string) => {
    setPendingAction({ type: "approve", id });
    setSelectedId(null);
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    undoTimerRef.current = setTimeout(() => {
      executeAction({ type: "approve", id });
      setPendingAction(null);
    }, 5000);
  };

  const handleReject = (id: string, reason: string) => {
    setPendingAction({ type: "reject", id, reason });
    setSelectedId(null);
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    undoTimerRef.current = setTimeout(() => {
      executeAction({ type: "reject", id, reason });
      setPendingAction(null);
    }, 5000);
  };

  const handleUndo = () => {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    setPendingAction(null);
    setUndoCountdown(5);
  };

  // Countdown timer for undo toast
  useEffect(() => {
    if (!pendingAction) return;
    setUndoCountdown(5);
    countdownRef.current = setInterval(() => {
      setUndoCountdown((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, [pendingAction]);

  // Keyboard shortcuts when photo is selected
  useEffect(() => {
    if (!selectedReview) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "a" || e.key === "A") {
        e.preventDefault();
        // Open approve confirmation modal via detail panel
        document.dispatchEvent(new CustomEvent("admin-approve-shortcut"));
      } else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        // Open reject modal via detail panel
        document.dispatchEvent(new CustomEvent("admin-reject-shortcut"));
      } else if (e.key === "Escape") {
        setSelectedId(null);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedReview]);

  const handleFilterChange = (key: string) => {
    setActiveFilter(key);
    setSelectedId(null);
  };

  const toggleBatchMode = () => {
    setBatchMode((prev) => !prev);
    setSelectedIds(new Set());
    setSelectedId(null);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(queue.map((r) => r.id)));
  };

  const executeBatch = async (type: "approve" | "reject") => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    try {
      await Promise.all(ids.map((id) =>
        type === "approve" ? reviewPhoto(id, "verified") : reviewPhoto(id, "rejected", "ปฎิเสธเป็นกลุ่ม")
      ));
      setSelectedIds(new Set());
      setBatchMode(false);
      fetchedRef.current.clear();
      fetchQueue(activeFilter, true);
    } catch {
      setError(type === "approve" ? "ไม่สามารถอนุมัติได้ กรุณาลองใหม่" : "ไม่สามารถปฏิเสธได้ กรุณาลองใหม่");
    }
  };

  const handleBatchApprove = () => {
    setShowBatchConfirm("approve");
  };

  const handleBatchReject = () => {
    setShowBatchConfirm("reject");
  };

  const confirmBatch = () => {
    if (showBatchConfirm) {
      executeBatch(showBatchConfirm);
      setShowBatchConfirm(null);
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      <div className="hidden lg:block">
        <DashboardSidebar
          entries={sidebarEntries}
          userName="System Admin"
          userEmail="admin@netzerocarbon.com"
        />
      </div>
      <div className="hidden lg:block">
        <DashboardHeader userLabel="Admin" />
      </div>

      {/* Mobile top bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-surface/60 backdrop-blur-xl z-40 px-4 flex items-center shadow-sm">
        <span data-testid="mobile-brand" className="text-headline-md font-bold text-on-surface">NetZero</span>
        <span className="ml-4 text-body-md text-on-surface font-semibold">คิวตรวจสอบ</span>
      </header>

      <div className="dashboard-main">
      <main className="pt-20 lg:pt-24 px-4 lg:px-10 pb-10">
        <div className="flex flex-col w-full h-[calc(100vh-80px)]">
          <div className="flex h-full w-full gap-6">
            {/* Main Grid Area */}
            <div className="flex-1 min-w-0 flex flex-col h-full bg-surface-container-low rounded-xl overflow-hidden shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-headline-lg text-headline-lg text-on-surface">คิวตรวจสอบ</h2>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-2">
                    {loading ? "กำลังโหลด..." : `${queue.length} รายการรอตรวจสอบ`}
                  </p>
                </div>
                {/* Filter tabs + Batch toggle + Help */}
                <div className="flex items-center gap-3">
                  <FilterTabs tabs={filterTabs} activeKey={activeFilter} onChange={handleFilterChange} />
                  <Button
                    variant={batchMode ? "primary" : "secondary"}
                    size="sm"
                    onClick={toggleBatchMode}
                  >
                    <span className="material-symbols-outlined text-[16px]">{batchMode ? "check_box" : "check_box_outline_blank"}</span>
                    {batchMode ? "ยกเลิก" : "เลือกหลายรายการ"}
                  </Button>
                  <div className="relative group">
                    <button
                      className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors"
                      aria-label="คีย์ลัดและคำแนะนำ"
                    >
                      <span className="material-symbols-outlined text-[18px]">help</span>
                    </button>
                    <div className="absolute right-0 top-full mt-2 w-64 neumorphic rounded-xl p-4 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <p className="text-label-md font-semibold text-on-surface mb-2">คีย์ลัด</p>
                      <ul className="text-[12px] text-on-surface-variant space-y-1">
                        <li><kbd className="px-1 py-0.5 rounded bg-surface-container-high font-mono text-[10px]">A</kbd> อนุมัติภาพที่เลือก</li>
                        <li><kbd className="px-1 py-0.5 rounded bg-surface-container-high font-mono text-[10px]">R</kbd> ปฏิเสธภาพที่เลือก</li>
                        <li><kbd className="px-1 py-0.5 rounded bg-surface-container-high font-mono text-[10px]">Esc</kbd> ยกเลิกการเลือก</li>
                      </ul>
                      <p className="text-label-md font-semibold text-on-surface mt-3 mb-1">โหมดเลือกหลายรายการ</p>
                      <p className="text-[12px] text-on-surface-variant">กดปุ่ม "เลือกหลายรายการ" เพื่ออนุมัติหรือปฏิเสธหลายภาพพร้อมกัน</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Precision stat */}
              <div className="mb-6 max-w-[512px]">
                <PrecisionCard
                  auditReviewed={precision.auditReviewed}
                  overrides={precision.overrides}
                  precision={precision.precision}
                />
              </div>

              {/* Season gate */}
              <div className="mb-6 max-w-[512px]">
                <div className="neumorphic p-4 rounded-xl">
                  <h3 className="text-label-md font-semibold text-on-surface mb-2">สถานะฤดูกาล</h3>
                  {gateStatus === "approved" && (
                    <p className="text-label-md text-primary font-medium">อนุมัติสำเร็จ</p>
                  )}
                  {gateStatus === "blocked" && gateResult?.missing && (
                    <div>
                      <p className="text-label-md text-error font-medium">ไม่ผ่านการอนุมัติ</p>
                      <ul className="text-[12px] text-on-surface-variant mt-1 list-disc list-inside">
                        {gateResult.missing.map((m) => (
                          <li key={m}>{m}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <Button
                    size="sm"
                    onClick={async () => {
                      try {
                        const res = await apiRequest<{ success: boolean; missing?: string[] }>("/api/season/approve", { method: "POST" });
                        const data = res.data;
                        if (data.success) {
                          setGateStatus("approved");
                          setGateResult(data);
                        } else {
                          setGateStatus("blocked");
                          setGateResult(data);
                        }
                      } catch {
                        setGateStatus("blocked");
                        setGateResult({ success: false, missing: ["ไม่สามารถเชื่อมต่อได้"] });
                      }
                    }}
                    className="mt-2"
                  >
                    อนุมัติฤดูกาล
                  </Button>
                </div>
              </div>

              {/* Grid area */}
              <section className="flex-1 overflow-y-auto pr-2 pb-4" aria-label="รายการตรวจสอบ">
                {error && (
                  <div className="neumorphic p-6 text-center">
                    <span className="material-symbols-outlined text-error text-4xl mb-2">error</span>
                    <p className="text-body-md text-on-surface mb-2">{error}</p>
                    {error.includes("401") && (
                      <p className="text-label-md text-on-surface-variant mb-4">
                        กรุณาเข้าสู่ระบบเพื่อดูข้อมูล
                      </p>
                    )}
                    <Button
                      onClick={() => fetchQueue(activeFilter)}
                    >
                      ลองใหม่
                    </Button>
                  </div>
                )}

                {loading && !error && (
                  <div className="neumorphic p-6 text-center">
                    <div className="flex justify-center gap-2 mb-2">
                      <div className="typing-dot w-3 h-3 rounded-full bg-primary" />
                      <div className="typing-dot w-3 h-3 rounded-full bg-primary" />
                      <div className="typing-dot w-3 h-3 rounded-full bg-primary" />
                    </div>
                    <p className="text-body-md text-on-surface-variant">กำลังโหลด...</p>
                  </div>
                )}

                {!loading && !error && queue.length === 0 && (
                  <div className="neumorphic p-6 text-center">
                    <span className="material-symbols-outlined text-outline text-4xl mb-2">inbox</span>
                    <p className="text-body-md text-on-surface-variant">ไม่มีรายการในขณะนี้</p>
                  </div>
                )}

                {!loading && !error && queue.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {queue.map((review) => (
                      <ReviewCard
                        key={review.id}
                        review={review}
                        selected={review.id === selectedId}
                        onSelect={batchMode ? () => toggleSelect(review.id) : setSelectedId}
                        batchMode={batchMode}
                        batchSelected={selectedIds.has(review.id)}
                      />
                    ))}
                  </div>
                )}
              </section>
            </div>

            {/* Detail panel */}
            {selectedReview && (
              <ReviewDetailPanel
                review={selectedReview}
                onApprove={handleApprove}
                onReject={handleReject}
                onClose={() => setSelectedId(null)}
              />
            )}
          </div>
        </div>
      </main>
      </div>

      {/* Batch Action Bar */}
      {batchMode && selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[150] glass rounded-2xl px-6 py-3 flex items-center gap-4 shadow-lg">
          <span className="text-body-md text-on-surface font-medium">
            เลือก {selectedIds.size} รายการ
          </span>
          <Button variant="ghost" size="sm" onClick={selectAll}>
            เลือกทั้งหมด
          </Button>
          <Button variant="danger" size="sm" onClick={handleBatchReject}>
            ปฏิเสธทั้งหมด
          </Button>
          <Button variant="primary" size="sm" onClick={handleBatchApprove}>
            อนุมัติทั้งหมด
          </Button>
        </div>
      )}

      {/* Batch Confirmation Modal */}
      {showBatchConfirm && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40"
          role="dialog"
          aria-modal="true"
          aria-labelledby="batch-confirm-title"
        >
          <div className="neumorphic bg-surface-container-low p-6 w-[400px] max-w-[90vw] rounded-2xl shadow-xl">
            <h3 id="batch-confirm-title" className="text-headline-md font-bold text-on-surface mb-4">
              {showBatchConfirm === "approve" ? "ยืนยันการอนุมัติทั้งหมด" : "ยืนยันการปฏิเสธทั้งหมด"}
            </h3>
            <p className="text-body-md text-on-surface-variant mb-6">
              {showBatchConfirm === "approve"
                ? `อนุมัติ ${selectedIds.size} รายการเป็นผ่าน?`
                : `ปฏิเสธ ${selectedIds.size} รายการทั้งหมด?`}
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setShowBatchConfirm(null)}>
                ยกเลิก
              </Button>
              <Button
                variant={showBatchConfirm === "approve" ? "primary" : "danger"}
                onClick={confirmBatch}
              >
                {showBatchConfirm === "approve" ? "อนุมัติทั้งหมด" : "ปฏิเสธทั้งหมด"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Undo Toast with Countdown */}
      {pendingAction && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] glass rounded-2xl px-6 py-3 flex items-center gap-4 shadow-lg min-w-[280px]">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-body-md text-on-surface">
                {pendingAction.type === "approve" ? "กำลังอนุมัติ..." : "กำลังปฏิเสธ..."}
              </span>
              <span className="text-label-md text-on-surface-variant">{undoCountdown}s</span>
            </div>
            <div className="w-full h-1 bg-surface-container-high rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${(undoCountdown / 5) * 100}%` }}
              />
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleUndo}>
            ยกเลิก
          </Button>
        </div>
      )}
    </div>
  );
}
