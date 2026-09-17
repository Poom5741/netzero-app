import { Hono } from "hono";
import { describe, expect, it } from "vitest";
import { createSessionCookie } from "../../src/auth/session";
import { adminRoutes } from "../../src/routes/admin";

type Row = Record<string, unknown>;

function makeDb(options: { phoneExists?: boolean } = {}) {
  const store = new Map<string, Row[]>();
  const farmer = {
    id: "farmer_test",
    full_name: "Test Farmer",
    gender: "unspecified",
    phone: "0812345678",
    addr_province: null,
    addr_district: null,
    addr_subdistrict: null,
    addr_village: null,
    created_at: "2026-09-17T00:00:00.000Z",
    updated_at: "2026-09-17T00:00:00.000Z",
  };

  return {
    store,
    prepare(sql: string) {
      return {
        bind(...args: unknown[]) {
          return {
            first: async <T>() => {
              if (sql.includes("SELECT id FROM farmers WHERE phone = ?")) {
                return (options.phoneExists ? { id: "existing" } : null) as T | null;
              }
              if (sql.includes("SELECT id, full_name, gender, phone")) return farmer as T;
              return null;
            },
            run: async () => {
              if (sql.includes("INSERT INTO farmers")) {
                store.set("farmers", [farmer]);
              }
              if (sql.includes("automation_audit_log")) {
                store.set("automation_audit_log", [{ actor_id: args[1], action: "farmer.create" }]);
              }
              return { success: true };
            },
            all: async () => ({ results: [] }),
          };
        },
      };
    },
  };
}

async function makeApp() {
  const app = new Hono();
  app.route("/", adminRoutes);
  const cookie = await createSessionCookie(
    { userId: "admin-test", role: "admin", email: "admin@test.com" },
    "test-secret",
    false,
  );
  return { app, cookie };
}

describe("POST /api/admin/farmers", () => {
  it("requires admin authentication", async () => {
    const db = makeDb();
    const { app } = await makeApp();
    const response = await app.request("/api/admin/farmers", { method: "POST" }, {
      DB: db,
      SECRET: "test-secret",
    } as never);
    expect(response.status).toBe(401);
  });

  it("returns 400 for an invalid phone", async () => {
    const db = makeDb();
    const { app, cookie } = await makeApp();
    const response = await app.request(
      "/api/admin/farmers",
      {
        method: "POST",
        headers: { Cookie: cookie, "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: "Test Farmer", phone: "123" }),
      },
      { DB: db, SECRET: "test-secret" } as never,
    );
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ error: "Invalid phone format" });
  });

  it("returns 409 when the phone already exists", async () => {
    const db = makeDb({ phoneExists: true });
    const { app, cookie } = await makeApp();
    const response = await app.request(
      "/api/admin/farmers",
      {
        method: "POST",
        headers: { Cookie: cookie, "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: "Test Farmer", phone: "0812345678" }),
      },
      { DB: db, SECRET: "test-secret" } as never,
    );
    expect(response.status).toBe(409);
    expect(await response.json()).toMatchObject({ message: "เบอร์โทรศัพท์นี้ถูกใช้งานแล้ว" });
  });

  it("creates the farmer and writes an audit entry", async () => {
    const db = makeDb();
    const { app, cookie } = await makeApp();
    const response = await app.request(
      "/api/admin/farmers",
      {
        method: "POST",
        headers: { Cookie: cookie, "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: "Test Farmer", phone: "0812345678" }),
      },
      { DB: db, SECRET: "test-secret" } as never,
    );
    expect(response.status).toBe(201);
    expect(db.store.get("farmers")).toHaveLength(1);
    expect(db.store.get("automation_audit_log")).toHaveLength(1);
  });
});
