import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ProvinceGroup } from "../province-group";
import type { PlotSummary } from "@/lib/sponsor";

const samplePlots: PlotSummary[] = [
  {
    plot_id: "1",
    plot_code: "AY-001",
    area_rai: 15,
    cpa_code: "CPA-AY-001",
    province: "พระนครศรีอยุธยา",
    district: "พระนครศรีอยุธยา",
    total_offset_tco2e: 12.5,
    latest_season_id: "S1",
    estimate_status: "verified",
  },
  {
    plot_id: "2",
    plot_code: "AY-042",
    area_rai: 20,
    cpa_code: "CPA-AY-042",
    province: "พระนครศรีอยุธยา",
    district: "บางปะอิน",
    total_offset_tco2e: 8.3,
    latest_season_id: "S1",
    estimate_status: "pending",
  },
];

describe("ProvinceGroup", () => {
  it("renders the province name", () => {
    render(<ProvinceGroup province="พระนครศรีอยุธยา" plots={samplePlots} regionCode="AY" />);
    expect(screen.getByText("พระนครศรีอยุธยา")).toBeInTheDocument();
  });

  it("renders the region code badge", () => {
    render(<ProvinceGroup province="พระนครศรีอยุธยา" plots={samplePlots} regionCode="AY" />);
    expect(screen.getByText("AY")).toBeInTheDocument();
  });

  it("renders the plot count", () => {
    render(<ProvinceGroup province="พระนครศรีอยุธยา" plots={samplePlots} regionCode="AY" />);
    expect(screen.getByText(/2 แปลง/)).toBeInTheDocument();
  });

  it("renders individual plot cards", () => {
    render(<ProvinceGroup province="พระนครศรีอยุธยา" plots={samplePlots} regionCode="AY" />);
    expect(screen.getByText(/AY-001/)).toBeInTheDocument();
    expect(screen.getByText(/AY-042/)).toBeInTheDocument();
  });

  it("renders CPA codes", () => {
    render(<ProvinceGroup province="พระนครศรีอยุธยา" plots={samplePlots} regionCode="AY" />);
    expect(screen.getByText(/CPA-AY-001/)).toBeInTheDocument();
    expect(screen.getByText(/CPA-AY-042/)).toBeInTheDocument();
  });

  it("renders total CO2 for the province", () => {
    render(<ProvinceGroup province="พระนครศรีอยุธยา" plots={samplePlots} regionCode="AY" />);
    // 12.5 + 8.3 = 20.8
    expect(screen.getByText(/20.8/)).toBeInTheDocument();
  });

  it("renders progress bars for each plot", () => {
    const { container } = render(
      <ProvinceGroup province="พระนครศรีอยุธยา" plots={samplePlots} regionCode="AY" />,
    );
    const progressBars = container.querySelectorAll('[role="progressbar"]');
    expect(progressBars.length).toBe(2);
  });
});
