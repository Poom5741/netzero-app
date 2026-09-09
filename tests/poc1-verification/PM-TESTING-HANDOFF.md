# POC1 — PM Testing Handoff

> **For:** PM (pre-client sanity check)
> **Environment:** LIVE PRODUCTION on Cloudflare Workers
> **Estimated time:** 30–45 minutes
> **Goal:** Confirm the app works end-to-end before we send it to the client

---

## Production URLs (use these — do NOT test on localhost)

| Surface | URL |
|---|---|
| **Farmer chat** | https://netzero-frontend.poom-a1d.workers.dev/chat |
| **Photo upload** | https://netzero-frontend.poom-a1d.workers.dev/upload |
| **Season summary** | https://netzero-frontend.poom-a1d.workers.dev/summary |
| **Admin dashboard** | https://netzero-frontend.poom-a1d.workers.dev/admin |
| **Sponsor dashboard** | https://netzero-frontend.poom-a1d.workers.dev/sponsor |
| **Backend health** | https://netzero-carbon-poc.poom-a1d.workers.dev/health |

### Login credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@netzero.com` | `ClawTest2026!` |
| Sponsor | `sponsor@netzero.com` | `ClawTest2026!` |

**Browser:** Chrome or Safari on desktop. For the chat/upload flows, also try on your phone (the app is mobile-first).

---

## ⚠️ Before you start — please read

1. **Test phone that works on production:** `0812345678` (bound to farmer-004 / "Chirayu Charoenyost"). Older demo phones (081-xxx-xxxx for "สมชาย / สมหญิง") will return "ไม่พบข้อมูลเกษตรกรในระบบ" — that is **correct behavior**, not a bug.
2. **Sponsor numbers may look "empty":** CO₂ saved = 0, total plots = 1, total farmers = 1, payments = $0. This is correct — no seasons have been admin-verified yet (admin approval is the final gate). DO NOT report these as bugs.
3. **Farmer chat photos uploaded by admin may show a placeholder image.** This is because R2 photo storage is not bound in production yet. The `/api/photo/:id` proxy returns a real image for newly uploaded photos, but rows uploaded **before** 2026-09-05 may show a placeholder.
4. **If a page shows "Material Symbols" icons as English words** (e.g. "send" instead of a paper-plane icon), that is the font not loading — please report it. Otherwise, the design system is intact.

---

## Test Flow 1 — Farmer chat (consent → phone → AI)

**URL:** https://netzero-frontend.poom-a1d.workers.dev/chat

| # | Action | Expected outcome | ✅ |
|---|---|---|---|
| 1.1 | Open `/chat` in a fresh browser tab | Welcome message in Thai appears: "สวัสดีครับ! 🌿 ยินดีต้อนรับสู่ NetZeroCarbon" + bottom nav (แชท / อัปโหลด / สรุปผล) | ☐ |
| 1.2 | Type "สวัสดี" | Reply says "กรุณายอมรับเงื่อนไขก่อนใช้งาน พิมพ์ 'ยอมรับ'..." — AI does NOT answer | ☐ |
| 1.3 | Type "ยอมรับ" | Reply: "✅ ยอมรับเงื่อนไขเรียบร้อยแล้วค่ะ กรุณาพิมพ์เบอร์โทรศัพท์..." | ☐ |
| 1.4 | Type "0812345678" | Reply: "สวัสดีค่ะ คุณ Chirayu Charoenyost" + asks which plot to discuss | ☐ |
| 1.5 | Pick plot "CM-004" (or any available plot) | Chat opens for that plot | ☐ |
| 1.6 | Ask: "วิธีปลูกข้าวที่ถูกต้องทำอย่างไร" | AI gives a real Thai reply within 3–8 seconds (OpenRouter / Qwen 3 model) | ☐ |
| 1.7 | Try a wrong-format phone (e.g. "123") | Reply says "กรุณาพิมพ์เบอร์โทรศัพท์ 10 หลัง" | ☐ |
| 1.8 | Refresh the page | Your conversation history is still there (we persist to localStorage) | ☐ |

**Pass = all 8 checked. Failure example:** AI never replies, or replies are blank, or chat shows raw English text instead of Thai.

---

## Test Flow 2 — Photo upload + AI screening

**URL:** https://netzero-frontend.poom-a1d.workers.dev/upload

**Test photo:** `tests/poc1-verification/test-photo-wetdry.png` (saved in the repo — please copy to your desktop first).

| # | Action | Expected outcome | ✅ |
|---|---|---|---|
| 2.1 | Open `/upload` | See camera-frame with corner markers + GPS status line | ☐ |
| 2.2 | Select photo type "วัดน้ำ (wet/dry)" | Upload button label becomes "ถ่ายรูป" | ☐ |
| 2.3 | Click the camera frame / button → pick `test-photo-wetdry.png` | Image preview appears | ☐ |
| 2.4 | (Skip GPS — desktop won't have it) | If no GPS: a confirmation dialog says "ไม่มีข้อมูล GPS — รูปจะไม่มีพิกัด ต้องการอัปโหลดต่อหรือไม่?" — click OK | ☐ |
| 2.5 | Click "อัปโหลด" | Loading state, then a verdict card shows | ☐ |
| 2.6 | Read the verdict | Either `pre_verified` (high confidence ≥ 0.85), `flagged` (low confidence, goes to admin queue), or `refused` (invalid photo — use "ถ่ายใหม่" to retry) | ☐ |
| 2.7 | Verdict should show: `water_state` (flooded / dry / not-applicable), confidence score (e.g. 0.53) | If NaN% appears — that is a known bug we already fixed; please report | ☐ |
| 2.8 | Repeat with photo type "เตรียมดิน (prepare)" using `test-photo-admin.png` | Should also upload — verdict is queued/flagged (no CLIP for prepare/harvest) | ☐ |

**Pass = upload completes, verdict is shown, no JS errors in browser console.**

---

## Test Flow 3 — Admin review queue

**URL:** https://netzero-frontend.poom-a1d.workers.dev/admin

| # | Action | Expected outcome | ✅ |
|---|---|---|---|
| 3.1 | Open `/admin` → enter `admin@netzero.com` / `ClawTest2026!` → click login | Redirected to admin dashboard | ☐ |
| 3.2 | Look at the review queue | At least 1 photo card visible (filter: ทั้งหมด / 🚩 Flag / ⏳ Pending / ✅ Pass / ❌ Reject) | ☐ |
| 3.3 | Click a photo card | Side panel opens with full-size image + AI result (label, confidence, reason) + GPS + farmer info | ☐ |
| 3.4 | Click "✅ อนุมัติ" (Approve) | Photo moves to "verified" status, panel closes or queue refreshes | ☐ |
| 3.5 | Pick another photo → click "❌ ปฏิเสธ" → enter "ภาพเบลอ" → confirm | Photo moves to "rejected" status | ☐ |
| 3.6 | Click "📜 History" on any photo | Audit trail shows who reviewed, when, what action | ☐ |
| 3.7 | Try filter tab "🚩 Flag" | List shows only flagged photos; if list is empty that's correct (all approved) | ☐ |

**Pass = you can log in, open details, approve, reject, and see history.**

---

## Test Flow 4 — Sponsor dashboard

**URL:** https://netzero-frontend.poom-a1d.workers.dev/sponsor

| # | Action | Expected outcome | ✅ |
|---|---|---|---|
| 4.1 | Open `/sponsor` | KPI cards visible: CO₂ reduced (tons), supported plots, total investment | ☐ |
| 4.2 | Read the numbers | Numbers are real integers (not `NaN`, not `undefined`). Expect small numbers — see ⚠️ above | ☐ |
| 4.3 | Scroll to the farmers list | See farmer-004 "Chirayu Charoenyost" with progress bar at 33% | ☐ |
| 4.4 | Resize the browser narrow (≤ 768px) | Layout reflows — sidebar collapses or stacks, no horizontal scroll | ☐ |
| 4.5 | Click a farmer row | Farmer detail (or summary) loads without error | ☐ |

**Pass = dashboard renders real numbers, responsive layout works.**

---

## Test Flow 5 — Season summary

**URL:** https://netzero-frontend.poom-a1d.workers.dev/summary

| # | Action | Expected outcome | ✅ |
|---|---|---|---|
| 5.1 | Open `/summary` | Season/plot selectors visible (form renders) | ☐ |
| 5.2 | Pick plot "CM-004" + season "2568 / นาปี" | Summary data appears (water mgmt, inputs, estimates — even if all zero is OK) | ☐ |
| 5.3 | Bottom nav: tap สรุปผล → แชท → อัปโหลด → สรุปผล | All three pages load without errors | ☐ |

**Pass = form renders, can pick plot/season, no console errors.**

---

## Test Flow 6 — Visual + mobile check

Open the app on your phone too (use the same URLs).

| # | Check | Expected | ✅ |
|---|---|---|---|
| 6.1 | All icons render as glyphs (paper plane, leaf, dashboard, etc.) — NOT English words | If you see "send" or "dashboard" as text, the Material Symbols font is missing | ☐ |
| 6.2 | Cards are WHITE on a light-gray body (`#f0f4f8`) | Not gray-on-gray | ☐ |
| 6.3 | Thai text is readable — no □ tofu boxes | | ☐ |
| 6.4 | Mobile width (390px): no horizontal scroll on any page | | ☐ |
| 6.5 | On phone, open `/chat` → consent → phone → ask question | Same flow works | ☐ |
| 6.6 | On phone, open `/upload` → can pick photo from camera or library | Native picker opens | ☐ |

**Pass = design system intact + mobile works.**

---

## What to report back

After testing, please send back:

1. **Pass / fail** for each flow (1–6) — copy the ✅ column filled in, or take screenshots.
2. **Any new bugs** that are NOT in the "already known" list below. Include:
   - Page URL
   - What you did (steps to reproduce)
   - What you saw vs. what you expected
   - Screenshot if possible
3. **Smoke-test result** of the backend health URL — paste the JSON response.

---

## ✅ Already known — DO NOT report these

These are known limitations / open items the team is already tracking. Mentioning them will not help the client, so please skip:

- **R2 photo storage not bound** — historical photos (uploaded before 2026-09-05) show a placeholder SVG. Newly uploaded photos render correctly via the `/api/photo/:id` proxy. This is documented in the project's technical debt list.
- **Sponsor counters are low / CO₂ = 0** — this is because no season has been admin-verified end-to-end yet. Numbers will populate once admin approves verified photos.
- **No LINE integration** — the chat in the app is a standalone chat that mimics LINE UX. LINE webhook integration is paused (CF ↔ LINE latency).
- **No real GPS on desktop** — desktop browsers can't provide GPS; the app handles this gracefully (allows upload with warning, per design).
- **Dev-only bypass buttons on login page** — visible at the bottom of `/admin/login`. These are intentional dev escape hatches and not part of the client flow.
- **Login endpoint returns 500 on JSON body** — only the form-encoded POST works. The frontend uses form-encoded; this is correct.
- **Material Symbols icons render correctly in real browsers** — earlier reports of raw-text icons were headless-browser artifacts, not real bugs. Verified 2026-08-31.

---

## Quick pre-flight check (run from terminal, ~30 seconds)

```bash
# 1. Backend healthy?
curl -s https://netzero-carbon-poc.poom-a1d.workers.dev/health

# 2. Frontend healthy?
curl -sI https://netzero-frontend.poom-a1d.workers.dev/ | head -1

# 3. Chat API responds?
curl -s -X POST https://netzero-carbon-poc.poom-a1d.workers.dev/api/chat \
  -H "Content-Type: application/json" \
  -d '{"text":"ยอมรับ","userId":"pm-preflight"}'

# 4. Sponsor API responds?
curl -s https://netzero-carbon-poc.poom-a1d.workers.dev/sponsor/summary
```

**All four should print JSON (or HTTP/1.1 200 for #2). If any fail, please tell me before starting the manual flows.**

---

## Sign-off

When done, please reply with one of:

- **GO** — all flows passed, ready to send to client
- **GO_WITH_NOTES** — flows passed, list of cosmetic items I'd like polished (won't block ship)
- **NO-GO** — at least one flow failed; describe what blocked and which step

If anything is ambiguous or you need clarification on what to test, ping me directly.