"use client";

import { useAdminSessionGate } from "@/lib/use-session-gate";
import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import {
  getSponsors,
  getProvinceTable,
  saveSponsorAreas,
  type SponsorItem,
  type ProvinceTableItem,
} from "@/lib/api";
import { Checkbox } from "@/components/ui/checkbox";

/**
 * AD-SPONSOR SponsorsScreen — T-307 (admin-design-spec.md:427-439, :1039;
 * admin-artifact.json screens/7). Restyle: page-local PageTitle (DECIDED
 * O-6) with artifact copy verbatim (R-028) + one Section per sponsor
 * (header: name + stats; body two-column: province-area checkboxes /
 * visibility-level checkboxes). Live wiring preserved (R-025/R-026):
 * session gate + getSponsors effect verbatim; getProvinceTable (existing
 * live getter) feeds the province checkbox OPTIONS (checked = the live
 * sponsor.areas membership). J4 ENABLER 2026-10-06: checkbox selection is
 * no longer local-state-only — a per-sponsor บันทึก action PUTs the
 * selection to /api/admin/sponsors/:id/areas and refreshes the live state.
 * Live-field deltas, disclosed (R-025): the artifact stats header
 * (households / ไร่ / verified) has no SponsorItem field — the header
 * binds the live fields (แปลง / เครดิต / จังหวัด); the visibility-level
 * checkbox group has NO artifact enumeration and NO live field, so it
 * ships as an explicitly-labelled deferred placeholder (R-015 pattern,
 * precedent admin/page.tsx) rather than with invented option labels; the
 * no-op ดูรายละเอียด button of the old card layout is dropped
 * (presentation-only).
 */

type SaveState = "idle" | "saving" | "saved" | "error";

export default function SponsorsPage() {
  const [sponsors, setSponsors] = useState<SponsorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const authed = useAdminSessionGate();
  const [provinces, setProvinces] = useState<ProvinceTableItem[]>([]);
  const [areaSelection, setAreaSelection] = useState<Record<string, string[]>>({});
  const [saveState, setSaveState] = useState<Record<string, SaveState>>({});

  useEffect(() => {
    if (!authed) return;
    queueMicrotask(() => setLoading(true));
    getSponsors()
      .then((data) => { setSponsors(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => { setError("ไม่สามารถโหลดข้อมูลได้"); setLoading(false); });
  }, [authed]);

  // Province checkbox OPTIONS — live getProvinceTable (existing getter);
  // checked state = live sponsor.areas until changed locally.
  useEffect(() => {
    if (!authed) return;
    getProvinceTable()
      .then((rows) => setProvinces(Array.isArray(rows) ? rows : []))
      .catch(() => setProvinces([]));
  }, [authed]);

  const provinceNames = [...new Set(provinces.map((p) => p.province))];

  async function handleSave(sponsor: SponsorItem) {
    const areas = areaSelection[sponsor.id] ?? sponsor.areas;
    setSaveState((prev) => ({ ...prev, [sponsor.id]: "saving" }));
    try {
      await saveSponsorAreas(sponsor.id, areas);
      // refresh live state so the stats header and checked boxes reflect D1
      setSponsors((prev) =>
        prev.map((s) => (s.id === sponsor.id ? { ...s, areas } : s)),
      );
      setSaveState((prev) => ({ ...prev, [sponsor.id]: "saved" }));
    } catch {
      setSaveState((prev) => ({ ...prev, [sponsor.id]: "error" }));
    }
  }

  if (authed === null) return null;

  return (
    <main className="pt-14 lg:pt-14 px-4 lg:px-10 pb-10">
      <div className="max-w-[1400px] flex flex-col" style={{ gap: "var(--space-6)" }}>
        {/* PageTitle — artifact copy verbatim (R-028; :431-433). */}
        <PageTitle
          eyebrow="F-65 · สิทธิ์ของลูกค้า"
          title="บริษัทผู้สนับสนุนและขอบเขตที่มองเห็นได้"
          sub="แอดมินเป็นผู้กำหนดว่าบัญชีลูกค้าเห็นพื้นที่ใดได้ · ลูกค้าไม่เห็นพื้นที่ของผู้สนับสนุนรายอื่น"
        />

        {loading && (
          <div className="card p-6 text-center rounded-xl">
            <div className="flex justify-center gap-2 mb-2">
              <div className="typing-dot w-3 h-3 rounded-full bg-primary" />
              <div className="typing-dot w-3 h-3 rounded-full bg-primary" />
              <div className="typing-dot w-3 h-3 rounded-full bg-primary" />
            </div>
            <p className="text-body-md text-on-surface-variant">กำลังโหลด...</p>
          </div>
        )}

        {error && (
          <div className="card p-6 text-center rounded-xl">
            <span className="material-symbols-outlined text-error text-4xl mb-2">error</span>
            <p className="text-body-md text-on-surface">{error}</p>
          </div>
        )}

        {!loading && !error && sponsors.length === 0 && (
          <div className="card p-6 text-center rounded-xl">
            <span className="material-symbols-outlined text-outline text-4xl mb-2">inbox</span>
            <p className="text-body-md text-on-surface-variant">ไม่มีผู้สนับสนุนในระบบ</p>
          </div>
        )}

        {!loading && !error && sponsors.length > 0 && (
          <div className="flex flex-col" style={{ gap: "var(--space-6)" }}>
            {sponsors.map((sponsor) => {
              const areas = areaSelection[sponsor.id] ?? sponsor.areas;
              return (
                <Section
                  key={sponsor.id}
                  title={sponsor.name}
                  /* Stats header — LIVE fields (R-025): the artifact
                     households / ไร่ / verified stats have no SponsorItem
                     source, so the header binds the live fields. */
                  actions={
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {sponsor.plot_count} แปลง · {sponsor.credit_total.toFixed(2)} tCO2e · {sponsor.areas.length} จังหวัด
                    </span>
                  }
                >
                  <div className="grid items-start" style={{ gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: "var(--space-6)" }}>
                    {/* Province-area checkbox group (:436) — live options;
                        J4 enabler: selection persists via the บันทึก action. */}
                    <div className="flex flex-col" style={{ gap: "var(--space-3)" }}>
                      <p className="text-sm font-semibold" style={{ color: "var(--text-heading)", margin: 0 }}>พื้นที่จังหวัดที่เห็นได้</p>
                      {provinceNames.length === 0 ? (
                        <span className="text-sm" style={{ color: "var(--text-muted)" }}>-</span>
                      ) : (
                        provinceNames.map((province) => (
                          <Checkbox
                            key={sponsor.id + ":" + province}
                            label={province}
                            checked={areas.includes(province)}
                            onChange={(checked) => {
                              setAreaSelection((prev) => {
                                const current = prev[sponsor.id] ?? sponsor.areas;
                                const next = checked
                                  ? [...new Set([...current, province])]
                                  : current.filter((a) => a !== province);
                                return { ...prev, [sponsor.id]: next };
                              });
                            }}
                          />
                        ))
                      )}
                      <div className="flex items-center" style={{ gap: "var(--space-3)", marginTop: "var(--space-2)" }}>
                        <button
                          type="button"
                          onClick={() => handleSave(sponsor)}
                          disabled={saveState[sponsor.id] === "saving"}
                          className="text-sm font-semibold rounded-lg bg-primary text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{ padding: "var(--space-2) var(--space-5)" }}
                        >
                          {saveState[sponsor.id] === "saving" ? "กำลังบันทึก..." : "บันทึกพื้นที่"}
                        </button>
                        {saveState[sponsor.id] === "saved" && (
                          <span className="text-xs text-primary">บันทึกแล้ว ✓</span>
                        )}
                        {saveState[sponsor.id] === "error" && (
                          <span className="text-xs text-error">บันทึกไม่สำเร็จ ลองใหม่</span>
                        )}
                      </div>
                    </div>

                    {/* Visibility-level checkbox group (:436) — deferred
                        placeholder (R-015): the artifact enumerates no
                        levels and no live field exists (R-025). */}
                    <div className="flex flex-col" style={{ gap: "var(--space-3)" }}>
                      <p className="text-sm font-semibold" style={{ color: "var(--text-heading)", margin: 0 }}>ระดับการมองเห็น</p>
                      <div
                        className="flex flex-col items-center justify-center text-center"
                        style={{ border: "1px dashed var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "var(--space-8) var(--space-6)", gap: "var(--space-2)" }}
                      >
                        <span className="text-xs font-semibold uppercase" style={{ color: "var(--text-muted)", letterSpacing: "var(--tracking-eyebrow)" }}>
                          DEFERRED — VISIBILITY LEVELS
                        </span>
                        <p className="text-sm" style={{ color: "var(--text-muted)", margin: 0 }}>
                          ระดับการมองเห็นของลูกค้ายังไม่มีข้อมูลจาก artifact และ API (R-015 deferred placeholder)
                        </p>
                      </div>
                    </div>
                  </div>
                </Section>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

// ── PageTitle — page-local pattern (DECIDED O-6). ──
// Geometry: admin-design-spec.md:504-510 (same as admin/page.tsx).

function PageTitle({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div>
      <p
        className="text-xs font-semibold uppercase"
        style={{ color: "var(--teal-600)", letterSpacing: "var(--tracking-eyebrow)", marginBottom: "var(--space-1)" }}
      >
        {eyebrow}
      </p>
      <h1
        style={{ fontSize: "38px", fontWeight: "var(--weight-light)", color: "var(--text-heading)", lineHeight: 1.25, margin: 0 }}
      >
        {title}
      </h1>
      {sub ? (
        <p className="text-sm" style={{ color: "var(--text-muted)", marginTop: "var(--space-2)", maxWidth: "72ch" }}>
          {sub}
        </p>
      ) : null}
    </div>
  );
}

// ── Section — page-local pattern (DECIDED O-6). ──
// Geometry: admin-design-spec.md:512-518 (same as admin/page.tsx).

function Section({ title, actions, children, pad = true }: { title: string; actions?: ReactNode; children: ReactNode; pad?: boolean }) {
  return (
    <section
      style={{
        background: "var(--surface-card)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-card)",
        boxShadow: "var(--shadow-xs)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "var(--space-4) var(--space-6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <h2 className="text-sm font-semibold" style={{ color: "var(--text-heading)", margin: 0 }}>
          {title}
        </h2>
        {actions}
      </div>
      {pad ? <div style={{ padding: "var(--space-6)" }}>{children}</div> : children}
    </section>
  );
}
