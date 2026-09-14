"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DashboardSidebar, type SidebarEntry } from "@/components/dashboard/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

const adminSidebarEntries: SidebarEntry[] = [
  { key: "overview", label: "ภาพรวม", href: "/admin", icon: "dashboard" },
  { key: "applications", label: "ตรวจสอบใบสมัคร", href: "/admin/applications", icon: "assignment" },
  { key: "farmers", label: "เกษตรกร", href: "/admin/farmers", icon: "agriculture" },
  { key: "sponsors", label: "ผู้สนับสนุน", href: "/admin/sponsors", icon: "handshake" },
  { key: "reports", label: "รายงาน", href: "/admin/reports", icon: "summarize" },
  { key: "settings", label: "ตั้งค่า", href: "/admin/settings", icon: "settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [userName, setUserName] = useState("System Admin");
  const [userEmail, setUserEmail] = useState("admin@netzerocarbon.com");

  useEffect(() => {
    const email = sessionStorage.getItem("nzc_admin_email");
    if (email) setUserEmail(email);
  }, []);

  // Mark active entry based on current path
  const entries = adminSidebarEntries.map((e) => ({
    ...e,
    active: pathname === e.href || (e.href !== "/admin" && pathname.startsWith(e.href)),
  }));

  return (
    <div className="min-h-screen bg-surface">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <DashboardSidebar entries={entries} userName={userName} userEmail={userEmail} />
      </div>

      {/* Desktop topbar */}
      <div className="hidden lg:block">
        <DashboardHeader userLabel="Admin" />
      </div>

      {/* Mobile top bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-surface/60 backdrop-blur-xl z-40 px-4 flex items-center shadow-sm">
        <span className="text-headline-md font-bold text-on-surface">NetZero</span>
        <span className="ml-4 text-body-md text-on-surface font-semibold">
          {entries.find((e) => e.active)?.label ?? "ภาพรวม"}
        </span>
      </header>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface/80 backdrop-blur-xl z-40 flex items-center justify-around border-t border-outline-variant/30">
        {adminSidebarEntries.slice(0, 5).map((entry) => (
          <Link
            key={entry.key}
            href={entry.href}
            className={`flex flex-col items-center gap-1 px-2 ${
              pathname === entry.href || (entry.href !== "/admin" && pathname.startsWith(entry.href))
                ? "text-primary"
                : "text-on-surface-variant"
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">{entry.icon}</span>
            <span className="text-[10px] font-medium">{entry.label}</span>
          </Link>
        ))}
      </nav>

      <div className="dashboard-main">
        {children}
      </div>
    </div>
  );
}
