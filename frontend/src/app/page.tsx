"use client";

import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    // Initialize scrollcraft engine once mounted
    const w = window as unknown as { Scrollcraft?: { init: () => void } };
    if (w.Scrollcraft) {
      w.Scrollcraft.init();
    }
  }, []);

  return (
    <main>
      <section className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-4" style={{ color: "var(--color-brown)" }}>
            Bangpho Coffee & Beer
          </h1>
          <p className="text-xl md:text-2xl" style={{ color: "var(--color-green)" }}>
            First Specialty Coffee Workspace in Bangpho
          </p>
          <p className="mt-4 text-lg opacity-75">40 THB americano · 100+ Mbps WiFi · Craft beer on tap</p>
        </div>
      </section>
    </main>
  );
}
