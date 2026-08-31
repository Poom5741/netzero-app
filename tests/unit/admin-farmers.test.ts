import { Hono } from "hono";
import { describe, expect, it } from "vitest";
import { createSessionCookie } from "../../src/auth/session";

const SECRET = "test-secret";

type Bindings = {
  DB: D1Database;
  SECRET: string;
};

function mockD1(farmers: Record<string, unknown>[] = []) {
  const store = [...farmers];
  return {
    store,
    db: {
      prepare(sql: string) {
        return {
          bind(...args: unknown[]) {
            return {
              run: async () => {
                if (sql.includes("UPDATE")) {
                  const id = args[args.length - 1];
                  const status = args[0];
                  const farmer = store.find(f => f.id === id) as Record<string, unknown> | undefined;
                  if (farmer) farmer.status = status;
                }
                return { success: true };
              },
              first: async <T>() => {
                if (sql.includes("WHERE id")) {
                  const id = args[0];
                  return (store.find(f => f.id === id) as T) ?? null;
                }
                return null;
              },
              all: async <T>() => {
                let results = [...store] as T[];
                if (sql.includes("WHERE status")) {
                  const status = args[0];
                  results = store.filter(f => f.status === status) as T[];
                }
                return { results };
              },
            };
          },
        };
      },
    } as unknown as D1Database,
  };
}

function adminHeaders() {
  const cookie = createSessionCookie({ userId: "admin-1", role: "admin", email: "admin@test.com" }, SECRET);
  const raw = cookie.split(";")[0]?.split("=").slice(1).join("=") ?? "";
  return { Cookie: `nzc_session=${raw}` };
}

function sponsorHeaders() {
  const cookie = createSessionCookie({ userId: "sponsor-1", role: "sponsor", email: "sponsor@test.com" }, SECRET);
  const raw = cookie.split(";")[0]?.split("=").slice(1).join("=") ?? "";
  return { Cookie: `nzc_session=${raw}` };
}

// We'll import the actual routes once implemented
// For now, build a minimal app that mounts admin farmer routes
async function buildApp(db: D1Database) {
  const { adminFarmerRoutes } = await import("../../src/routes/admin-farmers");
  const app = new Hono<{ Bindings: Bindings }>();
  app.use("*", async (c, next) => {
    c.env = { DB: db, SECRET } as never;
    await next();
  });
  app.route("/", adminFarmerRoutes);
  return app;
}

describe("GET /api/admin/farmers", () => {
  it("returns 401 without admin auth", async () => {
    const { db } = mockD1();
    const app = await buildApp(db);
    const res = await app.request("/api/admin/farmers");
    expect(res.status).toBe(401);
  });

  it("returns 401 for sponsor role", async () => {
    const { db } = mockD1();
    const app = await buildApp(db);
    const res = await app.request("/api/admin/farmers", { headers: sponsorHeaders() });
    expect(res.status).toBe(401);
  });

  it("returns pending farmers list", async () => {
    const farmers = [
      { id: "f1", full_name: "สมชาย", phone: "0811111111", status: "pending" },
      { id: "f2", full_name: "สมหญิง", phone: "0822222222", status: "approved" },
      { id: "f3", full_name: "สมศักดิ์", phone: "0833333333", status: "pending" },
    ];
    const { db } = mockD1(farmers);
    const app = await buildApp(db);
    const res = await app.request("/api/admin/farmers", { headers: adminHeaders() });
    expect(res.status).toBe(200);
    const body = await res.json() as { farmers: Record<string, unknown>[] };
    expect(body.farmers).toHaveLength(2);
  });

  it("filters by status query param", async () => {
    const farmers = [
      { id: "f1", full_name: "สมชาย", phone: "0811111111", status: "pending" },
      { id: "f2", full_name: "สมหญิง", phone: "0822222222", status: "approved" },
    ];
    const { db } = mockD1(farmers);
    const app = await buildApp(db);
    const res = await app.request("/api/admin/farmers?status=approved", { headers: adminHeaders() });
    expect(res.status).toBe(200);
    const body = await res.json() as { farmers: Record<string, unknown>[] };
    expect(body.farmers).toHaveLength(1);
    expect(body.farmers[0]?.id).toBe("f2");
  });
});

describe("POST /api/admin/farmers/:id/approve", () => {
  it("returns 401 without admin auth", async () => {
    const { db } = mockD1();
    const app = await buildApp(db);
    const res = await app.request("/api/admin/farmers/f1/approve", { method: "POST" });
    expect(res.status).toBe(401);
  });

  it("approves a pending farmer", async () => {
    const farmers = [
      { id: "f1", full_name: "สมชาย", phone: "0811111111", status: "pending" },
    ];
    const mock = mockD1(farmers);
    const app = await buildApp(mock.db);
    const res = await app.request("/api/admin/farmers/f1/approve", {
      method: "POST",
      headers: adminHeaders(),
    });
    expect(res.status).toBe(200);
    const farmer = mock.store.find(f => f.id === "f1") as Record<string, unknown>;
    expect(farmer?.status).toBe("approved");
  });
});

describe("POST /api/admin/farmers/:id/reject", () => {
  it("rejects a pending farmer", async () => {
    const farmers = [
      { id: "f1", full_name: "สมชาย", phone: "0811111111", status: "pending" },
    ];
    const mock = mockD1(farmers);
    const app = await buildApp(mock.db);
    const res = await app.request("/api/admin/farmers/f1/reject", {
      method: "POST",
      headers: adminHeaders(),
    });
    expect(res.status).toBe(200);
    const farmer = mock.store.find(f => f.id === "f1") as Record<string, unknown>;
    expect(farmer?.status).toBe("rejected");
  });
});
