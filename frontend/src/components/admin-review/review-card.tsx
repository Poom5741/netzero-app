"use client";

import type { PhotoReview } from "@/lib/api";
import { API_BASE } from "@/lib/api";

interface ReviewCardProps {
  review: PhotoReview;
  selected: boolean;
  onSelect: (id: string) => void;
  batchMode?: boolean;
  batchSelected?: boolean;
}

/**
 * Photo card with AI badge overlay and farm/plot labels.
 * Renders inside the grid; selected card gets a highlight outline.
 */
export function ReviewCard({ review, selected, onSelect, batchMode, batchSelected }: ReviewCardProps) {
  const badgeVariant =
    review.ai_status === "flag"
      ? "bg-error-container text-on-error-container"
      : review.ai_status === "pass"
        ? "bg-surface/60 backdrop-blur-md"
        : "bg-surface-container-high/60 backdrop-blur-md";

  const badgeLabel =
    review.ai_status === "flag"
      ? "AI: ถูกธง"
      : review.ai_status === "pass"
        ? "AI: ผ่าน"
        : "AI: รอตรวจ";

  const isSelected = batchMode ? batchSelected : selected;

  return (
    <button
      type="button"
      onClick={() => onSelect(review.id)}
      aria-pressed={isSelected}
      aria-label={`ภาพหลักฐาน ${review.plot_id}`}
      className={[
        "relative group cursor-pointer text-left",
        isSelected
          ? "outline-2 outline-offset-4 outline outline-primary rounded-xl ring-4 ring-primary/20"
          : "rounded-xl",
      ].join(" ")}
    >
      <div className="rounded-xl overflow-hidden shadow-md transition-transform duration-300 group-hover:-translate-y-2 group-hover:shadow-xl bg-surface-container-high relative" style={{ aspectRatio: "1 / 1" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="w-full h-full object-cover"
          src={`${API_BASE}/api/photo/${review.id}`}
          alt={`ภาพพื้นที่ ${review.plot_id}`}
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            img.style.display = 'none';
            const parent = img.parentElement;
            if (parent && !parent.querySelector('.fallback-icon')) {
              const icon = document.createElement('div');
              icon.className = 'fallback-icon absolute inset-0 flex items-center justify-center';
              icon.innerHTML = '<span class="material-symbols-outlined text-outline text-4xl">image_not_supported</span>';
              parent.appendChild(icon);
            }
          }}
        />

        {/* Batch mode checkbox */}
        {batchMode && (
          <div className={`absolute top-2 right-2 z-10 w-6 h-6 rounded-full flex items-center justify-center shadow-sm transition-colors ${batchSelected ? "bg-primary text-white" : "bg-white/80 backdrop-blur-sm text-on-surface-variant"}`}>
            {batchSelected && <span className="material-symbols-outlined text-[16px]">check</span>}
          </div>
        )}

        {/* AI Badge */}
        <div className={`absolute top-2 left-2 ${badgeVariant} px-2 py-1 rounded-full flex items-center gap-1 shadow-sm`}>
          <div className={`w-2 h-2 rounded-full ${review.ai_status === "flag" ? "bg-error" : "bg-primary"}`} />
          <span className="text-[12px] font-medium text-on-surface">{badgeLabel}</span>
        </div>

        {/* Top-right badges — audit sample and admin decision stack vertically */}
        {(review.audit_sample === 1 || review.admin_status === "verified" || review.admin_status === "rejected") && (
          <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
            {review.audit_sample === 1 && (
              <div className="bg-amber-500 text-white px-2 py-1 rounded-full text-[12px] font-semibold shadow-sm">
                ตรวจตัวอย่าง
              </div>
            )}
            {review.admin_status === "verified" && (
              <div className="bg-primary text-white px-2 py-1 rounded-full text-[12px] font-semibold shadow-sm flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">check_circle</span> อนุมัติแล้ว
              </div>
            )}
            {review.admin_status === "rejected" && (
              <div className="bg-error text-white px-2 py-1 rounded-full text-[12px] font-semibold shadow-sm flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">cancel</span> ปฏิเสธแล้ว
              </div>
            )}
          </div>
        )}

        {/* Farm label */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
          <div className="flex items-center justify-between mb-1">
            <p className="text-label-md font-medium text-white">{review.plot_id}</p>
            <span className="text-[12px] text-white/90 font-mono">{Math.round(review.ai_confidence * 100)}%</span>
          </div>
          {review.water_state && (
            <p className="text-[12px] text-white/90 mb-0.5">
              {review.water_state === "flooded" ? "💧 น้ำขัง" : "🏜️ แห้ง"}
            </p>
          )}
          {review.ai_reason && (
            <p className="text-[12px] text-white/80 truncate">{review.ai_reason}</p>
          )}
        </div>
      </div>
    </button>
  );
}