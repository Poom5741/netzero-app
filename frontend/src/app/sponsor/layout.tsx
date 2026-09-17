"use client";

import { useEffect } from "react";
export default function SponsorLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.dataset.sponsorReady = "true";
  }, []);

  return children;
}
