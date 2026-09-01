import { describe, expect, it } from "vitest";
import { adminRoutes } from "../../src/routes/admin";
import { createSessionCookie } from "../../src/auth/session";

const SECRET = "test-secret-key";

function mockDB(rows: Record<string, unknown>[] = []) {
  return {
    prepare(_sql: string) {
      return {
        bind(..._args: unknown[]) {
          return {
            all: async () => ({ results: rows }),
            first: async () => rows[0] ?? null,
            run: async () => ({ success: true }),
          };
        },
      };
    },
  };
}

function mockR2(store: Map<string, ArrayBuffer> = new Map()) {
  return {
    get: async (key: string) => {
      const data = store.get(key);
      if (!data) return null;
      return {
        body: new ReadableStream({
          start(controller) {
            controller.enqueue(new Uint8Array(data));
            controller.close();
          },
        }),
        type: "image/jpeg",
      };
    },
  };
}

function env() {
  return { DB: mockDB() as any, R2: mockR2() as any, SECRET };
}

function adminCookie() {
  return createSessionCookie({ userId: "admin-1", role: "admin", email: "a@b.com" }, SECRET);
}

describe("GET /api/photo/:photoId", () => {
  it("returns 401 without admin session", async () => {
    const res = await adminRoutes.request("/api/photo/test123", {}, env());
    expect(res.status).toBe(401);
  });

  it("returns 401 with non-admin session", async () => {
    const cookie = createSessionCookie({ userId: "u1", role: "farmer", email: "f@b.com" }, SECRET);
    const res = await adminRoutes.request("/api/photo/test123", { headers: { Cookie: cookie } }, env());
    expect(res.status).toBe(401);
  });

  it("serves image from R2 with valid admin session", async () => {
    const store = new Map<string, ArrayBuffer>();
    store.set("evidence/test123.jpg", new ArrayBuffer(8));
    const e = { DB: mockDB() as any, R2: mockR2(store) as any, SECRET };
    const res = await adminRoutes.request("/api/photo/test123", { headers: { Cookie: adminCookie() } }, e);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("image/jpeg");
  });

  it("returns placeholder SVG when photo not in R2", async () => {
    const res = await adminRoutes.request("/api/photo/missing", { headers: { Cookie: adminCookie() } }, env());
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("image/svg+xml");
  });
});

describe("GET /api/admin/review — photo_url transformation", () => {
  it("returns photo_url as /api/photo/:id instead of raw R2 key", async () => {
    const rows = [
      {
        id: "photo_abc",
        plot_id: "plot-1",
        ai_status: "flag",
        ai_label: "uncertain",
        ai_reason: "blurry",
        ai_confidence: 0.5,
        admin_status: "pending",
        photo_url: "evidence/photo_abc.jpg",
        photo_type: "wetdry",
        pre_verified: 0,
        audit_sample: 0,
        water_state: null,
      },
    ];
    const e = { DB: mockDB(rows) as any, R2: mockR2() as any, SECRET };
    const res = await adminRoutes.request("/api/admin/review", { headers: { Cookie: adminCookie() } }, e);
    expect(res.status).toBe(200);
    const body = await res.json<any[]>();
    expect(body[0].photo_url).toBe("/api/photo/photo_abc");
  });
});
