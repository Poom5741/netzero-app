import { Hono } from "hono";
import { parseSessionCookie } from "../auth/session";

type Bindings = {
  DB: D1Database;
  R2: R2Bucket;
  ENVIRONMENT: string;
  SECRET: string;
};

export const dashboardRoutes = new Hono<{ Bindings: Bindings }>();

function renderAdminDashboard(): string {
  return `<!DOCTYPE html>
<html lang="th">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Admin Dashboard - NetZeroCarbon</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, sans-serif; background: #f5f5f5; }
  .header { background: #1a1a2e; color: white; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; }
  .header h1 { font-size: 18px; }
  .header a { color: #aaa; text-decoration: none; font-size: 14px; }
  .cards { padding: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .card { background: white; border-radius: 12px; padding: 20px; text-decoration: none; color: #333; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
  .card h3 { font-size: 24px; margin-bottom: 4px; }
  .card p { font-size: 13px; color: #666; }
</style>
</head>
<body>
  <div class="header">
    <h1>🌱 Admin Dashboard</h1>
    <a href="/logout">ออกจากระบบ</a>
  </div>
  <div class="cards">
    <a href="/admin/review" class="card">
      <h3>📋</h3>
      <h3>คิวตรวจภาพ</h3>
      <p>ตรวจสอบและอนุมัติภาพหลักฐาน</p>
    </a>
    <a href="/admin/season" class="card">
      <h3>🌾</h3>
      <h3>อนุมัติฤดู</h3>
      <p>อนุมัติข้อมูลฤดูและคำนวณคาร์บอน</p>
    </a>
    <a href="/sponsor" class="card">
      <h3>📊</h3>
      <h3>Sponsor Dashboard</h3>
      <p>ดูข้อมูลเครดิตคาร์บอน</p>
    </a>
    <a href="/export/estimates" class="card">
      <h3>📥</h3>
      <h3>Export</h3>
      <p>ดาวน์โหลดข้อมูล CSV/JSON</p>
    </a>
  </div>
</body>
</html>`;
}

function renderSponsorDashboard(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sponsor Dashboard</title></head>
<body>
<h1>Sponsor Dashboard</h1>
<p>Welcome, sponsor.</p>
<nav>
  <a href="/sponsor/plots">My Plots</a>
  <a href="/sponsor/estimates">Carbon Estimates</a>
</nav>
</body>
</html>`;
}

async function extractSession(
  c: { req: { header: (name: string) => string | undefined } },
  secret: string,
) {
  const cookieHeader = c.req.header("Cookie") ?? "";
  const match = cookieHeader.match(/nzc_session=([^;]+)/);
  if (!match?.[1]) return null;
  return parseSessionCookie(match[1], secret);
}

dashboardRoutes.get("/admin", async (c) => {
  const secret = c.env.SECRET;
  const session = await extractSession(c, secret);
  if (!session) return c.json({ error: "Unauthorized" }, 401);
  if (session.role !== "admin") return c.json({ error: "Forbidden" }, 403);
  return c.html(renderAdminDashboard());
});

dashboardRoutes.get("/sponsor", async (c) => {
  const secret = c.env.SECRET;
  const session = await extractSession(c, secret);
  if (!session) return c.json({ error: "Unauthorized" }, 401);
  if (session.role !== "sponsor") return c.json({ error: "Forbidden" }, 403);
  return c.html(renderSponsorDashboard());
});
