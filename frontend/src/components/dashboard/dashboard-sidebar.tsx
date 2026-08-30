"use client";

import Link from "next/link";

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
 */
export function DashboardSidebar({
  entries,
  userName = "Admin User",
  userEmail = "admin@netzerocarbon.com",
  brand = "NetZero",
}: DashboardSidebarProps) {
  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-[#1A1A2E] z-50 flex flex-col pt-6 shadow-xl hidden lg:flex">
      <div className="px-6 mb-10 flex items-center gap-2">
        <span className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center text-sm">
          <span className="material-symbols-outlined text-[18px]">eco</span>
        </span>
        <span className="text-headline-md text-surface-container-lowest tracking-tight font-bold">
          {brand}
        </span>
      </div>

      <nav className="flex-1 px-4 space-y-2" aria-label="นำทางหลัก">
        {entries.map((entry) => (
          <Link
            key={entry.key}
            href={entry.href}
            aria-current={entry.active ? "page" : undefined}
            className={[
              "flex items-center touch-target px-4 rounded-lg transition-all",
              entry.active
                ? "bg-primary-container text-on-primary-container font-bold"
                : "text-surface-container-highest hover:bg-white/10 font-label-md text-label-md",
            ].join(" ")}
          >
            <span aria-hidden="true" className="material-symbols-outlined mr-4 text-[20px]">
              {entry.icon}
            </span>
            <span>{entry.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-6 border-t border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-surface-container-lowest text-label-md font-medium truncate">{userName}</p>
            <p className="text-surface-container-highest text-[12px] truncate">{userEmail}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}