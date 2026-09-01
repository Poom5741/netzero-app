import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { DashboardSidebar } from "../dashboard-sidebar";
import { DashboardHeader } from "../dashboard-header";

describe("DashboardSidebar", () => {
  const entries = [
    { key: "admin", label: "Review Dashboard", href: "/admin", icon: "fact_check", active: true },
    { key: "sponsor", label: "Sponsor Dashboard", href: "/sponsor", icon: "volunteer_activism" },
  ];

  it("renders the brand", () => {
    render(<DashboardSidebar entries={entries} userName="Admin" userEmail="a@b.com" />);
    expect(screen.getByText("NetZero")).toBeInTheDocument();
  });

  it("renders each navigation entry", () => {
    render(<DashboardSidebar entries={entries} userName="Admin" userEmail="a@b.com" />);
    expect(screen.getByRole("link", { name: "Review Dashboard" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sponsor Dashboard" })).toBeInTheDocument();
  });

  it("marks the active entry with aria-current=page", () => {
    render(<DashboardSidebar entries={entries} userName="Admin" userEmail="a@b.com" />);
    const active = screen.getByRole("link", { name: "Review Dashboard" });
    expect(active).toHaveAttribute("aria-current", "page");
    const inactive = screen.getByRole("link", { name: "Sponsor Dashboard" });
    expect(inactive).not.toHaveAttribute("aria-current");
  });

  it("renders the user name and email", () => {
    render(<DashboardSidebar entries={entries} userName="Admin User" userEmail="admin@netzerocarbon.com" />);
    expect(screen.getByText("Admin User")).toBeInTheDocument();
    expect(screen.getByText("admin@netzerocarbon.com")).toBeInTheDocument();
  });

  it("exposes navigation with an accessible label", () => {
    render(<DashboardSidebar entries={entries} userName="Admin" userEmail="a@b.com" />);
    expect(screen.getByRole("navigation", { name: "นำทางหลัก" })).toBeInTheDocument();
  });
});

describe("DashboardHeader", () => {
  it("renders the search input", () => {
    render(<DashboardHeader userLabel="System Admin" />);
    expect(screen.getByLabelText("ค้นหาทั่วโลก...")).toBeInTheDocument();
  });

  it("renders notification and settings buttons", () => {
    render(<DashboardHeader userLabel="System Admin" />);
    expect(screen.getByLabelText("การแจ้งเตือน")).toBeInTheDocument();
    expect(screen.getByLabelText("การตั้งค่า")).toBeInTheDocument();
  });

  it("renders the user label", () => {
    render(<DashboardHeader userLabel="System Admin" />);
    expect(screen.getByText("System Admin")).toBeInTheDocument();
  });

  it("renders a logout button", () => {
    render(<DashboardHeader userLabel="System Admin" />);
    expect(screen.getByLabelText("ออกจากระบบ")).toBeInTheDocument();
  });

  it("POSTs to /api/auth/logout and redirects on click", async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true });
    global.fetch = mockFetch;
    const mockAssign = vi.fn();
    delete (window as any).location;
    (window as any).location = { assign: mockAssign } as any;

    render(<DashboardHeader userLabel="System Admin" />);
    fireEvent.click(screen.getByLabelText("ออกจากระบบ"));

    await vi.waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/auth/logout", { method: "POST" });
      expect(mockAssign).toHaveBeenCalledWith("/login");
    });
  });
});