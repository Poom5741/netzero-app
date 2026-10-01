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

  it("renders the panel with the artifact card chrome: surface-card, border-subtle, radius-card (R-031)", () => {
    const { container } = render(<LiveCalc liveValue={14520} techniques={techniques} />);
    const panel = Array.from(container.querySelectorAll("div")).find((d) =>
      d.className.includes("bg-[var(--surface-card)]"),
    );
    expect(panel).toBeDefined();
    expect(panel?.className).toContain("border-[var(--border-subtle)]");
    expect(panel?.className).toContain("rounded-[var(--radius-card)]");
  });
});
