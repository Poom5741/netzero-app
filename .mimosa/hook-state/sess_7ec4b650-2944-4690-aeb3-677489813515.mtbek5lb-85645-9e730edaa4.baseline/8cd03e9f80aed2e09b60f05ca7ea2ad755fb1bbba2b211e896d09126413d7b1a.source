/**
 * Issue #106 — Integration: audit trail written at every decision point.
 * Tests through the HTTP surface that machine and admin decisions
 * produce automation_audit_log entries.
 */
import { describe, expect, it } from "vitest";
import { createTestApp, makeSessionCookie } from "../helpers/integration";

function makeUploadRequest(overrides?: Record<string, string>) {
  const fd = new FormData();
  fd.append("photo", new File(["bytes"], "test.jpg", { type: "image/jpeg" }));
  fd.append("plot_id", "plot-1");
  fd.append("season_id", "2026-01");
  fd.append("gps_lat", "18.7883");
  fd.append("gps_lng", "98.9853");
  fd.append("gps_accuracy", "10");
  fd.append("taken_at", "2026-01-15T10:00:00Z");
  fd.append("photo_type", "wetdry");
  if (overrides) {
    for (const [k, v] of Object.entries(overrides)) {
      fd.set(k, v);
    }
  }
  return new Request("http://localhost/photo/upload", { method: "POST", body: fd });
}

describe("Audit trail — machine decisions", () => {
  it("writes audit entry when photo is pre-verified", async () => {
    const { app, db } = await createTestApp();
    const res = await app.request("/photo/upload", makeUploadRequest({ __classifier_result: "pass" }));
    expect(res.status).toBe(201);

    const auditLog = db.store.get("automation_audit_log") ?? [];
    expect(auditLog.length).toBe(1);
    expect(auditLog[0]?.actor_type).toBe("machine");
    expect(auditLog[0]?.action).toBe("pre_verified");
    expect(auditLog[0]?.confidence).toBe(0.95);
  });

  it("writes audit entry when photo is flagged", async () => {
    const { app, db } = await createTestApp();
    const res = await app.request("/photo/upload", makeUploadRequest({ __classifier_result: "flag" }));
    expect(res.status).toBe(201);

    const auditLog = db.store.get("automation_audit_log") ?? [];
    expect(auditLog.length).toBe(1);
    expect(auditLog[0]?.actor_type).toBe("machine");
    expect(auditLog[0]?.action).toBe("flagged");
  });

  it("writes audit entry when photo is refused", async () => {
    const { app, db } = await createTestApp();
    const res = await app.request("/photo/upload", makeUploadRequest({ __classifier_result: "reject" }));
    expect(res.status).toBe(200);

    const auditLog = db.store.get("automation_audit_log") ?? [];
    expect(auditLog.length).toBe(1);
    expect(auditLog[0]?.actor_type).toBe("machine");
    expect(auditLog[0]?.action).toBe("refused");
  });
});

describe("Audit trail — admin decisions", () => {
  it("writes audit entry when admin overrides (supersedes) a pre-verified photo", async () => {
    const { app, db } = await createTestApp();

    // First: upload a pre-verified photo
    const uploadRes = await app.request("/photo/upload", makeUploadRequest({ __classifier_result: "pass" }));
    const body = await uploadRes.json<{ id: string }>();
    const photoId = body.id;

    // Admin overrides it
    const cookie = makeSessionCookie("admin");
    const reviewRes = await app.request(`/api/admin/review/${photoId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ status: "rejected", reason: "ภาพไม่ชัดเจน" }),
    });
    expect(reviewRes.status).toBe(200);

    const auditLog = db.store.get("automation_audit_log") ?? [];
    // Should have: 1 machine pre_verified + 1 admin superseded
    const adminEntries = auditLog.filter((e) => e.actor_type === "admin");
    expect(adminEntries.length).toBe(1);
    expect(adminEntries[0]?.action).toBe("superseded");
    expect(adminEntries[0]?.reason).toBe("ภาพไม่ชัดเจน");
  });

  it("writes audit entry when admin promotes an audit-sampled photo", async () => {
    const { app, db } = await createTestApp();

    // Upload with 100% audit sample rate
    const uploadRes = await app.request(
      "/photo/upload",
      makeUploadRequest({ __classifier_result: "pass", __sample_rate: "1" }),
    );
    const body = await uploadRes.json<{ id: string }>();
    const photoId = body.id;

    // Admin verifies (promotes)
    const cookie = makeSessionCookie("admin");
    const reviewRes = await app.request(`/api/admin/review/${photoId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ status: "verified", reason: "" }),
    });
    expect(reviewRes.status).toBe(200);

    const auditLog = db.store.get("automation_audit_log") ?? [];
    const adminEntries = auditLog.filter((e) => e.actor_type === "admin");
    expect(adminEntries.length).toBe(1);
    expect(adminEntries[0]?.action).toBe("promoted");
  });

  it("writes audit entry for normal admin verify/reject on non-pre-verified photos", async () => {
    const { app, db } = await createTestApp();

    // Upload a flagged photo (not pre-verified)
    const uploadRes = await app.request("/photo/upload", makeUploadRequest({ __classifier_result: "flag" }));
    const body = await uploadRes.json<{ id: string }>();
    const photoId = body.id;

    // Admin verifies
    const cookie = makeSessionCookie("admin");
    await app.request(`/api/admin/review/${photoId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ status: "verified", reason: "looks good" }),
    });

    const auditLog = db.store.get("automation_audit_log") ?? [];
    const adminEntries = auditLog.filter((e) => e.actor_type === "admin");
    expect(adminEntries.length).toBe(1);
    expect(adminEntries[0]?.action).toBe("verified");
  });
});

describe("GET /api/admin/audit/:photoId — decision history API", () => {
  it("returns the full decision history for a photo", async () => {
    const { app, db } = await createTestApp();

    // Upload pre-verified
    const uploadRes = await app.request(
      "/photo/upload",
      makeUploadRequest({ __classifier_result: "pass", __sample_rate: "1" }),
    );
    const body = await uploadRes.json<{ id: string }>();
    const photoId = body.id;

    // Admin promotes
    const cookie = makeSessionCookie("admin");
    await app.request(`/api/admin/review/${photoId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ status: "verified", reason: "" }),
    });

    // Fetch audit trail
    const auditRes = await app.request(`/api/admin/audit/${photoId}`, {
      headers: { Cookie: cookie },
    });
    expect(auditRes.status).toBe(200);
    const history = await auditRes.json<AuditEntry[]>();
    expect(history.length).toBe(2);
    expect(history[0]?.action).toBe("pre_verified");
    expect(history[1]?.action).toBe("promoted");
  });

  it("returns empty array for photo with no audit entries", async () => {
    const { app } = await createTestApp();
    const cookie = makeSessionCookie("admin");
    const auditRes = await app.request("/api/admin/audit/nonexistent", {
      headers: { Cookie: cookie },
    });
    expect(auditRes.status).toBe(200);
    const history = await auditRes.json<unknown[]>();
    expect(history).toEqual([]);
  });

  it("requires admin auth", async () => {
    const { app } = await createTestApp();
    const auditRes = await app.request("/api/admin/audit/photo-1");
    expect(auditRes.status).toBe(401);
  });
});

type AuditEntry = {
  id: string;
  photo_evidence_id: string;
  actor_type: string;
  action: string;
  confidence: number | null;
  reason: string | null;
  created_at: string;
};
