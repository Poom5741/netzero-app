/**
 * Admin Review Dashboard — photo review queue + review actions.
 */

import { Hono } from "hono";
import { getReviewQueue } from "../admin/queue";
import { reviewPhoto } from "../admin/review";
import { getPhotoDetail } from "../admin/detail";
import { parseSessionCookie } from "../auth/session";

type Bindings = {
  DB: D1Database;
  R2: R2Bucket;
  SECRET: string;
};

export const adminRoutes = new Hono<{ Bindings: Bindings }>();

// Auth helper
function requireAdmin(c: { req: { header: (name: string) => string | undefined } }, secret: string) {
  const cookieHeader = c.req.header("Cookie") ?? "";
  const match = cookieHeader.match(/nzc_session=([^;]+)/);
  if (!match?.[1]) return null;
  const session = parseSessionCookie(match[1], secret);
  if (!session || session.role !== "admin") return null;
  return session;
}

// GET /admin/review — Photo review queue
adminRoutes.get("/admin/review", async (c) => {
  const session = requireAdmin(c, c.env.SECRET);
  if (!session) return c.json({ error: "Unauthorized" }, 401);

  const db = c.env.DB;
  const filter = c.req.query("status") || undefined;
  const queue = await getReviewQueue(db, filter);

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
    .actions { display: flex; gap: 6px; }
    .btn { padding: 6px 14px; border: none; border-radius: 6px; font-size: 12px; cursor: pointer; }
    .btn-verify { background: #06c755; color: white; }
    .btn-reject { background: #dc3545; color: white; }
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
    <a href="/admin/review" class="${!filter ? 'active' : ''}">ทั้งหมด</a>
    <a href="/admin/review?status=flag" class="${filter === 'flag' ? 'active' : ''}">🚩 Flag</a>
    <a href="/admin/review?status=pending" class="${filter === 'pending' ? 'active' : ''}">⏳ Pending</a>
    <a href="/admin/review?status=pass" class="${filter === 'pass' ? 'active' : ''}">✅ Pass</a>
    <a href="/admin/review?status=reject" class="${filter === 'reject' ? 'active' : ''}">❌ Reject</a>
  </div>
  <div class="queue">
    ${queue.length === 0 ? '<div class="empty">ไม่มีภาพในคิว</div>' : queue.map(item => `
      <div class="item">
        <img src="/api/photo/${item.id}" alt="photo">
        <div class="item-info">
          <h3>${item.plot_id} <span class="badge ${item.ai_status}">${item.ai_status}</span> <span class="badge ${item.admin_status}">${item.admin_status}</span></h3>
          <p>${item.ai_label || '-'} | ${(item.ai_confidence * 100).toFixed(0)}% confidence</p>
          <p>${item.ai_reason || ''}</p>
        </div>
        <div class="actions">
          <button class="btn btn-verify" onclick="review('${item.id}','verified')">✓ ผ่าน</button>
          <button class="btn btn-reject" onclick="review('${item.id}','rejected')">✗ ตีกลับ</button>
        </div>
      </div>
    `).join('')}
  </div>
  <script>
    async function review(photoId, status) {
      const reason = status === 'rejected' ? prompt('เหตุผลที่ตีกลับ:') : '';
      if (status === 'rejected' && !reason) return;
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

// POST /api/admin/review/:photoId — Review a photo
adminRoutes.post("/api/admin/review/:photoId", async (c) => {
  const session = requireAdmin(c, c.env.SECRET);
  if (!session) return c.json({ error: "Unauthorized" }, 401);

  const db = c.env.DB;
  const photoId = c.req.param("photoId");
  const body = await c.req.json<{ status: string; reason?: string }>();

  const result = await reviewPhoto(db, photoId, body.status as "verified" | "rejected", body.reason || "");
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
