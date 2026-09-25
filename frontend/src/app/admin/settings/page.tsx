"use client";

import { useAdminSessionGate } from "@/lib/use-session-gate";
import { useState, useEffect } from "react";
import { getSettings, updateSettings, type SettingsData } from "@/lib/api";
import { Button } from "@/components/ui/button";

type TabKey = "permissions" | "users" | "constants" | "notifications" | "general";

const tabs: { key: TabKey; label: string; icon: string }[] = [
  { key: "permissions", label: "สิทธิ์การเข้าถึง", icon: "admin_panel_settings" },
  { key: "users", label: "บัญชีผู้ใช้", icon: "people" },
  { key: "constants", label: "ค่าคำนวณ", icon: "calculate" },
  { key: "notifications", label: "การแจ้งเตือน", icon: "notifications" },
  { key: "general", label: "ทั่วไป", icon: "tune" },
];

const roleLabels: Record<string, string> = {
  admin: "แอดมิน",
  verifier: "ผู้ตรวจสอบ",
  field: "ภาคสนาม",
  sponsor: "ผู้สนับสนุน",
  auditor: "ผู้ตรวจทาน",
};

const permissionLabels: Record<string, string> = {
  review: "ตรวจสอบภาพ",
  applications: "ใบสมัคร",
  farmers: "เกษตรกร",
  sponsors: "ผู้สนับสนุน",
  settings: "ตั้งค่า",
  reports: "รายงาน",
  overview: "ภาพรวม",
  audit: "ประวัติ",
};

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
    <main className="pt-20 lg:pt-24 px-4 lg:px-10 pb-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="font-headline-lg text-headline-lg text-on-surface">ตั้งค่า</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            ตั้งค่าระบบ NetZeroCarbon
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 overflow-x-auto border-b border-outline-variant/20">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1 px-4 py-3 text-label-md font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
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

// ── Tab 1: Permissions Matrix ─────────────────────────────────────

function PermissionsTab({ settings }: { settings: SettingsData }) {
  const allPermissions = Object.values(settings.permissions).flat();
  const uniquePerms = [...new Set(allPermissions)].sort();

  return (
    <div className="card rounded-2xl overflow-hidden">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-outline-variant/20">
            <th className="px-4 py-3 text-label-md font-semibold text-on-surface">บทบาท</th>
            {uniquePerms.map((perm) => (
              <th key={perm} className="px-3 py-3 text-label-sm font-semibold text-on-surface text-center">
                {permissionLabels[perm] ?? perm}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.entries(settings.permissions).map(([role, perms]) => (
            <tr key={role} className="border-b border-outline-variant/10 last:border-0 hover:bg-surface-container-low/30 transition-colors">
              <td className="px-4 py-3 text-body-md text-on-surface font-medium">
                {roleLabels[role] ?? role}
              </td>
              {uniquePerms.map((perm) => (
                <td key={perm} className="px-3 py-3 text-center">
                  {perms.includes(perm) ? (
                    <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                  ) : (
                    <span className="material-symbols-outlined text-outline text-[18px]">cancel</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Tab 2: User Accounts ──────────────────────────────────────────

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
                  {roleLabels[user.role] ?? user.role}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Tab 3: Calculation Constants ──────────────────────────────────

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
    <div className="space-y-4">
      <div className="card rounded-2xl p-6">
        <h3 className="text-label-lg font-semibold text-on-surface mb-4">ค่าคำนวณเครดิตคาร์บอน</h3>
        <div className="space-y-4">
          {Object.entries(local).map(([key, value]) => (
            <div key={key} className="flex items-center gap-4">
              <label className="w-64 text-label-md text-on-surface-variant">
                {constantLabels[key] ?? key}
              </label>
              <input
                type="number"
                step="0.01"
                value={value}
                onChange={(e) => setLocal({ ...local, [key]: parseFloat(e.target.value) || 0 })}
                className="w-32 px-3 py-2 rounded-xl bg-surface-container-low text-body-md text-on-surface outline-none"
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

// ── Tab 4: Notification Rules ─────────────────────────────────────

function NotificationsTab({ settings }: { settings: SettingsData }) {
  return (
    <div className="card rounded-xl p-6">
      <h3 className="text-label-lg font-semibold text-on-surface mb-4">กฎการแจ้งเตือน</h3>
      <div className="space-y-3">
        {settings.notifications.map((notif) => (
          <div key={notif.id} className="flex items-center justify-between py-2 border-b border-outline-variant/10 last:border-0">
            <span className="text-body-md text-on-surface">{notif.name}</span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
              notif.enabled ? "bg-primary/10 text-primary" : "bg-surface-container-high text-on-surface-variant"
            }`}>
              {notif.enabled ? "เปิด" : "ปิด"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Tab 5: General Settings ───────────────────────────────────────

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
