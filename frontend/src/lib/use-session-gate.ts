"use client";

import { useEffect, useState } from "react";

type Role = "admin" | "sponsor";

const TIMEOUT_MS = 8_000;

const SESSION_PATH = "/api/auth/session";

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
export function useSessionGate(expectedRole: Role): boolean | null {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    fetch(SESSION_PATH, { signal: controller.signal })
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
  }, [expectedRole]);

  return authed;
}

/** Convenience exports for the old names (backwards-compatible) */
export const useAdminSessionGate = () => useSessionGate("admin");
export const useSponsorSessionGate = () => useSessionGate("sponsor");
