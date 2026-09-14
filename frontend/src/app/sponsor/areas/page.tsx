"use client";

import { useEffect, useState } from "react";
import { DashboardSidebar as Sidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { PdpaNotice } from "@/components/sponsor/pdpa-notice";
import { formatTons, type ProvinceGroup, type PlotSummary, type SponsorProfile } from "@/lib/sponsor";

const PRIVATE_IP_PREFIXES = ["10.", "172.", "192.168."];

function validateApiUrl(url: string): string {
  const parsed = new URL(url);
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error(`Invalid API URL protocol: ${parsed.protocol}`);
  }
  const h = parsed.hostname;
  if (
    h === "localhost" || h === "127.0.0.1" || h === "0.0.0.0" || h === "::1" ||
    h.endsWith(".local") || PRIVATE_IP_PREFIXES.some((p) => h.startsWith(p))
  ) {
    throw new Error(`SSRF blocked: internal host ${h}`);
  }
  return url;
}

function fetchJson<T>(path: string, fallback: T): Promise<T> {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE;
  const endpoint = apiBase ? validateApiUrl(`${apiBase}${path}`) : path;
  return new Promise((resolve) => {
    try {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", endpoint);
      xhr.onload = () => {
        try {
          resolve(xhr.status >= 200 && xhr.status < 300 ? (JSON.parse(xhr.responseText) as T) : fallback);
        } catch {
          resolve(fallback);
        }
      };
      xhr.onerror = () => resolve(fallback);
      xhr.send();
    } catch {
      resolve(fallback);
    }
  });
}

function fetchSponsorData(): Promise<ProvinceGroup[]> {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE;
  const endpoint = apiBase ? validateApiUrl(`${apiBase}/sponsor`) : "/sponsor";
  return new Promise((resolve) => {
    try {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", endpoint);
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const data = JSON.parse(xhr.responseText);
          resolve(data.provinces ?? data);
        } else {
          resolve([]);
        }
      };
      xhr.onerror = () => resolve([]);
      xhr.send();
    } catch {
      resolve([]);
    }
  });
}

const sidebarEntries = [
  { key: "overview", label: "ภาพรวม", href: "/sponsor", icon: "dashboard" },
  { key: "areas", label: "พื้นที่", href: "/sponsor/areas", icon: "landscape", active: true },
  { key: "reports", label: "รายงานและใบรับรอง", href: "/sponsor/reports", icon: "description" },
];

/** Photo evidence indicator pill */
function PhotoIndicator({ plot }: { plot: PlotSummary }) {
  const machine = plot.provenance_counts?.machine ?? 0;
  const human = plot.provenance_counts?.human ?? 0;
  const flooded = plot.water_state_tallies?.flooded ?? 0;
  const dry = plot.water_state_tallies?.dry ?? 0;
  const total = machine + human;
  if (total === 0) return <span className="text-label-sm text-outline">—</span>;
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex gap-1">
        {machine > 0 && (
          <span className="inline-flex items-center gap-0.5 text-[11px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
            <span className="material-symbols-outlined text-[12px]">smart_toy</span>{machine}
          </span>
        )}
        {human > 0 && (
          <span className="inline-flex items-center gap-0.5 text-[11px] bg-tertiary-container text-on-tertiary-container px-1.5 py-0.5 rounded-full">
            <span className="material-symbols-outlined text-[12px]">person</span>{human}
          </span>
        )}
      </div>
      {(flooded > 0 || dry > 0) && (
        <div className="flex gap-1 text-[10px] text-on-surface-variant">
          {flooded > 0 && <span>น้ำขัง:{flooded}</span>}
          {dry > 0 && <span>แห้ง:{dry}</span>}
        </div>
      )}
    </div>
  );
}

/** Per-province DataTable with all sub-plots */
function ProvinceTable({ group }: { group: ProvinceGroup }) {
  const totalCO2 = group.plots.reduce((s, p) => s + (p.total_offset_tco2e ?? 0), 0);
  return (
    <div className="bg-surface-container-lowest rounded-xl overflow-hidden mb-6">
      <div className="p-4 border-b border-surface-variant flex justify-between items-center">
        <h3 className="font-headline-md text-on-surface">{group.province}</h3>
        <span className="text-label-md text-on-surface-variant">{group.plots.length} แปลง / {formatTons(totalCO2)} tCO2e</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-body-md">
          <thead>
            <tr className="bg-surface-container">
              <th className="text-left px-4 py-2 text-label-md text-on-surface-variant font-medium">รหัสแปลง</th>
              <th className="text-left px-4 py-2 text-label-md text-on-surface-variant font-medium">เกษตรกร</th>
              <th className="text-left px-4 py-2 text-label-md text-on-surface-variant font-medium">อำเภอ</th>
              <th className="text-right px-4 py-2 text-label-md text-on-surface-variant font-medium">พื้นที่ (ไร่)</th>
              <th className="text-right px-4 py-2 text-label-md text-on-surface-variant font-medium">CO₂ (tCO2e)</th>
              <th className="text-center px-4 py-2 text-label-md text-on-surface-variant font-medium">สถานะ</th>
              <th className="text-center px-4 py-2 text-label-md text-on-surface-variant font-medium">ภาพถ่าย</th>
            </tr>
          </thead>
          <tbody>
            {group.plots.map((plot) => (
              <tr key={plot.plot_id} className="border-t border-surface-variant/50 hover:bg-surface-container/50 transition-colors">
                <td className="px-4 py-3 font-medium text-on-surface">{plot.plot_code}</td>
                <td className="px-4 py-3 text-on-surface-variant">{plot.farmer_name}</td>
                <td className="px-4 py-3 text-on-surface-variant">{plot.district}</td>
                <td className="px-4 py-3 text-right text-on-surface-variant">{plot.area_rai}</td>
                <td className="px-4 py-3 text-right text-primary font-medium">{formatTons(plot.total_offset_tco2e ?? 0)}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex items-center gap-1 text-label-sm px-2 py-0.5 rounded-full ${
                    plot.estimate_status === "final"
                      ? "bg-primary/10 text-primary"
                      : plot.estimate_status === "verified"
                        ? "bg-tertiary-container text-on-tertiary-container"
                        : "bg-surface-variant text-on-surface-variant"
                  }`}>
                    {plot.estimate_status === "final" ? "ตรวจสอบแล้ว" : plot.estimate_status === "verified" ? "อนุมัติแล้ว" : "ประมาณการ"}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <PhotoIndicator plot={plot} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function SponsorAreasPage() {
  const [groups, setGroups] = useState<ProvinceGroup[]>([]);
  const [profile, setProfile] = useState<SponsorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [data, profileData] = await Promise.all([
        fetchSponsorData(),
        fetchJson<SponsorProfile>("/sponsor/me", null as unknown as SponsorProfile),
      ]);
      if (!cancelled) {
        setGroups(data);
        setProfile(profileData);
        setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const userName = profile?.user?.name ?? profile?.user?.email ?? "ผู้สนับสนุน";
  const userEmail = profile?.user?.email ?? "sponsor@netzerocarbon.com";

  return (
    <>
      <Sidebar
        entries={sidebarEntries}
        userName={userName}
        userEmail={userEmail}
        brand="NetZero"
      />
      <DashboardHeader userLabel={userName} searchPlaceholder="ค้นหาแปลง..." />

      <div className="dashboard-main">
        <main className="relative pt-20 min-h-screen bg-surface px-6 lg:px-10 py-6">
          <div className="flex flex-col w-full relative">
            <PdpaNotice />

            <div className="mb-6 relative z-10">
              <h1 className="text-display-lg text-on-surface">พื้นที่ที่รับผิดชอบ</h1>
              <p className="text-body-lg text-on-surface-variant mt-2">
                รายละเอียดแปลงเกษตรแต่ละพื้นที่ รวมถึงสถานะภาพถ่ายหลักฐานและคาร์บอนเครดิต
              </p>
            </div>

            {loading ? (
              <div className="bg-surface-container p-6 rounded-xl">
                <p className="text-on-surface-variant">กำลังโหลดข้อมูล...</p>
              </div>
            ) : groups.length === 0 ? (
              <div className="bg-surface-container p-12 rounded-xl text-center">
                <span className="material-symbols-outlined text-64 text-on-surface-variant mb-4">landscape</span>
                <h2 className="text-headline-lg text-on-surface mt-4">ยังไม่มีข้อมูลพื้นที่</h2>
                <p className="text-body-lg text-on-surface-variant mt-2">
                  ยังไม่มีแปลงเกษตรในพื้นที่ที่ท่านรับผิดชอบ
                </p>
              </div>
            ) : (
              <div className="relative z-10">
                {groups.map((group) => (
                  <ProvinceTable key={group.province} group={group} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
