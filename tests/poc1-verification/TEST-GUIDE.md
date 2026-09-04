# POC1 Client Verification Guide

> **Date:** 2026-09-04 (updated for production testing)
> **Purpose:** Step-by-step manual test of the LIVE PRODUCTION deployment
> **Estimated time:** 30-45 minutes
> **Status:** All critical bugs fixed and signed off (GO for pilot, 2026-09-04)

---

## ⚠️ Test against PRODUCTION — no setup needed

Everything below runs against the live deployment. Nothing to install or start.

- **Frontend:** https://netzero-frontend.poom-a1d.workers.dev
- **Backend:** https://netzero-carbon-poc.poom-a1d.workers.dev (check: `curl https://netzero-carbon-poc.poom-a1d.workers.dev/health` → `{"status":"ok"}`)

Use **Chrome or Safari on desktop + one phone** (the app is mobile-first).

---

## Pre-requisites

### 1. Test images

### 2. Test images

All test images are in `tests/poc1-verification/`:

| File | Use for |
|---|---|
| `test-photo-wetdry.png` | Photo upload test (wet/dry field) |
| `test-photo-chat.png` | Photo upload test (harvest) |
| `test-photo-admin.png` | Photo upload test (prepare) |
| `test-photo-sponsor.png` | Sponsor dashboard screenshot |
| `test-photo-summary.png` | Season summary screenshot |

### 3. Test credentials

| Role | URL | Email | Password |
|---|---|---|---|
| Admin | https://netzero-frontend.poom-a1d.workers.dev/admin | `admin@netzero.com` | `ClawTest2026!` |
| Sponsor | https://netzero-frontend.poom-a1d.workers.dev/sponsor | `sponsor@netzero.com` | `ClawTest2026!` |

---

## Test Flow 1: Farmer Chat (Consent + AI)

**URL:** https://netzero-frontend.poom-a1d.workers.dev/chat

### Step 1.1 — Welcome message
- [ ] Open `/chat`
- [ ] See welcome message: "สวัสดีครับ! 🌿 ยินดีต้อนรับสู่ NetZeroCarbon"
- [ ] See bottom nav: แชท / อัปโหลด / สรุปผล

### Step 1.2 — Consent guardrail
- [ ] Type any message (e.g. "สวัสดี")
- [ ] See guardrail: "กรุณายอมรับเงื่อนไขก่อนใช้งาน พิมพ์ 'ยอมรับ'..."
- [ ] AI does NOT answer questions yet

### Step 1.3 — Accept consent
- [ ] Type "ยอมรับ"
- [ ] See: "✅ ยอมรับเงื่อนไขเรียบร้อยแล้วค่ะ กรุณาพิมพ์เบอร์โทรศัพท์..."

### Step 1.4 — Phone binding
- [ ] Enter phone: `0812345678`
- [ ] See verification/binding response

### Step 1.5 — AI response
- [ ] Ask: "วิธีปลูกข้าวที่ถูกต้องทำอย่างไร"
- [ ] Wait 2-5 seconds
- [ ] See AI reply (real response from Qwen 3.6 Flash)

### Step 1.6 — Quick actions
- [ ] See quick action buttons: ส่งรูปถ่าย / สรุปฤดู / สอบถาม
- [ ] Click one — navigates to correct page

**Expected result:** Chat works end-to-end. Consent blocks unregistered users. AI responds after consent.

---

## Test Flow 2: Photo Upload + AI Screening

**URL:** https://netzero-frontend.poom-a1d.workers.dev/upload

### Step 2.1 — Camera view
- [ ] Open `/upload`
- [ ] See camera frame with corners ("แตะเพื่อถ่ายรูปแปลงนา")
- [ ] See GPS status ("กำลังค้นหาตำแหน่ง..." or GPS coordinates)
- [ ] See photo type picker

### Step 2.2 — Select photo type
- [ ] Select "วัดน้ำ (wet/dry)"
- [ ] Button changes from "เลือกประเภทรูปก่อน" → "ถ่ายรูป"

### Step 2.3 — Take/select photo
- [ ] Tap camera frame or "ถ่ายรูป" button
- [ ] File picker opens (or camera on mobile)
- [ ] Select `test-photo-wetdry.png` from `tests/poc1-verification/`
- [ ] See preview of selected image

### Step 2.4 — Upload
- [ ] GPS shows coordinates (or "ไม่มี GPS" — upload still works)
- [ ] Tap "อัปโหลด"
- [ ] See loading state
- [ ] See verdict result (one of: flagged, pre_verified, queued)

### Step 2.5 — Check CLIP screening
- [ ] Verdict shows `water_state`: "flooded" or "dry"
- [ ] Confidence score is displayed
- [ ] If confidence < 0.85 → " flagged — รอตรวจสอบ"
- [ ] If confidence ≥ 0.85 → " pre_verified — ผ่านแล้ว"

### Step 2.6 — Retake flow
- [ ] If verdict is "refused" → see "ถ่ายใหม่" button
- [ ] Tap "ถ่ายใหม่" → returns to camera view

### Step 2.7 — Upload different photo types
- [ ] Upload with type "เตรียมดิน (prepare)" → verdict: queued or flagged
- [ ] Upload with type "เก็บเกี่ยว (harvest)" → verdict: queued or flagged

**Expected result:** Photo uploads successfully. CLIP AI classifies water state. Verdict shown to farmer.

---

## Test Flow 3: Admin Review Dashboard

**URL:** https://netzero-frontend.poom-a1d.workers.dev/admin

### Step 3.1 — Login
- [ ] Open `/admin`
- [ ] See login form
- [ ] Enter: `admin@netzero.com` / `ClawTest2026!`
- [ ] Click login → redirected to admin dashboard

### Step 3.2 — Review queue
- [ ] See list of photos awaiting review
- [ ] Each card shows: photo thumbnail, plot ID, AI status, timestamp
- [ ] Filter tabs: ทั้งหมด / 🚩 Flag / ⏳ Pending / ✅ Pass / ❌ Reject

### Step 3.3 — View photo detail
- [ ] Click a photo card
- [ ] See full-size image
- [ ] See AI classification result (label, confidence, reason)
- [ ] See GPS coordinates
- [ ] See farmer info

### Step 3.4 — Approve photo
- [ ] Click "✅ อนุมัติ" (Approve)
- [ ] Photo moves to "verified" status
- [ ] Queue updates

### Step 3.5 — Reject photo
- [ ] Click "❌ ปฏิเสธ" (Reject)
- [ ] Enter reason (e.g. "ภาพเบลอ")
- [ ] Photo moves to "rejected" status

### Step 3.6 — Audit trail
- [ ] Click "📜 History" on a reviewed photo
- [ ] See decision history: who reviewed, when, what action

**Expected result:** Admin can log in, see queue, review photos, approve/reject with reasons.

---

## Test Flow 4: Sponsor Dashboard

**URL:** https://netzero-frontend.poom-a1d.workers.dev/sponsor

### Step 4.1 — Dashboard loads
- [ ] Open `/sponsor`
- [ ] See KPI cards: CO₂ reduced, supported plots, total investment
- [ ] Numbers are real (not NaN/undefined)

### Step 4.2 — Regional breakdown
- [ ] See province/regional data with progress bars
- [ ] Bars show real percentages

### Step 4.3 — Plot detail
- [ ] Click a plot/region
- [ ] See plot details (farmer name, area, season status)

### Step 4.4 — Sidebar navigation
- [ ] Sidebar collapses on mobile width
- [ ] Navigation items work

**Expected result:** Sponsor sees real data from database. KPIs and charts render correctly.

---

## Test Flow 5: Season Summary

**URL:** https://netzero-frontend.poom-a1d.workers.dev/summary

### Step 5.1 — Summary page loads
- [ ] Open `/summary`
- [ ] See season/plot selection
- [ ] See summary data (water management, inputs, estimates)

### Step 5.2 — Navigation
- [ ] Navigate: chat ↔ upload ↔ summary via bottom nav
- [ ] All pages load without errors

**Expected result:** Summary page renders with real data.

---

## Test Flow 6: API Smoke Tests

Run these from terminal:

```bash
# Health check
curl https://netzero-carbon-poc.poom-a1d.workers.dev/health
# Expected: {"status":"ok",...}

# Chat API
curl -X POST https://netzero-carbon-poc.poom-a1d.workers.dev/api/chat \
  -H "Content-Type: application/json" \
  -d '{"text":"สวัสดี","userId":"test-user"}'
# Expected: {"reply":"กรุณายอมรับเงื่อนไข...","state":"welcome"}

# Photo upload API
curl -X POST https://netzero-carbon-poc.poom-a1d.workers.dev/photo/upload \
  -F "photo=@tests/poc1-verification/test-photo-wetdry.png" \
  -F "plot_id=plot-004" \
  -F "season_id=2568-napi" \
  -F "gps_lat=18.83" \
  -F "gps_lng=98.99" \
  -F "taken_at=$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  -F "photo_type=wetdry" \
  -F "__exif_timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
# Expected: {"id":"photo_...","verdict":"flagged","water_state":"flooded","ai_confidence":0.53,...}

# Admin login + review queue
curl -c /tmp/cookies.txt -X POST https://netzero-carbon-poc.poom-a1d.workers.dev/login \
  -d "email=admin@netzero.com&password=ClawTest2026!"
curl -b /tmp/cookies.txt https://netzero-carbon-poc.poom-a1d.workers.dev/api/admin/review
# Expected: JSON array of photos

# Sponsor data
curl https://netzero-carbon-poc.poom-a1d.workers.dev/sponsor
# Expected: JSON with province-grouped plot data
```

---

## Test Flow 7: Visual Verification

Open each page in browser and check:

### Every page:
- [ ] **Icons render as symbols** — not English words ("send", "eco", "dashboard")
- [ ] **Cards are WHITE** on gray body (#f0f4f8)
- [ ] **Glassmorphism** — headers/nav look frosted, not flat
- [ ] **Thai text** — no tofu boxes (□), readable line-height
- [ ] **Contrast** — all labels legible, no light-gray on white
- [ ] **No overflow** — no horizontal scrollbar at mobile width (390px)
- [ ] **Empty states** — loading spinners, "no data" messages visible

### Specific checks:
- [ ] `/chat` — message bubbles render, typing indicator works
- [ ] `/upload` — camera frame corners visible, GPS status shows
- [ ] `/admin` — login form styled, queue cards render with images
- [ ] `/sponsor` — KPI numbers show (not blank), progress bars fill

---

## Pass/Fail Criteria

**MUST PASS (blocker — cannot send to client):**
- [ ] Chat consent flow works end-to-end
- [ ] Photo upload stores image and creates database record
- [ ] CLIP AI screening runs and returns verdict
- [ ] Admin can log in and see review queue
- [ ] Admin can approve/reject photos
- [ ] Sponsor dashboard shows real data
- [ ] All pages render without JS errors
- [ ] No broken icons (Material Symbols loaded)
- [ ] Thai text readable on all pages

**SHOULD PASS (important but not blocking):**
- [ ] Camera capture works on mobile
- [ ] GPS coordinates display correctly
- [ ] Auto-verify works for high-confidence photos
- [ ] Kill switch bypasses CLIP
- [ ] Audit trail shows review history

**NICE TO HAVE:**
- [ ] Responsive layout at all widths
- [ ] Loading states for all async operations
- [ ] Error messages in Thai

---

## After Testing

If all MUST PASS items are green:

1. Deploy to production:
   ```bash
   cd /Users/poom-work/netzero-app
   npm run deploy           # backend
   cd frontend && STATIC_EXPORT=1 NEXT_PUBLIC_API_BASE=https://netzero-carbon-poc.poom-a1d.workers.dev npm run build && npx wrangler deploy  # frontend
   ```

2. Send these URLs to client:
   - **Frontend:** https://netzero-frontend.poom-a1d.workers.dev
   - **Admin login:** https://netzero-frontend.poom-a1d.workers.dev/admin
   - **Sponsor:** https://netzero-frontend.poom-a1d.workers.dev/sponsor

3. Send credentials:
   - Admin: `admin@netzero.com` / `ClawTest2026!`
   - Sponsor: `sponsor@netzero.com` / `ClawTest2026!`
