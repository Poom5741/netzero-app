"use client";

import { useEffect, useState } from "react";

type Role = "admin" | "sponsor";

const TIMEOUT_MS = 8_000;

const ADMIN_SESSION_PATH = "/api/auth/session";

// F3 2026-10-05: sponsor and admin sessions now live on different cookie hosts.
// Admin login posts same-origin /login (proxy) → nzc_session lands on the
// frontend host, so the same-origin /api/auth/session proxy check carries it.
// Sponsor login posts cross-origin to the backend origin (F2 contract) → the
// cookie exists only on the backend host, so the sponsor check must also go
// cross-origin to the backend root-mounted /session route (CORS already
// allows this origin; validated live 2026-10-05). A same-origin sponsor check
// can never see that cookie → 401 → bounce loop after every successful login.
const SPONSOR_API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "https://netzero-carbon-poc.poom-a1d.workers.dev";

export function sessionCheck(role: Role): { url: string; credentials: RequestCredentials } {
  return role === "sponsor"
    ? { url: `${SPONSOR_API_BASE}/session`, credentials: "include" }
    : { url: ADMIN_SESSION_PATH, credentials: "same-origin" };
}

function loginPath(role: Role) {
  return role === "admin" ? "/admin/login" : "/sponsor/login";
}

/**
 * Real session gate for /admin/* and /sponsor/* pages.
 * - Checks the backend nzc_session cookie via GET /api/auth/session.
 * - Enforces the expected role; redirects to the appropriate login on mismatch.
 * - Uses AbortSignal.timeout() to avoid hanging on network failures.
 * No credentials stored client-side.
 */
export function useSessionGate(expectedRole: Role, options?: { enabled?: boolean }): boolean | null {
  const enabled = options?.enabled ?? true;
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    const controller = new AbortController();

    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const { url, credentials } = sessionCheck(expectedRole);

    fetch(url, { signal: controller.signal, credentials })
      .then((res) => {
        clearTimeout(timer);
        if (!res.ok) throw new Error(`session check failed: ${res.status}`);
        return res.json() as Promise<{ authenticated?: boolean; role?: string }>;
      })
      .then((data) => {
        if (cancelled) return;
        if (data?.authenticated && data?.role === expectedRole) {
          setAuthed(true);
        } else {
          window.location.href = loginPath(expectedRole);
        }
      })
      .catch(() => {
        clearTimeout(timer);
        if (!cancelled) window.location.href = loginPath(expectedRole);
      });

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [expectedRole, enabled]);

  return authed;
}

/** Convenience exports for the old names (backwards-compatible) */
export const useAdminSessionGate = () => useSessionGate("admin");
export const useSponsorSessionGate = () => useSessionGate("sponsor");
