"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSessionGate } from "@/lib/use-session-gate";

export default function SponsorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Skip the gate on /sponsor/login — that page must be accessible to
  // unauthenticated users (it is the login page itself). The hook must be
  // called unconditionally (Rules of Hooks) and SSR-safely (no
  // typeof-window checks): `enabled: false` makes it a no-op here, so no
  // session probe and no redirect loop on the login page.
  const isLoginPage = pathname === "/sponsor/login";
  const authed = useSessionGate("sponsor", { enabled: !isLoginPage });
  useEffect(() => {
    document.documentElement.dataset.sponsorReady = "true";
  }, []);
  if (!isLoginPage && authed === null) return null; // loading state while checking session
  return children;
}
