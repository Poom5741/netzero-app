import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { FilterTabs } from "../filter-tabs";

describe("FilterTabs", () => {
  const tabs = [
    { key: "all", label: "ทั้งหมด", count: 24 },
    { key: "flagged", label: "ถูกธง", count: 3 },
    { key: "completed", label: "เสร็จสิ้น" },
  ];

  it("renders all tab labels", () => {
    render(<FilterTabs tabs={tabs} activeKey="all" onChange={() => {}} />);
    expect(screen.getByRole("tab", { name: /ทั้งหมด/ })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /ถูกธง/ })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /เสร็จสิ้น/ })).toBeInTheDocument();
  });

  it("marks the active tab with aria-selected=true", () => {
    render(<FilterTabs tabs={tabs} activeKey="flagged" onChange={() => {}} />);
    expect(screen.getByRole("tab", { name: /ถูกธง/ })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: /ทั้งหมด/ })).toHaveAttribute("aria-selected", "false");
  });

  it("calls onChange when a tab is clicked", () => {
    const onChange = vi.fn();
    render(<FilterTabs tabs={tabs} activeKey="all" onChange={onChange} />);
    fireEvent.click(screen.getByRole("tab", { name: /ถูกธง/ }));
    expect(onChange).toHaveBeenCalledWith("flagged");
  });

  it("exposes a tablist with an accessible role", () => {
    render(<FilterTabs tabs={tabs} activeKey="all" onChange={() => {}} />);
    expect(screen.getByRole("tablist")).toBeInTheDocument();
  });
});