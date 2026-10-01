"use client";

import Link from "next/link";
import { useState } from "react";

export interface SidebarEntry {
  key: string;
  label: string;
  href: string;
  icon: string;
  active?: boolean;
}

interface DashboardSidebarProps {
  entries: SidebarEntry[];
  userName: string;
  userEmail: string;
  brand?: string;
}

/**
 * T-211 — Dark navy sidebar restyled to the artifact shell chrome
 * (admin-design-spec.md GAP A "ConsoleShell", :864-906): 232px rail
 * (--sidebar-width), bg var(--navy-900) (GAP A names it var(--surface-inverse);
 * both Map C tokens carry the same rgb(6,30,92) — the directive names
 * --navy-900), full viewport height, staying fixed while content scrolls.
 * Nav items per GAP A :885-893: radius --radius-sm, padding 9px 11px,
 * active bg rgba(255,255,255,.12) + white, inactive transparent +
 * rgba(255,255,255,.72), 13px semibold, 16px icon, 10px icon-label gap.
 * User chip per GAP A :896-904: borderTop 1px solid --border-on-dark,
 * avatar 32px --teal-600, name 12px semibold, role 10.5px
 * rgba(255,255,255,.6).
 *
 * DATA/route contracts preserved (R-001/R-002/R-026): the `entries` prop
 * (key/label/href/icon/active) and Link href routing are untouched; the
 * layouts keep computing `active` via usePathname. The out-of-flow rail
 * (fixed <md, docked ≥md) is kept — the consumers' main areas
 * (dashboard-shell, sponsor pages) offset by the rail width, so an in-flow
 * sticky rail would double the offset (deviation recorded in the task
 * report; visual geometry matches GAP A: 232px, rgb(6,30,92), 100vh,
 * persistent while scrolling).
 * Colours are artifact CSS vars only (R-006: no raw hex in source).
 */
export function DashboardSidebar({
  entries,
  userName = "Admin User",
  userEmail = "admin@netzerocarbon.com",
  brand = "NetZero",
}: DashboardSidebarProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      {/* Hamburger menu for tablet */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="fixed top-4 left-4 z-[60] md:hidden w-10 h-10 flex items-center justify-center rounded-lg bg-[var(--navy-900)] text-white shadow-lg"
        aria-label={expanded ? "ปิดเมนู" : "เปิดเมนู"}
      >
        <span className="material-symbols-outlined">
          {expanded ? "close" : "menu"}
        </span>
      </button>

      {/* Backdrop for tablet */}
      {expanded && (
        <div
          onClick={() => setExpanded(false)}
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
        />
      )}

      <aside
        className={[
          // 232px rail: --sidebar-width token width at lg; 100vh docked rail
          "fixed left-0 top-0 bg-[var(--navy-900)] z-50 flex flex-col pt-6 shadow-xl transition-all duration-300",
          "md:flex md:h-screen",
          expanded ? "flex w-[232px]" : "hidden md:flex md:w-[72px] lg:w-[232px]",
        ].join(" ")}
        style={{ height: "100vh" }}
      >
        <div className="px-4 lg:px-6 mb-10 flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-[var(--teal-600)] text-white flex items-center justify-center text-sm flex-shrink-0">
            <span className="material-symbols-outlined text-[18px]">eco</span>
          </span>
          <span className="text-headline-md text-white tracking-tight font-bold hidden lg:block">
            {brand}
          </span>
        </div>

        <nav className="flex-1 px-2 lg:px-4 space-y-2" aria-label="นำทางหลัก">
          {entries.map((entry) => (
            <Link
              key={entry.key}
              href={entry.href}
              onClick={() => setExpanded(false)}
              aria-current={entry.active ? "page" : undefined}
              className={[
                "flex items-center group",
                // GAP A :886 borderRadius --radius-sm; padding 9px 11px inline
                entry.active
                  ? "bg-white/[0.12] text-white"
                  : "bg-transparent text-white/[0.72] hover:bg-white/[0.08]",
              ].join(" ")}
              style={{
                padding: "9px 11px",
                borderRadius: "var(--radius-sm)",
                fontSize: "13px",
                fontWeight: "var(--weight-semibold)",
              }}
              title={entry.label}
            >
              <span aria-hidden="true" className="material-symbols-outlined text-[16px] flex-shrink-0">
                {entry.icon}
              </span>
              <span className="ml-[10px] hidden lg:block">{entry.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 lg:p-6 border-t border-[var(--border-on-dark)]">
          <div className="flex items-center gap-3 lg:gap-4">
            <div className="w-8 h-8 rounded-full bg-[var(--teal-600)] flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-white text-[18px]">person</span>
            </div>
            <div className="flex-1 overflow-hidden hidden lg:block">
              <p className="text-white text-[12px] font-semibold truncate">{userName}</p>
              <p className="text-white/60 text-[10.5px] truncate">{userEmail}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
