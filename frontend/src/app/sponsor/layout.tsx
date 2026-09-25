"use client";

import { useEffect } from "react";
import { useSponsorSessionGate } from "@/lib/use-session-gate";

export default function SponsorLayout({ children }: { children: React.ReactNode }) {
  // Skip the gate on /sponsor/login — that page must be accessible to
  // unauthenticated users (it is the login page itself).
  const isLoginPage = typeof window !== "undefined" && window.location.pathname === "/sponsor/login";
  const authed = isLoginPage ? true : useSponsorSessionGate();
  useEffect(() => {
    document.documentElement.dataset.sponsorReady = "true";
  }, []);
  if (authed === null) return null; // loading state while checking session
  return children;
}
