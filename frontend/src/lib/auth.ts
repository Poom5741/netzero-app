"use client";

import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api";

type AuthState = "loading" | "ok" | "denied" | "redirecting";

interface MeResponse {
  role: string;
  email?: string;
}

/**
 * Client-side auth guard (UX only — real enforcement is backend 401s).
 * Calls GET /me on mount. Redirects to /login on 401, shows denied on role mismatch.
 */
export function useAuthGuard(expectedRole: string): AuthState {
  const [state, setState] = useState<AuthState>("loading");

  useEffect(() => {
    let cancelled = false;
    apiRequest<MeResponse>("/me").then((res) => {
      if (cancelled) return;
      if (res.status === 401) {
        setState("redirecting");
        window.location.href = "/login";
      } else if (res.ok && res.data.role !== expectedRole) {
        setState("denied");
      } else if (res.ok) {
        setState("ok");
      } else {
        // Non-401 error — let page render, backend will 401 on data calls
        setState("ok");
      }
    }).catch(() => {
      if (!cancelled) setState("ok");
    });
    return () => { cancelled = true; };
  }, [expectedRole]);

  return state;
}
