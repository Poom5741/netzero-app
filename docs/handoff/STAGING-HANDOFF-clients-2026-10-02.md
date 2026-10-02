# 🧪 STAGING HANDOFF FOR CLIENT TESTING — NetZeroCarbon
**Date:** 2026-10-02 · **Deployed by:** Tech Lead (staging-r1 mission) · **Status:** ✅ LIVE — one known limitation (see §4)

---

## 1. What clients should test

| Surface | URL | Status |
|---|---|---|
| **Admin console** (017 design) | https://netzero-frontend.poom-a1d.workers.dev/admin/login | ✅ working — login + full console |
| **Farmer LINE chat** | LINE OA **netzero-test** (or open https://netzero-frontend.poom-a1d.workers.dev for standalone chat) | ✅ working — bot replies live |
| **Farmer LIFF dashboard** | button in LINE chat (เปิดแดชบอร์ดของฉัน) → /liff/summary | ✅ working |
| **Sponsor portal** (interim) | https://netzero-carbon-poc.poom-a1d.workers.dev/sponsor/login | ✅ working (legacy UI — see §4) |
| **Sponsor portal** (new 017 UI) | https://netzero-frontend.poom-a1d.workers.dev/sponsor | ⛔ login button broken — bug F1, fix with Dev (§4) |

**Build fingerprint:** https://netzero-frontend.poom-a1d.workers.dev/_staging-build.json → `"build": "4d3739d"` (= origin/main @ 2026-10-02, includes the Tier-2 mobile-scope fix `d4744f1`).

## 2. Test identities

| Role | Email | Password |
|---|---|---|
| Admin | `admin@netzero.com` | `ClawTest2026!` |
| Sponsor | `sponsor@netzero.com` | `ClawTest2026!` |

⚠️ Use **`@netzero.com`** exactly. (`@netzerocarbon.com` is rejected by login even though the admin rail *displays* `admin@netzerocarbon.com` — cosmetic inconsistency, reported.)

## 3. Suggested client test flows
1. **Admin:** log in → dashboard KPIs (เกษตรกรทั้งหมด 4 ราย) → sidebar nav → review queue → approve/reject a photo.
2. **Farmer (LINE):** open netzero-test OA → send สวัสดี → season card appears → เปิดแดชบอร์ดของฉัน → LIFF dashboard with mission progress.
3. **Sponsor (interim):** log in at the legacy portal → province/season filters → KPI cards → Log out.

## 4. Known limitations & quirks (not secrets, tell clients up front)
- **F1 (sponsor new-UI login broken):** the redesigned sponsor login form sends JSON, but the backend's form handler throws on JSON → HTTP 500 → "ไม่สามารถเข้าสู่ระบบได้". Reproduced + routed to Dev 2026-10-02. **Interim: use the legacy portal URL in §1.**
- Admin rail displays `admin@netzerocarbon.com` (display only; login uses `@netzero.com`).
- Backend `/health` reports `"environment": "development"` — label only, it is the live production worker.
- Charts page `/admin/charts` intentionally shows **8 dashed deferred chart frames** (not yet implemented).
- CO₂ shows 0.00 tCO₂eq / $0 investment — expected: no approved season yet; payment calc not wired.
- LINE chat identity binding is per-phone; the current test phone is bound to farmer สมชาย มั่นคง / PLOT-001.

## 5. Ops notes (for the team)
- Frontend worker `netzero-frontend` deployed 2026-10-02T01:15Z via API: assets of `4d3739d` + byte-identical `proxy.js` + `BACKEND`→`netzero-carbon-poc` binding + assets config `run_worker_first: [/api/*, /login, /logout, /redirect, /sponsor-login, /evidence/*]` (restores the 2026-09-25 routing contract; without it `POST /login` 405s on the asset layer).
- Backend worker NOT redeployed (src/ unchanged since the 2026-09-29 build) — LINE webhook continuity preserved.
- Full evidence + reports: `netzero-app/.super-speckit/qa/staging-r1-20261002/` (spec, report, manifest, suite logs, screenshots, probe scripts).
