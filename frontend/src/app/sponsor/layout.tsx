"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import type { SidebarEntry } from "@/components/dashboard/dashboard-sidebar";

const sponsorSidebarEntries: SidebarEntry[] = [
  { key: "overview", label: "ภาพรวม", href: "/sponsor", icon: "dashboard" },
  { key: "areas", label: "พื้นที่", href: "/sponsor/areas", icon: "map" },
  { key: "reports", label: "รายงานและใบรับรอง", href: "/sponsor/reports", icon: "description" },
];

export default function SponsorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const userName = "Sponsor User";
  const userEmail = "sponsor@netzerocarbon.com";

  useEffect(() => {
    document.documentElement.dataset.sponsorReady = "true";
  }, []);

  // Mark active entry based on current path
  const entries = sponsorSidebarEntries.map((e) => ({
    ...e,
    active: pathname === e.href || (e.href !== "/sponsor" && pathname.startsWith(e.href)),
  }));

  if (pathname === "/sponsor/login") return children;

  return (
    <DashboardShell
      entries={entries}
      userName={userName}
      userEmail={userEmail}
      brand="NetZero"
      userLabel="Sponsor"
      searchPlaceholder="ค้นหา..."
    >
      {children}
    </DashboardShell>
  );
}
