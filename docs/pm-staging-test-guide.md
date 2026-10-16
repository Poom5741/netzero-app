# PM Staging Test Guide — NetZeroCarbon POC

**Environment: STAGING (client-facing test stack). There is no production environment yet.**
Prepared 2026-10-16 by TL/Dev. Credentials are delivered separately in a private handoff file — they are never committed to this repository.

---

## 1. URLs

| Surface | URL |
|---|---|
| Admin portal (web) | https://netzero-frontend.poom-a1d.workers.dev/admin/login |
| Sponsor portal (web) | https://netzero-frontend.poom-a1d.workers.dev/sponsor/login |
| Backend API / LIFF host | https://netzero-carbon-poc.poom-a1d.workers.dev |
| Backend health/build check | https://netzero-carbon-poc.poom-a1d.workers.dev/health |
| LINE Official Account (farmer bot) | **netzero-test** (add as friend in the LINE app) |

> Note: `/health` reports `"environment":"development"` — that label is stale; this **is** staging.

## 2. Test accounts (staging D1)

| Role | Account | Notes |
|---|---|---|
| Admin | `pm-admin@netzero.com` | Dedicated PM admin account. No OTP required. Session 24 h (30 days with "จดจำอุปกรณ์นี้" ticked). |
| Sponsor | `pm-sponsor@netzero.com` | Dedicated PM sponsor account, scoped to province **อ่างทอง** only. No OTP required. |
| Farmer | LINE account + phone `0844444444` | Farmers do **not** have passwords — they exist through the LINE bot (see Scenario C). The farmer record "PM ทดสอบ" (จังหวัดอ่างทอง, แปลง ATG-0001, 6.25 ไร่) is pre-registered and waits for the phone number above to be linked. |
| Admin (legacy/client demo) | `admin@netzero.com` | Password in the private handoff file. |
| Sponsor (legacy/client demo) | `sponsor@netzero.com` | Scoped to **สุพรรณบุรี**. Password in the private handoff file. |

**What was seeded for you (2026-10-16):**

- Farmer **PM ทดสอบ** — phone `0844444444`, อ่างทอง, plot **ATG-0001** (เลขที่ 7701, โฉนด, ผู้ถือกรรมสิทธิ์, 6.25 ไร่). CPA code is intentionally **not assigned yet** — you will assign it yourself in Scenario C step 8 (the system auto-issues the next CPA code on approval).
- Sponsor **pm-sponsor@netzero.com** sees **only อ่างทอง** data, so the client-demo data (สุพรรณบุรี — มานี มีใจ / CPA0003 / 4.5 ไร่) stays untouched while you test.

## 3. Scenario A — Admin portal

1. Open `/admin/login`, sign in as `pm-admin@netzero.com`.
2. **ภาพรวม (Overview)** — KPI cards; rail should show your email `pm-admin@netzero.com`.
3. **คำขอ (Applications)** — approval queue. It starts empty; it fills when the farmer uploads both documents (Scenario C step 6). You will come back here.
4. **เกษตรกร (Farmers)** — should list 6 farmers including **PM ทดสอบ** (อ่างทอง, plot ATG-0001, 6.25 ไร่, CPA `–` until approved). Open the detail tabs.
5. **ตรวจภาพ (Evidence)** — photo review queue (empty until Scenario C step 10). Each item supports ผ่าน / ตีกลับ / ถ่ายใหม่ with a reason.
6. **ผู้สนับสนุน (Sponsors)** — sponsors list with area (province) checkboxes; the **บันทึกพื้นที่** button persists assignments (verify pm-sponsor has อ่างทอง ticked).
7. **รายงาน (Reports)** — export CSV (EX-2042 style).
8. **ตั้งค่า (Settings)** — settings tabs render.
9. **Logout** — after logout, opening `/admin` must bounce back to the login page (session-guard check).

## 4. Scenario B — Sponsor portal

1. Open `/sponsor/login`, sign in as `pm-sponsor@netzero.com`.
2. **ภาพรวม (Overview)** — expected values right now: **1 ครัวเรือน · 1 แปลง · 6.25 ไร่**, province filter scoped to **อ่างทอง**, 0 tCO₂e until photos are verified in Scenario C.
3. **พื้นที่ (Areas)** — assigned-area view; rail identity should show `pm-sponsor@netzero.com`.
4. **รายงาน (Reports)** — **ดาวน์โหลด CSV (EX-2042)**. The CSV counts farmers the same way as the on-screen list (plot-scoped), so both should say 1.
5. PDPA check: sponsor pages/CSV must show **CPA codes only** — no farmer names, phones, or ID numbers.
6. **Logout** — then `/sponsor` must bounce to the sponsor login page.

## 5. Scenario C — Farmer journey (LINE, full E2E)

Use a real phone with the LINE app. This exercises the live staging LINE OA (real messages, real LIFF, real AI screening).

1. Add the LINE Official Account **netzero-test** as a friend.
2. Tap ทักหา / send any message → the bot welcomes you and asks for PDPA consent → **consent**.
3. When asked for the phone number, send: **0844444444**.
4. The bot shows the matched identity (**PM ทดสอบ · อ่างทอง**) → reply **ใช่** to confirm it is you.
5. Accept the project conditions when prompted.
6. The bot sends a LIFF **registration form** link → open it (inside LINE), fill it in, submit. Then follow the **document upload** link and upload **both required documents**: DOC-01 (โฉนด/chanote) and DOC-03 (สำเนาบัตรประชาชน/id copy) — approval is blocked until both are in. Use test images, **not real personal documents** (this is still a test environment).
7. The bot confirms the account is pending staff review (message says 1–3 business days — on staging you approve it yourself in the next step).
8. As **pm-admin**: Admin portal → **คำขอ** → the PM ทดสอบ application appears → **approve** it. The system auto-assigns CPA code **CPA0005** and verifies the LINE link.
9. Back in LINE: send any message → activation success → the bot asks for the **sowing date (วันที่หว่าน)** → send one (e.g. `1 ต.ค. 2569`). The bot creates the season and shows the **9-step calendar** (SG-01…SG-09).
10. **Photo evidence rounds**: follow the WET-1 / DRY-1 (and later WET-2 / DRY-2) prompts → the bot opens the in-system camera page (LIFF). Photos must be taken live through that page — they carry GPS + timestamp + GPS accuracy, which is the compliance proof. Upload and watch the AI screening reply (pass / flag / reject with reason).
11. As **pm-admin**: **ตรวจภาพ** → review the submitted photo → ผ่าน (verify). The farmer receives a LINE push confirmation.
12. As farmer: the bot's **ผลการดำเนินงาน / season card** and the LIFF summary (ดูประวัติการส่ง → opens the ภาพ tab) now show the submitted/verified rounds. Numbers on the **sponsor overview** update as rounds get verified.

## 6. Facts & limits

- Passwords are in the private handoff file `PM-STAGING-CREDENTIALS-2026-10-16.md` (sent via chat/email, not in this repo).
- OTP is **not** enabled on any test account — leave the OTP field empty if shown.
- Sessions: 24 h default; admin "จดจำอุปกรณ์นี้" extends to 30 days. Sponsor sessions live on the backend host (SameSite=None cookie).
- The sponsor demo account `sponsor@netzero.com` (สุพรรณบุรี) and its data belong to client demos — please test with the `pm-*` accounts.
- If the bot is silent: confirm you added **netzero-test** (staging OA) and that you are not already friend-bound to another farmer phone.
- Please file anything odd as a GitHub issue (or send it to the TL) with a screenshot + approximate time.
