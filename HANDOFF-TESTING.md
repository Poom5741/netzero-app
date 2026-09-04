# 🧪 Manual Test Handoff — NetZeroCarbon Production

**For:** Claw
**Date:** 2026-09-04 (rev 2 — after first test round)
**Status:** Ready for retest
**Context:** First round found 4 bugs (approve/reject failing, filters not filtering). All were root-caused, fixed, deployed, and verified via API on 2026-09-04 ~13:15 UTC. Please retest.

---

## 🔗 URLs

| What | URL |
|------|-----|
| **Main app (farmer chat)** | https://netzero-frontend.poom-a1d.workers.dev |
| **Admin login** | https://netzero-frontend.poom-a1d.workers.dev/admin/login |
| **Sponsor dashboard** | https://netzero-frontend.poom-a1d.workers.dev/sponsor |
| **Backend API** | https://netzero-carbon-poc.poom-a1d.workers.dev |
| **Backend health check** | https://netzero-carbon-poc.poom-a1d.workers.dev/health |

---

## 🔑 Login Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@netzero.com` | `ClawTest2026!` |
| **Sponsor** | `sponsor@netzero.com` | `ClawTest2026!` |

⚠️ **Important:** Use `@netzero.com` — NOT `@netzero.local`. The old docs had the wrong email. (Verified working as of 2026-09-04.)

**Farmer chat:** No login needed — open the main app URL and start chatting. It works without LINE (standalone mode).

---

## 🛠️ What Was Just Fixed (Sept 4)

**Round 1 (morning):**
1. **Admin login form** — was rendered 64px wide (unusable). Now full-width and working. ✅ confirmed by Claw
2. **Admin review queue** — all admin pages crashed with 500 errors. Now load correctly. ✅ confirmed by Claw
3. **Chat under double-tap** — sending messages rapidly crashed 95% of requests. Now safe.
4. **Unprotected endpoints** — export API and season-approve worked without login. Now require admin/sponsor session.
5. **LINE webhook** — accepted forged requests. Now rejects bad signatures (webhook still disabled, returns 503 — that's correct).

**Round 2 (afternoon — fixes for bugs Claw found):**
6. **Approve/reject now work** — root cause: every review action wrote to a `farmer_trust` table that was never created in the database. Table added to the migration; review actions no longer depend on trust scoring succeeding. Verified via API: approve → `{"ok":true}`, reject → `{"ok":true}`.
7. **Filter tabs now actually filter** — root cause: backend called its own queue function with the wrong argument shape, so the WHERE clause silently never applied, AND the frontend sent `flagged/verified/rejected` while the DB stores `flag/pass/reject`. Verified: flag → 6 rows, pass → 2, pending → 11 (previously every tab returned all 19).
8. **Trust scores now attach to the right farmer** — review actions previously created trust rows for fake IDs like `farmer_plot-004`. Now resolved via the plot's real owner.

---

## 📋 Test Flows

### Flow 1: Admin Login & Review Queue (~10 min) — RETEST

1. Open https://netzero-frontend.poom-a1d.workers.dev/admin/login
2. Enter `admin@netzero.com` / `ClawTest2026!` → click เข้าสู่ระบบ
3. **Check:** Admin dashboard loads with ~19 photos, flagged first
4. **RETEST (was broken):** Click each filter tab — ทั้งหมด / รอตรวจสอบ / ถูกธง / ผ่านแล้ว / ปฏิเสธแล้ว. **Expect different card sets per tab** (approx: 19 / 11 / 6 / 2 / 1), not the same list every time.
5. **RETEST (was broken):** Open any card → click **approve** in the detail modal → **Expect success**, no "ไม่สามารถอนุมัติได้" error. Card status updates.
6. **RETEST (was broken):** Open another card → click **reject** → type a reason → confirm. **Expect success**, no error.
7. **📜 History note (Low, clarified):** the History link lives on the backend's own review page — https://netzero-carbon-poc.poom-a1d.workers.dev/admin/review (login there with the same credentials; it's a separate legacy UI). The frontend detail modal intentionally has no History button yet — tracked as a feature gap, not a regression.
8. **Export note (clarified):** the sponsor export button generates its CSV **client-side from the data already on screen** — it never calls the backend export API. Browser automation may not capture blob downloads; in a real browser the file saves to Downloads.

**⚠️ Known quirk:** Old seed photos (IDs like `photo-001`) show a "No Image" placeholder because they point to a fake URL. Real uploads may also show placeholder if R2 serving isn't wired — known gap.

### Flow 2: Sponsor Dashboard (~5 min)

1. Log out of admin (or use incognito window)
2. Open https://netzero-frontend.poom-a1d.workers.dev/sponsor
3. **Check:** KPI cards show real numbers — แปลงที่ได้รับการสนับสนุน (sponsored plots) should show **4**
4. **Check:** Province groups list plots: Bangkok (1), นครสวรรค์ (2), อุทัยธานี (1)
5. Click "ส่งออกรายงาน" (export report) → **Check:** file downloads (CSV/JSON)
6. **Check:** CO₂ shows 0 ตัน — **expected**, because no season has been approved yet. Not a bug.
7. 💰 "การลงทุนทั้งหมด" shows $0 — **known gap**, payment calc isn't wired to real data yet.
8. Resize browser to phone width → **⚠️ Known bug:** content shifts right with a horizontal scrollbar (sidebar padding bug). Desktop is fine. Don't re-report this — already tracked.

### Flow 3: Farmer Chat (the core journey) (~15 min)

1. Open https://netzero-frontend.poom-a1d.workers.dev (redirects to /chat)
2. **Check:** Welcome bubble appears: "สวัสดีค่ะ! 🌱 ยินดีต้อนรับสู่ NetZeroCarbon"
3. **Check:** Two quick-action buttons: ยอมรับเงื่อนไข and สอบถาม
4. Tap **ยอมรับเงื่อนไข** (accept terms) → **Check:** bot advances to next step (asks for phone number)
5. Enter a phone number (e.g. `0812345678`) → **Check:** bot responds appropriately
6. Type any free text message → **Check:** AI replies (uses OpenRouter, may take a few seconds)
7. Tap **📸 ถ่ายรูป** quick action or navigate to Upload tab → goes to photo upload
8. Send 10 messages fast (double-tap send) → **Check:** no 500 errors, all messages get replies (this was the race-condition bug)
9. Tap bottom nav: แชท → อัปโหลด → สรุปผล → **Check:** all three pages switch correctly

### Flow 4: Photo Upload (~10 min)

1. From chat, tap the **อัปโหลด** (upload) tab in bottom nav
2. **Check:** Photo type picker shows 3 options: เตรียมดิน / ท่อน้ำ/เปียก-แห้ง / เก็บเกี่ยว
3. Select **ท่อน้ำ/เปียก-แห้ง** (water pipe / wet-dry — the AI-screened type)
4. Tap the camera frame → file picker opens (on desktop) or camera (on phone)
5. Upload a photo of a rice field (test images: `tests/poc1-verification/` folder in the repo)
6. **Check:** A verdict appears — one of:
   - ✅ pre_verified (high confidence pass)
   - 🚩 flagged (uncertain — goes to admin queue)
   - ❌ refused (low confidence — asks to retake)
   - ⏳ queued (waiting for staff review)
7. Upload the same photo again → **Check:** rejected as duplicate
8. Go back to admin review queue → **Check:** your upload appears there

**⚠️ Known quirk:** GPS shows (0,0) if browser denies location. Allow location for accurate capture.

### Flow 5: Summary Page (~3 min)

1. Tap **สรุปผล** (summary) in bottom nav
2. **Check:** Page renders without crash (may show empty state if no data yet — fine)

### Flow 6: Mobile Checks (~10 min, phone or DevTools)

Test on a real phone or Chrome DevTools device mode (iPhone SE 375px):

| Page | Expect |
|------|--------|
| /chat | ✅ No horizontal scroll, bottom nav fixed, buttons tappable |
| /upload | ✅ Photo type cards stack properly |
| /admin/login | ✅ Form fits screen width |
| /summary | ✅ No horizontal scroll |
| /sponsor | ⚠️ Horizontal overflow — **known bug, already tracked** |

### Flow 7: Security Spot-Checks (~5 min)

Open a fresh incognito window (no login):

1. Visit https://netzero-carbon-poc.poom-a1d.workers.dev/api/admin/review → **Expect:** `{"error":"Unauthorized"}` (401), NOT data
2. Visit https://netzero-carbon-poc.poom-a1d.workers.dev/export/estimates → **Expect:** 401, NOT a data download
3. POST to https://netzero-carbon-poc.poom-a1d.workers.dev/api/season/approve → **Expect:** 401
4. Visit https://netzero-carbon-poc.poom-a1d.workers.dev/health → **Expect:** `{"status":"ok",...}` (this one is public by design)

---

## 🐛 Known Issues — Do NOT Re-Report

These are already tracked (see `.gstack/qa-reports/qa-report-netzero-2026-09-04.md`):

| Issue | Status |
|-------|--------|
| Sponsor dashboard overflows on mobile (padding bug) | Tracked — needs 1-line fix in `sponsor/page.tsx` |
| Sponsor investment shows $0 | Tracked — pricing data not seeded |
| ENVIRONMENT says "development" in health check | Tracked — cosmetic config |
| Old seed photos show "No Image" placeholder | Expected — fake URLs in seed data |
| Backend `/export/estimates` returns empty list | Expected — no approved seasons yet; the button uses on-screen data instead |
| History button missing in frontend review modal | Tracked — feature gap; History lives on backend legacy page for now |
| Admin filter tabs cramped at 375px width | Tracked — minor |
| Chat input box slightly short on mobile (26px) | Tracked — minor a11y |
| No rate limiting on chat API | Tracked — P1 backlog |
| Admin credentials in browser sessionStorage | Tracked — security P1, needs cookie-session rework |

---

## 📝 How to Report a Bug

For each bug, capture:

1. **What page/URL**
2. **What you did** (steps)
3. **What you expected vs. what happened**
4. **Screenshot** (phone or desktop)
5. **Was it after login? Which role?**

Add them to the Multica board (project POOM) or reply directly — either works.

---

## ✅ Sign-off Checklist

When done, tick these:

- [ ] Admin login works, review queue loads, approve/reject works
- [ ] Photo decision history page works
- [ ] Sponsor dashboard loads with 4 plots, export downloads
- [ ] Farmer chat: consent → phone → AI conversation works
- [ ] Photo upload: all 3 types, verdicts appear, duplicate rejected
- [ ] Bottom nav switches between all 3 tabs
- [ ] Mobile: no broken layouts (except known sponsor bug)
- [ ] Incognito access to protected endpoints returns 401
- [ ] Double-tap chat doesn't error

**All ticked = production is GO for pilot.** 🚀
