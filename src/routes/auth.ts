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
    <p style="text-align:center;color:#64748b;font-size:12px;margin:-12px 0 20px">มาตรฐาน T-VER-P-METH-13-08</p>
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
      <div class="field">
        <label>รหัส OTP (ถ้ามี)</label>
        <input name="otp" type="text" pattern="[0-9]{6}" maxlength="6" placeholder="123456" autocomplete="one-time-code" inputmode="numeric">
      </div>
      <label style="display:flex;align-items:center;gap:8px;font-size:13px;color:#444;margin:4px 0 16px"><input name="remember" type="checkbox"> จดจำอุปกรณ์นี้</label>
      <a href="mailto:support@netzero.local?subject=Reset%20password" style="display:block;text-align:right;color:#006e2b;font-size:13px;margin:-6px 0 16px">ลืมรหัสผ่าน?</a>
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
  try {
    const form = await c.req.formData();
    const email = form.get("email") as string | null;
    const password = form.get("password") as string | null;
    const otp = form.get("otp") as string | null;

    if (!email || !password) {
      return c.html(renderLoginPage("Email and password are required"), 400);
    }

    const user = await c.env.DB.prepare(
      "SELECT id, email, password_hash, role, otp_secret FROM users WHERE email = ?",
    )
      .bind(email)
      .first<{
        id: string;
        email: string;
        password_hash: string;
        role: string;
        otp_secret: string | null;
      }>();

    if (!user) {
      return c.html(renderLoginPage("Invalid credentials"), 401);
    }

    // Import verifyPassword dynamically to avoid circular issues
    const { verifyPassword } = await import("../auth/password");
    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return c.html(renderLoginPage("Invalid credentials"), 401);
    }

    // OTP verification — required only when user has otp_secret set
    if (user.otp_secret) {
      if (!otp) {
        return c.html(renderLoginPage("OTP code is required"), 401);
      }
      const { verifyOtp } = await import("../auth/otp");
      if (!verifyOtp(user.otp_secret, otp)) {
        return c.html(renderLoginPage("Invalid OTP code"), 401);
      }
    }

    const { createSessionCookie } = await import("../auth/session");
    const remember = form.get("remember") === "on";
    // T090 — extend session to 30 days when "remember device" is checked (AD-AUTH-02)
    const maxAge = remember ? 86400 * 30 : 86400;
    const cookie = await createSessionCookie(
      { userId: user.id, role: user.role as "admin" | "sponsor", email: user.email },
      c.env.SECRET,
      true,
      maxAge,
      "Lax",  // Explicitly set Lax for admin/sponsor login compatibility
    );

    // T063 — audit log entry for successful sign-in (AD-AUTH-03)
    try {
      const auditId = `audit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      await c.env.DB.prepare(
        `INSERT INTO automation_audit_log (id, photo_evidence_id, actor_type, action, reason, entity_type, entity_id, created_at)
       VALUES (?, NULL, 'admin', 'sign_in', ?, 'user', ?, datetime('now'))`,
      )
        .bind(auditId, `sign-in ${user.role}`, user.id)
        .run();
    } catch (err) {
      console.error("sign-in audit log failed:", err);
    }

    const redirectPath = user.role === "admin" ? "/admin" : "/sponsor";
    return new Response(null, {
      status: 302,
      headers: { Location: redirectPath, "Set-Cookie": cookie },
    });
  } catch (error) {
    console.error("Login error:", error);
    return c.json(
      { error: "Login failed", details: error instanceof Error ? error.message : String(error) },
      500,
    );
  }
});

authRoutes.post("/logout", (c) => {
  return c.json({ ok: true }, 200, {
    "Set-Cookie": "nzc_session=; Max-Age=0; Path=/; HttpOnly",
  });
});

authRoutes.get("/session", async (c) => {
  const cookieHeader = c.req.header("Cookie") ?? "";
  const match = cookieHeader.match(/nzc_session=([^;]+)/);
  if (!match?.[1]) {
    return c.json({ authenticated: false }, 401);
  }
  const session = await parseSessionCookie(match[1], c.env.SECRET);
  if (!session) {
    return c.json({ authenticated: false }, 401);
  }
  return c.json({ authenticated: true, role: session.role, email: session.email });
});

authRoutes.get("/redirect", async (c) => {
  const cookieHeader = c.req.header("Cookie") ?? "";
  const match = cookieHeader.match(/nzc_session=([^;]+)/);
  if (!match?.[1]) {
    return new Response(null, { status: 302, headers: { Location: "/login" } });
  }

  const session = await parseSessionCookie(match[1], c.env.SECRET);
  if (!session) {
    return new Response(null, { status: 302, headers: { Location: "/login" } });
  }

  const path = session.role === "admin" ? "/admin" : "/sponsor";
  return new Response(null, { status: 302, headers: { Location: path } });
});
