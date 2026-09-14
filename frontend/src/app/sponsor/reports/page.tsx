"use client";

import { useEffect, useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import { PdpaNotice } from "@/components/sponsor/pdpa-notice";
import {
  CERT_STATUS,
  type Certificate,
  type SponsorProfile,
} from "@/lib/sponsor";

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

const sidebarEntries = [
  { key: "overview", label: "ภาพรวม", href: "/sponsor", icon: "dashboard" },
  { key: "areas", label: "พื้นที่", href: "/sponsor/areas", icon: "landscape" },
  { key: "reports", label: "รายงานและใบรับรอง", href: "/sponsor/reports", icon: "description", active: true },
];

/** EX-2042 report download card */
function ReportCard({ onDownload }: { onDownload: () => void }) {
  return (
    <div className="bg-surface-container-lowest p-6 rounded-xl border border-surface-variant">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-primary text-[24px]">description</span>
        </div>
        <div className="flex-1">
          <h3 className="font-headline-md text-on-surface">EX-2042</h3>
          <p className="text-body-md text-on-surface-variant mt-1">
            รายงานสรุปคาร์บอนเครดิต — แสดงภาพรวมการลดการปล่อยก๊าซเรือนกระจกในพื้นที่ที่รับผิดชอบ
          </p>
          <div className="flex gap-4 mt-3 text-label-sm text-on-surface-variant">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">calendar_today</span>
              อัปเดตล่าสุด: {new Date().toLocaleDateString("th-TH")}
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">file_download</span>
              รูปแบบ: CSV
            </span>
          </div>
          <Button
            variant="primary"
            size="sm"
            className="mt-4 rounded-full"
            onClick={onDownload}
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            ดาวน์โหลดรายงาน
          </Button>
        </div>
      </div>
    </div>
  );
}

/** Certificate listing table */
function CertificateTable({ certificates }: { certificates: Certificate[] }) {
  if (certificates.length === 0) {
    return (
      <div className="bg-surface-container-lowest p-8 rounded-xl text-center">
        <span className="material-symbols-outlined text-48 text-on-surface-variant mb-3">verified</span>
        <h3 className="text-headline-sm text-on-surface">ยังไม่มีใบรับรอง</h3>
        <p className="text-body-md text-on-surface-variant mt-1">
          ใบรับรอง TVER จะปรากฏเมื่อคาร์บอนเครดิตได้รับการตรวจสอบและออกใบรับรองแล้ว
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest rounded-xl overflow-hidden">
      <div className="p-4 border-b border-surface-variant">
        <h3 className="font-headline-md text-on-surface">ใบรับรอง TVER</h3>
        <p className="text-label-md text-on-surface-variant mt-1">
          รายการใบรับรองคาร์บอนเครดิตที่ออกให้ในพื้นที่ของท่าน
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-body-md">
          <thead>
            <tr className="bg-surface-container">
              <th className="text-left px-4 py-2 text-label-md text-on-surface-variant font-medium">หมายเลขใบรับรอง</th>
              <th className="text-left px-4 py-2 text-label-md text-on-surface-variant font-medium">ฤดูกาล</th>
              <th className="text-right px-4 py-2 text-label-md text-on-surface-variant font-medium">ปริมาณ (tCO2e)</th>
              <th className="text-center px-4 py-2 text-label-md text-on-surface-variant font-medium">สถานะ</th>
              <th className="text-left px-4 py-2 text-label-md text-on-surface-variant font-medium">วันที่ออก</th>
            </tr>
          </thead>
          <tbody>
            {certificates.map((cert) => {
              const statusInfo = CERT_STATUS[cert.status] ?? { label: cert.status, color: "text-on-surface-variant" };
              return (
                <tr key={cert.id} className="border-t border-surface-variant/50 hover:bg-surface-container/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-on-surface">{cert.certificate_number}</td>
                  <td className="px-4 py-3 text-on-surface-variant">{cert.season_id}</td>
                  <td className="px-4 py-3 text-right text-primary font-medium">{cert.volume_tco2e.toLocaleString("en-US")}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 text-label-sm px-2 py-0.5 rounded-full ${statusInfo.color} bg-surface-container`}>
                      {statusInfo.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant">
                    {cert.issued_at ? new Date(cert.issued_at).toLocaleDateString("th-TH") : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function SponsorReportsPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [profile, setProfile] = useState<SponsorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [certData, profileData] = await Promise.all([
        fetchJson<{ certificates: Certificate[] }>("/sponsor/certificates", { certificates: [] }),
        fetchJson<SponsorProfile>("/sponsor/me", null as unknown as SponsorProfile),
      ]);
      if (!cancelled) {
        setCertificates(certData.certificates ?? []);
        setProfile(profileData);
        setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const handleDownload = () => {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE;
    const url = apiBase ? validateApiUrl(`${apiBase}/sponsor/reports/EX-2042/download`) : "/sponsor/reports/EX-2042/download";
    const a = document.createElement("a");
    a.href = url;
    a.download = `EX-2042-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const userName = profile?.user?.name ?? profile?.user?.email ?? "ผู้สนับสนุน";
  const userEmail = profile?.user?.email ?? "sponsor@netzerocarbon.com";

  return (
    <>
      <DashboardSidebar
        entries={sidebarEntries}
        userName={userName}
        userEmail={userEmail}
        brand="NetZero"
      />
      <DashboardHeader userLabel={userName} searchPlaceholder="ค้นหา..." />

      <div className="dashboard-main">
        <main className="relative pt-20 min-h-screen bg-surface px-6 lg:px-10 py-6">
          <div className="flex flex-col w-full relative">
            <PdpaNotice />

            <div className="mb-6 relative z-10">
              <h1 className="text-display-lg text-on-surface">รายงานและใบรับรอง</h1>
              <p className="text-body-lg text-on-surface-variant mt-2">
                ดาวน์โหลดรายงาน EX-2042 และดูรายการใบรับรองคาร์บอนเครดิต TVER
              </p>
            </div>

            {loading ? (
              <div className="bg-surface-container p-6 rounded-xl">
                <p className="text-on-surface-variant">กำลังโหลดข้อมูล...</p>
              </div>
            ) : (
              <div className="flex flex-col gap-6 relative z-10">
                {/* Reports Section */}
                <section>
                  <h2 className="text-headline-lg text-on-surface mb-4">รายงาน</h2>
                  <ReportCard onDownload={handleDownload} />
                </section>

                {/* Certificates Section */}
                <section>
                  <h2 className="text-headline-lg text-on-surface mb-4">ใบรับรอง</h2>
                  <CertificateTable certificates={certificates} />
                </section>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
