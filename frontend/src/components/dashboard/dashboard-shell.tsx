import { DashboardSidebar, SidebarEntry } from "./dashboard-sidebar";
import { DashboardHeader } from "./dashboard-header";

interface DashboardShellProps {
  children: React.ReactNode;
  entries: SidebarEntry[];
  userName?: string;
  userEmail?: string;
  brand?: string;
  userLabel?: string;
  searchPlaceholder?: string;
}

/**
 * Dashboard shell wrapper that combines sidebar and header with content area.
 * Shared by Admin and Sponsor dashboards.
 */
export function DashboardShell({
  children,
  entries,
  userName = "Admin User",
  userEmail = "admin@netzerocarbon.com",
  brand = "NetZero",
  userLabel = "System Admin",
  searchPlaceholder = "ค้นหาทั่วโลก...",
}: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar
        entries={entries}
        userName={userName}
        userEmail={userEmail}
        brand={brand}
      />
      <DashboardHeader
        userLabel={userLabel}
        searchPlaceholder={searchPlaceholder}
      />
      <main
        className="pt-14 pl-4 lg:pl-[232px] transition-all"
      >
        <div className="p-6 lg:p-10">
          {children}
        </div>
      </main>
    </div>
  );
}
