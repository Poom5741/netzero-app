"use client";

import { useRouter } from "next/navigation";

interface DashboardHeaderProps {
  userLabel: string;
  searchPlaceholder?: string;
  role?: "admin" | "sponsor";
}

// D-1 2026-10-05 (Rakazo staging e2e r1): sponsor and admin session cookies
// live on different hosts (sponsor login is cross-origin to the backend origin
// per the F2 contract; admin login is same-origin through the proxy). Logout
// must clear the cookie on the host that owns it: the 017 header's same-origin
// /api/auth/logout call cleared only the frontend-host cookie, so the sponsor
// session survived user-visible logout until the 24h TTL. The backend's
// POST /sponsor/logout clears the backend-host cookie with the matching
// SameSite=None flag (src/routes/sponsor.ts:134) — call it cross-origin with
// credentials:"include" for sponsor; admin keeps the same-origin proxy path.
const LOGOUT_API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "https://netzero-carbon-poc.poom-a1d.workers.dev";

export function logoutTarget(role: "admin" | "sponsor"): { url: string; credentials: RequestCredentials } {
  return role === "sponsor"
    ? { url: `${LOGOUT_API_BASE}/sponsor/logout`, credentials: "include" }
    : { url: "/api/auth/logout", credentials: "same-origin" };
}

/**
 * Sticky glassmorphic top header with search, notifications, settings,
 * and the signed-in user. Shared by the dashboards.
 *
 * T-501 — below the single 1024px boundary the sidebar hamburger (rendered
 * by DashboardSidebar, fixed into the header band) overlaps the left edge,
 * so the header reserves clearance with a pl-16 base padding; the shipped
 * lg:px-10 still governs at >=1024px (unchanged). No other behaviour
 * change; no intermediate breakpoints.
 */
export function DashboardHeader({
  userLabel = "System Admin",
  searchPlaceholder = "ค้นหาทั่วโลก...",
  role = "admin",
}: DashboardHeaderProps) {
  const router = useRouter();

  async function handleLogout() {
    const { url, credentials } = logoutTarget(role);
    await fetch(url, { method: "POST", credentials });
    router.push("/login");
  }

  return (
    <header className="dashboard-header fixed top-0 left-0 right-0 bg-surface/80 backdrop-blur-md z-40 pl-16 pr-6 lg:px-10 flex items-center justify-between border-b border-surface-container-highest/30 shadow-[0_1px_8px_rgba(0,0,0,0.02)]" style={{ height: "var(--header-height, 64px)" }}>
      <div className="flex items-center gap-4">
        <span className="material-symbols-outlined text-on-surface-variant">search</span>
        <input
          type="text"
          className="bg-transparent border-none outline-none text-body-md font-body-md text-on-surface placeholder:text-outline-variant w-64"
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
          <button
            type="button"
            className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high"
            aria-label="ออกจากระบบ"
            onClick={handleLogout}
          >
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
        <div className="h-8 w-px bg-outline-variant/30" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[var(--teal-600)] flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-[18px]">person</span>
          </div>
          <span className="text-label-md text-on-surface">{userLabel}</span>
        </div>
      </div>
    </header>
  );
}
