"use client";

import { useAdminSessionGate } from "@/lib/use-session-gate";
import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { getSettings, updateSettings, type SettingsData } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Tag } from "@/components/ui/tag";

/**
 * AD-SETTINGS SettingsScreen — T-308 (admin-design-spec.md:440-456,
 * :712-727, :1040; admin-artifact.json screens/8). Restyle: page-local
 * PageTitle (DECIDED O-6) with artifact copy verbatim (R-028) + the 5
 * tabs (keys/state unchanged, labels now the artifact strings).
 * สิทธิ์การเข้าถึง: role cards (repeat(5,1fr), :713-714) with LIVE account
 * counts from settings.users, + the 15x5 permissions MATRIX table
 * (:446, th 11px 14px / td 9px 14px / lock margin-left 7px :715-717)
 * replacing the Record-checkbox grid; matrix CELLS bind the live
 * permission record only where a live key names the same capability
 * (overview/review/applications/reports/audit) — the other 10 artifact
 * rows have NO live counterpart and render "-" in every role column
 * (R-025: no invented permission semantics; footnote discloses). The
 * PDPA row (:446 lock icons) = เห็นชื่อ เบอร์ เลขบัตร เลขโฉนด.
 * ค่าคงที่การคำนวณ: two DataTables — Group A = LIVE constants (edit + save
 * wiring preserved verbatim), Group B = the artifact behaviour lookups
 * (admin-artifact.json calc fixture: SF_P / SF_W / CFOA), read-only with
 * no live API (disclosed). การแจ้งเตือน: live rows as toggle rows
 * (padding --space-4, :719) — display-only exactly like before; the
 * artifact per-item descriptions have no live field (disclosed). The
 * artifact versioning MockNote (:453) has no decoded text and is NOT
 * rendered (design documentation, R-025). Live getSettings/updateSettings
 * wiring, บัญชีผู้ใช้ and ทั่วไป tabs preserved verbatim (R-025/R-026).
 */

type TabKey = "permissions" | "users" | "constants" | "notifications" | "general";

const tabs: { key: TabKey; label: string; icon: string }[] = [
  { key: "permissions", label: "สิทธิ์การเข้าถึง", icon: "admin_panel_settings" },
  { key: "users", label: "บัญชีผู้ใช้", icon: "people" },
  { key: "constants", label: "ค่าคงที่การคำนวณ", icon: "calculate" },
  { key: "notifications", label: "การแจ้งเตือน", icon: "notifications" },
  { key: "general", label: "ทั่วไป", icon: "tune" },
];

// ── Artifact roles (admin-artifact.json screens/8 roles) — verbatim Thai
// names/who; ids match the live permission record keys 1:1. ──
const ARTIFACT_ROLES: Array<{ id: string; name: string; who: string; tone: "success" | "warning" | "danger" | "info" | "neutral" }> = [
  { id: "admin", name: "ผู้ดูแลระบบ", who: "ทีม NZC ส่วนกลาง", tone: "danger" },
  { id: "verifier", name: "เจ้าหน้าที่ทวนสอบ", who: "ทีมตรวจภาพและเอกสาร", tone: "info" },
  { id: "field", name: "เจ้าหน้าที่ภาคสนาม", who: "ผู้ประสานงานพื้นที่", tone: "success" },
  { id: "sponsor", name: "บัญชีลูกค้า", who: "บริษัทผู้สนับสนุน", tone: "neutral" },
  { id: "auditor", name: "ผู้ประเมินภายนอก", who: "VVB / อบก. · อ่านอย่างเดียว", tone: "warning" },
];

// ── The 15 artifact permission rows (:446; screens/8 permissions), verbatim.
// liveKey = the live settings.permissions key that names the SAME
// capability (overview=ภาพรวม dashboard / review=ตรวจสอบภาพ /
// applications=ใบสมัคร / reports=รายงาน / audit=ประวัติ). Rows without a
// live counterpart carry no liveKey and are rendered "-" everywhere
// (R-025 — no invented permission semantics). pdpa = the artifact lock
// row (:446, margin-left 7px :717). ──
const ARTIFACT_PERMISSIONS: Array<{ label: string; liveKey?: string; pdpa?: boolean }> = [
  { label: "ดูแดชบอร์ดรวมทุกพื้นที่", liveKey: "overview" },
  { label: "ดูเฉพาะพื้นที่ที่ได้รับมอบหมาย" },
  { label: "เห็นชื่อ เบอร์ เลขบัตร เลขโฉนด", pdpa: true },
  { label: "ตรวจและอนุมัติภาพหลักฐาน", liveKey: "review" },
  { label: "ตรวจและอนุมัติใบสมัคร", liveKey: "applications" },
  { label: "กรอกข้อมูลแทนเกษตรกร (BL-14)" },
  { label: "ตอบแชตแทนบอต (AD-12)" },
  { label: "นำเข้าข้อมูลเป็นชุด (AD-13)" },
  { label: "สั่งคำนวณเครดิตใหม่ (calc_run)" },
  { label: "แก้ค่าคงที่และตารางค้นค่า" },
  { label: "ส่งออกรายงานรายเกษตรกร", liveKey: "reports" },
  { label: "ส่งออกชุดยื่น Premium T-VER" },
  { label: "ดูและส่งออกรายงานของตัวเอง" },
  { label: "ดู audit log ทั้งระบบ", liveKey: "audit" },
  { label: "ตั้งค่าสิทธิ์ของบัญชีอื่น" },
];

// ── Group B behaviour lookups — REFERENCE data from the artifact calc
// fixture (admin-artifact.json calc: SF_P / SF_W / CFOA). Read-only; no
// live API exists (R-025 — disclosed in the tab, not wired). ──
const LOOKUP_ROWS: Array<{ table: string; code: string; label: string; value: string }> = [
  { table: "SF_P", code: "WP-1", label: "ขังน้ำก่อนปลูก > 30 วัน", value: "2.41" },
  { table: "SF_P", code: "WP-2", label: "ไม่ขังน้ำ < 180 วัน หรือขังน้ำสั้น ๆ < 30 วัน", value: "1.0" },
  { table: "SF_P", code: "WP-3", label: "ไม่มีการขังน้ำก่อนปลูก > 180 วัน", value: "0.68" },
  { table: "SF_P", code: "WP-4", label: "ไม่มีการขังน้ำก่อนปลูก > 365 วัน", value: "0.58" },
  { table: "SF_W", code: "WW-1", label: "ขังน้ำต่อเนื่องตลอดฤดู", value: "1.0" },
  { table: "SF_W", code: "WW-2", label: "ระบายน้ำ / ปล่อยแห้ง 1 ครั้ง", value: "0.71" },
  { table: "SF_W", code: "WW-3", label: "ปล่อยแห้งหลายครั้ง / เปียกสลับแห้ง (AWD)", value: "0.55" },
  { table: "CFOA", code: "OM-1", label: "ฟางไถกลบก่อนปลูก < 30 วัน", value: "1.0" },
  { table: "CFOA", code: "OM-2", label: "ฟางไถกลบก่อนปลูก > 30 วัน", value: "0.29" },
  { table: "CFOA", code: "OM-3", label: "ปุ๋ยหมัก / วัสดุอินทรีย์อื่น", value: "0.45" },
  { table: "CFOA", code: "OM-4", label: "ปุ๋ยคอก", value: "0.14" },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("permissions");
  const authed = useAdminSessionGate();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authed) return;
    queueMicrotask(() => setLoading(true));
    getSettings()
      .then(setSettings)
      .catch(() => setError("ไม่สามารถโหลดข้อมูลได้"))
      .finally(() => setLoading(false));
  }, [authed]);

  if (authed === null) return null;

  return (
    <main className="pt-14 lg:pt-14 px-4 lg:px-10 pb-10">
      <div className="max-w-[1400px] flex flex-col" style={{ gap: "var(--space-6)" }}>
        {/* PageTitle — artifact copy verbatim (R-028; screens/8 copy). */}
        <PageTitle
          eyebrow="ตั้งค่าระบบ"
          title="ตั้งค่าแอปและระดับสิทธิ์ของบัญชี"
          sub="ทุกการเปลี่ยนแปลงในหน้านี้ถูกบันทึกลง audit log พร้อมค่าก่อน-หลัง (AD-11)"
        />

        {/* Tabs — keys/state preserved; labels = artifact tab strings. */}
        <div className="flex gap-1 overflow-x-auto" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={activeTab === tab.key
                ? "flex items-center gap-1 px-4 py-3 text-label-md font-medium whitespace-nowrap border-b-2 border-primary text-primary"
                : "flex items-center gap-1 px-4 py-3 text-label-md font-medium whitespace-nowrap border-b-2 border-transparent text-on-surface-variant hover:text-on-surface"}
            >
              <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

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

        {!loading && !error && settings && activeTab === "permissions" && (
          <PermissionsTab settings={settings} />
        )}
        {!loading && !error && settings && activeTab === "users" && (
          <UsersTab settings={settings} />
        )}
        {!loading && !error && settings && activeTab === "constants" && (
          <ConstantsTab settings={settings} saving={saving} setSaving={setSaving} />
        )}
        {!loading && !error && settings && activeTab === "notifications" && (
          <NotificationsTab settings={settings} />
        )}
        {!loading && !error && settings && activeTab === "general" && (
          <GeneralTab settings={settings} saving={saving} setSaving={setSaving} />
        )}
      </div>
    </main>
  );
}

// ── Tab 1: Permissions — role cards + 15x5 matrix table (:445-446). ──

const matrixThStyle = {
  textAlign: "left" as const,
  background: "var(--grey-50)",
  padding: "11px 14px",
  fontSize: "var(--text-xs)",
  fontWeight: "var(--weight-semibold)",
  color: "var(--text-muted)",
  borderBottom: "1px solid var(--border-subtle)",
  whiteSpace: "nowrap" as const,
};

const matrixTdStyle = {
  padding: "9px 14px",
  borderBottom: "1px solid var(--grey-100)",
  color: "var(--text-body)",
};

function PermissionsTab({ settings }: { settings: SettingsData }) {
  return (
    <div className="flex flex-col" style={{ gap: "var(--space-5)" }}>
      {/* Role cards — repeat(5, 1fr), gap --space-3, padding --space-4
          (:713-714). n = LIVE account count from settings.users (R-025);
          the artifact mock counts (3/6/11/3/2) are not rendered. */}
      <div className="grid" style={{ gridTemplateColumns: "repeat(5, 1fr)", gap: "var(--space-3)" }}>
        {ARTIFACT_ROLES.map((role) => (
          <div
            key={role.id}
            style={{ border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "var(--space-4)" }}
          >
            <Badge tone={role.tone}>{role.name}</Badge>
            <p className="text-xs" style={{ color: "var(--text-muted)", marginTop: "var(--space-2)", marginBottom: 0 }}>
              {role.who}
            </p>
            <p className="text-sm font-semibold" style={{ color: "var(--text-heading)", marginTop: "var(--space-2)", marginBottom: 0 }}>
              {settings.users.filter((u) => u.role === role.id).length} บัญชี
            </p>
          </div>
        ))}
      </div>

      {/* Permissions matrix — 15 artifact rows x 5 role columns (:446).
          Geometry per :715-717 (th 11px 14px / td 9px 14px / lock 7px).
          Cells: live record membership for the 5 mapped rows; "-" for the
          unmapped rows (R-025 — no invented semantics). */}
      <div style={{ border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-card)", overflow: "hidden", background: "var(--surface-card)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--text-sm)" }}>
          <thead>
            <tr>
              <th scope="col" style={{ ...matrixThStyle, textAlign: "left" }}>สิทธิ์</th>
              {ARTIFACT_ROLES.map((role) => (
                <th key={role.id} scope="col" style={{ ...matrixThStyle, textAlign: "center" }}>
                  {role.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ARTIFACT_PERMISSIONS.map((perm) => (
              <tr key={perm.label}>
                <td style={{ ...matrixTdStyle }}>
                  {perm.label}
                  {perm.pdpa ? (
                    <span
                      className="material-symbols-outlined"
                      style={{ marginLeft: "7px", fontSize: "16px", color: "var(--status-warning)" }}
                      aria-label="ข้อมูลส่วนบุคคล (PDPA)"
                    >
                      lock
                    </span>
                  ) : null}
                </td>
                {ARTIFACT_ROLES.map((role) => (
                  <td key={role.id} style={{ ...matrixTdStyle, textAlign: "center" }}>
                    {perm.liveKey && (settings.permissions[role.id] ?? []).includes(perm.liveKey) ? (
                      <span
                        className="material-symbols-outlined"
                        style={{ color: "var(--teal-600)", fontSize: "16px" }}
                        aria-label="อนุญาต"
                      >
                        check_circle
                      </span>
                    ) : (
                      <span style={{ color: "var(--text-subtle)" }}>-</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs" style={{ color: "var(--text-muted)", margin: 0 }}>
        - = ยังไม่มีข้อมูลสิทธิ์นี้จากระบบจริง (R-025)
      </p>
    </div>
  );
}

// ── Tab 2: User Accounts — preserved verbatim (R-025) except the role
// tag label, which now uses the artifact role names (R-028). ──

function UsersTab({ settings }: { settings: SettingsData }) {
  return (
    <div className="card rounded-2xl overflow-hidden">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-outline-variant/20">
            <th className="px-4 py-3 text-label-md font-semibold text-on-surface">ชื่อ</th>
            <th className="px-4 py-3 text-label-md font-semibold text-on-surface">อีเมล</th>
            <th className="px-4 py-3 text-label-md font-semibold text-on-surface">บทบาท</th>
          </tr>
        </thead>
        <tbody>
          {settings.users.map((user) => (
            <tr key={user.id} className="border-b border-outline-variant/10 last:border-0 hover:bg-surface-container-low/30 transition-colors">
              <td className="px-4 py-3 text-body-md text-on-surface font-medium">{user.name ?? "-"}</td>
              <td className="px-4 py-3 text-body-md text-on-surface-variant">{user.email}</td>
              <td className="px-4 py-3">
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-medium">
                  {ARTIFACT_ROLES.find((r) => r.id === user.role)?.name ?? user.role}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Tab 3: Calculation Constants — two DataTables (:453). Group A = LIVE
// constants with the edit/save wiring preserved verbatim; Group B = the
// artifact behaviour lookups (reference data, read-only). ──

function ConstantsTab({
  settings,
  saving,
  setSaving,
}: {
  settings: SettingsData;
  saving: boolean;
  setSaving: (v: boolean) => void;
}) {
  const [local, setLocal] = useState(settings.constants);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings("constants", local);
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  const constantLabels: Record<string, string> = {
    u_d: "U_d (%) — พื้นที่เสียหาย",
    cf: "CF — ปัจจัยการเปลี่ยนแปลง",
    ef_ch4: "EF_CH4 — ปัจจัยการปล่อย CH4",
    ef_n2o: "EF_N2O — ปัจจัยการปล่อย N2O",
    po4: "PO4 — ปัจจัยอื่นๆ",
  };

  return (
    <div className="flex flex-col" style={{ gap: "var(--space-6)" }}>
      {/* Group A — LIVE constants (R-025): the artifact Group A table names
          IPCC constants with หน่วย/ที่มา columns that have no live source,
          so the live shape (label + editable value) is what ships. Edit +
          save wiring preserved verbatim (updateSettings("constants", local)). */}
      <Section title="กลุ่ม A — ค่าคงที่การคำนวณ (ค่าระบบ)">
        <div className="flex flex-col" style={{ gap: "var(--space-4)" }}>
          <DataTable
            columns={[
              { key: "k", header: "ค่าคงที่" },
              { key: "v", header: "ค่า", align: "right", width: 180 },
            ]}
            rows={Object.entries(local).map(([key, value]) => ({
              k: constantLabels[key] ?? key,
              v: (
                <input
                  type="number"
                  step="0.01"
                  value={value}
                  onChange={(e) => setLocal({ ...local, [key]: parseFloat(e.target.value) || 0 })}
                  style={{
                    width: "120px",
                    padding: "6px 10px",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border-subtle)",
                    background: "var(--white)",
                    color: "var(--text-body)",
                    textAlign: "right",
                  }}
                  aria-label={constantLabels[key] ?? key}
                />
              ),
            }))}
            rowKey={(_row, i) => Object.entries(local)[i][0]}
          />
          <div className="flex justify-end">
            <Button onClick={handleSave} loading={saving}>
              บันทึก
            </Button>
          </div>
        </div>
      </Section>

      {/* Group B — behaviour lookup tables (:453): artifact REFERENCE rows
          (admin-artifact.json calc fixture), read-only, no live API
          (R-025 — disclosed in the note below, wired to nothing). */}
      <Section title="กลุ่ม B — ตารางค้นพฤติกรรม (ค่าอ้างอิง)">
        <div className="flex flex-col" style={{ gap: "var(--space-3)" }}>
          <DataTable
            dense
            columns={[
              { key: "table", header: "ตาราง" },
              { key: "code", header: "รหัส" },
              { key: "label", header: "คำอธิบาย" },
              { key: "value", header: "ค่า", align: "right" },
            ]}
            rows={LOOKUP_ROWS.map((row) => ({
              table: <Tag tone="teal">{row.table}</Tag>,
              code: <span className="font-mono" style={{ fontSize: "12px" }}>{row.code}</span>,
              label: row.label,
              value: row.value,
            }))}
            rowKey={(_row, i) => LOOKUP_ROWS[i].table + ":" + LOOKUP_ROWS[i].code}
          />
          <p className="text-xs" style={{ color: "var(--text-muted)", margin: 0 }}>
            ค่าอ้างอิงจาก artifact — ยังไม่มี API เชื่อมต่อ
          </p>
        </div>
      </Section>
    </div>
  );
}

// ── Tab 4: Notification Rules — live rows as toggle rows (padding
// --space-4, :719). Display-only, exactly like the previous page (no
// persist API); the artifact per-item descriptions have no live field.

function NotificationsTab({ settings }: { settings: SettingsData }) {
  return (
    <Section title="การแจ้งเตือน">
      <div>
        {settings.notifications.map((notif, i) => (
          <div
            key={notif.id}
            className="flex items-center justify-between"
            style={{
              padding: "var(--space-4)",
              borderBottom: i === settings.notifications.length - 1 ? "none" : "1px solid var(--grey-100)",
            }}
          >
            <span className="text-body-md" style={{ color: "var(--text-body)" }}>{notif.name}</span>
            <span className="flex items-center" style={{ gap: "var(--space-2)" }}>
              <span
                aria-hidden="true"
                style={{
                  display: "inline-block",
                  position: "relative",
                  width: "40px",
                  height: "22px",
                  borderRadius: "var(--radius-pill)",
                  background: notif.enabled ? "var(--teal-600)" : "var(--grey-300)",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: "2px",
                    left: notif.enabled ? "20px" : "2px",
                    width: "18px",
                    height: "18px",
                    borderRadius: "var(--radius-pill)",
                    background: "var(--white)",
                    boxShadow: "var(--shadow-xs)",
                  }}
                />
              </span>
              <span className="text-xs" style={{ color: notif.enabled ? "var(--teal-700)" : "var(--text-muted)" }}>
                {notif.enabled ? "เปิด" : "ปิด"}
              </span>
            </span>
          </div>
        ))}
      </div>
      <p className="text-xs" style={{ color: "var(--text-muted)", marginTop: "var(--space-3)", marginBottom: 0 }}>
        รายการมาจากระบบจริง — คำอธิบายรายการของ artifact ไม่มีข้อมูลจริง (R-025)
      </p>
    </Section>
  );
}

// ── Tab 5: General Settings — preserved verbatim (R-025). ──

function GeneralTab({
  settings,
  saving,
  setSaving,
}: {
  settings: SettingsData;
  saving: boolean;
  setSaving: (v: boolean) => void;
}) {
  const [local, setLocal] = useState(settings.general);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings("general", local);
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  const generalLabels: Record<string, string> = {
    project_name: "ชื่อโครงการ",
    project_year: "ปีโครงการ",
    methodology: "วิธีการคำนวณ",
    approach: "วิธีการ Approach",
    province_focus: "จังหวัดหลัก",
  };

  return (
    <div className="space-y-4">
      <div className="card rounded-2xl p-6">
        <h3 className="text-label-lg font-semibold text-on-surface mb-4">ตั้งค่าทั่วไป</h3>
        <div className="space-y-4">
          {Object.entries(local).map(([key, value]) => (
            <div key={key} className="flex items-center gap-4">
              <label className="w-48 text-label-md text-on-surface-variant">
                {generalLabels[key] ?? key}
              </label>
              <input
                type="text"
                value={value}
                onChange={(e) => setLocal({ ...local, [key]: e.target.value })}
                className="flex-1 px-3 py-2 rounded-xl bg-surface-container-low text-body-md text-on-surface outline-none"
              />
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={handleSave} loading={saving}>
            บันทึก
          </Button>
        </div>
      </div>
    </div>
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
