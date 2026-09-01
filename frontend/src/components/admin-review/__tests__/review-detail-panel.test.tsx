import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ReviewDetailPanel } from "../review-detail-panel";
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
  id: "photo-002",
  plot_id: "FARM-002",
  ai_status: "flag",
  ai_label: "Water level",
  ai_reason: "น้ำท่วมขังเกินกำหนด",
  ai_confidence: 0.82,
  admin_status: "pending",
  photo_url: "/test/photo2.jpg",
};

describe("ReviewDetailPanel", () => {
  it("renders nothing when review is null", () => {
    const { container } = render(
      <ReviewDetailPanel review={null} onApprove={() => {}} onReject={() => {}} onClose={() => {}} />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("displays farmer profile with plot_id", () => {
    render(
      <ReviewDetailPanel review={mockReview} onApprove={() => {}} onReject={() => {}} onClose={() => {}} />,
    );
    expect(screen.getByText("FARM-001")).toBeInTheDocument();
  });

  it("shows AI confidence as percentage in progress bar", () => {
    render(
      <ReviewDetailPanel review={mockReview} onApprove={() => {}} onReject={() => {}} onClose={() => {}} />,
    );
    expect(screen.getByText("95%")).toBeInTheDocument();
  });

  it("shows AI analysis section", () => {
    render(
      <ReviewDetailPanel review={mockReview} onApprove={() => {}} onReject={() => {}} onClose={() => {}} />,
    );
    expect(screen.getByText("AI Analysis Results")).toBeInTheDocument();
  });

  it("shows flag note when ai_status is flag", () => {
    render(
      <ReviewDetailPanel
        review={flaggedReview}
        onApprove={() => {}}
        onReject={() => {}}
        onClose={() => {}}
      />,
    );
    expect(screen.getByText("น้ำท่วมขังเกินกำหนด")).toBeInTheDocument();
  });

  it("renders Approve and Reject buttons", () => {
    render(
      <ReviewDetailPanel review={mockReview} onApprove={() => {}} onReject={() => {}} onClose={() => {}} />,
    );
    expect(screen.getByRole("button", { name: /Approve/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Reject/ })).toBeInTheDocument();
  });

  it("calls onApprove with photo id when approve clicked", () => {
    const onApprove = vi.fn();
    render(
      <ReviewDetailPanel review={mockReview} onApprove={onApprove} onReject={() => {}} onClose={() => {}} />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Approve/ }));
    expect(onApprove).toHaveBeenCalledWith("photo-001");
  });

  it("shows reject reason modal on reject click", () => {
    render(
      <ReviewDetailPanel review={mockReview} onApprove={() => {}} onReject={() => {}} onClose={() => {}} />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Reject/ }));
    expect(screen.getByText("เหตุผลในการปฏิเสธ")).toBeInTheDocument();
  });

  it("calls onReject with id and reason when reason submitted", () => {
    const onReject = vi.fn();
    render(
      <ReviewDetailPanel review={mockReview} onApprove={() => {}} onReject={onReject} onClose={() => {}} />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Reject/ }));
    const textarea = screen.getByPlaceholderText("กรุณาระบุเหตุผล...");
    fireEvent.change(textarea, { target: { value: "ไม่ตรงกับพื้นที่" } });
    fireEvent.click(screen.getByRole("button", { name: /ยืนยันการปฏิเสธ/ }));
    expect(onReject).toHaveBeenCalledWith("photo-001", "ไม่ตรงกับพื้นที่");
  });

  it("does not call onReject if reason is empty", () => {
    const onReject = vi.fn();
    render(
      <ReviewDetailPanel review={mockReview} onApprove={() => {}} onReject={onReject} onClose={() => {}} />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Reject/ }));
    const confirmBtn = screen.getByRole("button", { name: /ยืนยันการปฏิเสธ/ });
    fireEvent.click(confirmBtn);
    expect(onReject).not.toHaveBeenCalled();
  });

  it("displays farmer name in profile section", () => {
    render(
      <ReviewDetailPanel review={mockReview} onApprove={() => {}} onReject={() => {}} onClose={() => {}} />,
    );
    expect(screen.getByText("Farmer Profile")).toBeInTheDocument();
  });

  it("displays the photo image from photo_url", () => {
    render(
      <ReviewDetailPanel review={mockReview} onApprove={() => {}} onReject={() => {}} onClose={() => {}} />,
    );
    const img = screen.getByAltText(/FARM-001/);
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "/test/photo.jpg");
  });

  it("calls onClose when close button is clicked", () => {
    const onClose = vi.fn();
    render(
      <ReviewDetailPanel review={mockReview} onApprove={() => {}} onReject={() => {}} onClose={onClose} />,
    );
    fireEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("displays photo_type when available", () => {
    const reviewWithType = { ...mockReview, photo_type: "awd_midseason" };
    render(
      <ReviewDetailPanel review={reviewWithType} onApprove={() => {}} onReject={() => {}} onClose={() => {}} />,
    );
    expect(screen.getByText("awd_midseason")).toBeInTheDocument();
  });

  it("displays GPS coordinates when available", () => {
    const reviewWithGps = { ...mockReview, gps_lat: 13.7563, gps_lng: 100.5018 };
    render(
      <ReviewDetailPanel review={reviewWithGps} onApprove={() => {}} onReject={() => {}} onClose={() => {}} />,
    );
    expect(screen.getByText(/13\.7563/)).toBeInTheDocument();
    expect(screen.getByText(/100\.5018/)).toBeInTheDocument();
  });

  it("displays taken_at date when available", () => {
    const reviewWithDate = { ...mockReview, taken_at: "2025-08-15T10:30:00Z" };
    render(
      <ReviewDetailPanel review={reviewWithDate} onApprove={() => {}} onReject={() => {}} onClose={() => {}} />,
    );
    expect(screen.getByText(/2025-08-15/)).toBeInTheDocument();
  });
});
