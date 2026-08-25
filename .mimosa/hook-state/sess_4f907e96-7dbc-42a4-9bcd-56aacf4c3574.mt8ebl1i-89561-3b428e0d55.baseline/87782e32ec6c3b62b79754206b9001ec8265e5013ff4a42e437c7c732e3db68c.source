import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { LiveCalc } from "../live-calc";

const techniques = [
  { name: "AWD", pct: 65 },
  { name: "Biochar", pct: 25 },
  { name: "Fertilization", pct: 10 },
];

describe("LiveCalc", () => {
  it("renders the panel title", () => {
    render(<LiveCalc liveValue={14520} techniques={techniques} />);
    expect(screen.getByText("การคำนวณแบบเรียลไทม์")).toBeInTheDocument();
  });

  it("renders the live counter value", () => {
    render(<LiveCalc liveValue={14520} techniques={techniques} />);
    expect(screen.getByText("14,520")).toBeInTheDocument();
  });

  it("renders the live indicator", () => {
    render(<LiveCalc liveValue={14520} techniques={techniques} />);
    expect(screen.getByText("อัปเดตแบบเรียลไทม์")).toBeInTheDocument();
  });

  it("renders all technique names", () => {
    render(<LiveCalc liveValue={14520} techniques={techniques} />);
    expect(screen.getByText("AWD")).toBeInTheDocument();
    expect(screen.getByText("Biochar")).toBeInTheDocument();
    expect(screen.getByText("Fertilization")).toBeInTheDocument();
  });

  it("renders technique percentages", () => {
    render(<LiveCalc liveValue={14520} techniques={techniques} />);
    expect(screen.getByText("65%")).toBeInTheDocument();
    expect(screen.getByText("25%")).toBeInTheDocument();
    expect(screen.getByText("10%")).toBeInTheDocument();
  });

  it("applies pulse-live class to the live dot", () => {
    const { container } = render(<LiveCalc liveValue={14520} techniques={techniques} />);
    const pulseDot = container.querySelector(".pulse-live");
    expect(pulseDot).toBeInTheDocument();
  });

  it("applies neumorphic styling to the panel", () => {
    const { container } = render(<LiveCalc liveValue={14520} techniques={techniques} />);
    const panel = container.querySelector(".neumorphic");
    expect(panel).toBeInTheDocument();
  });
});
