import { Hono } from "hono";
import { parseSessionCookie, createSessionCookie } from "../auth/session";
import { verifyPassword } from "../auth/password";

type Bindings = {
  DB: D1Database;
  SECRET: string;
};

export const authRoutes = new Hono<{ Bindings: Bindings }>();

// POST /login — JSON body, returns session cookie + { email, role }
authRoutes.post("/login", async (c) => {
  const body = await c.req.json<{ email?: string; password?: string }>().catch(() => null);
  const email = body?.email?.trim();
  const password = body?.password;

  if (!email || !password) {
    return c.json({ error: "Email and password are required" }, 400);
  }

  const user = await c.env.DB.prepare(
    "SELECT id, email, password_hash, role FROM users WHERE email = ?",
  )
    .bind(email)
    .first<{ id: string; email: string; password_hash: string; role: string }>();

  if (!user) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const cookie = await createSessionCookie(
    { userId: user.id, role: user.role, email: user.email },
    c.env.SECRET,
  );

  return c.json(
    { email: user.email, role: user.role },
    200,
    { "Set-Cookie": cookie },
  );
});

// GET /me — return current session info
authRoutes.get("/me", async (c) => {
  const cookieHeader = c.req.header("Cookie") ?? "";
  const match = cookieHeader.match(/nzc_session=([^;]+)/);
  if (!match?.[1]) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const session = await parseSessionCookie(match[1], c.env.SECRET);
  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  return c.json({ email: session.email, role: session.role });
});

// POST /logout — clear session cookie
authRoutes.post("/logout", (c) => {
  return c.json({ ok: true }, 200, {
    "Set-Cookie": "nzc_session=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax",
  });
});
