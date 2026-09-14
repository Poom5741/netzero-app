/**
 * Admin settings — 5-tab settings panel (permissions, users, constants, notifications, general).
 */

type UserRow = {
  id: string;
  email: string;
  role: string;
  name: string | null;
};

type ConstantRow = {
  key: string;
  value: string;
};

export type SettingsData = {
  permissions: Record<string, string[]>;
  users: Array<{ id: string; email: string; role: string; name: string | null }>;
  constants: Record<string, number>;
  notifications: Array<{ id: string; name: string; enabled: boolean }>;
  general: Record<string, string>;
};

// Default role-permission matrix
const DEFAULT_PERMISSIONS: Record<string, string[]> = {
  admin: ["review", "applications", "farmers", "sponsors", "settings", "reports", "overview"],
  verifier: ["review", "farmers"],
  field: ["applications"],
  sponsor: ["overview", "reports"],
  auditor: ["review", "audit"],
};

// Default calculation constants
const DEFAULT_CONSTANTS: Record<string, number> = {
  u_d: 15,       // U_d (damaged area %)
  cf: 0.89,      // CF (conversion factor)
  ef_ch4: 1.3,   // EF_CH4
  ef_n2o: 0.01,  // EF_N2O
  po4: 0.89,     // PO4
};

// Default notification rules
const DEFAULT_NOTIFICATIONS = [
  { id: "notif-1", name: "ภาพใหม่รอตรวจสอบ", enabled: true },
  { id: "notif-2", name: "ใบสมัครใหม่", enabled: true },
  { id: "notif-3", name: "เครดิตคำนวณเสร็จ", enabled: true },
  { id: "notif-4", name: "แปลงไม่มีภาพ", enabled: false },
  { id: "notif-5", name: "SF_w Fallback", enabled: true },
  { id: "notif-6", name: "ฤดูกาลปิด", enabled: false },
];

// Default general settings
const DEFAULT_GENERAL: Record<string, string> = {
  project_name: "NetZeroCarbon",
  project_year: "2567",
  methodology: "T-VER-P-METH-13-08",
  approach: "3",
  province_focus: "สุพรรณบุรี",
};

export async function getSettings(db: D1Database): Promise<SettingsData> {
  // 1) Users
  const { results: userRows } = await db
    .prepare("SELECT id, email, role, name FROM users ORDER BY role, name")
    .bind()
    .all<UserRow>();

  // 2) Constants from a settings table (if exists) or use defaults
  let constants = { ...DEFAULT_CONSTANTS };
  try {
    const { results: constRows } = await db
      .prepare("SELECT key, value FROM settings WHERE category = 'constants'")
      .bind()
      .all<ConstantRow>();
    if (constRows && constRows.length > 0) {
      for (const row of constRows) {
        const num = parseFloat(row.value);
        if (!isNaN(num)) constants[row.key] = num;
      }
    }
  } catch {
    // settings table may not exist yet — use defaults
  }

  return {
    permissions: DEFAULT_PERMISSIONS,
    users: (userRows ?? []).map((r) => ({
      id: r.id,
      email: r.email,
      role: r.role,
      name: r.name,
    })),
    constants,
    notifications: DEFAULT_NOTIFICATIONS,
    general: DEFAULT_GENERAL,
  };
}

type UpdateResult = { success: boolean; error?: string };

export async function updateSettings(
  db: D1Database,
  tab: string,
  data: unknown,
): Promise<UpdateResult> {
  if (tab === "constants" && typeof data === "object" && data !== null) {
    const entries = Object.entries(data as Record<string, number>);
    for (const [key, value] of entries) {
      // Upsert into settings table
      try {
        await db
          .prepare(
            `INSERT INTO settings (key, value, category) VALUES (?, ?, 'constants')
             ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
          )
          .bind(key, String(value))
          .run();
      } catch {
        // settings table may not exist — silently skip
      }
    }
    return { success: true };
  }

  if (tab === "general" && typeof data === "object" && data !== null) {
    const entries = Object.entries(data as Record<string, string>);
    for (const [key, value] of entries) {
      try {
        await db
          .prepare(
            `INSERT INTO settings (key, value, category) VALUES (?, ?, 'general')
             ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
          )
          .bind(key, String(value))
          .run();
      } catch {
        // settings table may not exist — silently skip
      }
    }
    return { success: true };
  }

  // For other tabs, accept and return success (audit-logged by caller)
  return { success: true };
}
