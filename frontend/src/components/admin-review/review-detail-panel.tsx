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
                  Flagged
                </div>
              )}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
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
              src={review.photo_url}
              alt={`ภาพพื้นที่ ${review.plot_id}`}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Photo type */}
          {review.photo_type && (
            <div className="bg-surface rounded-xl p-4 shadow-sm">
              <p className="font-label-md text-label-md text-on-surface-variant mb-1 uppercase tracking-wider text-[11px]">Photo Type</p>
              <p className="font-body-md text-body-md text-on-surface">{review.photo_type}</p>
            </div>
          )}

          {/* Farmer Info */}
          <div className="bg-surface rounded-xl p-4 shadow-sm">
            <p className="font-label-md text-label-md text-on-surface-variant mb-1 uppercase tracking-wider text-[11px]">Farmer Profile</p>
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
            <p className="font-label-md text-label-md text-on-surface-variant mb-2 uppercase tracking-wider text-[11px]">AI Analysis Results</p>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-body-md text-body-md text-on-surface text-[14px]">Confidence</span>
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
                    <span className="font-body-md text-body-md text-on-surface text-[14px]">Water Level</span>
                    <span className={`font-label-md text-label-md ${review.water_state === "flooded" ? "text-error" : "text-primary"}`}>
                      {review.water_state === "flooded" ? "High" : "Normal"}
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
                  <span className="font-label-md block mb-1">AI Flag Note:</span>
                  {review.ai_reason}
                </p>
              </div>
            )}
          </div>

          {/* GPS Coordinates */}
          {(review.gps_lat != null && review.gps_lng != null) && (
            <div className="bg-surface rounded-xl p-4 shadow-sm">
              <p className="font-label-md text-label-md text-on-surface-variant mb-1 uppercase tracking-wider text-[11px]">Geolocation</p>
              <p className="font-body-md text-body-md text-on-surface text-[14px]">
                Lat: {review.gps_lat}, Lng: {review.gps_lng}
              </p>
            </div>
          )}
        </div>

        {/* Action Area */}
        <div className="p-6 bg-surface-container-lowest border-t border-surface-container-highest/20 mt-auto">
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setShowRejectModal(true)}
              className="flex-1 h-11 flex items-center justify-center gap-2 bg-error text-on-error rounded-xl font-label-md text-label-md shadow-[0_4px_10px_rgba(186,26,26,0.3),inset_0_2px_4px_rgba(255,255,255,0.4)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              <span className="material-symbols-outlined text-[18px]">cancel</span>
              Reject
            </button>
            <button
              type="button"
              onClick={() => onApprove(review.id)}
              className="flex-1 h-11 flex items-center justify-center gap-2 bg-gradient-to-b from-[#06C755] to-[#00A854] text-white rounded-xl font-label-md text-label-md shadow-[0_4px_10px_rgba(6,199,85,0.3),inset_0_2px_4px_rgba(255,255,255,0.5)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              <span className="material-symbols-outlined text-[18px]">check</span>
              Approve
            </button>
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
