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
 * Side panel (384px) for reviewing a selected photo.
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
        className="w-96 flex flex-col h-full bg-surface-container-lowest rounded-xl shadow-lg overflow-hidden shrink-0"
        aria-label="รายละเอียดการตรวจสอบ"
      >
        {/* Header */}
        <div className="p-6 bg-surface-container-low border-b border-surface-container-highest/50">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-headline-md text-on-surface">{review.plot_id}</h3>
            {review.ai_status === "flag" && (
              <div className="bg-error-container text-on-error-container px-2 py-1 rounded text-[12px]">
                ถูกธง
              </div>
            )}
          </div>
          <p className="text-body-md text-on-surface-variant flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">calendar_today</span>
            ส่งมา 2 ชั่วโมงที่แล้ว
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Farmer Info */}
          <div className="bg-surface rounded-xl p-4 shadow-sm">
            <p className="text-label-md text-on-surface-variant mb-1 uppercase tracking-wider text-[11px]">ข้อมูลเกษตรกร</p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-headline-md">
                {review.plot_id.charAt(0)}
              </div>
              <div>
                <p className="text-label-md text-on-surface text-[16px]">{review.farmer_name || review.plot_id}</p>
                <p className="text-body-md text-on-surface-variant text-[12px]">ID: {review.plot_id}</p>
              </div>
            </div>
          </div>

          {/* AI Analysis */}
          <div className="bg-surface rounded-xl p-4 shadow-[inset_0_2px_10px_rgba(0,0,0,0.05)] border border-surface-container-highest/20">
            <p className="text-label-md text-on-surface-variant mb-2 uppercase tracking-wider text-[11px]">ผลการวิเคราะห์ AI</p>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-body-md text-on-surface text-[14px]">ความตรงกับประเภทพืช</span>
                <span className="text-label-md text-primary">{confidencePercent}%</span>
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
                    <span className="text-body-md text-on-surface text-[14px]">ระดับน้ำ</span>
                    <span className={`text-label-md ${review.water_state === "flooded" ? "text-error" : "text-primary"}`}>
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
                <p className="text-body-md text-on-error-container text-[12px]">
                  <span className="text-label-md block mb-1">หมายเหตุ AI:</span>
                  {review.ai_reason}
                </p>
              </div>
            )}
          </div>

          {/* Location Map */}
          <div>
            <p className="text-label-md text-on-surface-variant mb-1 uppercase tracking-wider text-[11px]">หลักฐานตำแหน่ง</p>
            <div className="w-full h-40 bg-cover bg-center rounded-xl shadow-sm border border-surface-container-highest/30 relative overflow-hidden" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBRUuf3vpHPkk2Ft7Wu0YDo4PymlZSv9q5JmR9_BZS5hjsyaZ-ZSg-TzcPMF5eRipSuspPOiH7OClBYF1MTPnWKH6URsOS25xPaSAoe-1qC6bd7NlWnLkOP-hx503-_llRwtGZx6zR1T272ryBc5KVUJYBTiVDLufHvvdQjMxuz2nFPy1Lhuoo0N6Y1L135g8OvYqLwl5hckxBBtch_CGQKox5EVdhtU5Xlz5YokKPA8dPFgbgDtY66ZQ')" }}>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30" />
              <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end">
                <div className="bg-surface/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] text-body-md text-on-surface">
                  พิกัด GPS
                </div>
                <div className="bg-surface/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] text-body-md text-on-surface flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">verified</span> ตรงตาม GPS
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Area */}
        <div className="p-6 bg-surface-container-lowest border-t border-surface-container-highest/20 mt-auto">
          <div className="flex gap-4">
            <Button
              variant="danger"
              onClick={() => setShowRejectModal(true)}
              className="flex-1"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
              ปฏิเสธ
            </Button>
            <Button
              onClick={() => onApprove(review.id)}
              className="flex-1 claymorphic"
            >
              <span className="material-symbols-outlined text-[18px]">check</span>
              อนุมัติ
            </Button>
          </div>
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
