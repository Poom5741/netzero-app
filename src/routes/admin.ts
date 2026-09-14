/**
 * Admin Review Dashboard — photo review queue + review actions.
 */

import { Hono } from "hono";
import { getDecisionHistory } from "../admin/audit-log";
import { approveApplication, getApplications, rejectApplication, holdApplication } from "../admin/applications";
import { getFarmerDetail, getFarmerAuditLog } from "../admin/farmer-detail";
import { getOverviewKpis, getWorkQueueAlerts, getCreditChart, getGhgSourceTable, getProvinceTable } from "../admin/overview";
import { getReports, logReportDownload } from "../admin/reports";
import { getSponsors } from "../admin/sponsors";
import { getSettings, updateSettings } from "../admin/settings";
import { getPrecisionStat } from "../admin/precision";
import { getReviewQueue } from "../admin/queue";
import { reviewPhoto } from "../admin/review";
import { requireRole } from "../auth/middleware";

type Bindings = {
  DB: D1Database;
  R2: R2Bucket;
  SECRET: string;
};

export const adminRoutes = new Hono<{ Bindings: Bindings }>();

// Require admin role for all /admin/* and /api/admin/* routes
adminRoutes.use("/admin/*", async (c, next) => {
  return requireRole("admin", c.env.SECRET)(c, next);
});
adminRoutes.use("/api/admin/*", async (c, next) => {
  return requireRole("admin", c.env.SECRET)(c, next);
});

// ── Shared nav helper ──────────────────────────────────────────────────
function adminNav(active: string): string {
  const items = [
    { key: "overview", label: "ภาพรวม", href: "/admin/overview", icon: "📊" },
    { key: "applications", label: "คำขอ", href: "/admin/applications", icon: "📝" },
    { key: "review", label: "ตรวจภาพ", href: "/admin/review", icon: "📋" },
    { key: "farmers", label: "เกษตรกร", href: "/admin/farmers", icon: "🌾" },
    { key: "sponsors", label: "ผู้สนับสนุน", href: "/admin/sponsors", icon: "🏢" },
    { key: "reports", label: "รายงาน", href: "/admin/reports", icon: "📥" },
    { key: "settings", label: "ตั้งค่า", href: "/admin/settings", icon: "⚙️" },
  ];
  return `<nav style="background:#1a1a2e;padding:8px 20px;display:flex;gap:4px;overflow-x:auto">
    ${items.map((i) => `<a href="${i.href}" style="padding:6px 14px;border-radius:8px;text-decoration:none;font-size:13px;color:${active === i.key ? "#fff" : "#aaa"};background:${active === i.key ? "#06c755" : "transparent"}">${i.icon} ${i.label}</a>`).join("")}
  </nav>`;
}

function adminShell(title: string, active: string, body: string): string {
  return `<!DOCTYPE html><html lang="th"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} - NetZeroCarbon</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,sans-serif;background:#f0f4f8}.header{background:#1a1a2e;color:white;padding:16px 20px;display:flex;justify-content:space-between;align-items:center}.header h1{font-size:18px}.header a{color:#aaa;text-decoration:none;font-size:14px}.content{padding:20px;max-width:1200px;margin:0 auto}.card{background:white;border-radius:12px;padding:20px;box-shadow:0 1px 3px rgba(0,0,0,.08);margin-bottom:16px}.kpi{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-bottom:16px}.kpi-card{background:white;border-radius:12px;padding:16px;text-align:center;box-shadow:0 1px 3px rgba(0,0,0,.08)}.kpi-card h3{font-size:28px;color:#06c755}.kpi-card p{font-size:12px;color:#666;margin-top:4px}table{width:100%;border-collapse:collapse}th,td{text-align:left;padding:8px 12px;border-bottom:1px solid #eee;font-size:13px}th{background:#f8f9fa;font-weight:600;color:#555}.badge{display:inline-block;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600}.btn{padding:6px 14px;border:none;border-radius:6px;font-size:12px;cursor:pointer;text-decoration:none;display:inline-block}.btn-primary{background:#06c755;color:white}.btn-danger{background:#dc3545;color:white}.btn-warn{background:#fd7e14;color:white}.btn-secondary{background:#6c757d;color:white}.empty{text-align:center;padding:40px;color:#999}</style>
</head><body>
<div class="header"><h1>🌱 ${title}</h1><a href="/logout">ออกจากระบบ</a></div>
${adminNav(active)}
<div class="content">${body}</div>
</body></html>`;
}

// GET /admin/review — Photo review queue
adminRoutes.get("/admin/review", async (c) => {
  const db = c.env.DB;
  const filter = c.req.query("status") || undefined;
  const queue = await getReviewQueue(db, filter ? { ai_status: filter } : {});

  const html = `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Review - NetZeroCarbon</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, sans-serif; background: #f5f5f5; }
    .header { background: #1a1a2e; color: white; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; }
    .header h1 { font-size: 18px; }
    .header a { color: #aaa; text-decoration: none; font-size: 14px; }
    .filters { padding: 12px 20px; background: white; display: flex; gap: 8px; border-bottom: 1px solid #eee; }
    .filters a { padding: 6px 14px; border-radius: 16px; text-decoration: none; font-size: 13px; background: #f0f0f0; color: #333; }
    .filters a.active { background: #06c755; color: white; }
    .queue { padding: 12px 20px; }
    .item { background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px; display: flex; gap: 12px; align-items: center; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
    .item img { width: 80px; height: 80px; object-fit: cover; border-radius: 8px; background: #eee; }
    .item-info { flex: 1; }
    .item-info h3 { font-size: 14px; margin-bottom: 4px; }
    .item-info p { font-size: 12px; color: #666; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600; }
    .badge.flag { background: #fff3cd; color: #856404; }
    .badge.reject { background: #f8d7da; color: #721c24; }
    .badge.pass { background: #d4edda; color: #155724; }
    .badge.pending { background: #e2e3e5; color: #383d41; }
    .badge.verified { background: #d4edda; color: #155724; }
    .badge.audit { background: #fff3cd; color: #856404; border: 2px solid #ffc107; }
    .badge.preverified { background: #d1ecf1; color: #0c5460; }
    .water-state { font-size: 11px; color: #555; margin-top: 2px; }
    .item.audit-item { border-left: 4px solid #ffc107; }
    .actions { display: flex; gap: 6px; }
    .btn { padding: 6px 14px; border: none; border-radius: 6px; font-size: 12px; cursor: pointer; }
    .btn-verify { background: #06c755; color: white; }
    .btn-reject { background: #dc3545; color: white; }
    .btn-retake { background: #fd7e14; color: white; }
    .btn-override { background: #fd7e14; color: white; }
    .btn-detail { background: #6c757d; color: white; }
    .empty { text-align: center; padding: 40px; color: #999; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📋 คิวตรวจภาพ</h1>
    <a href="/admin">← กลับ</a>
  </div>
  <div class="filters">
    <a href="/admin/review" class="${!filter ? "active" : ""}">ทั้งหมด</a>
    <a href="/admin/review?status=flag" class="${filter === "flag" ? "active" : ""}">🚩 Flag</a>
    <a href="/admin/review?status=pending" class="${filter === "pending" ? "active" : ""}">⏳ Pending</a>
    <a href="/admin/review?status=pass" class="${filter === "pass" ? "active" : ""}">✅ Pass</a>
    <a href="/admin/review?status=reject" class="${filter === "reject" ? "active" : ""}">❌ Reject</a>
  </div>
  <div class="queue">
    ${
      queue.length === 0
        ? '<div class="empty">ไม่มีภาพในคิว</div>'
        : queue
            .map((item) => {
              const isAudit = item.audit_sample === 1 && item.pre_verified === 1;
              const isPreVerified = item.pre_verified === 1 && !isAudit;
              const waterLabel =
                item.water_state === "flooded"
                  ? "💧 น้ำขัง"
                  : item.water_state === "dry"
                    ? "🏜️ แห้ง"
                    : "";
              return `
      <div class="item${isAudit ? " audit-item" : ""}">
        <img src="/api/photo/${item.id}" alt="photo">
        <div class="item-info">
          <h3>${item.plot_id}
            <span class="badge ${item.ai_status}">${item.ai_status}</span>
            <span class="badge ${item.admin_status}">${item.admin_status}</span>
            ${isAudit ? '<span class="badge audit">🔍 ตรวจตัวอย่าง</span>' : ""}
            ${isPreVerified ? '<span class="badge preverified">✓ Pre-verified</span>' : ""}
          </h3>
          <p>${item.ai_label || "-"} | ${(item.ai_confidence * 100).toFixed(0)}% confidence</p>
          ${waterLabel ? `<p class="water-state">${waterLabel}</p>` : ""}
          <p>${item.ai_reason || ""}</p>
        </div>
        <div class="actions">
          <a href="/admin/audit/${item.id}" class="btn btn-detail">📜 History</a>
          ${isPreVerified ? `<button class="btn btn-override" onclick="review('${item.id}','rejected')">⚡ Override</button>` : ""}
          <button class="btn btn-verify" onclick="review('${item.id}','verified')">✓ ผ่าน</button>
          <button class="btn btn-reject" onclick="review('${item.id}','rejected')">✗ ตีกลับ</button>
          <button class="btn btn-retake" onclick="review('${item.id}','retake')">🔄 ถ่ายใหม่</button>
        </div>
      </div>`;
            })
            .join("")
    }
  </div>
  <script>
    async function review(photoId, status) {
      const reason = (status === 'rejected' || status === 'retake') ? prompt('เหตุผล:') : '';
      if ((status === 'rejected' || status === 'retake') && !reason) return;
      const res = await fetch('/api/admin/review/' + photoId, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reason }),
      });
      if (res.ok) location.reload();
      else alert('Error: ' + await res.text());
    }
  </script>
</body>
</html>`;
  return c.html(html);
});

// GET /api/admin/review — Photo review queue (JSON API)
adminRoutes.get("/api/admin/review", async (c) => {
  const db = c.env.DB;
  const filter = c.req.query("status") || undefined;
  const queue = await getReviewQueue(db, filter ? { ai_status: filter } : {});

  return c.json(queue);
});

// GET /api/admin/precision — Pre-verify precision stat
adminRoutes.get("/api/admin/precision", async (c) => {
  const db = c.env.DB;
  const stat = await getPrecisionStat(db);

  return c.json(stat);
});

// GET /api/admin/audit/:photoId — Decision history for a photo (JSON)
adminRoutes.get("/api/admin/audit/:photoId", async (c) => {
  const db = c.env.DB;
  const photoId = c.req.param("photoId");
  const history = await getDecisionHistory(db, photoId);
  return c.json(history);
});

// GET /admin/audit/:photoId — Decision history HTML view
adminRoutes.get("/admin/audit/:photoId", async (c) => {
  const db = c.env.DB;
  const photoId = c.req.param("photoId");
  const history = await getDecisionHistory(db, photoId);

  const actionLabels: Record<string, string> = {
    pre_verified: "✓ Pre-verified (machine)",
    flagged: "🚩 Flagged (machine)",
    refused: "❌ Refused (machine)",
    verified: "✓ Verified (admin)",
    rejected: "✗ Rejected (admin)",
    superseded: "⚡ Superseded (admin override)",
    promoted: "🎯 Promoted (audit confirmed)",
  };

  const html = `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Decision History - ${photoId}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, sans-serif; background: #f5f5f5; }
    .header { background: #1a1a2e; color: white; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; }
    .header h1 { font-size: 18px; }
    .header a { color: #aaa; text-decoration: none; font-size: 14px; }
    .content { padding: 20px; max-width: 800px; margin: 0 auto; }
    .photo-id { font-size: 14px; color: #666; margin-bottom: 16px; }
    .timeline { position: relative; padding-left: 24px; }
    .timeline::before { content: ''; position: absolute; left: 8px; top: 0; bottom: 0; width: 2px; background: #ddd; }
    .entry { background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px; position: relative; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
    .entry::before { content: ''; position: absolute; left: -20px; top: 20px; width: 12px; height: 12px; border-radius: 50%; background: #06c755; border: 2px solid white; }
    .entry.machine::before { background: #0dcaf0; }
    .entry.admin::before { background: #fd7e14; }
    .entry-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .entry-action { font-weight: 600; font-size: 14px; }
    .entry-time { font-size: 12px; color: #999; }
    .entry-meta { font-size: 12px; color: #666; }
    .entry-reason { font-size: 13px; color: #333; margin-top: 4px; font-style: italic; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600; margin-left: 8px; }
    .badge.machine { background: #d1ecf1; color: #0c5460; }
    .badge.admin { background: #fff3cd; color: #856404; }
    .empty { text-align: center; padding: 40px; color: #999; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📜 ประวัติการตัดสินใจ</h1>
    <a href="/admin/review">← กลับคิว</a>
  </div>
  <div class="content">
    <p class="photo-id">Photo: ${photoId}</p>
    ${
      history.length === 0
        ? '<div class="empty">ไม่มีประวัติการตัดสินใจ</div>'
        : `
    <div class="timeline">
      ${history
        .map(
          (entry) => `
      <div class="entry ${entry.actor_type}">
        <div class="entry-header">
          <span class="entry-action">
            ${actionLabels[entry.action] || entry.action}
            <span class="badge ${entry.actor_type}">${entry.actor_type === "machine" ? "🤖 machine" : "👤 admin"}</span>
          </span>
          <span class="entry-time">${new Date(entry.created_at).toLocaleString("th-TH")}</span>
        </div>
        ${entry.confidence ? `<div class="entry-meta">Confidence: ${(entry.confidence * 100).toFixed(0)}%</div>` : ""}
        ${entry.reason ? `<div class="entry-reason">"${entry.reason}"</div>` : ""}
      </div>
      `,
        )
        .join("")}
    </div>
    `
    }
  </div>
</body>
</html>`;
  return c.html(html);
});

// POST /api/admin/review/:photoId — Review a photo
adminRoutes.post("/api/admin/review/:photoId", async (c) => {
  const db = c.env.DB;
  const photoId = c.req.param("photoId");
  const body = await c.req.json<{ status: string; reason?: string }>();

  const result = await reviewPhoto(
    db,
    photoId,
    body.status as "verified" | "rejected",
    body.reason || "",
  );
  if (result.success) {
    return c.json({ ok: true });
  }
  return c.json({ error: result.error }, 400);
});

// GET /api/photo/:photoId — Serve photo from R2
adminRoutes.get("/api/photo/:photoId", async (c) => {
  const photoId = c.req.param("photoId");
  const r2 = c.env.R2;

  const obj = await r2.get(`evidence/${photoId}.jpg`);
  if (!obj) {
    // Return placeholder
    return new Response(
      `<svg width="80" height="80" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="80" fill="#eee"/><text x="40" y="45" text-anchor="middle" fill="#999" font-size="12">No Image</text></svg>`,
      { headers: { "Content-Type": "image/svg+xml" } },
    );
  }

  return new Response(obj.body, {
    headers: { "Content-Type": "image/jpeg", "Cache-Control": "public, max-age=3600" },
  });
});

// ── Application Review API ─────────────────────────────────────────────

// POST /api/admin/applications — List applications (pending/verified/rejected)
adminRoutes.post("/api/admin/applications", async (c) => {
  const db = c.env.DB;
  const body = await c.req.json<{ status?: string }>().catch(() => ({ status: undefined as string | undefined }));
  const apps = await getApplications(db, body.status);
  return c.json(apps);
});

// GET /api/admin/applications — List applications (query param variant)
adminRoutes.get("/api/admin/applications", async (c) => {
  const db = c.env.DB;
  const status = c.req.query("status") || undefined;
  const apps = await getApplications(db, status);
  return c.json(apps);
});

// POST /api/admin/applications/:id/approve — Approve application + CPA code
adminRoutes.post("/api/admin/applications/:id/approve", async (c) => {
  const db = c.env.DB;
  const linkId = c.req.param("id");
  const result = await approveApplication(db, linkId);
  if (result.success) {
    return c.json({ ok: true, cpa_code: result.cpa_code });
  }
  return c.json({ error: result.error }, 400);
});

// POST /api/admin/applications/:id/hold — Hold application pending documents
adminRoutes.post("/api/admin/applications/:id/hold", async (c) => {
  const body = await c.req.json<{ reason: string }>();
  const result = await holdApplication(c.env.DB, c.req.param("id"), body.reason);
  return result.success ? c.json({ ok: true }) : c.json({ error: result.error }, 400);
});

// POST /api/admin/applications/:id/reject — Reject application
adminRoutes.post("/api/admin/applications/:id/reject", async (c) => {
  const db = c.env.DB;
  const linkId = c.req.param("id");
  const body = await c.req.json<{ reason: string }>();
  const result = await rejectApplication(db, linkId, body.reason);
  if (result.success) {
    return c.json({ ok: true });
  }
  return c.json({ error: result.error }, 400);
});

// ── Farmer Detail API ──────────────────────────────────────────────────

// GET /api/admin/farmers — List all farmers
adminRoutes.get("/api/admin/farmers", async (c) => {
  const db = c.env.DB;
  // T067 + T095 — BE, PE, ER per AD-FAR-01, plus sponsor and total area
  const { results } = await db
    .prepare(
      `SELECT f.id, f.full_name, f.phone, f.addr_province, f.addr_district, f.cpa_code,
              COALESCE((SELECT trust_score FROM farmer_trust WHERE farmer_id = f.id), 0.5) as trust_score,
              COUNT(DISTINCT p.id) as plot_count,
              COALESCE(SUM(p.area_rai), 0) as total_area_rai,
              COALESCE((SELECT u.name FROM users u WHERE u.id = f.sponsor_id), '-') as sponsor_name,
              COALESCE((SELECT SUM(ce.burning_emissions) FROM carbon_estimates ce
                        JOIN plots p2 ON p2.id = ce.plot_id WHERE p2.farmer_id = f.id), 0) as burning_emissions,
              (SELECT COUNT(*) FROM photo_evidence pe
               JOIN plots p3 ON p3.id = pe.plot_id WHERE p3.farmer_id = f.id) as photo_evidence_count,
              CASE
                WHEN EXISTS (SELECT 1 FROM carbon_estimates ce JOIN plots p4 ON p4.id = ce.plot_id
                             WHERE p4.farmer_id = f.id AND ce.status = 'final') THEN 'verified'
                WHEN EXISTS (SELECT 1 FROM carbon_estimates ce JOIN plots p5 ON p5.id = ce.plot_id
                             WHERE p5.farmer_id = f.id) THEN 'estimated'
                ELSE 'none'
              END as estimation_status
       FROM farmers f
       LEFT JOIN plots p ON p.farmer_id = f.id
       GROUP BY f.id
       ORDER BY f.full_name ASC`,
    )
    .bind()
    .all();
  return c.json(results ?? []);
});

// GET /api/admin/farmers/:id — Farmer detail (5-tab data)
adminRoutes.get("/api/admin/farmers/:id", async (c) => {
  const db = c.env.DB;
  const farmerId = c.req.param("id");
  const detail = await getFarmerDetail(db, farmerId);
  if (!detail) return c.json({ error: "Farmer not found" }, 404);
  return c.json(detail);
});

// GET /api/admin/farmers/:id/audit — Audit log for farmer
adminRoutes.get("/api/admin/farmers/:id/audit", async (c) => {
  const db = c.env.DB;
  const farmerId = c.req.param("id");
  const audit = await getFarmerAuditLog(db, farmerId);
  return c.json(audit);
});

// ── Overview Dashboard API ──────────────────────────────────────────────

// GET /api/admin/overview/kpis — 4 KPI tiles
adminRoutes.get("/api/admin/overview/kpis", async (c) => {
  const db = c.env.DB;
  const season = c.req.query("season") || undefined;
  const kpis = await getOverviewKpis(db, season ? { season } : {});
  return c.json(kpis);
});

// GET /api/admin/overview/work-queue — work queue alert counts
adminRoutes.get("/api/admin/overview/work-queue", async (c) => {
  const db = c.env.DB;
  const alerts = await getWorkQueueAlerts(db);
  return c.json(alerts);
});

// GET /api/admin/overview/credit-chart — seasonal credit bar chart
adminRoutes.get("/api/admin/overview/credit-chart", async (c) => {
  const db = c.env.DB;
  const chart = await getCreditChart(db);
  return c.json(chart);
});

// GET /api/admin/overview/ghg-sources — GHG emission source table
adminRoutes.get("/api/admin/overview/ghg-sources", async (c) => {
  const db = c.env.DB;
  const sources = await getGhgSourceTable(db);
  return c.json(sources);
});

// GET /api/admin/overview/provinces — province/sponsor table
adminRoutes.get("/api/admin/overview/provinces", async (c) => {
  const db = c.env.DB;
  const provinces = await getProvinceTable(db);
  return c.json(provinces);
});

// ── Sponsors Management API ───────────────────────────────────────────

// GET /api/admin/sponsors — List sponsors
adminRoutes.get("/api/admin/sponsors", async (c) => {
  const db = c.env.DB;
  const sponsors = await getSponsors(db);
  return c.json(sponsors);
});

// ── Settings API ──────────────────────────────────────────────────────

// GET /api/admin/settings — Get all settings
adminRoutes.get("/api/admin/settings", async (c) => {
  const db = c.env.DB;
  const settings = await getSettings(db);
  return c.json(settings);
});

// POST /api/admin/settings — Update settings
adminRoutes.post("/api/admin/settings", async (c) => {
  const db = c.env.DB;
  const body = await c.req.json<{ tab: string; data: unknown }>();
  const result = await updateSettings(db, body.tab, body.data);

  // Audit-log the settings change
  const session = c.get("session" as never) as { userId?: string } | undefined;
  const auditId = `audit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  try {
    await db
      .prepare(
        `INSERT INTO automation_audit_log (id, photo_evidence_id, actor_type, action, reason, entity_type, entity_id, created_at)
         VALUES (?, NULL, 'admin', 'update_settings', ?, 'setting', ?, datetime('now'))`,
      )
      .bind(auditId, `Settings tab: ${body.tab}`, body.tab)
      .run();
  } catch {
    // audit log failure is non-fatal
  }

  if (result.success) {
    return c.json({ ok: true });
  }
  return c.json({ error: result.error }, 400);
});

// ── Reports API ───────────────────────────────────────────────────────

// GET /api/admin/reports — List report catalogue
adminRoutes.get("/api/admin/reports", async (c) => {
  const db = c.env.DB;
  const reports = await getReports(db);
  return c.json(reports);
});

// GET /api/admin/reports/:id/download — Download report + audit log
adminRoutes.get("/api/admin/reports/:id/download", async (c) => {
  const db = c.env.DB;
  const reportId = c.req.param("id");
  const session = c.get("session" as never) as { userId?: string } | undefined;

  // Log the download
  await logReportDownload(db, session?.userId ?? "unknown", reportId);

  // For now, return a placeholder response
  return c.json({ ok: true, message: `Report ${reportId} download initiated` });
});

// ── HTML Pages ─────────────────────────────────────────────────────────

// GET /admin/overview — Operational overview dashboard
adminRoutes.get("/admin/overview", async (c) => {
  const db = c.env.DB;
  const seasonFilter = c.req.query("season") || undefined;
  const provinceFilter = c.req.query("province") || "";
  const [kpis, queue, credits, provinces] = await Promise.all([
    getOverviewKpis(db, {
      season: seasonFilter,
      province: provinceFilter || undefined,
    }),
    getWorkQueueAlerts(db),
    getCreditChart(db),
    getProvinceTable(db),
  ]);

  const visibleProvinces = provinceFilter ? provinces.filter((p) => p.province === provinceFilter) : provinces;
  const body = `
    <div class="card" style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">
      <strong>ตัวกรอง:</strong>
      <form method="GET" action="/admin/overview" style="display:flex;gap:8px;align-items:center">
        <select name="province" style="padding:7px;border:1px solid #ddd;border-radius:6px">
          <option value="">ทุกจังหวัด</option>
          ${provinces.map((p) => `<option value="${p.province}"${p.province === provinceFilter ? " selected" : ""}>${p.province}</option>`).join("")}
        </select>
        <input name="season" placeholder="Season ID" value="${seasonFilter ?? ""}" style="padding:7px;border:1px solid #ddd;border-radius:6px" />
        <button class="btn btn-primary" type="submit">กรอง</button>
      </form>
    </div>
    <div class="kpi">
      <div class="kpi-card"><h3>${kpis.totalFarmers}</h3><p>ครัวเรือน</p></div>
      <div class="kpi-card"><h3>${kpis.totalPlots}</h3><p>แปลงย่อย</p></div>
      <div class="kpi-card"><h3>${kpis.totalAreaRai?.toFixed(1) ?? 0}</h3><p>ไร่</p></div>
      <div class="kpi-card"><h3>${kpis.totalCredits?.toFixed(1) ?? 0}</h3><p>tCO₂eq สุทธิ</p></div>
    </div>
    <div class="card">
      <h3 style="margin-bottom:12px">มาตรฐาน T-VER-P-METH-13-08</h3>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div>
          <h4 style="font-size:14px;margin-bottom:8px">⚡ คิวงาน</h4>
          <table>
            <tr><td>คำขอรอดำเนินการ</td><td><strong>${queue.pendingApplications}</strong>${queue.urgentApplications > 0 ? ` <span class="badge" style="background:#f8d7da;color:#721c24">${queue.urgentApplications} เร่งด่วน</span>` : ""}</td></tr>
            <tr><td>ภาพรอตรวจ</td><td><strong>${queue.photoQueue}</strong>${queue.urgentPhotos > 0 ? ` <span class="badge" style="background:#f8d7da;color:#721c24">${queue.urgentPhotos} เร่งด่วน</span>` : ""}</td></tr>
            <tr><td>ขาดภาพถ่าย</td><td><strong>${queue.missingPhotos}</strong></td></tr>
            <tr><td>SF_w fallback</td><td><strong>${queue.sfwFallback}</strong></td></tr>
          </table>
          <div style="margin-top:8px"><a href="/admin/applications" class="btn btn-primary">ดูคำขอ</a> <a href="/admin/review" class="btn btn-secondary">ดูภาพ</a></div>
        </div>
        <div>
          <h4 style="font-size:14px;margin-bottom:8px">📊 เครดิตตามฤดู</h4>
          <table>
            <tr><th>ฤดู</th><th>ประมาณการ</th><th>ยืนยัน</th></tr>
            ${credits.map((r) => `<tr><td>${r.season ?? "-"}</td><td>${r.estimated.toFixed(1)}</td><td style="color:#06c755;font-weight:600">${r.verified.toFixed(1)}</td></tr>`).join("")}
          </table>
        </div>
      </div>
    </div>
    <div class="card">
      <h4 style="font-size:14px;margin-bottom:8px">🗺️ ตามจังหวัด</h4>
      <table>
        <tr><th>จังหวัด</th><th>ผู้สนับสนุน</th><th>แปลง</th><th>เครดิต (tCO₂eq)</th></tr>
        ${visibleProvinces.map((r) => `<tr><td>${r.province}</td><td>${r.sponsor}</td><td>${r.plots}</td><td>${r.credits.toFixed(1)}</td></tr>`).join("")}
      </table>
      <div style="margin-top:8px"><a href="/admin/reports" class="btn btn-primary">📥 ส่งออกรายงาน</a></div>
    </div>
  `;
  return c.html(adminShell("ภาพรวม", "overview", body));
});

// GET /admin/applications — Application review queue
adminRoutes.get("/admin/applications", async (c) => {
  const db = c.env.DB;
  const apps = await getApplications(db);

  const body = `
    <div class="card">
      <h3 style="margin-bottom:12px">📝 คิวคำขอจดทะเบียน</h3>
      ${apps.length === 0 ? '<div class="empty">ไม่มีคำขอ</div>' : `
      <table>
        <tr><th>ID</th><th>เกษตรกร</th><th>จังหวัด</th><th>ประเภท</th><th>เอกสาร</th><th>อายุ(วัน)</th><th>สถานะ</th><th>จัดการ</th></tr>
        ${apps.map((a: Record<string, unknown>) => `<tr>
          <td>${a.id}</td>
          <td>${a.farmer_name ?? "-"}</td>
          <td>${a.province ?? "-"}</td>
          <td>${a.holding_type ?? "owner"}</td>
          <td>${a.doc_count ?? 0}/${a.docs_needed ?? 3}</td>
          <td>${a.age_days ?? 0}</td>
          <td><span class="badge" style="background:${a.status === "verified" ? "#d4edda" : a.status === "hold" ? "#fff3cd" : a.status === "rejected" ? "#f8d7da" : "#e2e3e5"};color:${a.status === "verified" ? "#155724" : a.status === "hold" ? "#856404" : a.status === "rejected" ? "#721c24" : "#383d41"}">${a.status}</span></td>
          <td>
            ${a.status === "pending" ? `
              <button class="btn btn-primary" onclick="appAction('${a.id}','approve')">✓ อนุมัติ</button>
              <button class="btn btn-warn" onclick="appAction('${a.id}','hold')">⏸ ถือ</button>
              <button class="btn btn-danger" onclick="appAction('${a.id}','reject')">✗ ปฏิเสธ</button>
            ` : "-"}
          </td>
        </tr>`).join("")}
      </table>`}
      <p style="font-size:11px;color:#999;margin-top:8px">⚠️ OCR ไม่พร้อมใช้งาน — ข้อมูลตัวอย่าง</p>
    </div>
    <script>
      async function appAction(id, action) {
        const reason = (action === 'hold' || action === 'reject') ? prompt('เหตุผล:') : '';
        if ((action === 'hold' || action === 'reject') && !reason) return;
        const res = await fetch('/api/admin/applications/' + id + '/' + action, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason }),
        });
        if (res.ok) location.reload(); else alert('Error: ' + await res.text());
      }
    </script>
  `;
  return c.html(adminShell("คำขอจดทะเบียน", "applications", body));
});

// GET /admin/farmers — Farmer registry
adminRoutes.get("/admin/farmers", async (c) => {
  const db = c.env.DB;
  const { results } = await db
    .prepare(
      `SELECT f.id, f.full_name, f.addr_province, f.cpa_code,
              COUNT(DISTINCT p.id) as plot_count,
              COALESCE(SUM(p.area_rai), 0) as total_rai,
              COALESCE((SELECT SUM(ce.burning_emissions) FROM carbon_estimates ce
                        JOIN plots p2 ON p2.id = ce.plot_id WHERE p2.farmer_id = f.id), 0) as BE,
              (SELECT COUNT(*) FROM photo_evidence pe
               JOIN plots p3 ON p3.id = pe.plot_id WHERE p3.farmer_id = f.id) as PE,
              CASE
                WHEN EXISTS (SELECT 1 FROM carbon_estimates ce JOIN plots p4 ON p4.id = ce.plot_id
                             WHERE p4.farmer_id = f.id AND ce.status = 'final') THEN 'verified'
                WHEN EXISTS (SELECT 1 FROM carbon_estimates ce JOIN plots p5 ON p5.id = ce.plot_id
                             WHERE p5.farmer_id = f.id) THEN 'estimated'
                ELSE 'none'
              END as ER
       FROM farmers f
       LEFT JOIN plots p ON p.farmer_id = f.id
       GROUP BY f.id
       ORDER BY f.full_name ASC`,
    )
    .bind()
    .all();

  const farmers = results ?? [];
  const body = `
    <div class="card">
      <h3 style="margin-bottom:12px">🌾 ทะเบียนเกษตรกร (${farmers.length})</h3>
      ${farmers.length === 0 ? '<div class="empty">ไม่มีข้อมูลเกษตรกร</div>' : `
      <table>
        <tr><th>CPA</th><th>ชื่อ</th><th>จังหวัด</th><th>แปลง</th><th>ไร่</th><th>BE</th><th>PE</th><th>ER</th><th>ดู</th></tr>
        ${farmers.map((f: Record<string, unknown>) => `<tr>
          <td>${f.cpa_code ?? "-"}</td>
          <td>${f.full_name ?? "-"}</td>
          <td>${f.addr_province ?? "-"}</td>
          <td>${f.plot_count}</td>
          <td>${Number(f.total_rai).toFixed(1)}</td>
          <td>${Number(f.BE).toFixed(2)}</td>
          <td>${f.PE}</td>
          <td><span class="badge" style="background:${f.ER === "verified" ? "#d4edda" : f.ER === "estimated" ? "#fff3cd" : "#e2e3e5"};color:${f.ER === "verified" ? "#155724" : f.ER === "estimated" ? "#856404" : "#383d41"}">${f.ER}</span></td>
          <td><a href="/admin/farmers/${f.id}" class="btn btn-secondary">รายละเอียด</a></td>
        </tr>`).join("")}
      </table>`}
    </div>
  `;
  return c.html(adminShell("ทะเบียนเกษตรกร", "farmers", body));
});

// GET /admin/farmers/:id — Farmer detail (5-tab view)
adminRoutes.get("/admin/farmers/:id", async (c) => {
  const db = c.env.DB;
  const farmerId = c.req.param("id");
  const detail = await getFarmerDetail(db, farmerId);
  if (!detail) return c.html(adminShell("ไม่พบเกษตรกร", "farmers", '<div class="empty">ไม่พบข้อมูลเกษตรกร</div>'));

  const plots = (detail as Record<string, unknown>).plots as Array<Record<string, unknown>> | undefined ?? [];
  const photos = (detail as Record<string, unknown>).photos as Array<Record<string, unknown>> | undefined ?? [];
  const trace = (detail as Record<string, unknown>).carbonTrace as Record<string, unknown> | undefined;

  const body = `
    <div class="card">
      <h3 style="margin-bottom:12px">🌾 รายละเอียดเกษตรกร</h3>
      <h4 style="font-size:14px;margin-bottom:8px">แปลงและเอกสาร (${plots.length})</h4>
      ${plots.length === 0 ? '<p style="color:#999">ไม่มีแปลง</p>' : `
      <table>
        <tr><th>รหัสแปลง</th><th>ไร่</th><th>พันธุ์ข้าว</th><th>เอกสาร</th><th>ฤดู</th><th>คาร์บอน</th></tr>
        ${plots.map((p) => `<tr>
          <td>${p.plot_code ?? "-"}</td>
          <td>${Number(p.area_rai ?? 0).toFixed(1)}</td>
          <td>${p.rice_variety ?? "-"}</td>
          <td>${p.doc_type ?? "-"}</td>
          <td>${p.season_name ?? "-"}</td>
          <td>${Number(p.carbon_total ?? 0).toFixed(2)}</td>
        </tr>`).join("")}
      </table>`}
    </div>
    ${trace ? `
    <div class="card">
      <h4 style="font-size:14px;margin-bottom:8px">📊 CalcTrace — T-VER-P-METH-13-08</h4>
      <table>
        <tr><th>ขั้นตอน</th><th>พื้นฐาน</th><th>โครงการ</th><th>การลด</th></tr>
        ${["ch4", "n2o", "co2"].map((g) => `<tr>
          <td>${g.toUpperCase()} baseline/project</td>
          <td>${Number((trace as Record<string, Record<string, number>>)[`${g}_baseline`] ?? 0).toFixed(3)}</td>
          <td>${Number((trace as Record<string, Record<string, number>>)[`${g}_project`] ?? 0).toFixed(3)}</td>
          <td style="color:#06c755;font-weight:600">${Number((trace as Record<string, Record<string, number>>)[`${g}_reduction`] ?? 0).toFixed(3)}</td>
        </tr>`).join("")}
        <tr><td>SF_w / SF_p / SF_o</td><td>${Number((trace as Record<string, number>).sf_w ?? 0).toFixed(3)}</td><td>${Number((trace as Record<string, number>).sf_p ?? 0).toFixed(3)}</td><td>${Number((trace as Record<string, number>).sf_o ?? 0).toFixed(3)}</td></tr>
        <tr style="font-weight:600"><td>Uncertainty deduction (U_d)</td><td colspan="3">${Number((trace as Record<string, number>).u_d ?? 0).toFixed(3)} tCO₂eq</td></tr>
      </table>
    </div>` : ""}
    <div class="card">
      <h4 style="font-size:14px;margin-bottom:8px">📸 ภาพถ่าย (${photos.length})</h4>
      ${photos.length === 0 ? '<p style="color:#999">ไม่มีภาพถ่าย</p>' : `
      <table>
        <tr><th>ประเภท</th><th>GPS</th><th>วันที่</th><th>สถานะ AI</th><th>สถานะ Admin</th></tr>
        ${photos.map((p) => `<tr>
          <td>${p.photo_type ?? "-"}</td>
          <td>${p.gps_lat ?? "-"}, ${p.gps_lng ?? "-"}</td>
          <td>${p.taken_at ?? "-"}</td>
          <td>${p.ai_status ?? "-"}</td>
          <td>${p.admin_status ?? "-"}</td>
        </tr>`).join("")}
      </table>`}
    </div>
  `;
  return c.html(adminShell("รายละเอียดเกษตรกร", "farmers", body));
});

// GET /admin/sponsors — Sponsor management
adminRoutes.get("/admin/sponsors", async (c) => {
  const db = c.env.DB;
  const sponsors = await getSponsors(db);

  const body = `
    <div class="card">
      <h3 style="margin-bottom:12px">🏢 ผู้สนับสนุน (${sponsors.length})</h3>
      ${sponsors.length === 0 ? '<div class="empty">ไม่มีผู้สนับสนุน</div>' : `
      <table>
        <tr><th>ชื่อ</th><th>อีเมล</th><th>พื้นที่</th></tr>
        ${sponsors.map((s: Record<string, unknown>) => `<tr>
          <td>${s.name ?? "-"}</td>
          <td>${s.email ?? "-"}</td>
          <td>${Array.isArray(s.areas) ? (s.areas as string[]).join(", ") : "-"}</td>
        </tr>`).join("")}
      </table>`}
    </div>
  `;
  return c.html(adminShell("ผู้สนับสนุน", "sponsors", body));
});

// GET /admin/reports — Report catalogue
adminRoutes.get("/admin/reports", async (c) => {
  const db = c.env.DB;
  const reports = await getReports(db);

  const body = `
    <div class="card">
      <h3 style="margin-bottom:12px">📥 รายงาน (${reports.length})</h3>
      <table>
        <tr><th>รหัส</th><th>ชื่อ</th><th>คำอธิบาย</th><th>ดาวน์โหลด</th></tr>
        ${reports.map((r: Record<string, unknown>) => `<tr>
          <td>${r.id ?? r.code ?? "-"}</td>
          <td>${r.name ?? r.title ?? "-"}</td>
          <td>${r.description ?? "-"}</td>
          <td><a href="/api/admin/reports/${r.id ?? r.code}/download" class="btn btn-primary">📥 ดาวน์โหลด</a></td>
        </tr>`).join("")}
      </table>
    </div>
  `;
  return c.html(adminShell("รายงาน", "reports", body));
});

// GET /admin/settings — Settings panel
adminRoutes.get("/admin/settings", async (c) => {
  const db = c.env.DB;
  const settings = await getSettings(db);

  const perms = (settings as Record<string, unknown>).permissions as Record<string, unknown> | undefined ?? {};
  const constants = (settings as Record<string, unknown>).constants as Record<string, unknown> | undefined ?? {};

  const body = `
    <div class="card">
      <h3 style="margin-bottom:12px">⚙️ ตั้งค่าระบบ</h3>
      <h4 style="font-size:14px;margin-bottom:8px">สิทธิ์การเข้าถึง (5 บทบาท × 15 หมวดหมู่)</h4>
      <table>
        <tr><th>บทบาท</th><th>สิทธิ์</th></tr>
        ${Object.entries(perms).map(([role, permsList]) => `<tr>
          <td><strong>${role}</strong></td>
          <td style="font-size:11px">${Array.isArray(permsList) ? (permsList as string[]).join(", ") : JSON.stringify(permsList)}</td>
        </tr>`).join("")}
      </table>
    </div>
    <div class="card">
      <h4 style="font-size:14px;margin-bottom:8px">ค่าคงที่วิธีการคำนวณ</h4>
      <table>
        <tr><th>พารามิเตอร์</th><th>ค่า</th></tr>
        ${Object.entries(constants).map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join("")}
      </table>
    </div>
  `;
  return c.html(adminShell("ตั้งค่า", "settings", body));
});
