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
 * Dark navy sidebar with logo, navigation, and user chip.
 * Shared by the Admin Review and Sponsor dashboards.
 * Responsive: compact icons on tablet, full sidebar on desktop.
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
        className="fixed top-4 left-4 z-[60] md:hidden w-10 h-10 flex items-center justify-center rounded-lg bg-[#061E5C] text-white shadow-lg"
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
          "fixed left-0 top-0 h-full bg-[#061E5C] z-50 flex flex-col pt-6 shadow-xl transition-all duration-300",
          // Claude source: 232px sidebar width
          "md:flex",
          expanded ? "flex w-[232px]" : "hidden md:flex md:w-[72px] lg:w-[232px]",
        ].join(" ")}
      >
        <div className="px-4 lg:px-6 mb-10 flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-[#028E91] text-white flex items-center justify-center text-sm flex-shrink-0">
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
                "flex items-center touch-target px-3 lg:px-4 rounded-lg transition-all group",
                entry.active
                  ? "bg-white/[0.12] text-white font-semibold"
                  : "text-white/70 hover:bg-white/[0.08] font-label-md text-label-md",
              ].join(" ")}
              style={{ height: 'var(--nav-item-height, 40px)' }}
              title={entry.label}
            >
              <span aria-hidden="true" className="material-symbols-outlined text-[20px] flex-shrink-0">
                {entry.icon}
              </span>
              <span className="ml-4 hidden lg:block">{entry.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 lg:p-6 border-t border-white/5">
          <div className="flex items-center gap-3 lg:gap-4">
            <div className="w-8 h-8 rounded-full bg-[#028E91] flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-white text-[18px]">person</span>
            </div>
            <div className="flex-1 overflow-hidden hidden lg:block">
              <p className="text-white text-label-md font-medium truncate">{userName}</p>
              <p className="text-white/60 text-[12px] truncate">{userEmail}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}