import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { KpiCard } from "../kpi-card";

describe("KpiCard", () => {
  it("renders the title", () => {
    render(<KpiCard title="CO₂ ที่ลดทั้งหมด" value={14520} suffix="ตัน" icon="eco" />);
    expect(screen.getByText("CO₂ ที่ลดทั้งหมด")).toBeInTheDocument();
  });

  it("renders the value", () => {
    render(<KpiCard title="CO₂ ที่ลดทั้งหมด" value={14520} suffix="ตัน" icon="eco" />);
    expect(screen.getByText("14,520")).toBeInTheDocument();
  });

  it("renders the suffix", () => {
    render(<KpiCard title="CO₂ ที่ลดทั้งหมด" value={14520} suffix="ตัน" icon="eco" />);
    expect(screen.getByText("ตัน")).toBeInTheDocument();
  });

  it("renders trend when provided", () => {
    render(
      <KpiCard
        title="CO₂ ที่ลดทั้งหมด"
        value={14520}
        suffix="ตัน"
        icon="eco"
        trend="+12% จากไตรมาสที่แล้ว"
      />,
    );
    expect(screen.getByText("+12% จากไตรมาสที่แล้ว")).toBeInTheDocument();
  });

  it("does not render trend when not provided", () => {
    render(<KpiCard title="CO₂ ที่ลดทั้งหมด" value={14520} suffix="ตัน" icon="eco" />);
    expect(screen.queryByText(/จากไตรมาสที่แล้ว/)).not.toBeInTheDocument();
  });

  it("renders with counter-animate class for animation", () => {
    render(<KpiCard title="Test" value={100} suffix="unit" icon="eco" />);
    const animated = screen.getByText("100");
    expect(animated.className).toContain("counter-animate");
  });
});
