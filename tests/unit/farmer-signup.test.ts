import { Hono } from "hono";
import { describe, expect, it } from "vitest";
import { farmerSignupRoutes } from "../../src/routes/farmer-signup";

type Bindings = {
  DB: D1Database;
  SECRET: string;
};

function mockD1() {
  const store: Record<string, unknown>[] = [];
  return {
    store,
    db: {
      prepare(sql: string) {
        return {
          bind(...args: unknown[]) {
            return {
              run: async () => {
                if (sql.includes("INSERT")) {
                  const row: Record<string, unknown> = {};
                  const cols = sql.match(/\(([^)]+)\)/)?.[1]?.split(",").map(c => c.trim()) ?? [];
                  cols.forEach((col, i) => { row[col] = args[i]; });
                  store.push(row);
                }
                return { success: true };
              },
              first: async <T>() => {
                if (sql.includes("phone")) {
                  const phone = args[0];
                  return (store.find(r => r.phone === phone) as T) ?? null;
                }
                return null;
              },
              all: async <T>() => ({ results: store as T[] }),
            };
          },
        };
      },
    } as unknown as D1Database,
  };
}

function buildApp(db: D1Database) {
  const app = new Hono<{ Bindings: Bindings }>();
  app.use("*", async (c, next) => {
    c.env = { DB: db, SECRET: "test-secret" } as never;
    await next();
  });
  app.route("/", farmerSignupRoutes);
  return app;
}

describe("POST /api/farmer/signup", () => {
  it("creates a farmer with pending status", async () => {
    const { db } = mockD1();
    const app = buildApp(db);
    const res = await app.request("/api/farmer/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: "0812345678", name: "สมชาย" }),
    });
    expect(res.status).toBe(201);
    const body = await res.json() as { farmer: { status: string } };
    expect(body.farmer.status).toBe("pending");
  });

  it("rejects missing phone", async () => {
    const { db } = mockD1();
    const app = buildApp(db);
    const res = await app.request("/api/farmer/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "สมชาย" }),
    });
    expect(res.status).toBe(400);
  });

  it("rejects missing name", async () => {
    const { db } = mockD1();
    const app = buildApp(db);
    const res = await app.request("/api/farmer/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: "0812345678" }),
    });
    expect(res.status).toBe(400);
  });

  it("rejects invalid Thai phone format", async () => {
    const { db } = mockD1();
    const app = buildApp(db);
    const res = await app.request("/api/farmer/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: "123", name: "สมชาย" }),
    });
    expect(res.status).toBe(400);
  });

  it("rejects duplicate phone", async () => {
    const mock = mockD1();
    mock.store.push({ id: "f1", phone: "0812345678", full_name: "Existing", status: "pending" });
    const app = buildApp(mock.db);
    const res = await app.request("/api/farmer/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: "0812345678", name: "สมชาย" }),
    });
    expect(res.status).toBe(409);
  });
});
