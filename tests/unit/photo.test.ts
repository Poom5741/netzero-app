import { describe, expect, it } from "vitest";
import { photoRoutes } from "../../src/routes/photo";

function mockDB() {
  const calls: { sql: string; args: unknown[] }[] = [];
  return {
    calls,
    prepare(sql: string) {
      return {
        bind(...args: unknown[]) {
          calls.push({ sql, args });
          return { run: async () => ({ success: true }) };
        },
      };
    },
  };
}

function mockR2() {
  const stored: Map<string, unknown> = new Map();
  return {
    stored,
    put: async (key: string, body: unknown) => {
      stored.set(key, body);
    },
  };
}

function makeUploadRequest(overrides?: Record<string, string | File>) {
  const fd = new FormData();
  fd.append("photo", new File(["bytes"], "test.jpg", { type: "image/jpeg" }));
  fd.append("plot_id", "plot-1");
  fd.append("season_id", "season-1");
  fd.append("gps_lat", "13.7563");
  fd.append("gps_lng", "100.5018");
  fd.append("gps_accuracy", "10");
  fd.append("taken_at", "2025-01-01T12:00:00Z");
  if (overrides) {
    for (const [k, v] of Object.entries(overrides)) {
      fd.set(k, v);
    }
  }
  return new Request("http://localhost/photo/upload", { method: "POST", body: fd });
}

describe("POST /photo/upload", () => {
  it("stores photo in R2 and creates DB record", async () => {
    const db = mockDB();
    const r2 = mockR2();

    const res = await photoRoutes.request("/photo/upload", makeUploadRequest(), {
      DB: db as any,
      R2: r2 as any,
      ENVIRONMENT: "test",
    });

    expect(res.status).toBe(201);
    expect(r2.stored.size).toBe(1);
    expect(db.calls.length).toBe(1);
    expect(db.calls[0]?.sql).toContain("INSERT INTO photo_evidence");
  });

  it("returns 400 when photo is missing", async () => {
    const db = mockDB();
    const r2 = mockR2();
    const fd = new FormData();
    fd.append("plot_id", "plot-1");
    fd.append("season_id", "season-1");
    const req = new Request("http://localhost/photo/upload", { method: "POST", body: fd });

    const res = await photoRoutes.request("/photo/upload", req, {
      DB: db as any,
      R2: r2 as any,
      ENVIRONMENT: "test",
    });

    expect(res.status).toBe(400);
    const body = await res.json<{ error: string }>();
    expect(body.error).toBeDefined();
  });

  it("returns photo id and url in response", async () => {
    const db = mockDB();
    const r2 = mockR2();

    const res = await photoRoutes.request("/photo/upload", makeUploadRequest(), {
      DB: db as any,
      R2: r2 as any,
      ENVIRONMENT: "test",
    });

    const body = await res.json<{ id: string; photo_url: string }>();
    expect(body.id).toMatch(/^photo_/);
    expect(body.photo_url).toContain("evidence/");
  });
});
