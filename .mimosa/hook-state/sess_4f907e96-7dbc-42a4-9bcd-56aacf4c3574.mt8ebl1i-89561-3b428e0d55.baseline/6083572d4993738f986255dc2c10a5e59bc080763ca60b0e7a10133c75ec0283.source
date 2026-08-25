"use client";

import type { PhotoReview } from "@/lib/api";

interface ReviewCardProps {
  review: PhotoReview;
  selected: boolean;
  onSelect: (id: string) => void;
}

/**
 * Photo card with AI badge overlay and farm/plot labels.
 * Renders inside the grid; selected card gets a highlight outline.
 */
export function ReviewCard({ review, selected, onSelect }: ReviewCardProps) {
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

  return (
    <button
      type="button"
      onClick={() => onSelect(review.id)}
      aria-pressed={selected}
      aria-label={`ภาพหลักฐาน ${review.plot_id}`}
      className={[
        "relative group cursor-pointer text-left",
        selected
          ? "outline-2 outline-offset-4 outline outline-primary rounded-xl ring-4 ring-primary/20"
          : "rounded-xl",
      ].join(" ")}
    >
      <div className="aspect-square rounded-xl overflow-hidden shadow-md transition-transform duration-300 group-hover:-translate-y-2 group-hover:shadow-xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="w-full h-full object-cover"
          src={review.photo_url}
          alt={`ภาพพื้นที่ ${review.plot_id}`}
        />

        {/* AI Badge */}
        <div className={`absolute top-2 left-2 ${badgeVariant} px-2 py-1 rounded-full flex items-center gap-1 shadow-sm`}>
          <div className={`w-2 h-2 rounded-full ${review.ai_status === "flag" ? "bg-error" : "bg-primary"}`} />
          <span className="text-xs font-medium text-on-surface">{badgeLabel}</span>
        </div>

        {/* Farm label */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
          <p className="text-sm font-medium text-white">{review.plot_id}</p>
          {review.ai_reason && (
            <p className="text-xs text-white/80 truncate">{review.ai_reason}</p>
          )}
        </div>
      </div>
    </button>
  );
}