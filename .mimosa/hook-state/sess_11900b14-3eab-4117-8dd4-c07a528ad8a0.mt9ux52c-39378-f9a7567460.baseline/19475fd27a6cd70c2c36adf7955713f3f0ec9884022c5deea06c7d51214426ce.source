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
  const errorHtml = error ? `<p style="color:red">${error}</p>` : "";
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>NetZeroCarbon Login</title></head>
<body>
<h1>NetZeroCarbon</h1>
${errorHtml}
<form method="POST" action="/login">
  <label>Email <input name="email" type="email" required></label>
  <label>Password <input name="password" type="password" required></label>
  <button type="submit">Log in</button>
</form>
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
