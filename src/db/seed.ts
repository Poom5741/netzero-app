/**
 * Seed D1 with demo data for the NetZeroCarbon POC.
 * Run: bun run src/db/seed.ts
 */

export type SeedResult = {
  farmers: number;
  plots: number;
  lineLinks: number;
  users: number;
  farmerPhones: string[];
  userRoles: string[];
};

type D1Like = {
  prepare: (sql: string) => {
    bind: (...args: unknown[]) => {
      run: () => Promise<{ success: boolean }>;
      first: () => Promise<unknown>;
    };
  };
  exec: (sql: string) => Promise<{ success: boolean }>;
};

const FARMERS = [
  {
    id: "farmer-001",
    full_name: "สมชาย ใจดี",
    gender: "male",
    phone: "0812345678",
    province: "เชียงใหม่",
    district: "สันทราย",
    subdistrict: "สันทรายหลวง",
    village: "บ้านสันทราย",
  },
  {
    id: "farmer-002",
    full_name: "สมหญิง รักโลก",
    gender: "female",
    phone: "0898765432",
    province: "เชียงราย",
    district: "เมือง",
    subdistrict: "ริมกก",
    village: "บ้านริมกก",
  },
  {
    id: "farmer-003",
    full_name: "ทดสอบ ทดลอง",
    gender: "unspecified",
    phone: "0999999999",
    province: "กรุงเทพ",
    district: "จตุจักร",
    subdistrict: "จันทรเกษม",
    village: "ทดสอบ",
  },
];

const PLOTS = [
  {
    id: "plot-001",
    farmerId: "farmer-001",
    code: "CM-001",
    deed: "12345",
    docType: "chanote",
    tenure: "owner",
    area: 15.5,
    lat: 18.82,
    lng: 98.98,
  },
  {
    id: "plot-004",
    farmerId: "farmer-001",
    code: "CM-002",
    deed: "12346",
    docType: "chanote",
    tenure: "owner",
    area: 8.0,
    lat: 18.83,
    lng: 98.99,
  },
  {
    id: "plot-002",
    farmerId: "farmer-002",
    code: "CR-001",
    deed: "67890",
    docType: "ns3k",
    tenure: "tenant",
    area: 22.0,
    lat: 19.91,
    lng: 100.08,
  },
  {
    id: "plot-003",
    farmerId: "farmer-003",
    code: "TEST-001",
    deed: "99999",
    docType: "chanote",
    tenure: "owner",
    area: 10.0,
    lat: 13.85,
    lng: 100.57,
  },
];

const SEASONS = [
  { id: "2568-napi", plotId: "plot-001", name: "นาปี 2568", status: "active" },
  { id: "2568-prang", plotId: "plot-001", name: "นาปรัง 2568", status: "closed" },
  { id: "2568-napi-p4", plotId: "plot-004", name: "นาปี 2568 (แปลง 2)", status: "active" },
];

const LINE_LINKS = [
  { id: "line-001", farmerId: "farmer-001", lineUserId: "U1234567890abcdef", status: "verified" },
  { id: "line-002", farmerId: "farmer-003", lineUserId: "UTESTFARMER000001", status: "verified" },
];

const USERS = [
  { id: "user-admin", email: "admin@netzero.local", role: "admin", name: "Admin User" },
  { id: "user-sponsor", email: "sponsor@netzero.local", role: "sponsor", name: "Sponsor User" },
];

async function insertFarmers(db: D1Like): Promise<string[]> {
  const phones: string[] = [];
  for (const f of FARMERS) {
    await db
      .prepare(
        `INSERT OR IGNORE INTO farmers (id, full_name, gender, phone, addr_province, addr_district, addr_subdistrict, addr_village)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(f.id, f.full_name, f.gender, f.phone, f.province, f.district, f.subdistrict, f.village)
      .run();
    phones.push(f.phone);
  }
  return phones;
}

async function insertPlots(db: D1Like): Promise<number> {
  let count = 0;
  for (const p of PLOTS) {
    await db
      .prepare(
        `INSERT OR IGNORE INTO plots (id, farmer_id, plot_code, deed_no, doc_type, tenure, area_rai, centroid_lat, centroid_lng)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(p.id, p.farmerId, p.code, p.deed, p.docType, p.tenure, p.area, p.lat, p.lng)
      .run();
    count++;
  }
  return count;
}

async function insertSeasons(db: D1Like): Promise<number> {
  let count = 0;
  for (const s of SEASONS) {
    await db
      .prepare(
        `INSERT OR IGNORE INTO seasons (id, plot_id, name, status)
         VALUES (?, ?, ?, ?)`,
      )
      .bind(s.id, s.plotId, s.name, s.status)
      .run();
    count++;
  }
  return count;
}

async function insertLineLinks(db: D1Like): Promise<number> {
  let count = 0;
  for (const l of LINE_LINKS) {
    await db
      .prepare(
        `INSERT OR IGNORE INTO line_links (id, farmer_id, line_user_id, status)
         VALUES (?, ?, ?, ?)`,
      )
      .bind(l.id, l.farmerId, l.lineUserId, l.status)
      .run();
    count++;
  }
  return count;
}

async function insertUsers(db: D1Like): Promise<string[]> {
  const roles: string[] = [];
  for (const u of USERS) {
    await db
      .prepare(
        `INSERT OR IGNORE INTO users (id, email, password_hash, role, name)
         VALUES (?, ?, ?, ?, ?)`,
      )
      .bind(u.id, u.email, "placeholder-hash", u.role, u.name)
      .run();
    roles.push(u.role);
  }
  return roles;
}

export async function seedData(db: D1Like): Promise<SeedResult> {
  const farmerPhones = await insertFarmers(db);
  const plots = await insertPlots(db);
  await insertSeasons(db);
  const lineLinks = await insertLineLinks(db);
  const userRoles = await insertUsers(db);

  return {
    farmers: FARMERS.length,
    plots,
    lineLinks,
    users: USERS.length,
    farmerPhones,
    userRoles,
  };
}

// CLI entry point
if (import.meta.main) {
  console.log("Seeding is only available via wrangler D1 bindings.");
  console.log("Use: bunx wrangler d1 execute netzero --local --command 'SELECT 1'");
}
