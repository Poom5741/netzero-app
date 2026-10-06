"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { DashboardSidebar as Sidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DataTable } from "@/components/ui/data-table";
import { PdpaNotice } from "@/components/sponsor/pdpa-notice";
import { formatTons, type ProvinceGroup, type PlotSummary, type SponsorProfile } from "@/lib/sponsor";

/**
 * SP-AREA SponsorAreas — spec 017 sponsor-design-spec.md:557-602 + sponsor-artifact.json
 * SP-AREA. Restyle only: ALL live API wiring (SSRF-guarded XHR fetchers with
 * withCredentials, provinces + /sponsor/me profile state, sidebar/header props,
 * loading/empty states) is preserved verbatim (R-025); the sponsor session gate
 * stays in app/sponsor/layout.tsx (untouched, R-026).
 * Artifact structure: PageTitle (artifact copy verbatim, R-028) + PdpaNote + one
 * pad={false} Section per province (title = province, sub = live stats line) each
 * with a DataTable + the photo gallery Section (4-col grid).
 * Live-set rule (R-025): artifact column geometry ships where live fields exist —
 * cpa (mono 12px bold), plot (mono 11.5px), rai (right, 2dp), photos (4 pills
 * 24x18px radius 3px, filled from the live provenance counts), er (right, 3dp).
 * OMITTED (disclosed): the artifact rice (พันธุ์ข้าว) and sfw (ตัวปรับการจัดการน้ำ)
 * columns have NO live PlotSummary field (lib/sponsor.ts:1-13) — rendering mock
 * values would invent data (R-015/R-025); the columns land with their API. The
 * live district column is dropped (not in the artifact table; province-level
 * location already in the section context); live water-state tallies stay as the
 * microcopy under the pills. Province sub: the artifact {note}/{households} parts
 * have no per-province live source (households exists only as a global summary
 * field) — the sub binds the live-derivable tail (แปลง/ไร่/ER). Gallery: the live
 * photo pipeline is not wired on this page, so the cards use the artifact
 * gradient-simulated field image (:601) with the artifact PHOTO_ROUNDS labels —
 * no placeholder PNG is fabricated (R-027) — and disclose the gap.
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
  // Sponsor pages run in the static Pages export — the Worker API lives on a
  // different origin, so fall back to it when NEXT_PUBLIC_API_BASE is unset.
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "https://netzero-carbon-poc.poom-a1d.workers.dev";
  const endpoint = apiBase ? validateApiUrl(apiBase + path) : path;
  return new Promise((resolve) => {
    try {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", endpoint);
      xhr.withCredentials = true;
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
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "https://netzero-carbon-poc.poom-a1d.workers.dev";
  const endpoint = apiBase ? validateApiUrl(apiBase + "/sponsor") : "/sponsor";
  return new Promise((resolve) => {
    try {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", endpoint);
      xhr.withCredentials = true;
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

// R-002 (sponsor-design-spec §5): the artifact sponsor NAV carries the label-only
// เอกสาร divider between รายแปลงในพื้นที่ and รายงานและใบรับรอง (intentional — NO
// document screen exists). The live DashboardSidebar entries contract has no
// divider branch; untouched here (see SP-OV comment; T-501 lands the shared nav).

const PHOTO_ROUNDS = [
  { code: "WET-1", name: "รอบที่ 1 · เปียก", phase: "wet", label: "เปียก" },
  { code: "DRY-1", name: "รอบที่ 1 · แห้ง", phase: "dry", label: "แห้ง" },
  { code: "WET-2", name: "รอบที่ 2 · เปียก", phase: "wet", label: "เปียก" },
  { code: "DRY-2", name: "รอบที่ 2 · แห้ง", phase: "dry", label: "แห้ง" },
] as const;

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
  const userEmail = profile?.user?.email ?? "sponsor@netzero.com";

  return (
    <>
      <Sidebar
        entries={sidebarEntries}
        userName={userName}
        userEmail={userEmail}
        brand="NetZero"
      />
      <DashboardHeader role="sponsor" userLabel={userName} searchPlaceholder="ค้นหาแปลง..." />

      <div className="dashboard-main">
        <main className="relative pt-20 min-h-screen bg-surface px-6 lg:px-10 py-6">
          <div className="flex flex-col w-full relative gap-6">
            {/* PageTitle — artifact copy verbatim (sponsor-artifact.json SP-AREA
                copy; R-028). */}
            <PageTitle
              eyebrow="พื้นที่ของท่าน"
              title="รายแปลงย่อยในพื้นที่ที่บริษัทของท่านสนับสนุน"
              sub="ระบุด้วย CPA code และรหัสแปลงย่อยเท่านั้น · ไม่มีชื่อ ไม่มีเลขโฉนด"
            />

            {/* PdpaNote (existing component, every sponsor screen) */}
            <PdpaNotice />

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
              <div className="flex flex-col gap-6">
                {groups.map((group) => (
                  <ProvinceSection key={group.province} group={group} />
                ))}

                {/* Photo gallery Section — artifact gradient-simulated tiles
                    (:601) + artifact PHOTO_ROUNDS labels; live photo pipeline
                    not wired on this page (disclosed in-card, R-025/R-027). */}
                <Section
                  title="ภาพถ่ายแปลงจากพื้นที่ของท่าน"
                  sub="CU-02 · ผูกภาพถ่ายแปลงเข้ากับตัวเลขเครดิต · ภาพไม่ระบุตัวบุคคล"
                  ariaLabel="ภาพถ่ายแปลง"
                >
                  <div className="flex flex-col gap-3">
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--space-3)" }}>
                      {PHOTO_ROUNDS.map((r) => (
                        <div
                          key={r.code}
                          style={{
                            borderRadius: "var(--radius-sm)",
                            overflow: "hidden",
                            border: "1px solid var(--border-subtle)",
                            background: "var(--surface-card)",
                          }}
                        >
                          <div
                            aria-hidden="true"
                            data-deferred="R-027"
                            style={{
                              aspectRatio: "4 / 3",
                              background: "linear-gradient(160deg, var(--navy-100) 0%, var(--teal-200) 55%, var(--teal-500) 100%)",
                            }}
                          />
                          <div style={{ padding: "7px 9px" }}>
                            <p className="text-xs font-semibold" style={{ color: "var(--text-heading)", margin: 0 }}>
                              {r.name}
                            </p>
                            <p style={{ fontSize: "11px", color: "var(--text-subtle)", margin: "2px 0 0", fontVariantNumeric: "tabular-nums" }}>
                              {r.code}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs" style={{ color: "var(--text-subtle)", margin: 0 }}>
                      หมายเหตุ: ภาพถ่ายจริงจากระบบหลักฐานยังไม่เชื่อมต่อกับหน้านี้ (R-025) — การ์ดแสดงตัวอย่างไล่เฉดสีแทนภาพตามงานออกแบบ (R-027)
                    </p>
                  </div>
                </Section>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}

// ── ProvinceSection — page-local, artifact Province Section (:563-570): pad={false}
// (the DataTable fills the section body), title = province name, sub = stats line.
// The artifact sub {note}/{households} parts have no per-province live source —
// the live-derivable tail (แปลง / ไร่ / ER) ships (R-025, disclosed above).

function ProvinceSection({ group }: { group: ProvinceGroup }) {
  const rai = group.plots.reduce((s, p) => s + (p.area_rai ?? 0), 0);
  const er = group.plots.reduce((s, p) => s + (p.total_offset_tco2e ?? 0), 0);
  return (
    <Section title={group.province} sub={group.plots.length + " แปลง · " + formatTons(rai) + " ไร่ · ER " + er.toFixed(3) + " tCO₂eq"} ariaLabel={group.province} pad={false}>
      <DataTable
        columns={
          [
            { key: "cpa", header: "CPA code" },
            { key: "plot", header: "แปลงย่อย" },
            { key: "rai", header: "ไร่", align: "right" },
            { key: "photos", header: "ภาพหลักฐาน" },
            { key: "er", header: "ER (tCO₂eq)", align: "right" },
          ]
        }
        rows={group.plots.map((p) => ({
          cpa: <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "12px", fontWeight: "var(--weight-semibold)", color: "var(--text-heading)" }}>{p.cpa_code}</span>,
          plot: <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "11.5px", color: "var(--text-body)" }}>{p.plot_code}</span>,
          rai: (p.area_rai ?? 0).toFixed(2),
          photos: <PhotoPills plot={p} />,
          er: (p.total_offset_tco2e ?? 0).toFixed(3),
        }))}
        rowKey={(row, i) => String(group.plots[i]?.plot_id ?? i)}
      />
    </Section>
  );
}

// ── PhotoPills — page-local, artifact photo badge geometry (:584-591): 4 pill
// badges 24x18px, radius 3px, fontSize 9px weight 700; filled = artifact phase
// inks (wet --navy-600 / dry --teal-600, white text), empty --grey-200 bg +
// --grey-500 text; Thai labels เปียก/แห้ง. Fill count binds the live approved
// evidence count (provenance machine+human, capped at 4 rounds); the live
// water-state tallies stay as the microcopy line (R-025).

function PhotoPills({ plot }: { plot: PlotSummary }) {
  const machine = plot.provenance_counts?.machine ?? 0;
  const human = plot.provenance_counts?.human ?? 0;
  const flooded = plot.water_state_tallies?.flooded ?? 0;
  const dry = plot.water_state_tallies?.dry ?? 0;
  const filled = Math.min(4, machine + human);
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex gap-1">
        {PHOTO_ROUNDS.map((r, i) => {
          const on = i < filled;
          return (
            <span
              key={r.code}
              title={r.name}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "24px",
                height: "18px",
                borderRadius: "3px",
                fontSize: "9px",
                fontWeight: "var(--weight-bold)",
                background: on ? (r.phase === "wet" ? "var(--navy-600)" : "var(--teal-600)") : "var(--grey-200)",
                color: on ? "var(--white)" : "var(--grey-500)",
              }}
            >
              {r.label}
            </span>
          );
        })}
      </div>
      {(flooded > 0 || dry > 0) && (
        <span style={{ fontSize: "10px", color: "var(--text-subtle)" }}>
          น้ำขัง:{flooded} · แห้ง:{dry}
        </span>
      )}
    </div>
  );
}

// ── PageTitle — page-local pattern (DECIDED O-6), SP-OV/SP-AREA geometry
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

// ── Section — page-local pattern (DECIDED O-6), SP-AREA geometry
// (sponsor-design-spec.md:542-548): header padding --space-5 --space-6; title
// --text-md (18px) semibold; sub --text-xs --text-subtle; body padding --space-6,
// or 0 when pad={false} (province tables fill the body, :564).

function Section({
  title,
  sub,
  children,
  pad = true,
  ariaLabel,
}: {
  title?: string;
  sub?: string;
  children: ReactNode;
  pad?: boolean;
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
      {pad ? <div style={{ padding: "var(--space-6)" }}>{children}</div> : children}
    </section>
  );
}
