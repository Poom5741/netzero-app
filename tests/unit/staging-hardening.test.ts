import { Hono } from "hono";
import { describe, expect, it } from "vitest";
import { buildDashboardBubble } from "../../src/line/flex-builders";
import { noStoreForAuthenticatedSessions } from "../../src/middleware/no-store";
import { healthRoutes } from "../../src/routes/health";

// Staging-hardening regression (Rakazo r2/r3 findings D-2, D-3, D-4 residue).

function buildApp() {
  const app = new Hono<{ Bindings: Record<string, never> }>();
  app.use("*", noStoreForAuthenticatedSessions);
  app.route("/", healthRoutes);
  app.get("/api/admin/anything", (c) => c.json({ ok: true }));
  app.get("/public", (c) => c.json({ ok: true }));
  return app;
}

describe("D-2: no-store on authenticated responses", () => {
  it("stamps no-store on a response to a request carrying the session cookie", async () => {
    const res = await buildApp().request("/api/admin/anything", {
      headers: { Cookie: "other=1; nzc_session=abc; x=2" },
    });
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
  });

  it("stamps no-store when the session cookie is the only cookie", async () => {
    const res = await buildApp().request("/public", {
      headers: { Cookie: "nzc_session=abc" },
    });
    expect(res.headers.get("Cache-Control")).toBe("no-store");
  });

  it("stamps no-store on /session even without a cookie (its answer is security state)", async () => {
    const res = await buildApp().request("/session");
    expect(res.headers.get("Cache-Control")).toBe("no-store");
  });

  it("leaves public unauthenticated traffic untouched", async () => {
    const res = await buildApp().request("/public");
    expect(res.headers.get("Cache-Control")).toBeNull();
  });
});

describe("D-4 residue: backend build fingerprint", () => {
  it("reports the BUILD_ID on /health and /_staging-build.json", async () => {
    const app = new Hono<{ Bindings: { BUILD_ID?: string; ENVIRONMENT?: string } }>();
    app.use("*", async (c, next) => {
      c.env = { ENVIRONMENT: "test" } as { BUILD_ID?: string; ENVIRONMENT?: string };
      await next();
    });
    app.route("/", healthRoutes);
    const health = await app.request("/health");
    const healthBody = (await health.json()) as { build?: string };
    expect(healthBody.build).toBe("unknown"); // var unset in tests

    const fp = await app.request("/_staging-build.json");
    expect(fp.status).toBe(200);
    const fpBody = (await fp.json()) as { build?: string; side?: string };
    expect(fpBody.build).toBe("unknown");
    expect(fpBody.side).toBe("backend");
  });
});

describe("D-3: season card history action has its own target", () => {
  const base = {
    farmerName: "สมชาย มั่นคง",
    plotName: "PLOT-001",
    totalOffset: 1.25,
    sfW: 0.71,
    approvedPhotos: 1,
    totalPhotos: 4,
    pendingTasks: 3,
  };

  function actionUris(msg: ReturnType<typeof buildDashboardBubble>): string[] {
    // msg.contents is the bubble; actions live in footer boxes' .action
    const bubble = (
      msg as { contents?: { footer?: { contents: Array<{ action?: { uri?: string } }> } } }
    ).contents;
    const footerButtons = bubble?.footer?.contents ?? [];
    return footerButtons.map((b) => b.action?.uri ?? "").filter(Boolean);
  }

  it("points ดูประวัติการส่ง at the history URL, not the dashboard URL", () => {
    const msg = buildDashboardBubble({
      ...base,
      appUrl: "https://liff.line.me/123/liff/summary?plot_id=p1&farmer_id=f1",
      historyUrl:
        "https://liff.line.me/123/liff/summary?plot_id=p1&farmer_id=f1&tab=%E0%B8%A0%E0%B8%B2%E0%B8%9E",
    });
    const uris = actionUris(msg);
    expect(uris.length).toBe(2);
    expect(uris[0]).not.toBe(uris[1]);
    expect(uris[0]).toContain("tab=");
  });

  it("falls back to appUrl for the history action when no historyUrl is given", () => {
    const msg = buildDashboardBubble({
      ...base,
      appUrl: "https://example.test/liff/summary",
    });
    const uris = actionUris(msg);
    expect(uris[0]).toBe(uris[1]);
  });
});
