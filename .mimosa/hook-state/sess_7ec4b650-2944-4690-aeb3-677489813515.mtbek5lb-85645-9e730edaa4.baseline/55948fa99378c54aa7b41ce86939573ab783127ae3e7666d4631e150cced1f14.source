/**
 * Issue #104 — Precision stat card component
 */
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PrecisionCard } from "../precision-card";

describe("PrecisionCard", () => {
  it("shows precision percentage when available", () => {
    render(<PrecisionCard auditReviewed={10} overrides={2} precision={0.8} />);
    expect(screen.getByText("80%")).toBeInTheDocument();
  });

  it("shows awaiting data when no audits reviewed", () => {
    render(<PrecisionCard auditReviewed={0} overrides={0} precision={null} />);
    expect(screen.getByText(/รอข้อมูล/i)).toBeInTheDocument();
  });

  it("shows override count", () => {
    render(<PrecisionCard auditReviewed={10} overrides={3} precision={0.7} />);
    expect(screen.getByText(/3/)).toBeInTheDocument();
  });

  it("shows label text", () => {
    render(<PrecisionCard auditReviewed={5} overrides={1} precision={0.8} />);
    expect(screen.getByText(/ความแม่นยำ/i)).toBeInTheDocument();
  });
});
