/**
 * Shared helpers for integration tests.
 * Provides an in-memory D1 mock, mock R2, and a test app builder.
 */
import { Hono } from "hono";
import { createSessionCookie } from "../../src/auth/session";

// ── Types ──────────────────────────────────────────────────────────

type Row = Record<string, unknown>;

type MockStatement = {
  bind: (...args: unknown[]) => {
    run: () => Promise<{ success: boolean }>;
    first: <T = Row>() => Promise<T | null>;
    all: <T = Row>() => Promise<{ results: T[] }>;
  };
};

type MockDB = {
  store: Map<string, Row[]>;
  prepare: (sql: string) => MockStatement;
};

type MockR2 = {
  stored: Map<string, unknown>;
  put: (key: string, body: unknown) => Promise<void>;
  get: (key: string) => Promise<unknown>;
};

type AppBindings = {
  DB: MockDB;
  R2: MockR2;
  ENVIRONMENT: string;
  SECRET: string;
};

// ── In-memory D1 mock ──────────────────────────────────────────────

export function createMockDB(): MockDB {
  const store = new Map<string, Row[]>();

  function ensureTable(name: string): Row[] {
    if (!store.has(name)) store.set(name, []);
    const table = store.get(name);
    if (!table) throw new Error(`Table ${name} not found`);
    return table;
  }

  function runInsert(sql: string, args: unknown[]): { success: boolean } {
    const m = sql.match(/INSERT\s+(?:OR\s+IGNORE\s+)?INTO\s+(\w+)/i);
    if (!m?.[1]) return { success: false };
    const table = m[1];
    const cols = extractColumns(sql);
    const row: Row = {};
    cols.forEach((col, i) => {
      row[col] = args[i] ?? null;
    });
    ensureTable(table).push(row);
    return { success: true };
  }

  function runUpdate(sql: string, args: unknown[]): { success: boolean } {
    const m = sql.match(/UPDATE\s+(\w+)\s+SET\s+(.+?)\s+WHERE/i);
    if (!m?.[1] || !m?.[2]) return { success: false };
    const table = m[1];
    const setParts = m[2].split(",").map((s) => {
      const eq = s.trim().split("=");
      return eq[0]?.trim() ?? "";
    });
    const whereMatch = sql.match(/WHERE\s+(\w+)\s*=\s*\?/i);
    const whereCol = whereMatch?.[1];
    const setCount = setParts.length;
    const whereVal = args[setCount];

    const rows = ensureTable(table);
    let count = 0;
    for (const row of rows) {
      if (whereCol && row[whereCol] === whereVal) {
        setParts.forEach((col, i) => {
          row[col] = args[i];
        });
        count++;
      }
    }
    return { success: count > 0 };
  }

  function runSelectFirst<T = Row>(sql: string, args: unknown[]): T | null {
    const m = sql.match(/FROM\s+(\w+)/i);
    if (!m?.[1]) return null;
    const table = m[1];
    const rows = ensureTable(table);
    let filtered = rows;
    if (sql.includes("WHERE") && args.length > 0) {
      const whereMatch = sql.match(/WHERE\s+(.+?)(?:\s+ORDER|\s+GROUP|\s+LIMIT|$)/i);
      if (whereMatch?.[1]) {
        const conditions = whereMatch[1]
          .split(/\s+AND\s+/i)
          .map((c) =>
            c
              .trim()
              .split(/\s*=\s*/)[0]
              ?.trim(),
          )
          .filter((c): c is string => Boolean(c));
        filtered = rows.filter((row) => conditions.every((col, i) => row[col] === args[i]));
      }
    }
    return (filtered[0] as T) ?? null;
  }

  function runSelectAll<T = Row>(sql: string, args: unknown[]): { results: T[] } {
    const m = sql.match(/FROM\s+(\w+)/i);
    if (!m?.[1]) return { results: [] };
    const table = m[1];
    const rows = ensureTable(table);
    let filtered = rows;
    if (sql.includes("WHERE") && args.length > 0) {
      const whereMatch = sql.match(/WHERE\s+(.+?)(?:\s+ORDER|\s+GROUP|\s+LIMIT|$)/i);
      if (whereMatch?.[1]) {
        const conditions = whereMatch[1]
          .split(/\s+AND\s+/i)
          .map((c) =>
            c
              .trim()
              .split(/\s*=\s*/)[0]
              ?.trim(),
          )
          .filter((c): c is string => Boolean(c));
        filtered = rows.filter((row) => conditions.every((col, i) => row[col] === args[i]));
      }
    }
    return { results: filtered as T[] };
  }

  return {
    store,
    prepare(sql: string): MockStatement {
      return {
        bind(...args: unknown[]) {
          return {
            run: () => {
              const upper = sql.toUpperCase();
              if (upper.startsWith("INSERT")) return Promise.resolve(runInsert(sql, args));
              if (upper.startsWith("UPDATE")) return Promise.resolve(runUpdate(sql, args));
              return Promise.resolve({ success: true });
            },
            first: <T = Row>() => Promise.resolve(runSelectFirst<T>(sql, args)),
            all: <T = Row>() => Promise.resolve(runSelectAll<T>(sql, args)),
          };
        },
      };
    },
  };
}

function extractColumns(sql: string): string[] {
  const m = sql.match(/INSERT\s+(?:OR\s+IGNORE\s+)?INTO\s+\w+\s*\(([^)]+)\)/i);
  if (!m?.[1]) return [];
  return m[1].split(",").map((c) => c.trim());
}

// ── Mock R2 ────────────────────────────────────────────────────────

export function createMockR2(): MockR2 {
  const stored = new Map<string, unknown>();
  return {
    stored,
    put: async (key: string, body: unknown) => {
      stored.set(key, body);
    },
    get: async (key: string) => stored.get(key) ?? null,
  };
}

// ── Test app builder ───────────────────────────────────────────────

/**
 * Build a Hono app with all routes mounted + mocks injected.
 */
export async function createTestApp(): Promise<{
  app: Hono;
  db: MockDB;
  r2: MockR2;
}> {
  const db = createMockDB();
  const r2 = createMockR2();

  const { healthRoutes } = await import("../../src/routes/health");
  const { photoRoutes } = await import("../../src/routes/photo");
  const { authRoutes } = await import("../../src/routes/auth");
  const { dashboardRoutes } = await import("../../src/routes/dashboard");
  const { sponsorRoutes } = await import("../../src/routes/sponsor");
  const { adminRoutes } = await import("../../src/routes/admin");
  const { seasonRoutes } = await import("../../src/routes/season");

  const app = new Hono();
  app.route("/", healthRoutes);
  app.route("/", photoRoutes);
  app.route("/", authRoutes);
  app.route("/", dashboardRoutes);
  app.route("/sponsor", sponsorRoutes);
  app.route("/", adminRoutes);
  app.route("/", seasonRoutes);

  app.notFound((c) => c.json({ error: "Not found" }, 404));

  const bindings: AppBindings = {
    DB: db as never,
    R2: r2 as never,
    ENVIRONMENT: "test",
    SECRET: "test-secret-key",
  };

  // Return app that injects bindings on each request
  const wrapped = new Hono();
  wrapped.all("/*", async (c) => {
    const req = c.req.raw;
    const url = new URL(req.url);
    return app.request(url.pathname + url.search, req, bindings as never);
  });

  return { app: wrapped, db, r2 };
}

// ── Session cookie helper ──────────────────────────────────────────

export function makeSessionCookie(role: "admin" | "sponsor", secret = "test-secret-key"): string {
  const data = { userId: `${role}-1`, role, email: `${role}@test.com` };
  const raw = createSessionCookie(data, secret);
  // extract value: Set-Cookie -> "nzc_session=<payload>.<sig>; Path=/..."
  // we need just "nzc_session=<payload>.<sig>"
  const cookiePair = raw.split(";")[0] ?? raw;
  return cookiePair;
}

// ── Seed helpers ───────────────────────────────────────────────────

export async function seedFarmer(db: MockDB, overrides?: Partial<Row>): Promise<Row> {
  const farmer = {
    id: overrides?.id ?? "farmer-1",
    full_name: overrides?.full_name ?? "Somchai Jaidee",
    phone: overrides?.phone ?? "0812345678",
    gender: "male",
    addr_province: "Chiang Mai",
    addr_district: "Mae Rim",
    addr_subdistrict: "Ban Pong",
    addr_village: "Moo 4",
    ...overrides,
  };
  await db
    .prepare(
      "INSERT OR IGNORE INTO farmers (id, full_name, phone, gender, addr_province, addr_district, addr_subdistrict, addr_village) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(
      farmer.id,
      farmer.full_name,
      farmer.phone,
      farmer.gender,
      farmer.addr_province,
      farmer.addr_district,
      farmer.addr_subdistrict,
      farmer.addr_village,
    )
    .run();
  return farmer;
}

export async function seedPlot(
  db: MockDB,
  farmerId: string,
  overrides?: Partial<Row>,
): Promise<Row> {
  const plot = {
    id: overrides?.id ?? `plot-${Date.now()}`,
    farmer_id: farmerId,
    plot_code: overrides?.plot_code ?? `P${Date.now()}`,
    deed_no: "12345",
    doc_type: "chanote",
    tenure: "owner",
    area_rai: 15,
    centroid_lat: 18.7883,
    centroid_lng: 98.9853,
    ...overrides,
  };
  await db
    .prepare(
      "INSERT OR IGNORE INTO plots (id, farmer_id, plot_code, deed_no, doc_type, tenure, area_rai, centroid_lat, centroid_lng) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(
      plot.id,
      plot.farmer_id,
      plot.plot_code,
      plot.deed_no,
      plot.doc_type,
      plot.tenure,
      plot.area_rai,
      plot.centroid_lat,
      plot.centroid_lng,
    )
    .run();
  return plot;
}

export async function seedPhoto(
  db: MockDB,
  plotId: string,
  seasonId: string,
  overrides?: Partial<Row>,
): Promise<Row> {
  const photo = {
    id: overrides?.id ?? `photo-${Date.now()}`,
    plot_id: plotId,
    season_id: seasonId,
    photo_url: overrides?.photo_url ?? `evidence/${overrides?.id ?? "photo-1"}.jpg`,
    gps_lat: 18.7883,
    gps_lng: 98.9853,
    gps_accuracy: 10,
    taken_at: new Date().toISOString(),
    ai_status: "pending",
    admin_status: "pending",
    photo_type: overrides?.photo_type ?? null,
    water_state: overrides?.water_state ?? null,
    pre_verified: overrides?.pre_verified ?? 0,
    audit_sample: overrides?.audit_sample ?? 0,
    superseded: overrides?.superseded ?? 0,
    ...overrides,
  };
  await db
    .prepare(
      "INSERT OR IGNORE INTO photo_evidence (id, plot_id, season_id, photo_url, gps_lat, gps_lng, gps_accuracy, taken_at, ai_status, admin_status, photo_type, water_state, pre_verified, audit_sample, superseded) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(
      photo.id,
      photo.plot_id,
      photo.season_id,
      photo.photo_url,
      photo.gps_lat,
      photo.gps_lng,
      photo.gps_accuracy,
      photo.taken_at,
      photo.ai_status,
      photo.admin_status,
      photo.photo_type,
      photo.water_state,
      photo.pre_verified,
      photo.audit_sample,
      photo.superseded,
    )
    .run();
  return photo;
}

export async function seedFertilizer(
  db: MockDB,
  plotId: string,
  seasonId: string,
  overrides?: Partial<Row>,
): Promise<Row> {
  const entry = {
    id: overrides?.id ?? `fert-${Date.now()}`,
    plot_id: plotId,
    season_id: seasonId,
    step: "base",
    formula: "46-0-0",
    rate_kg_per_rai: 12,
    percent_n: 46,
    nitrogen_kg_per_rai: 5.52,
    is_urea: 1,
    confirmed: 1,
    ...overrides,
  };
  await db
    .prepare(
      "INSERT OR IGNORE INTO fertilizer_entries (id, plot_id, season_id, step, formula, rate_kg_per_rai, percent_n, nitrogen_kg_per_rai, is_urea, confirmed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(
      entry.id,
      entry.plot_id,
      entry.season_id,
      entry.step,
      entry.formula,
      entry.rate_kg_per_rai,
      entry.percent_n,
      entry.nitrogen_kg_per_rai,
      entry.is_urea,
      entry.confirmed,
    )
    .run();
  return entry;
}

export async function seedSeasonInput(
  db: MockDB,
  plotId: string,
  seasonId: string,
  overrides?: Partial<Row>,
): Promise<Row> {
  const input = {
    id: overrides?.id ?? `si-${Date.now()}`,
    plot_id: plotId,
    season_id: seasonId,
    rice_variety: "KDML105",
    water_pre_plant: "flooded",
    water_management: "continuous",
    organic_material: "rice_straw",
    organic_rate_kg_per_rai: 500,
    lime_kg_per_rai: 200,
    fuel_liters_per_rai: 5,
    fuel_type: "diesel",
    electricity_kwh_per_rai: 10,
    straw_management: "incorporate",
    yield_kg_per_rai: 400,
    harvest_fuel_liters: 3,
    harvest_electricity_kwh: 5,
    status: "open",
    ...overrides,
  };
  await db
    .prepare(
      "INSERT OR IGNORE INTO season_inputs (id, plot_id, season_id, rice_variety, water_pre_plant, water_management, organic_material, organic_rate_kg_per_rai, lime_kg_per_rai, fuel_liters_per_rai, fuel_type, electricity_kwh_per_rai, straw_management, yield_kg_per_rai, harvest_fuel_liters, harvest_electricity_kwh, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(
      input.id,
      input.plot_id,
      input.season_id,
      input.rice_variety,
      input.water_pre_plant,
      input.water_management,
      input.organic_material,
      input.organic_rate_kg_per_rai,
      input.lime_kg_per_rai,
      input.fuel_liters_per_rai,
      input.fuel_type,
      input.electricity_kwh_per_rai,
      input.straw_management,
      input.yield_kg_per_rai,
      input.harvest_fuel_liters,
      input.harvest_electricity_kwh,
      input.status,
    )
    .run();
  return input;
}

export async function seedUser(db: MockDB, overrides?: Partial<Row>): Promise<Row> {
  const user = {
    id: overrides?.id ?? `user-${Date.now()}`,
    email: overrides?.email ?? "admin@test.com",
    password_hash: overrides?.password_hash ?? "placeholder-hash",
    role: overrides?.role ?? "admin",
    name: overrides?.name ?? "Test Admin",
    ...overrides,
  };
  await db
    .prepare(
      "INSERT OR IGNORE INTO users (id, email, password_hash, role, name) VALUES (?, ?, ?, ?, ?)",
    )
    .bind(user.id, user.email, user.password_hash, user.role, user.name)
    .run();
  return user;
}
