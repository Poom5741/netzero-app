"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import { PdpaNotice } from "@/components/sponsor/pdpa-notice";
import { Badge } from "@/components/ui/badge";
import { Tag } from "@/components/ui/tag";
import { DataTable } from "@/components/ui/data-table";
import {
  CERT_STATUS,
  formatTons,
  type Certificate,
  type SponsorProfile,
} from "@/lib/sponsor";

/**
 * SP-REPORT SponsorReports — spec 017 sponsor-design-spec.md:603-640 + sponsor-artifact.json
 * SP-REPORT. Restyle only: ALL live API wiring (SSRF-guarded XHR fetchers,
 * /sponsor/certificates + /sponsor/me state, CERT_STATUS vocab, the EX-2042
 * download handler, sidebar/header props, loading state) is preserved verbatim
 * (R-025); the sponsor session gate stays in app/sponsor/layout.tsx (untouched,
 * R-026). PdpaNotice stays on the page (component doc: every sponsor screen).
 * Artifact structure: PageTitle (artifact copy verbatim, R-028) + Section with the
 * available-reports DataTable (name + note, Tag tone=teal format, scope,
 * right-aligned outline download Button) + Section with the issued-certificates
 * DataTable (id, season, tCO₂eq right, status Badge, issued date).
 * Ambiguity decisions (minimal-fidelity, cited):
 * - Tag format shows CSV (the live download streams a .csv, reports/page.tsx
 *   handleDownload) — the artifact XLSX is sample documentation; no mislabeling
 *   of the live artefact (R-025).
 * - The artifact download control is iconLeft={<Icon name="download" .../>}; the
 *   lucide Icon sprite is the documented asset gap (R-027 unknown #3, reversible
 *   alternative lucide-react is NOT a dependency and no new deps are allowed) —
 *   the existing material-symbols pipeline ships inside the outline Button (the
 *   slice-A precedent), right-aligned via the column align prop.
 * - Status Badge tones map the live CERT_STATUS vocab: verified -> success,
 *   retired -> danger, pending -> warning (artifact SP-REPORT tokensUsed lists
 *   status-success/warning; danger for retirement); unknown statuses -> neutral.
 * - Section titles keep the live headings (รายงาน / ใบรับรอง) — the artifact
 *   defines no section-title copy for SP-REPORT (R-028 governs artifact copy only).
 */

const PRIVATE_IP_PREFIXES = ["10.", "172.", "192.168."];

function validateApiUrl(url: string): string {
  const parsed = new URL(url);
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Invalid API URL protocol: " + parsed.protocol);
  }
  const h = parsed.hostname;
  if (
    h === "localhost" || h === "127.0.0.1" || h === "0.0.0.0" || h === "::1" ||
    h.endsWith(".local") || PRIVATE_IP_PREFIXES.some((p) => h.startsWith(p))
  ) {
    throw new Error("SSRF blocked: internal host " + h);
  }
  return url;
}

function fetchJson<T>(path: string, fallback: T): Promise<T> {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "https://netzero-carbon-poc.poom-a1d.workers.dev";
  const endpoint = apiBase ? validateApiUrl(apiBase + path) : path;
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

// R-002 (sponsor-design-spec §5): the artifact sponsor NAV groups รายงานและใบรับรอง
// under the label-only เอกสาร divider (intentional — NO document screen). The live
// DashboardSidebar entries contract has no divider branch; untouched here (see
// SP-OV comment; T-501 lands the shared nav source).

// The sponsor-visible report set: EXPORTS filtered to who.includes(ลูกค้า)
// yields EX-2042 only (artifact fixtures). The live download endpoint is wired
// below (handleDownload, R-025).
const SPONSOR_REPORTS = [
  {
    id: "EX-2042",
    name: "สรุปเครดิตประมาณการรายฤดู",
    note: "รายงานสรุปคาร์บอนเครดิต — แสดงภาพรวมการลดการปล่อยก๊าซเรือนกระจกในพื้นที่ที่รับผิดชอบ",
    fmt: "CSV",
    scope: "รายพื้นที่ · รายฤดู",
  },
];

function certBadgeTone(status: string): "success" | "warning" | "danger" | "neutral" {
  if (status === "verified") return "success";
  if (status === "pending") return "warning";
  if (status === "retired") return "danger";
  return "neutral";
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
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || "https://netzero-carbon-poc.poom-a1d.workers.dev";
    const url = apiBase ? validateApiUrl(apiBase + "/sponsor/reports/EX-2042/download") : "/sponsor/reports/EX-2042/download";
    const a = document.createElement("a");
    a.href = url;
    a.download = "EX-2042-" + new Date().toISOString().slice(0, 10) + ".csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const userName = profile?.user?.name ?? profile?.user?.email ?? "ผู้สนับสนุน";
  const userEmail = profile?.user?.email ?? "sponsor@netzero.com";

  return (
    <>
      <DashboardSidebar
        entries={sidebarEntries}
        userName={userName}
        userEmail={userEmail}
        brand="NetZero"
      />
      <DashboardHeader role="sponsor" userLabel={userName} searchPlaceholder="ค้นหา..." />

      <div className="dashboard-main">
        <main className="relative pt-20 min-h-screen bg-surface px-6 lg:px-10 py-6">
          <div className="flex flex-col w-full relative gap-6">
            {/* PageTitle — artifact copy verbatim (sponsor-artifact.json SP-REPORT
                copy; R-028). */}
            <PageTitle
              eyebrow="รายงาน"
              title="ไฟล์ที่บริษัทของท่านดาวน์โหลดได้"
              sub="ขอบเขตจำกัดอยู่ที่พื้นที่ที่ท่านสนับสนุน · ทุกไฟล์ใช้ CPA code แทนชื่อ"
            />

            {/* PdpaNote (existing component, every sponsor screen) */}
            <PdpaNotice />

            {loading ? (
              <div className="bg-surface-container p-6 rounded-xl">
                <p className="text-on-surface-variant">กำลังโหลดข้อมูล...</p>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {/* Available reports — artifact columns: name (bold + note line),
                    fmt Tag tone=teal, scope, right-aligned outline download
                    Button (ดาวน์โหลด, :626). */}
                <Section title="รายงาน" ariaLabel="รายงานที่ดาวน์โหลดได้">
                  <DataTable
                    columns={
                      [
                        { key: "name", header: "รายงาน" },
                        { key: "fmt", header: "รูปแบบ" },
                        { key: "scope", header: "ขอบเขต" },
                        { key: "a", header: "", align: "right" },
                      ]
                    }
                    rows={
                      SPONSOR_REPORTS.map((r) => ({
                        name: (
                          <span>
                            <span className="block font-semibold" style={{ color: "var(--text-heading)" }}>
                              {r.id} · {r.name}
                            </span>
                            <span className="block text-xs" style={{ color: "var(--text-muted)" }}>
                              {r.note}
                            </span>
                          </span>
                        ),
                        fmt: <Tag tone="teal">{r.fmt}</Tag>,
                        scope: r.scope,
                        a: (
                          <Button variant="outline" size="sm" onClick={handleDownload}>
                            <span className="material-symbols-outlined text-[14px]" aria-hidden="true">download</span>
                            ดาวน์โหลด
                          </Button>
                        ),
                      }))
                    }
                    rowKey={(row, i) => String(SPONSOR_REPORTS[i]?.id ?? i)}
                  />
                </Section>

                {/* Issued certificates — artifact columns (:631-637): id, season,
                    tCO₂eq right, status Badge, issued date. Live CERT_STATUS
                    vocab maps to Badge tones (cited above). */}
                <Section
                  title="ใบรับรอง"
                  sub="รายการใบรับรองคาร์บอนเครดิตที่ออกให้ในพื้นที่ของท่าน"
                  ariaLabel="ใบรับรอง"
                >
                  {certificates.length === 0 ? (
                    <div className="text-center p-8">
                      <span className="material-symbols-outlined text-48 text-on-surface-variant mb-3">verified</span>
                      <h3 className="text-headline-sm text-on-surface">ยังไม่มีใบรับรอง</h3>
                      <p className="text-body-md text-on-surface-variant mt-1">
                        ใบรับรอง TVER จะปรากฏเมื่อคาร์บอนเครดิตได้รับการตรวจสอบและออกใบรับรองแล้ว
                      </p>
                    </div>
                  ) : (
                    <DataTable
                      columns={
                        [
                          { key: "id", header: "เลขที่ใบรับรอง" },
                          { key: "season", header: "ฤดู" },
                          { key: "vol", header: "tCO₂eq", align: "right" },
                          { key: "status", header: "สถานะ" },
                          { key: "d", header: "วันที่ออก" },
                        ]
                      }
                      rows={certificates.map((cert) => ({
                        id: cert.certificate_number,
                        season: cert.season_id,
                        vol: formatTons(cert.volume_tco2e),
                        status: (
                          <Badge tone={certBadgeTone(cert.status)}>
                            {CERT_STATUS[cert.status]?.label ?? cert.status}
                          </Badge>
                        ),
                        d: cert.issued_at ? new Date(cert.issued_at).toLocaleDateString("th-TH") : "—",
                      }))}
                      rowKey={(row) => String(row.id)}
                    />
                  )}
                </Section>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}

// ── PageTitle — page-local pattern (DECIDED O-6), SP-OV/SP-REPORT geometry
// (sponsor-design-spec.md:504-510): eyebrow --text-accent (both names carry the
// same artifact value as --teal-600); title --text-3xl = 38px light --text-heading
// --tracking-display; sub --text-sm --text-muted.

function PageTitle({ eyebrow, title, sub }: { eyebrow: string; title: string; sub: string }) {
  return (
    <div>
      <p
        className="text-xs font-semibold uppercase"
        style={{ color: "var(--text-accent)", letterSpacing: "var(--tracking-eyebrow)", marginBottom: "var(--space-1)" }}
      >
        {eyebrow}
      </p>
      <h1
        style={{ fontSize: "38px", fontWeight: "var(--weight-light)", color: "var(--text-heading)", lineHeight: 1.25, letterSpacing: "var(--tracking-display)", margin: 0 }}
      >
        {title}
      </h1>
      <p className="text-sm" style={{ color: "var(--text-muted)", marginTop: "var(--space-2)", maxWidth: "72ch" }}>
        {sub}
      </p>
    </div>
  );
}

// ── Section — page-local pattern (DECIDED O-6), SP-REPORT geometry
// (sponsor-design-spec.md:542-548; artifact geometry.sectionRadius 16px,
// sectionPadding 24px, sectionHeaderPadding 20px 24px): header padding
// --space-5 --space-6; title --text-md (18px) semibold; sub --text-xs
// --text-subtle; body padding --space-6.

function Section({
  title,
  sub,
  children,
  ariaLabel,
}: {
  title?: string;
  sub?: string;
  children: ReactNode;
  ariaLabel?: string;
}) {
  return (
    <section
      aria-label={ariaLabel}
      style={{
        background: "var(--surface-card)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-card)",
        boxShadow: "var(--shadow-xs)",
        overflow: "hidden",
      }}
    >
      {title ? (
        <div
          style={{
            padding: "var(--space-5) var(--space-6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: "var(--weight-semibold)", color: "var(--text-heading)", margin: 0 }}>
              {title}
            </h2>
            {sub ? (
              <p className="text-xs" style={{ color: "var(--text-subtle)", margin: "3px 0 0" }}>
                {sub}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
      <div style={{ padding: "var(--space-6)" }}>{children}</div>
    </section>
  );
}
