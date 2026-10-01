# Handoff — Agent Manual Test: Farmer User Journey (Design + Functionality)

**Date:** 2026-09-29
**For:** An autonomous testing agent (e.g. Grok bot) with its own computer and full access to:
the NetZeroCarbon web app, the real LINE app (mobile or desktop), and the public web.
**Mission:** Walk the **entire farmer user journey end-to-end through the real LINE app** —
from add-friend to results — and at **every step verify BOTH tracks**:
1. **Functionality** — does the step work? (bot replies, data is correct, buttons do what
   their labels say, the flow advances)
2. **Design** — does the step look like the Claude design artifact? (card anatomy, hero
   tone, badge, exact Thai copy, LIFF shell)

A step is only `pass` when **both** tracks pass. Do not split the work into "a design pass"
and "a functional pass" — one journey, two checks per step.
**Deploy under test:** Worker `bf7dd54f-1305-4e85-9bf6-aed477663cd1` · Pages `74d93a45`
(commit `c1950e9`, pushed to `origin/main` on 2026-09-29).

---

## 1. What shipped (the update under test)

Twelve commits landed 2026-09-29. The farmer-facing changes:

1. **LINE chat cards redesigned to the artifact** — every flex card the bot sends now matches
   the Claude artifact's card design (`specs/016-flow-parity/node-design-spec.md`): 248px white
   card, radius 14px, colored hero strip with badge chip, title, dashed data rows, and a
   two-button action row (primary = green filled, secondary = white outline). Bot copy was
   aligned to the artifact's 43-step script (`specs/016-flow-parity/flow-spec.md`).
2. **Six new LIFF screens** served by the Worker at `/liff/calendar`, `/liff/summary`,
   `/liff/fields`, `/liff/contact`, `/liff/baseline`, `/liff/docs` — each rendered through one
   shared shell (`liffScreenHtml`): gradient-deep header with a 26px roundel, 14px bold title,
   10.5px subtitle, close button, grey-50 scroll body, optional footer.
3. **Rich menu assets added** (2500×843 PNG + LINE Rich Menu API client) — **but NOT activated**,
   see §8 known limitations.
4. Old duplicate welcome/consent builders removed; web demo `/chat` page removed from the
   frontend (the farmer interface is LINE only now).

Authoritative design references (read these before judging "correct"):
- `specs/016-flow-parity/flow-spec.md` — the 43-step script, in order, with every card's actions.
- `specs/016-flow-parity/node-design-spec.md` — card anatomy, exact copy, the five hero tones.
- `specs/015-worker-liff-parity/spec.md` — LIFF shell spec.

## 2. Environment — URLs

| Surface | URL |
|---|---|
| LINE OA (add friend / open chat) | https://line.me/R/ti/p/@489xulzz |
| Backend Worker (API + LIFF pages) | https://netzero-carbon-poc.poom-a1d.workers.dev |
| Health check | https://netzero-carbon-poc.poom-a1d.workers.dev/health |
| Admin console | https://netzero-frontend.pages.dev/admin/login |
| Sponsor portal | https://netzero-frontend.pages.dev/sponsor/login |
| LIFF entry (what LINE buttons resolve to) | `https://liff.line.me/2011183008-7bEomfVF/...` |

Worker-served LIFF routes (all verified HTTP 200 on 2026-09-29):

| Route | Query params | Shows |
|---|---|---|
| `/liff/register` | — (LIFF context) | LF-01 registration form |
| `/liff/camera` | `?step=&plot_id=&season_id=` | photo capture for a calendar step |
| `/liff/documents` | — (LIFF context) | document upload/status (DOC-01/DOC-03) |
| `/liff/calendar` | `?plot_id=` (opt. `season_input_id`) | 9-step season calendar, per-step status, camera deep links |
| `/liff/summary` | `?plot_id=&farmer_id=` | season results summary |
| `/liff/fields` | `?farmer_id=` | plots + verified photo counts |
| `/liff/baseline` | `?plot_id=` | backfill (ย้อนหลัง) entry form |
| `/liff/contact` | — | staff contact page |
| `/liff/docs` | — | document list screen |

## 3. Credentials (all verified working on 2026-09-29)

| Role | Login | Password |
|---|---|---|
| Admin | `admin@netzero.com` | `ClawTest2026!` |
| Sponsor | `sponsor@netzero.com` | `ClawTest2026!` (password was reset in D1 on 2026-09-29 — the old one was unknown) |

Farmer identity = **phone number**, no password. Seeded farmers in production D1:

| Farmer | Phone | State |
|---|---|---|
| สมชาย มั่นคง (`farmer-happy`) | `0812345679` | registered, 1 plot (`PLOT-001`) |
| มานี มีใจ (`farmer-edge`) | `0899999999` | registered, no plot |
| ภูมิ ทดสอบ | `0822222222` | registered, 1 plot (`SPB-5887`) |
| ทดสอบ ระบบ | `0833333333` | registered, no plot |

Current D1 state (verified 2026-09-29): 4 farmers, 2 plots, **0 seasons**, 6 photo evidences,
6 LINE links. There is **no active season** — the tester creates one through the flow itself
(step J8, §5).

## 4. Required setup

1. A **real LINE account** not previously linked to this OA (fresh account preferred). The
   LIFF pages only carry farmer context inside LINE; in a plain browser they render an honest
   empty state — that is by design, not a bug to report.
2. LINE webhook must be enabled (it is; if the bot never replies, check LINE Console →
   Messaging API → webhook status before blaming the app).
3. A phone (or Android emulator + `adb`/`scrcpy`, already set up on the Xiaomi device
   `6dd797c`) to drive the native LINE app and its in-app camera.
4. The farmer's document photos (any 3 clear images of the application forms suffice) and, for
   photo rounds, a photo of a field/water pipe — content just needs to be a plausible JPEG.

## 5. The user journey — one pass, two checks per step

Drive everything from the real LINE chat with the OA. For each step below, record **two
verdicts**: F (functionality) and D (design). The **[D]** line names what the design must look
like; full anatomy rules are in §6, exact copy authority in
`specs/016-flow-parity/node-design-spec.md` §2.

### J1 · Add friend → welcome
- **[F]** Bot immediately sends welcome card **OB-01** without any tap.
- **[D]** Teal hero `#028D8A`, badge ยินดีต้อนรับ, title สวัสดีครับ 🌾 …, primary action
  ผูกบัญชีของฉัน rendered as a green filled button.

### J2 · PDPA consent (OB-15)
- **[F]** Tapping ยินยอม registers consent and advances; replying the text ยินยอม also works.
- **[D]** Navy hero `#11337D`, badge CS-01 · PDPA, actions อ่านข้อความเต็ม (secondary) /
  ยินยอม ★ (primary).

### J3 · Phone share (OB-02)
- **[F]** Bot asks for the phone and LINE's native share-phone keyboard appears; tapping it
  delivers the number.

### J4 · Identity confirm (OB-03)
- **[F]** With phone `0812345679` the bot shows the registered name สมชาย มั่นคง and ใช่
  ผมเอง trusts immediately (phone is identity — no extra verification). An unknown number
  routes to new registration instead.
- **[D]** Teal hero, badge ยืนยันตัวตน, hero line พบเบอร์นี้ในทะเบียนแล้ว.

### J5 · Terms (OB-05)
- **[F]** All 3 condition checkboxes are individually togglable; ยอมรับทั้ง 3 ข้อ proceeds
  **only** when all are ticked (try tapping it with one unticked — it must not advance).
- **[D]** Navy hero, badge 3 ข้อ, secondary action อ่านข้อความเต็ม.

### J6 · Registration form (LF-01) → documents (OB-13)
- **[F]** กรอกข้อมูล opens `/liff/register` inside LINE. Submitting the form advances the
  chat (กรอกข้อมูลเรียบร้อย), then card OB-13 requires 3 documents; ถ่ายเอกสาร opens
  `/liff/documents`; uploading 3 documents succeeds and status updates.
- **[D]** LF-01 teal hero, badge 1 จาก 2; OB-13 amber hero `#B17E15`, badge 2 จาก 2.
  The register LIFF and documents LIFF both follow the shared shell (§6).

### J7 · Pending-review gate (OB-10)
- **[F]** While the application is under review the bot must **refuse photo submission**
  (ระหว่างนี้ยังส่งภาพกิจกรรมไม่ได้) and offer backfill (กรอกข้อมูลย้อนหลัง) instead. Try
  sending a photo now — it must be declined.
- **[D]** Grey hero `#53616F`, badge pending_review, hero line รอเจ้าหน้าที่ตรวจเอกสาร.

### J8 · Admin approval → activation (OB-11)
- **[F]** In the web admin (`/admin`, login above) approve the application and 3 documents.
  Back in LINE, the bot announces activation with the farmer code (SPB-xxxx) and เริ่มใช้งาน
  advances. (Admin-side design is out of scope for this handoff — function only.)
- **[D]** Teal hero, badge active, hero บัญชีของคุณเปิดใช้งานแล้ว 🎉.

### J9 · Season setup (PJ-00 → PJ-13)
- **[F]** Bot asks if ready to start the season; reply a start date (e.g. `1 ก.ค. 2569`).
  A season is created and the PJ-13 card lists 9 steps; ดูทั้งปฏิทิน opens
  `/liff/calendar?plot_id=…` showing all 9 steps with per-step status markers and working
  camera deep links (each carries step/plot/season).
- **[D]** PJ-13 teal hero, badge SG-01 ถึง SG-09; the calendar LIFF follows the shared shell,
  no horizontal scroll at phone width.

### J10 · Photo rounds WET-1 → DRY-1 → WET-2 → DRY-2
- **[F]** Open a step's camera deep link from the calendar, capture **in the LIFF camera**
  (GPS + timestamp are mandatory evidence), submit. Each accepted photo gets a bot
  confirmation with remaining count (PJ-07: "เหลืออีก 3 ภาพ"). Wet rounds expect water in
  the pipe, dry rounds drained.
  **Negative paths that MUST be tested:**
  - Send a photo picked from the phone gallery instead of the LIFF camera → expect the
    gallery-rejection message (artifact node SY-03: no GPS/time evidence). *(Flagged in the
    gap analysis as "to verify" — the single most important open check in this handoff.)*
  - Submit a dry-looking photo for a WET round → expect mismatch rejection **PJ-09** with
    ถ่ายใหม่ action, and the retake then succeeds.
- **[D]** PJ-02 wet card navy hero (badge WET-1 · SG-04), dry card amber hero (badge
  DRY-1 · SG-05); PJ-06 grey confirm card (badge ก่อนส่ง) with dashed data rows; PJ-09
  amber, badge WET-2 · ตีกลับ; PJ-08 teal progress card (ครอปนี้ส่งแล้ว N จาก 4 ภาพ).

### J11 · Results (RP-03) + dashboard LIFF
- **[F]** After 4/4 photos the summary card shows the plot summary; เปิดแดชบอร์ดของฉัน opens
  `/liff/summary` and the numbers reflect the verified photos (not 0/4 — this was FINDING-J,
  since fixed). `/liff/fields` shows the plot with verified photo counts.
- **[D]** RP-03 teal hero, badge นาปี 2569; summary/fields LIFF screens follow the shared
  shell; figures render in proper Thai numerals/units without overflow.

### J12 · Cross-surface closure
- **[F]** Photos from J10 appear in the admin evidence queue; approving one there updates
  the farmer's verified counts in `/liff/fields` and `/liff/summary`.
- **[D]** (Admin visuals out of scope; check only that the farmer LIFF numbers change.)

## 6. Design rules — applied at every step above

**Card anatomy (every flex card):** white card, ~14px radius, colored hero strip (min 56px)
with a small dark translucent **badge** pill top-left, bold title, optional dashed data rows,
action bar with green **filled primary** + white **outlined secondary**.

**The five hero tones** (LINE Flex can't do gradients, so each artifact gradient ships as its
midpoint solid; this approximation is intentional, do not report it):
teal `#028D8A` · navy `#11337D` · green `#05B54C` · amber `#B17E15` · grey `#53616F`.

**Copy** must match the artifact exactly — authority is the node table in
`specs/016-flow-parity/node-design-spec.md` §2 (17 cards) and the step order in
`specs/016-flow-parity/flow-spec.md` (43 steps).

**Dividers:** 7 grey divider bubbles appear between scenes (ขั้นตอนสมัคร, ฤดูโครงการ,
photo-round markers, งานที่ต้องทำ).

**Thai text rendering:** no tofu boxes, no truncated buttons, all primary actions tappable
and doing what their label says.

**LIFF shell (all six screens):** gradient-deep header with roundel + bold 14px title + 10.5px
subtitle + close button; grey-50 body; content scrolls; footer buttons (when present) don't
overlap content. Check each screen at phone width (~390×844): no horizontal scrollbar, no
text overflowing its row, roundel and close button vertically centered.

## 7. Regression spots worth one look each

- `/liff/register` and `/liff/camera` (pre-existing routes) still work after the redesign —
  they share the same Worker.
- The **welcome/rich-menu path**: the bot's welcome card on add-friend (OB-01) must appear
  even before any tap.
- Admin login → dashboard → evidence queue load with real data.
- Sponsor login (password freshly reset — confirm it works in the UI, not just the API).

## 8. Known limitations — do NOT report these

1. **Rich menu is not activated.** The new artifact rich menu (PNG + API client) was added
   but has no call site yet; whatever rich menu LINE currently shows is the older one. A
   missing/old rich menu is a known gap, not a finding.
2. **`/liff/baseline` save validates only** — there is no backfill persistence endpoint
   outside the chat flow, so the buttons confirm validation and do not persist. Documented
   in commit `de8ef8c`.
3. **`/liff/summary` omits the credit-comparison figure** — nothing computes it yet.
4. **LIFF pages outside LINE show an empty state** — honest by design.
5. **Hero gradients render as solid colors** (LINE Flex limitation, midpoint approximation).
6. `/health` reports `"environment":"development"` — wrangler.toml value, not a deployment bug.
7. GPS may record 0,0 on some devices — known caveat from earlier rounds; re-verify but
   check the device's own permission state first.
8. The web `/chat` demo page was intentionally removed; the farmer surface is LINE only.

## 9. How to report

Write findings to `tests/verification/agent-farmer-flow-test-2026-09-29.md` with, per step:

- **Step ID** (J1…J12) plus, when relevant, the artifact node (OB-15, PJ-09, …).
- **Two verdicts per step:** `F: pass/fail/blocked` (functionality) and
  `D: pass/fail/blocked` (design) — a blocked step explains what prevented the attempt.
- For each fail: **expected vs actual** and **evidence** (screenshot path or exact bot reply
  text).
- Preserve the distinctions — a claim of "verified" without evidence will be rejected.
  Known-limitation items (§8) reported as findings will be rejected too.
- Finish with an overall **GO / NO-GO** for the farmer redesign release, covering both
  tracks.

Good hunting.
