"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import type { SidebarEntry } from "@/components/dashboard/dashboard-sidebar";

const adminSidebarEntries: SidebarEntry[] = [
  { key: "overview", label: "ภาพรวม", href: "/admin", icon: "dashboard" },
  { key: "applications", label: "ตรวจสอบใบสมัคร", href: "/admin/applications", icon: "assignment" },
  { key: "evidence", label: "ตรวจสอบภาพ", href: "/admin/evidence", icon: "photo_library" },
  { key: "farmers", label: "เกษตรกร", href: "/admin/farmers", icon: "agriculture" },
  { key: "sponsors", label: "ผู้สนับสนุน", href: "/admin/sponsors", icon: "handshake" },
  { key: "reports", label: "รายงาน", href: "/admin/reports", icon: "summarize" },
  { key: "settings", label: "ตั้งค่า", href: "/admin/settings", icon: "settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Rail-identity fix (Rakazo r1-r4 cosmetic): show the real working identity
  // from the session, not a fabricated address. Fallback keeps the role label.
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.dataset.adminReady = "true";
    fetch("/api/auth/session", { credentials: "same-origin" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { authenticated?: boolean; email?: string } | null) => {
        if (d?.authenticated && d.email) setSessionEmail(d.email);
      })
      .catch(() => {});
  }, []);

  const userName = "System Admin";
  const userEmail = sessionEmail ?? "admin@netzero.com";

  useEffect(() => {
    document.documentElement.dataset.adminReady = "true";
  }, []);

  // Mark active entry based on current path
  const entries = adminSidebarEntries.map((e) => ({
    ...e,
    active: pathname === e.href || (e.href !== "/admin" && pathname.startsWith(e.href)),
  }));

  if (pathname === "/admin/login") return children;

  return (
    <DashboardShell
      entries={entries}
      userName={userName}
      userEmail={userEmail}
      brand="NetZero"
      userLabel="Admin"
      searchPlaceholder="ค้นหาทั่วโลก..."
    >
      {children}
    </DashboardShell>
  );
}
