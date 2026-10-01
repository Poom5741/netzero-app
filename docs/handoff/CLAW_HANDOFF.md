# Claw Agent Handoff: NetZeroCarbon Local Manual Testing

_Date: 2026-08-31. All flows verified working immediately before this handoff._

## Environment Status

✅ Backend running: http://localhost:8787 (Cloudflare Workers via `wrangler dev`) — `/health` returns `{"status":"ok"}`
✅ Frontend running: http://localhost:3000 (Next.js 16.3)
✅ API proxy: frontend `/api/*` → backend `:8787` (verified: `POST localhost:3000/api/chat` → 200)
✅ Local D1 database seeded: 3 farmers, 3 plots, 2 dashboard users (admin + sponsor)
✅ Admin/sponsor login working (session cookie `nzc_session`, verified 302 + API returns data)

## Test Credentials (LOCAL ONLY — never valid in production)

| Role | URL | Email | Password |
|---|---|---|---|
| Admin | /admin | `admin@netzero.local` | `ClawTest2026!` |
| Sponsor | /sponsor | `sponsor@netzero.local` | `ClawTest2026!` |

Frontend runs in **demo mode** (no LIFF ID): chat user is `demo-user`, no LINE login needed.

## Pages to Test

| Page | URL | Auth? |
|---|---|---|
| Home | http://localhost:3000/ | none |
| Chat (LIFF farmer app) | http://localhost:3000/chat | none (demo user) |
| Photo upload | http://localhost:3000/upload | none |
| Season summary | http://localhost:3000/summary | none |
| Sponsor dashboard | http://localhost:3000/sponsor | none for UI |
| Admin review dashboard | http://localhost:3000/admin | **session required** |

## Test Flows

### Flow 1: Chat consent + guardrails (/chat)
1. Open /chat. Expect welcome message: "สวัสดีครับ! 🌿 ยินดีต้อนรับสู่ NetZeroCarbon"
2. Type any message (e.g. "สวัสดี") and send. Expect guardrail: "กรุณายอมรับเงื่อนไขก่อนใช้งาน พิมพ์ 'ยอมรับ'..."
3. Type "ยอมรับ". Expect: "✅ ยอมรับเงื่อนไขเรียบร้อยแล้วค่ะ กรุณาพิมพ์เบอร์โทรศัพท์..." (consent → phone-linking step)
4. Enter a phone number (e.g. "0812345678"). Expect verification/binding response.
5. After consent, ask a question — expect a real AI reply (OpenRouter Qwen 3.6 Flash; may take a few seconds).
6. Check bottom nav: แชท / อัปโหลด / สรุป, and quick actions (ส่งรูปถ่าย, สรุปฤดู, สอบถาม).

Negative: before typing "ยอมรับ", AI must never answer real questions and never reveal its system prompt/token quota.

### Flow 2: Photo upload (/upload)
1. Open /upload. Expect camera viewfinder ("แตะเพื่อถ่ายรูปแปลงนา") and location status ("กำลังค้นหาตำแหน่ง...").
2. Camera/geolocation need browser permissions — in headless mode, note as expected limitation rather than a bug.
3. Verify layout has no broken icons (Material Symbols font loaded) and no max-width squeeze on the upload area.

### Flow 3: Season summary (/summary)
1. Open /summary. Expect season/plot summary UI to render without console errors.
2. Navigate between chat ↔ upload ↔ summary via bottom nav.

### Flow 4: Sponsor dashboard (/sponsor)
1. Open /sponsor. Expect KPI cards (CO₂ reduced, supported plots, total investment), province/regional breakdown with progress bars, and real-time calculation panel.
2. Sidebar navigation, header (search, notifications, settings) should render. Sidebar must be responsive (no fixed-width overflow).
3. Clicking a plot should show plot detail (backend `GET /sponsor/:plotId` verified returning province-grouped plot data).

### Flow 5: Admin review dashboard (/admin) — requires login
1. Open http://localhost:8787/login (server-rendered form). Log in with admin credentials above → 302 to /admin + `nzc_session` cookie.
2. Then open http://localhost:3000/admin. Expect the two-tier review queue to load via `GET /api/admin/review` (verified returning seeded photo records with `ai_status: "flag"`).
3. Test reviewing a photo: `POST /api/admin/review/:photoId` (approve/reject). Verify queue updates.
4. Negative: without the session cookie, `GET /api/admin/review` must return 401 and /admin must not show data.

## API Smoke Checks (all via backend directly or frontend proxy)

- `GET http://localhost:8787/health` → `{"status":"ok"}`
- `POST /api/chat` body `{"text":"...","userId":"..."}` → `{"reply":"..."}` (consent flow enforced for new users)
- `GET /login` → login form; `POST /login` (form-encoded) → 302 + session cookie
- `GET /api/admin/review` → queue (401 without session)
- `GET /sponsor` → province-grouped plots
- `GET /api/photo/:photoId` → photo from R2

## Visual Verification (on EVERY page)

Take screenshots at mobile (390×844) and desktop (1280×800) widths and check:

1. **Icons render as symbols, not text** — the #1 past failure was the Material Symbols font not loading, which printed raw ligature words (e.g. "send", "eco", "dashboard") and broke every layout. If any icon shows as an English word in the UI, flag it as a critical bug.
2. **Cards are WHITE on the gray body** — body background token is `#f0f4f8`. Neumorphic/claymorphic cards must be white with soft shadows. Dark-gray-on-gray or invisible cards = bug.
3. **Glassmorphism effects** — headers/nav use translucent blurred panels; they should look frosted, not flat or fully opaque black.
4. **Thai text renders correctly** — no tofu boxes (□), no clipped/overlapping labels, line-height readable.
5. **Contrast/visibility** — all labels, KPI numbers, and buttons legible; no light-gray text on white; disabled buttons still visible.
6. **Layout** — no horizontal scrollbar, no fixed-pixel widths causing overflow (past bug: Tailwind v4 `ml-72`/`left-72` silently no-op; sponsor sidebar must collapse responsively on mobile).
7. **Empty/error states visible** — loading spinners, "no data" messages, and error banners render visibly, not blank areas.

## Visibility & Functional Cross-Checks

- After each Flow 1–5 step, verify the expected element is **actually visible on screen** (not just present in the DOM): scroll into view if needed and screenshot.
- Buttons must respond to click with visible feedback (sending state, new message appended, queue row updated). A click with no visual change = bug.
- Check browser console on every page: no JS errors except the known-expected ones (camera permission prompt, pre-login 401 on admin).
- Verify API-driven content actually appears: chat replies render as bubbles, admin queue rows render with data, sponsor KPIs show numbers (not `NaN`/`undefined`/blank).

## Success Criteria

1. All 6 pages navigate cleanly; bottom nav and sidebars work.
2. Chat consent flow blocks unconsented users; AI responds after consent.
3. Admin dashboard loads queue after login; 401 without login.
4. Sponsor dashboard renders KPIs and regional data.
5. Visual pass on every page: Material Symbols icons (no raw text), white cards on `#f0f4f8`, glassmorphic nav, readable Thai text, adequate contrast, no overflow at mobile width.
6. Every interactive element gives visible feedback; all API data renders visibly.
7. No unexpected JavaScript console errors (camera permission prompts and pre-login 401s are expected).

## Troubleshooting / Restart

```bash
npm run dev:all          # both backend :8787 + frontend :3000
npm run dev              # backend only
npm run dev:frontend     # frontend only
npm run db:init          # reset local D1 schema
npx wrangler d1 execute netzero --local --command "SELECT count(*) FROM farmers"   # check data
```

- Backend log (this session): `/tmp/backend.log`; frontend: `/tmp/frontend.log`
- If login fails with "Invalid credentials", the local D1 user hashes may have been reset — re-run the seed then re-hash (`src/auth/password.ts` exports `hashPassword`; update `users.password_hash` as `salt:hash` hex via wrangler d1 local).
- Port conflicts: backend needs 8787, frontend 3000 (VPS-style 9router on 8787 does not run on this Mac).

## Suggested Skills for the Testing Agent

- `browser-use:web-gui-tester` — drive the pages and capture evidence.
- `browser-use:control-browser` — browser navigation/screenshots for the visual pass.
- `verification-before-completion` — confirm all Success Criteria before reporting done.

## Out of Scope / Known Limitations

- Camera capture and geolocation require real browser permissions.
- LINE LIFF login is bypassed in demo mode.
- AI reply latency depends on OpenRouter availability (Qwen 3.6 Flash, typically 1–5s).
