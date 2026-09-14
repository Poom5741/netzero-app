import { Hono } from "hono";
import { requireRole } from "../auth/middleware";
import { verifyOtp } from "../auth/otp";
import { verifyPassword } from "../auth/password";
import type { SessionData } from "../auth/session";
import { createSessionCookie } from "../auth/session";
import {
  getCertificates,
  getGhgSourceBreakdown,
  getPlotDetail,
  getPlotsByProvinceScoped,
  getSeasonCredits,
  getSponsorAreas,
  getSponsorFarmers,
  getSponsorSummary,
  type SponsorFilters,
} from "../sponsor/dashboard";

function requestFilters(c: { req: { query: (key: string) => string | undefined } }): SponsorFilters {
  return {
    province: c.req.query("province") || undefined,
    areaCode: c.req.query("area_code") || undefined,
    season: c.req.query("season") || undefined,
  };
}

function loginPage(error = ""): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sponsor Portal | NetZeroCarbon</title><link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet"><style>body{margin:0;background:#f0f4f8;font:16px system-ui;color:#17324d;display:grid;place-items:center;min-height:100vh}.card{background:#fff;padding:2rem;border-radius:24px;box-shadow:12px 12px 28px #cbd5e1,-12px -12px 28px #fff;width:min(420px,calc(100% - 3rem))}label{display:block;margin:.8rem 0 .3rem}input{box-sizing:border-box;width:100%;padding:.8rem;border:1px solid #dbe4ee;border-radius:10px}button{margin-top:1.2rem;width:100%;padding:.85rem;border:0;border-radius:10px;background:#14532d;color:#fff;font-weight:700}.error{color:#b91c1c}</style></head><body><main class="card"><small>Sponsor Portal</small><h1>Scoped carbon impact reporting</h1><p>Access only your configured supported areas. CPA codes are shown instead of personal data.</p>${error ? `<p class="error">${error}</p>` : ""}<form method="post" action="/sponsor/login"><label>Email<input name="email" type="email" required></label><label>Password<input name="password" type="password" required></label><label>OTP<input name="otp" inputmode="numeric" maxlength="6"></label><label><input name="remember" type="checkbox" style="width:auto"> Remember this device</label><button>Sign in</button></form><p>Methodology: T-VER-P-METH-13-08 · Activity is audited.</p></main></body></html>`;
}

function dashboardPage(
  summary: Awaited<ReturnType<typeof getSponsorSummary>>,
  areas: string[],
): string {
  const hectares = (summary.totalAreaRai * 0.16).toFixed(1);
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sponsor Overview</title><link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet"><style>body{margin:0;background:#f0f4f8;font:16px system-ui;color:#17324d}header{padding:1rem 2rem;display:flex;justify-content:space-between;flex-wrap:wrap}main{max-width:1100px;margin:auto;padding:1rem}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:1rem}.card{background:#fff;border-radius:18px;padding:1.25rem;box-shadow:8px 8px 20px #cbd5e1,-8px -8px 20px #fff}.hero{background:linear-gradient(135deg,#14532d,#166534);color:#fff}.value{font-size:2rem;font-weight:800}a,button{color:#14532d}table{width:100%;border-collapse:collapse}td,th{padding:.6rem;text-align:left;border-bottom:1px solid #e5e7eb}.notice{margin:1rem 0;padding:1rem;background:#ecfdf5;border-radius:12px}@media (max-width:720px){header{padding:1rem}.value{font-size:1.5rem}}</style></head><body><header><strong>Sponsor Portal</strong><form method="post" action="/sponsor/logout"><button>Log out</button></form></header><main><form method="get" style="display:flex;gap:.5rem;flex-wrap:wrap;margin:1rem 0"><label>Province <input name="province" placeholder="province"></label><label>Season <input name="season" placeholder="season id"></label><button type="submit">Apply filters</button></form><p>Supported areas: ${areas.join(", ")} · T-VER-P-METH-13-08</p><div class="notice">PDPA boundary: reports use CPA codes only. Farmer names, phone numbers, identity numbers, and deed numbers are never exposed.</div><section class="grid"><article class="card hero"><small>Verified credits</small><div class="value">${summary.totalCO2Tons.toFixed(2)} tCO₂eq</div><p>Certification period: current reporting year</p><small>Estimates may change when evidence is incomplete.</small></article><article class="card"><small>Supported area</small><div class="value">${summary.totalAreaRai.toFixed(1)} rai</div><p>${hectares} hectares · ${summary.totalPlots} subplots</p></article><article class="card"><small>Households benefited</small><div class="value">${summary.totalHouseholds}</div><p>Distinct CPA-coded households in scope</p></article></section><section class="card" style="margin-top:1rem"><h2>Estimate transparency</h2><p>Estimates can change when evidence is incomplete; conservative SF_w (0.71) is used.</p><table><thead><tr><th>GHG source</th><th>Baseline</th><th>Project</th><th>Reduction</th></tr></thead><tbody><tr><td>Methane (CH₄)</td><td>—</td><td>—</td><td>Primary credit difference source</td></tr><tr><td>Fertilizer</td><td colspan="3">No change in fertilizer emissions between baseline and project.</td></tr></tbody></table></section></main></body></html>`;
}

type Bindings = {
  DB: D1Database;
  SECRET: string;
};

export const sponsorRoutes = new Hono<{ Bindings: Bindings }>();

// All sponsor routes require sponsor role
sponsorRoutes.use("*", async (c, next) => {
  if (c.req.path === "/sponsor/login" || c.req.path === "/sponsor/logout") return next();
  const middleware = requireRole("sponsor", c.env.SECRET);
  return middleware(c, next);
});

sponsorRoutes.get("/login", (c) => c.html(loginPage()));

sponsorRoutes.post("/login", async (c) => {
  const form = await c.req.formData();
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  const otp = String(form.get("otp") ?? "");
  if (!email || !password) return c.html(loginPage("Email and password are required"), 400);
  const user = await c.env.DB.prepare(
    "SELECT id, email, password_hash, role, otp_secret, areas FROM users WHERE email = ?",
  )
    .bind(email)
    .first<{
      id: string;
      email: string;
      password_hash: string;
      role: string;
      otp_secret: string | null;
    }>();
  if (!user || user.role !== "sponsor" || !(await verifyPassword(password, user.password_hash))) {
    return c.html(loginPage("Invalid credentials"), 401);
  }
  if (user.otp_secret && !verifyOtp(user.otp_secret, otp))
    return c.html(loginPage("Invalid OTP code"), 401);
  const cookie = await createSessionCookie(
    { userId: user.id, role: "sponsor", email: user.email },
    c.env.SECRET,
  );
  return new Response(null, {
    status: 302,
    headers: { Location: "/sponsor", "Set-Cookie": cookie },
  });
});

sponsorRoutes.post(
  "/logout",
  (c) =>
    new Response(null, {
      status: 302,
      headers: {
        Location: "/sponsor/login",
        "Set-Cookie": "nzc_session=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax",
      },
    }),
);

sponsorRoutes.get("/overview", async (c) => {
  const session = c.get("session" as never) as SessionData;
  const areas = await getSponsorAreas(c.env.DB, session.userId);
  if (!areas || areas.length === 0)
    return c.json({ error: "Forbidden — sponsor has no assigned areas" }, 403);
  const summary = await getSponsorSummary(c.env.DB, areas);
  return c.html(dashboardPage(summary, areas));
});

/** Helper: extract areas for the current sponsor from the DB. Returns 403 Response when sponsor has no areas. */
async function getAreasForRequest(c: {
  env: { DB: D1Database };
  get: (key: string) => unknown;
}): Promise<string[] | Response> {
  const session = c.get("session" as never) as SessionData | undefined;
  if (!session)
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  const areas = await getSponsorAreas(c.env.DB, session.userId);
  if (!areas || areas.length === 0) {
    return new Response(JSON.stringify({ error: "Forbidden — sponsor has no assigned areas" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }
  return areas;
}

// ─── Authenticated sponsor profile ───
sponsorRoutes.get("/me", async (c) => {
  const session = c.get("session" as never) as SessionData | undefined;
  if (!session) return c.json({ error: "Unauthorized" }, 401);
  const db = c.env.DB;
  const areas = await getSponsorAreas(db, session.userId);
  const user = await db
    .prepare("SELECT id, email, name, role FROM users WHERE id = ?")
    .bind(session.userId)
    .first<{ id: string; email: string; name: string | null; role: string }>();
  if (!user) return c.json({ error: "User not found" }, 404);
  return c.json({
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    areas,
  });
});

// ─── Plots grouped by province (area-scoped) ───
sponsorRoutes.get("/", async (c) => {
  const db = c.env.DB;
  const areas = await getAreasForRequest(c);
  if (areas instanceof Response) {
    if (c.req.header("Accept")?.includes("text/html")) return c.redirect("/sponsor/login");
    return areas;
  }
  const filters = requestFilters(c);
  if (c.req.header("Accept")?.includes("text/html")) {
    return c.html(dashboardPage(await getSponsorSummary(db, areas, filters), areas));
  }
  const provinces = await getPlotsByProvinceScoped(db, areas, filters);
  return c.json({ provinces });
});

// ─── Summary KPIs (area-scoped) ───
sponsorRoutes.get("/summary", async (c) => {
  const db = c.env.DB;
  const areas = await getAreasForRequest(c);
  if (areas instanceof Response) return areas;
  const summary = await getSponsorSummary(db, areas, requestFilters(c));
  return c.json(summary);
});

// ─── Farmers list (area-scoped) ───
sponsorRoutes.get("/farmers", async (c) => {
  const db = c.env.DB;
  const areas = await getAreasForRequest(c);
  if (areas instanceof Response) return areas;
  const farmers = await getSponsorFarmers(db, areas, requestFilters(c));
  return c.json({ farmers });
});

// ─── GHG source breakdown (area-scoped) ───
sponsorRoutes.get("/ghg-sources", async (c) => {
  const db = c.env.DB;
  const areas = await getAreasForRequest(c);
  if (areas instanceof Response) return areas;
  const sources = await getGhgSourceBreakdown(db, areas, requestFilters(c));
  return c.json({ sources });
});

// ─── Season credit chart data (area-scoped) ───
sponsorRoutes.get("/season-credits", async (c) => {
  const db = c.env.DB;
  const areas = await getAreasForRequest(c);
  if (areas instanceof Response) return areas;
  const credits = await getSeasonCredits(db, areas, requestFilters(c));
  return c.json({ credits });
});

// ─── TVER certificates (area-scoped) ───
sponsorRoutes.get("/certificates", async (c) => {
  const db = c.env.DB;
  const areas = await getAreasForRequest(c);
  if (areas instanceof Response) return areas;
  const certificates = await getCertificates(db, areas);
  return c.json({ certificates });
});

// ─── Report download (EX-2042) ───
sponsorRoutes.get("/reports/:id/download", async (c) => {
  const reportId = c.req.param("id");
  // Only EX-2042 is available for sponsors
  if (reportId !== "EX-2042") {
    return c.json({ error: "Report not found or not available for sponsors" }, 404);
  }
  const db = c.env.DB;
  const areas = await getAreasForRequest(c);
  if (areas instanceof Response) return areas;
  // Build a CSV report scoped to sponsor's areas
  const summary = await getSponsorSummary(db, areas);
  const csv = [
    "รายงาน EX-2042 — สรุปคาร์บอนเครดิต",
    `วันที่สร้าง,${new Date().toISOString().slice(0, 10)}`,
    "",
    "สรุปภาพรวม",
    `คาร์บอนที่ลดทั้งหมด (tCO2e),${summary.totalCO2Tons}`,
    `จำนวนแปลง,${summary.totalPlots}`,
    `จำนวนเกษตรกร,${summary.totalFarmers}`,
    `พื้นที่ทั้งหมด (ไร่),${summary.totalAreaRai}`,
    `ครัวเรือนที่ได้รับประโยชน์,${summary.totalHouseholds}`,
    `มูลค่าโดยประมาณ (USD),${summary.paymentEstimateUSD}`,
    "",
    "สัดส่วนวิธีการ",
    `AWD,${summary.methodologyBreakdown.awd}%`,
    `Biochar,${summary.methodologyBreakdown.biochar}%`,
    `Fertilization,${summary.methodologyBreakdown.fertilization}%`,
  ].join("\n");

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="EX-2042-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
});

// ─── Plot detail (must be after static routes to avoid param collision) ───
sponsorRoutes.get("/:plotId", async (c) => {
  const db = c.env.DB;
  const plotId = c.req.param("plotId");
  const detail = await getPlotDetail(db, plotId);
  if (!detail) {
    return c.json({ error: "Plot not found" }, 404);
  }

  // C1 fix: verify the plot's farmer province is in the sponsor's assigned areas
  const areas = await getAreasForRequest(c);
  if (areas instanceof Response) return areas;
  if (!areas.includes(detail.province)) {
    return c.json({ error: "Forbidden" }, 403);
  }

  return c.json(detail);
});
