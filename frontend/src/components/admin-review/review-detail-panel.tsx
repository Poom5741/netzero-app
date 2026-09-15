"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import type { PhotoReview } from "@/lib/api";
import { API_BASE } from "@/lib/api";

interface ReviewDetailPanelProps {
  review: PhotoReview | null;
  onApprove: (id: string, reason?: string) => void;
  onReject: (id: string, reason: string) => void;
  onClose: () => void;
}

/**
 * Detail panel for reviewing a selected photo.
 * Desktop (≥lg): side panel (384px) in flex row.
 * Mobile (<lg): full-screen modal overlay.
 */
export function ReviewDetailPanel({
  review,
  onApprove,
  onReject,
  onClose,
}: ReviewDetailPanelProps) {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showApproveModal, setShowApproveModal] = useState(false);

  // Escape key closes modals + focus trap
  const rejectModalRef = useRef<HTMLDivElement>(null);
  const approveModalRef = useRef<HTMLDivElement>(null);

  const trapFocus = useCallback((modalRef: React.RefObject<HTMLDivElement | null>) => {
    const modal = modalRef.current;
    if (!modal) return;
    const focusable = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first?.focus();

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    };
    modal.addEventListener("keydown", handleTab);
    return () => modal.removeEventListener("keydown", handleTab);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showRejectModal) {
          setRejectReason("");
          setShowRejectModal(false);
        } else if (showApproveModal) {
          setShowApproveModal(false);
        }
      }
    };
    if (showRejectModal || showApproveModal) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [showRejectModal, showApproveModal]);

  useEffect(() => {
    if (showRejectModal) return trapFocus(rejectModalRef)?.();
  }, [showRejectModal, trapFocus]);
  useEffect(() => {
    if (showApproveModal) return trapFocus(approveModalRef)?.();
  }, [showApproveModal, trapFocus]);

  // Listen for keyboard shortcuts from admin page
  useEffect(() => {
    const rejectHandler = () => setShowRejectModal(true);
    const approveHandler = () => setShowApproveModal(true);
    document.addEventListener("admin-reject-shortcut", rejectHandler);
    document.addEventListener("admin-approve-shortcut", approveHandler);
    return () => {
      document.removeEventListener("admin-reject-shortcut", rejectHandler);
      document.removeEventListener("admin-approve-shortcut", approveHandler);
    };
  }, []);

  if (!review) return null;

  const confidencePercent = Math.round(review.ai_confidence * 100);

  const handleRejectSubmit = () => {
    if (!rejectReason.trim()) return;
    onReject(review.id, rejectReason.trim());
    setRejectReason("");
    setShowRejectModal(false);
  };

  const handleRejectCancel = () => {
    setRejectReason("");
    setShowRejectModal(false);
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toISOString().slice(0, 10);
    } catch {
      return iso;
    }
  };

  return (
    <>
      <aside
        className="review-detail-panel flex flex-col h-full bg-surface-container-lowest rounded-xl shadow-lg overflow-hidden shrink-0"
        aria-label="รายละเอียดการตรวจสอบ"
      >
        {/* Header */}
        <div className="p-6 bg-surface-container-low border-b border-surface-container-highest/50">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-headline-md text-headline-md text-on-surface">{review.plot_id}</h3>
            <div className="flex items-center gap-2">
              {review.ai_status === "flag" && (
                <div className="bg-error-container text-on-error-container px-2 py-1 rounded text-[12px] font-label-md">
                  ถูกธง
                </div>
              )}
              <button
                type="button"
                onClick={onClose}
                aria-label="ปิด"
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-[20px] text-on-surface-variant">close</span>
              </button>
            </div>
          </div>
          {review.taken_at && (
            <p className="font-body-md text-body-md text-on-surface-variant flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">calendar_today</span>
              {formatDate(review.taken_at)}
            </p>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Photo */}
          <div className="rounded-xl overflow-hidden shadow-sm" style={{ aspectRatio: "16/9" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${API_BASE}/api/photo/${review.id}`}
              alt={`ภาพพื้นที่ ${review.plot_id}`}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Photo type */}
          {review.photo_type && (
            <div className="bg-surface rounded-xl p-4 shadow-sm">
              <p className="font-label-md text-label-md text-on-surface-variant mb-1 uppercase tracking-wider text-[11px]">ประเภทภาพ</p>
              <p className="font-body-md text-body-md text-on-surface">{review.photo_type}</p>
            </div>
          )}

          {/* Farmer Info */}
          <div className="bg-surface rounded-xl p-4 shadow-sm">
            <p className="font-label-md text-label-md text-on-surface-variant mb-1 uppercase tracking-wider text-[11px]">ข้อมูลเกษตรกร</p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-headline-md">
                {review.plot_id.charAt(0)}
              </div>
              <div>
                <p className="font-label-md text-label-md text-on-surface text-[16px]">{review.farmer_name || "—"}</p>
                <p className="font-body-md text-body-md text-on-surface-variant text-[12px]">ID: {review.plot_id}</p>
              </div>
            </div>
          </div>

          {/* AI Analysis */}
          <div className="bg-surface rounded-xl p-4 shadow-[inset_0_2px_10px_rgba(0,0,0,0.05)] border border-surface-container-highest/20">
            <p className="font-label-md text-label-md text-on-surface-variant mb-2 uppercase tracking-wider text-[11px]">ผลวิเคราะห์ AI</p>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-body-md text-body-md text-on-surface text-[14px]">ความเชื่อมั่น</span>
                <span className="font-label-md text-label-md text-primary">{confidencePercent}%</span>
              </div>
              <div className="w-full bg-surface-container-highest rounded-full h-1.5">
                <div
                  className="bg-primary h-1.5 rounded-full"
                  style={{ width: `${confidencePercent}%` }}
                />
              </div>

              {/* Water level */}
              {review.water_state && (
                <>
                  <div className="flex justify-between items-center mt-4">
                    <span className="font-body-md text-body-md text-on-surface text-[14px]">ระดับน้ำ</span>
                    <span className={`font-label-md text-label-md ${review.water_state === "flooded" ? "text-error" : "text-primary"}`}>
                      {review.water_state === "flooded" ? "สูง" : "ปกติ"}
                    </span>
                  </div>
                  <div className="w-full bg-surface-container-highest rounded-full h-1.5">
                    <div
                      className={`${review.water_state === "flooded" ? "bg-error" : "bg-primary"} h-1.5 rounded-full`}
                      style={{ width: review.water_state === "flooded" ? "85%" : "40%" }}
                    />
                  </div>
                </>
              )}
            </div>

            {/* AI Flag note */}
            {review.ai_status === "flag" && review.ai_reason && (
              <div className="mt-4 p-3 bg-error-container/30 rounded-lg">
                <p className="font-body-md text-body-md text-on-error-container text-[12px]">
                  <span className="font-label-md block mb-1">หมายเหตุ AI:</span>
                  {review.ai_reason}
                </p>
              </div>
            )}
          </div>

          {/* GPS Coordinates */}
          {(review.gps_lat != null && review.gps_lng != null) && (
            <div className="bg-surface rounded-xl p-4 shadow-sm">
              <p className="font-label-md text-label-md text-on-surface-variant mb-1 uppercase tracking-wider text-[11px]">พิกัด GPS</p>
              <p className="font-body-md text-body-md text-on-surface text-[14px]">
                ละติจูด: {review.gps_lat}, ลองจิจูด: {review.gps_lng}
              </p>
            </div>
          )}
        </div>

        {/* Action Area */}
        <div className="p-6 bg-surface-container-lowest border-t border-surface-container-highest/20 mt-auto">
          <div className="flex gap-4">
            <Button
              variant="danger"
              onClick={() => setShowRejectModal(true)}
              className="flex-1"
            >
              <span className="material-symbols-outlined text-[18px]">cancel</span>
              ปฏิเสธ
            </Button>
            <Button
              variant="primary"
              onClick={() => setShowApproveModal(true)}
              className="flex-1"
            >
              <span className="material-symbols-outlined text-[18px]">check</span>
              อนุมัติ
            </Button>
          </div>
          <p className="text-[11px] text-outline mt-2 text-center">
            กด <kbd className="px-1 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-mono text-[10px]">A</kbd> อนุมัติ · <kbd className="px-1 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-mono text-[10px]">R</kbd> ปฏิเสธ
          </p>
        </div>
      </aside>

      {/* Reject Reason Modal */}
      {showRejectModal && (
        <div
          ref={rejectModalRef}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reject-modal-title"
        >
          <div className="card bg-surface-container-low p-6 w-[400px] max-w-[90vw] rounded-2xl shadow-xl">
            <h3 id="reject-modal-title" className="text-headline-md font-bold text-on-surface mb-4">
              เหตุผลในการปฏิเสธ
            </h3>
            <textarea
              className="w-full h-28 p-3 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface resize-none focus:outline-none focus:ring-2 focus:ring-error"
              placeholder="กรุณาระบุเหตุผล..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              aria-label="เหตุผลในการปฏิเสธ"
            />
            <div className="flex gap-3 mt-4 justify-end">
              <Button variant="ghost" onClick={handleRejectCancel}>
                ยกเลิก
              </Button>
              <Button
                variant="danger"
                onClick={handleRejectSubmit}
                disabled={!rejectReason.trim()}
              >
                ยืนยันการปฏิเสธ
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Confirmation Modal */}
      {showApproveModal && (
        <div
          ref={approveModalRef}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40"
          role="dialog"
          aria-modal="true"
          aria-labelledby="approve-modal-title"
        >
          <div className="card bg-surface-container-low p-6 w-[400px] max-w-[90vw] rounded-2xl shadow-xl">
            <h3 id="approve-modal-title" className="text-headline-md font-bold text-on-surface mb-4">
              ยืนยันการอนุมัติ
            </h3>
            <p className="text-body-md text-on-surface-variant mb-6">
              ตรวจสอบภาพหลักฐานแล้วอนุมัติเป็นผ่าน?
            </p>
            <div className="flex gap-3 mt-4 justify-end">
              <Button variant="ghost" onClick={() => setShowApproveModal(false)}>
                ยกเลิก
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  onApprove(review.id);
                  setShowApproveModal(false);
                }}
              >
                อนุมัติ
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
