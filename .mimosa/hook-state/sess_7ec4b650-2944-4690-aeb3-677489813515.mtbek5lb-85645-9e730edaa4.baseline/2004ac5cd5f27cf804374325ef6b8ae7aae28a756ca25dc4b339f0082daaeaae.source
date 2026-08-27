"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { PhotoReview } from "@/lib/api";

interface ReviewDetailPanelProps {
  review: PhotoReview | null;
  onApprove: (id: string, reason?: string) => void;
  onReject: (id: string, reason: string) => void;
  onClose: () => void;
}

/**
 * Side panel (384px, neumorphic) for reviewing a selected photo.
 * Shows farmer profile, AI analysis, GPS, and approve/reject buttons.
 */
export function ReviewDetailPanel({
  review,
  onApprove,
  onReject,
  onClose,
}: ReviewDetailPanelProps) {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

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

  return (
    <>
      <aside
        className="w-[384px] shrink-0 h-full overflow-y-auto neumorphic p-6 flex flex-col gap-6"
        aria-label="รายละเอียดการตรวจสอบ"
      >
        {/* Close button */}
        <div className="flex items-center justify-between">
          <h2 className="text-headline-md font-bold text-on-surface">รายละเอียด</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high touch-target"
            aria-label="ปิด"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Photo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={review.photo_url}
          alt={`ภาพหลักฐาน ${review.plot_id}`}
          className="w-full aspect-video object-cover rounded-xl shadow-md"
        />

        {/* Farmer profile */}
        <section className="neumorphic-inset p-4 rounded-xl">
          <h3 className="text-label-md font-semibold text-on-surface-variant mb-2">ข้อมูลเกษตรกร</h3>
          <p className="text-body-md text-on-surface font-medium">{review.plot_id}</p>
          <p className="text-label-md text-on-surface-variant">รหัสภาพ: {review.id}</p>
        </section>

        {/* AI Analysis */}
        <section className="neumorphic-inset p-4 rounded-xl">
          <h3 className="text-label-md font-semibold text-on-surface-variant mb-3">ผลวิเคราะห์ AI</h3>

          {/* Crop match / confidence */}
          <div className="mb-3">
            <div className="flex justify-between text-label-md mb-1">
              <span className="text-on-surface">ความแม่นยำ</span>
              <span className="font-semibold text-primary">{confidencePercent}%</span>
            </div>
            <div className="w-full h-3 bg-surface-container-high rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${confidencePercent}%` }}
                role="progressbar"
                aria-valuenow={confidencePercent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="ความแม่นยำ"
              />
            </div>
          </div>

          {/* AI Label */}
          {review.ai_label && (
            <div className="mb-3">
              <div className="flex justify-between text-label-md mb-1">
                <span className="text-on-surface">ประเภทพืชผล</span>
                <span className="font-semibold text-primary-container">{review.ai_label}</span>
              </div>
            </div>
          )}

          {/* AI Flag note */}
          {review.ai_status === "flag" && review.ai_reason && (
            <div className="mt-3 bg-error-container/40 border border-error/20 rounded-lg p-3">
              <p className="text-label-md text-error font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">warning</span>
                หมายเหตุ AI
              </p>
              <p className="text-sm text-on-surface mt-1">{review.ai_reason}</p>
            </div>
          )}
        </section>

        {/* GPS */}
        <section className="neumorphic-inset p-4 rounded-xl">
          <h3 className="text-label-md font-semibold text-on-surface-variant mb-2">พิกัด GPS</h3>
          <span className="badge-verified text-xs">GPS Match</span>
        </section>

        {/* Photo taken time */}
        <section className="neumorphic-inset p-4 rounded-xl">
          <h3 className="text-label-md font-semibold text-on-surface-variant mb-2">เวลาถ่ายภาพ</h3>
          <p className="text-body-md text-on-surface">--</p>
        </section>

        {/* Actions */}
        <div className="flex gap-3 mt-auto">
          <Button
            variant="primary"
            className="flex-1"
            onClick={() => onApprove(review.id)}
          >
            อนุมัติ
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            onClick={() => setShowRejectModal(true)}
          >
            ปฏิเสธ
          </Button>
        </div>
      </aside>

      {/* Reject Reason Modal */}
      {showRejectModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reject-modal-title"
        >
          <div className="neumorphic bg-surface-container-low p-6 w-[400px] max-w-[90vw] rounded-2xl shadow-xl">
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
    </>
  );
}
