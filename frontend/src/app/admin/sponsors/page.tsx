"use client";

import { useState, useEffect } from "react";
import { getSponsors, type SponsorItem } from "@/lib/api";

export default function SponsorsPage() {
  const [sponsors, setSponsors] = useState<SponsorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    const email = sessionStorage.getItem("nzc_admin_email");
    const pass = sessionStorage.getItem("nzc_admin_pass");
    if (!email || !pass) {
      window.location.href = "/admin/login";
      return;
    }
    setAuthed(true);
  }, []);

  useEffect(() => {
    if (!authed) return;
    setLoading(true);
    getSponsors()
      .then((data) => { setSponsors(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => { setError("ไม่สามารถโหลดข้อมูลได้"); setLoading(false); });
  }, [authed]);

  if (authed === null) return null;

  return (
    <main className="pt-20 lg:pt-24 px-4 lg:px-10 pb-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="font-headline-lg text-headline-lg text-on-surface">ผู้สนับสนุน</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            จัดการผู้สนับสนุนและขอบเขตพื้นที่
          </p>
        </div>

        {loading && (
          <div className="card p-6 text-center rounded-2xl">
            <div className="flex justify-center gap-2 mb-2">
              <div className="typing-dot w-3 h-3 rounded-full bg-primary" />
              <div className="typing-dot w-3 h-3 rounded-full bg-primary" />
              <div className="typing-dot w-3 h-3 rounded-full bg-primary" />
            </div>
            <p className="text-body-md text-on-surface-variant">กำลังโหลด...</p>
          </div>
        )}

        {error && (
          <div className="card p-6 text-center rounded-2xl">
            <span className="material-symbols-outlined text-error text-4xl mb-2">error</span>
            <p className="text-body-md text-on-surface">{error}</p>
          </div>
        )}

        {!loading && !error && sponsors.length === 0 && (
          <div className="card p-6 text-center rounded-2xl">
            <span className="material-symbols-outlined text-outline text-4xl mb-2">inbox</span>
            <p className="text-body-md text-on-surface-variant">ไม่มีผู้สนับสนุนในระบบ</p>
          </div>
        )}

        {!loading && !error && sponsors.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sponsors.map((sponsor) => (
              <div key={sponsor.id} className="card rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-[20px]">handshake</span>
                  </div>
                  <div>
                    <h3 className="text-body-lg font-semibold text-on-surface">{sponsor.name}</h3>
                    <p className="text-label-sm text-on-surface-variant">{sponsor.email}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-label-sm text-on-surface-variant">พื้นที่:</span>
                    <div className="flex flex-wrap gap-1 justify-end">
                      {sponsor.areas.length === 0 ? (
                        <span className="text-[11px] text-on-surface-variant">-</span>
                      ) : (
                        sponsor.areas.map((area) => (
                          <span key={area} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium">
                            {area}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-label-sm text-on-surface-variant">แปลง:</span>
                    <span className="text-body-md font-semibold text-on-surface">{sponsor.plot_count}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-label-sm text-on-surface-variant">เครดิต:</span>
                    <span className="text-body-md font-semibold text-on-surface">
                      {sponsor.credit_total.toFixed(2)} tCO2e
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-outline-variant/20">
                  <button className="w-full py-2 rounded-xl bg-surface-container-high text-on-surface text-label-md font-medium hover:bg-surface-container-highest transition-colors">
                    ดูรายละเอียด
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
