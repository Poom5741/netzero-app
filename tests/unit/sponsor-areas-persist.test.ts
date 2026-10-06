import { Hono } from "hono";
import { describe, expect, it } from "vitest";
import { setSponsorAreas } from "../../src/admin/sponsors";
import { createSessionCookie } from "../../src/auth/session";
import { adminRoutes } from "../../src/routes/admin";

// J4 enabler: PUT /api/admin/sponsors/:id/areas must persist the sponsor's
// assigned provinces (users.areas JSON). Previously the sponsors page kept
// checkbox selection local-only, so attributable scoping data could never
// exist (Rakazo r2/r3/r4).

type Bindings = { DB: unknown; SECRET: string };

function buildApp(db: unknown) {
  const app = new Hono<{ Bindings: Bindings }>();
  app.use("*", async (c, next) => {
    c.env = { DB: db, SECRET: "test-secret" } as Bindings;
    await next();
  });
  app.route("/", adminRoutes);
  return app;
}

async function adminCookie() {
  return createSessionCookie(
    { userId: "admin-test", role: "admin", email: "admin@test.com" },
    "test-secret",
    false,
  );
}

function capturingDb(existing: Record<string, unknown> | null) {
  const captured: { sql: string; binds: unknown[] }[] = [];
  const db = {
    prepare(sql: string) {
      captured.push({ sql, binds: [] });
      const entry = captured[captured.length - 1];
      return {
        bind(...args: unknown[]) {
          entry.binds = args;
          return {
            first: async () => existing,
            all: async () => ({ results: existing ? [existing] : [] }),
            run: async () => ({ success: true, meta: { changes: 1 } }),
          };
        },
      };
    },
  };
  return { db, captured };
}

describe("setSponsorAreas", () => {
  it("writes a sorted, deduped JSON array and returns it", async () => {
    const { db, captured } = capturingDb(null);
    const out = await setSponsorAreas(db as never, "user-1", ["สุพรรณบุรี", " สุพรรณบุรี ", "", "test"]);
    expect(out).toEqual(["test", "สุพรรณบุรี"]);
    const update = captured.find((c) => c.sql.includes("UPDATE users SET areas"));
    expect(update).toBeTruthy();
    expect(update!.binds[0]).toBe(JSON.stringify(["test", "สุพรรณบุรี"]));
    expect(update!.binds[1]).toBe("user-1");
  });

  it("returns null when the id is not a sponsor (no rows changed)", async () => {
    const db = {
      prepare(_sql: string) {
        return {
          bind() {
            return { run: async () => ({ success: true, meta: { changes: 0 } }) };
          },
        };
      },
    };
    const out = await setSponsorAreas(db as never, "not-a-sponsor", ["test"]);
    expect(out).toBeNull();
  });
});

describe("PUT /api/admin/sponsors/:id/areas", () => {
  it("persists and echoes the area list", async () => {
    const { db } = capturingDb(null);
    const res = await buildApp(db).request("/api/admin/sponsors/user-1/areas", {
      method: "PUT",
      headers: { Cookie: await adminCookie(), "Content-Type": "application/json" },
      body: JSON.stringify({ areas: ["สุพรรณบุรี"] }),
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { id: string; areas: string[] };
    expect(body.id).toBe("user-1");
    expect(body.areas).toEqual(["สุพรรณบุรี"]);
  });

  it("rejects a non-array body with 400", async () => {
    const { db } = capturingDb(null);
    const res = await buildApp(db).request("/api/admin/sponsors/user-1/areas", {
      method: "PUT",
      headers: { Cookie: await adminCookie(), "Content-Type": "application/json" },
      body: JSON.stringify({ areas: "สุพรรณบุรี" }),
    });
    expect(res.status).toBe(400);
  });

  it("requires an admin session (401 without a cookie)", async () => {
    const { db } = capturingDb(null);
    const res = await buildApp(db).request("/api/admin/sponsors/user-1/areas", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ areas: [] }),
    });
    expect([401, 403]).toContain(res.status);
  });
});
