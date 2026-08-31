import { Hono } from "hono";
import { parseSessionCookie } from "../auth/session";

type Bindings = {
  DB: D1Database;
  R2: R2Bucket;
  ENVIRONMENT: string;
  SECRET: string;
};

export const authRoutes = new Hono<{ Bindings: Bindings }>();

function renderLoginPage(error?: string): string {
  const errorHtml = error
    ? `<div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:12px;padding:12px 16px;display:flex;align-items:center;gap:8px;margin-bottom:16px">
        <span class="material-symbols-outlined" style="color:#dc2626;font-size:20px">error</span>
        <span style="color:#991b1b;font-size:14px">${error}</span>
      </div>`
    : "";
  return `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>NetZeroCarbon — เข้าสู่ระบบ</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Sarabun',sans-serif; background:#f0f4f8; min-height:100vh; display:flex; align-items:center; justify-content:center; }
    .card { background:#fff; border-radius:24px; box-shadow:5px 5px 15px #d1d9e6,-5px -5px 15px #fff; padding:40px; width:100%; max-width:380px; margin:16px; }
    .brand { display:flex; align-items:center; gap:10px; margin-bottom:32px; justify-content:center; }
    .brand-icon { width:40px; height:40px; background:#006e2b; border-radius:12px; display:flex; align-items:center; justify-content:center; }
    .brand-icon span { color:#fff; font-size:22px; }
    .brand-text { font-size:22px; font-weight:700; color:#1a1a2e; }
    .subtitle { text-align:center; color:#666; font-size:14px; margin-bottom:24px; }
    .field { margin-bottom:16px; }
    .field label { display:block; font-size:13px; font-weight:600; color:#444; margin-bottom:6px; }
    .field input { width:100%; padding:12px 16px; border:none; border-radius:12px; background:#f0f4f8; box-shadow:inset 2px 2px 5px rgba(0,0,0,0.05),inset -2px -2px 5px rgba(255,255,255,0.5); font-size:15px; font-family:inherit; outline:none; transition:box-shadow .2s; }
    .field input:focus { box-shadow:inset 2px 2px 5px rgba(0,0,0,0.05),inset -2px -2px 5px rgba(255,255,255,0.5),0 0 0 2px #006e2b33; }
    .btn { width:100%; padding:14px; border:none; border-radius:14px; background:#006e2b; color:#fff; font-size:16px; font-weight:600; font-family:inherit; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; transition:background .2s; box-shadow:3px 3px 8px rgba(0,110,43,0.3); }
    .btn:hover { background:#005a23; }
    .btn:active { transform:scale(0.98); }
    .footer { text-align:center; margin-top:20px; font-size:12px; color:#999; }
  </style>
</head>
<body>
  <div class="card">
    <div class="brand">
      <div class="brand-icon"><span class="material-symbols-outlined">eco</span></div>
      <span class="brand-text">NetZeroCarbon</span>
    </div>
    <p class="subtitle">เข้าสู่ระบบจัดการคาร์บอนเครดิต</p>
    ${errorHtml}
    <form method="POST" action="/login">
      <div class="field">
        <label>อีเมล</label>
        <input name="email" type="email" required placeholder="admin@netzero.local" autocomplete="email">
      </div>
      <div class="field">
        <label>รหัสผ่าน</label>
        <input name="password" type="password" required placeholder="••••••••" autocomplete="current-password">
      </div>
      <button type="submit" class="btn">
        <span class="material-symbols-outlined" style="font-size:20px">login</span>
        เข้าสู่ระบบ
      </button>
    </form>
    <p class="footer">NetZeroCarbon POC1 — ระบบคาร์บอนเครดิตสำหรับเกษตรกร</p>
  </div>
</body>
</html>`;
}

authRoutes.get("/login", (c) => {
  return c.html(renderLoginPage());
});

authRoutes.post("/login", async (c) => {
  const form = await c.req.formData();
  const email = form.get("email") as string | null;
  const password = form.get("password") as string | null;

  if (!email || !password) {
    return c.html(renderLoginPage("Email and password are required"), 400);
  }

  const user = await c.env.DB.prepare(
    "SELECT id, email, password_hash, role FROM users WHERE email = ?",
  )
    .bind(email)
    .first<{ id: string; email: string; password_hash: string; role: string }>();

  if (!user) {
    return c.html(renderLoginPage("Invalid credentials"), 401);
  }

  // Import verifyPassword dynamically to avoid circular issues
  const { verifyPassword } = await import("../auth/password");
  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    return c.html(renderLoginPage("Invalid credentials"), 401);
  }

  const { createSessionCookie } = await import("../auth/session");
  const cookie = createSessionCookie(
    { userId: user.id, role: user.role as "admin" | "sponsor", email: user.email },
    c.env.SECRET,
  );

  const redirectPath = user.role === "admin" ? "/admin" : "/sponsor";
  return new Response(null, {
    status: 302,
    headers: { Location: redirectPath, "Set-Cookie": cookie },
  });
});

authRoutes.post("/logout", (c) => {
  return c.json({ ok: true }, 200, {
    "Set-Cookie": "nzc_session=; Max-Age=0; Path=/; HttpOnly",
  });
});

authRoutes.get("/redirect", (c) => {
  const cookieHeader = c.req.header("Cookie") ?? "";
  const match = cookieHeader.match(/nzc_session=([^;]+)/);
  if (!match?.[1]) {
    return new Response(null, { status: 302, headers: { Location: "/login" } });
  }

  const session = parseSessionCookie(match[1], c.env.SECRET);
  if (!session) {
    return new Response(null, { status: 302, headers: { Location: "/login" } });
  }

  const path = session.role === "admin" ? "/admin" : "/sponsor";
  return new Response(null, { status: 302, headers: { Location: path } });
});
