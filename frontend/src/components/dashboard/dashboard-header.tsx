"use client";

interface DashboardHeaderProps {
  userLabel: string;
  searchPlaceholder?: string;
}

/**
 * Sticky glassmorphic top header with search, notifications, settings,
 * and the signed-in user. Shared by the dashboards.
 */
export function DashboardHeader({
  userLabel = "System Admin",
  searchPlaceholder = "ค้นหาทั่วโลก...",
}: DashboardHeaderProps) {
  return (
    <header className="dashboard-header fixed top-0 left-0 right-0 h-20 bg-surface/60 backdrop-blur-xl z-40 px-6 lg:px-10 flex items-center justify-between border-b border-surface-container-highest/30 shadow-[0_1px_8px_rgba(0,0,0,0.02)]">
      <div className="flex items-center gap-4">
        <span className="material-symbols-outlined text-on-surface-variant">search</span>
        <input
          type="text"
          className="bg-transparent border-none outline-none text-body-md text-on-surface placeholder:text-outline-variant w-64"
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
        />
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high"
            aria-label="การแจ้งเตือน"
          >
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button
            type="button"
            className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high"
            aria-label="การตั้งค่า"
          >
            <span className="material-symbols-outlined">settings</span>
          </button>
        </div>
        <div className="h-8 w-px bg-outline-variant/30" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
          </div>
          <span className="text-label-md text-on-surface">{userLabel}</span>
        </div>
      </div>
    </header>
  );
}