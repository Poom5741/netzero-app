import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ReviewCard } from "../review-card";
import type { PhotoReview } from "@/lib/api";

const mockReview: PhotoReview = {
  id: "photo-001",
  plot_id: "FARM-001",
  ai_status: "pass",
  ai_label: "Rice paddy",
  ai_reason: null,
  ai_confidence: 0.95,
  admin_status: "pending",
  photo_url: "/test/photo.jpg",
};

const flaggedReview: PhotoReview = {
  ...mockReview,
  id: "photo-002",
  ai_status: "flag",
  ai_label: "Water level",
  ai_reason: "Water level may exceed AWD limits",
  ai_confidence: 0.82,
};

describe("ReviewCard", () => {
  it("renders the plot_id as accessible label", () => {
    render(<ReviewCard review={mockReview} selected={false} onSelect={() => {}} />);
    expect(screen.getByRole("button", { name: "ภาพหลักฐาน FARM-001" })).toBeInTheDocument();
  });

  it("renders the photo with alt text", () => {
    render(<ReviewCard review={mockReview} selected={false} onSelect={() => {}} />);
    expect(screen.getByAltText("ภาพพื้นที่ FARM-001")).toBeInTheDocument();
  });

  it("shows pass badge text when ai_status is pass", () => {
    render(<ReviewCard review={mockReview} selected={false} onSelect={() => {}} />);
    expect(screen.getByText("AI: ผ่าน")).toBeInTheDocument();
  });

  it("shows flag badge text and reason when ai_status is flag", () => {
    render(<ReviewCard review={flaggedReview} selected={false} onSelect={() => {}} />);
    expect(screen.getByText("AI: ถูกธง")).toBeInTheDocument();
    expect(screen.getByText(flaggedReview.ai_reason!)).toBeInTheDocument();
  });

  it("applies selected outline when selected", () => {
    const { container } = render(
      <ReviewCard review={mockReview} selected={true} onSelect={() => {}} />,
    );
    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("aria-pressed", "true");
    expect(container.firstElementChild).toHaveClass("outline-primary");
  });

  it("does not apply selected outline when not selected", () => {
    render(<ReviewCard review={mockReview} selected={false} onSelect={() => {}} />);
    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("aria-pressed", "false");
  });

  it("calls onSelect with the photo id on click", () => {
    const onSelect = vi.fn();
    render(<ReviewCard review={mockReview} selected={false} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onSelect).toHaveBeenCalledWith("photo-001");
  });
});