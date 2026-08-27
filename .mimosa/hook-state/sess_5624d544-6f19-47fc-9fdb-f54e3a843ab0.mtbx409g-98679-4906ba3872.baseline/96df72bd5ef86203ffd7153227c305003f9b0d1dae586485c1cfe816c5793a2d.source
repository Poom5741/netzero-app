/**
 * Issue #104 — ReviewCard two-tier enhancements
 * Shows water state, confidence, audit badge (visually distinct), override action.
 */
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ReviewCard } from "../review-card";
import type { PhotoReview } from "@/lib/api";

const baseReview: PhotoReview = {
  id: "photo-001",
  plot_id: "PLOT-001",
  ai_status: "pass",
  ai_label: "flooded",
  ai_reason: "เห็นน้ำขังชัดเจน",
  ai_confidence: 0.95,
  admin_status: "pending",
  photo_url: "/test/photo.jpg",
  water_state: "flooded",
  photo_type: "wetdry",
  pre_verified: 1,
  audit_sample: 0,
};

const auditReview: PhotoReview = {
  ...baseReview,
  id: "photo-002",
  audit_sample: 1,
  ai_status: "pass",
  ai_label: "dry",
  ai_reason: "เห็นท่อชัดเจน — น้ำแห้ง",
  ai_confidence: 0.92,
  water_state: "dry",
};

const flaggedReview: PhotoReview = {
  ...baseReview,
  id: "photo-003",
  ai_status: "flag",
  ai_label: null,
  ai_reason: "ภาพเบลอ",
  ai_confidence: 0.45,
  water_state: null,
  pre_verified: 0,
  audit_sample: 0,
};

describe("ReviewCard — two-tier metadata", () => {
  it("shows water state when present", () => {
    render(<ReviewCard review={baseReview} selected={false} onSelect={() => {}} />);
    // Water state shows with emoji: "💧 น้ำขัง" for flooded
    const matches = screen.getAllByText(/น้ำขัง/);
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it("shows confidence percentage", () => {
    render(<ReviewCard review={baseReview} selected={false} onSelect={() => {}} />);
    expect(screen.getByText("95%")).toBeInTheDocument();
  });

  it("shows audit badge for audit-sampled items", () => {
    render(<ReviewCard review={auditReview} selected={false} onSelect={() => {}} />);
    // Audit badge should be visually present
    expect(screen.getByText(/audit|ตรวจตัวอย่าง/i)).toBeInTheDocument();
  });

  it("does not show audit badge for non-audit items", () => {
    render(<ReviewCard review={baseReview} selected={false} onSelect={() => {}} />);
    expect(screen.queryByText(/audit|ตรวจตัวอย่าง/i)).not.toBeInTheDocument();
  });

  it("shows AI reason text", () => {
    render(<ReviewCard review={baseReview} selected={false} onSelect={() => {}} />);
    expect(screen.getByText("เห็นน้ำขังชัดเจน")).toBeInTheDocument();
  });
});
