/**
 * T-501 — <1024px overlay drawer + >=1024px rail (R-003, single 1024px boundary).
 *
 * Two techniques, per feedback-loop.md Tier-1 rules (no jsdom computed-style
 * cascade assertions — HANDOFF lesson 1; jsdom cannot evaluate media
 * queries):
 *
 *  1. Render-based (testing-library): drawer open/close interactions, dialog
 *     semantics, focus trap, Escape/backdrop close, focus return to the
 *     hamburger, body scroll lock.
 *  2. Source-level (readFileSync + regex): the responsive BOUNDARY itself —
 *     hamburger/drawer/rail visibility per breakpoint is asserted on the
 *     media-query classes in source. The only responsive variants allowed in
 *     the dashboard trio are lg: (the one 1024px boundary): no sm:/md:/xl:
 *     rail states, no intermediate breakpoints, drawer rendered from the
 *     same nav source as the rail (single nav mapping).
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { DashboardSidebar } from "../dashboard-sidebar";
import type { SidebarEntry } from "../dashboard-sidebar";
const QT = String.fromCharCode(34); // double-quote char, backslash-free
const HAMBURGER_ATTR = "data-testid=" + QT + "dashboard-hamburger" + QT;
const RAIL_ATTR = "data-testid=" + QT + "sidebar-rail" + QT;
const DRAWER_ATTR = "data-testid=" + QT + "dashboard-drawer" + QT;
const BACKDROP_ATTR = "data-testid=" + QT + "drawer-backdrop" + QT;

const HERE = dirname(fileURLToPath(import.meta.url));
const SIDEBAR_SRC = readFileSync(join(HERE, "../dashboard-sidebar.tsx"), "utf8");
const HEADER_SRC = readFileSync(join(HERE, "../dashboard-header.tsx"), "utf8");
const SHELL_SRC = readFileSync(join(HERE, "../dashboard-shell.tsx"), "utf8");

const ENTRIES: SidebarEntry[] = [
  { key: "overview", label: "ภาพรวม", href: "/admin", icon: "dashboard", active: true },
  { key: "reports", label: "รายงาน", href: "/admin/reports", icon: "summarize" },
];

function renderSidebar() {
  return render(
    <DashboardSidebar entries={ENTRIES} userName="Admin User" userEmail="admin@netzerocarbon.com" />
  );
}

function openDrawer() {
  fireEvent.click(screen.getByTestId("dashboard-hamburger"));
  const drawer = screen.getByTestId("dashboard-drawer");
  return { drawer, dialog: within(drawer) };
}

describe("T-501 — source-level: single 1024px boundary (R-003)", () => {
  it("hamburger is <1024px only (lg:hidden) with the 28px glyph", () => {
    const start = SIDEBAR_SRC.indexOf(HAMBURGER_ATTR);
    const end = SIDEBAR_SRC.indexOf(RAIL_ATTR);
    const block = SIDEBAR_SRC.slice(start, end);
    expect(block).toContain("lg:hidden");
    expect(block).toContain("text-[28px]");
    expect(block).not.toContain("md:hidden");
  });

  it("rail is hidden below 1024px and docks only at lg (no intermediate mini-rail)", () => {
    const start = SIDEBAR_SRC.indexOf(RAIL_ATTR);
    const end = SIDEBAR_SRC.indexOf("{renderNav");
    const block = SIDEBAR_SRC.slice(start, end);
    expect(block).toContain("hidden");
    expect(block).toContain("lg:flex");
    expect(block).toContain("lg:w-[232px]");
    expect(block).not.toContain("md:w-");
  });

  it("drawer and backdrop are <1024px only (lg:hidden on both); drawer is 232px", () => {
    const drawerBlock = SIDEBAR_SRC.slice(SIDEBAR_SRC.indexOf(DRAWER_ATTR));
    expect(drawerBlock.match(/className="([^"]+)"/)?.[1] ?? "").toContain("lg:hidden");
    expect(drawerBlock.match(/className="([^"]+)"/)?.[1] ?? "").toContain("w-[232px]");
    const backdropBlock = SIDEBAR_SRC.slice(SIDEBAR_SRC.indexOf(BACKDROP_ATTR));
    expect(backdropBlock.match(/className="([^"]+)"/)?.[1] ?? "").toContain("lg:hidden");
  });


  it("no intermediate breakpoints in the dashboard trio (only lg: variants)", () => {
    const midRange = /[^-A-Za-z0-9_](sm|md|xl|2xl):/;
    expect(SIDEBAR_SRC.match(midRange)).toBeNull();
    expect(HEADER_SRC.match(midRange)).toBeNull();
    expect(SHELL_SRC.match(midRange)).toBeNull();
  });

  it("header reserves hamburger clearance below 1024px (pl-16 base, lg:px-10 docked)", () => {
    expect(HEADER_SRC).toContain("pl-16 pr-6 lg:px-10");
  });

  it("drawer renders from the SAME nav source as the rail (single nav mapping)", () => {
    const maps = SIDEBAR_SRC.match(/entries.map/g) ?? [];
    expect(maps.length).toBe(1);
    expect(SIDEBAR_SRC).toContain("renderNav");
  });

  it("zero raw hex in the drawer source (R-006: artifact vars only)", () => {
    expect(SIDEBAR_SRC.match(/[=:( ]#[0-9a-fA-F]{3,8}/)).toBeNull();
  });

  it("dialog semantics + focus wiring present in source", () => {
    expect(SIDEBAR_SRC).toContain("role=" + QT + "dialog" + QT);
    expect(SIDEBAR_SRC).toContain("aria-modal=" + QT + "true" + QT);
  });

})

describe("T-501 — render-based: drawer interactions", () => {
  it("drawer is closed on load: no dialog, no backdrop", () => {
    renderSidebar();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByTestId("drawer-backdrop")).not.toBeInTheDocument();
  });

  it("hamburger exposes aria-expanded=false and aria-controls while closed", () => {
    renderSidebar();
    const hamburger = screen.getByTestId("dashboard-hamburger");
    expect(hamburger).toHaveAttribute("aria-expanded", "false");
    expect(hamburger).toHaveAttribute("aria-controls", "dashboard-drawer");
    expect(hamburger).toHaveAttribute("aria-label", "เปิดเมนู");
  });

  it("hamburger click opens the drawer with dialog semantics and the same nav data", () => {
    renderSidebar();
    const { drawer, dialog } = openDrawer();
    expect(drawer).toHaveAttribute("role", "dialog");
    expect(drawer).toHaveAttribute("aria-modal", "true");
    expect(dialog.getAllByRole("link")).toHaveLength(ENTRIES.length);
    expect(dialog.getByRole("link", { name: "ภาพรวม" })).toHaveAttribute("href", "/admin");
    expect(dialog.getByRole("link", { name: "รายงาน" })).toHaveAttribute("href", "/admin/reports");
    expect(screen.getByTestId("dashboard-hamburger")).toHaveAttribute("aria-expanded", "true");
  });

  it("opening locks body scroll; closing restores it", () => {
    renderSidebar();
    expect(document.body.style.overflow).toBe("");
    openDrawer();
    expect(document.body.style.overflow).toBe("hidden");
    fireEvent.keyDown(screen.getByTestId("dashboard-drawer"), { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe("");
  });

  it("opening moves focus to the first nav link", () => {
    renderSidebar();
    const { dialog } = openDrawer();
    expect(document.activeElement).toBe(dialog.getAllByRole("link")[0]);
  });

  it("Escape closes the drawer and returns focus to the hamburger", () => {
    renderSidebar();
    const hamburger = screen.getByTestId("dashboard-hamburger");
    openDrawer();
    fireEvent.keyDown(screen.getByTestId("dashboard-drawer"), { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(hamburger).toHaveAttribute("aria-expanded", "false");
    expect(document.activeElement).toBe(hamburger);
  });

  it("backdrop click closes the drawer", () => {
    renderSidebar();
    openDrawer();
    fireEvent.click(screen.getByTestId("drawer-backdrop"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("hamburger toggles the drawer closed when clicked again", () => {
    renderSidebar();
    const hamburger = screen.getByTestId("dashboard-hamburger");
    openDrawer();
    fireEvent.click(hamburger);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("focus trap: Tab on the last link wraps to the first", () => {
    renderSidebar();
    const { drawer, dialog } = openDrawer();
    const links = dialog.getAllByRole("link");
    links[links.length - 1].focus();
    fireEvent.keyDown(drawer, { key: "Tab" });
    expect(document.activeElement).toBe(links[0]);
  });

  it("focus trap: Shift+Tab on the first link wraps to the last", () => {
    renderSidebar();
    const { drawer, dialog } = openDrawer();
    const links = dialog.getAllByRole("link");
    links[0].focus();
    fireEvent.keyDown(drawer, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(links[links.length - 1]);
  });

  it("rail nav stays mounted (class-gated for >=1024px) with the same entries", () => {
    renderSidebar();
    const rail = screen.getByTestId("sidebar-rail");
    const railNav = within(rail).getByRole("navigation");
    expect(within(railNav).getAllByRole("link")).toHaveLength(ENTRIES.length);
  });
});
