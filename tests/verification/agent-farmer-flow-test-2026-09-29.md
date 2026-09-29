# Agent Farmer Flow Test — 2026-09-29

**Tester:** Tech Lead agent (autonomous, desktop LINE + Chromium + CF/D1 access)
**Deploy under test:** Worker `netzero-carbon-poc` (live modified 2026-09-29 05:53Z → superseded by hotfix chain below) · Pages `74d93a45` · commit `c1950e9`
**Surface:** real LINE desktop app (standalone), chat `netzero-test`, account `Uaedb673…` (linked during the walk to `farmer-happy` สมชาย มั่นคง / PLOT-001)
**Verdict rule:** a step passes only when BOTH F (function) and D (design) pass.

---

## 0. Release-blocking bug found & fixed during the walk (BUG-017-B1/B2)

The redesign under test **could not deliver a single card**: every push failed with
LINE 400. Root causes found live via Workers observability (which the agent enabled)
and fixed in 11 hotfix commits (`aa62238`…`054228d`, all local, tests red→green):

| # | Live failure | Root cause | Fix |
|---|---|---|---|
| 1 | 400 `/hero/color` unknown field | box has no `color` (text-only) | removed |
| 2 | 400 `/hero/minHeight` | `minHeight` not in LINE FlexBox schema | padding-based band height |
| 3 | 400 `/hero/contents/0/minHeight` | hero children restricted too | inner band box carries styling |
| 4 | 400 `invalid property /hero/.../backgroundColor` | `rgba(0, 0, 0, 0.34)` (spaces) rejected | hex8 `#00000057` |
| 5 | paddingAll `"9px 4px"` | CSS shorthand invalid; schema has only All/Top/Bottom/Start/End | split Start/End |
| 6 | OB-15/OB-11 cards never sent; OB-03/OB-15 primary buttons were no-ops | builders existed but were never wired; fallback postback labels didn't match handler keywords | wired + explicit postback data |
| 7 | LF-01 opened the old dev demo (`/liff/` bare) | LIFF URL had no additional path | `/liff/register`, calendar/summary/documents/baseline deep links |
| 8 | Admin/sponsor login returned 500 "cannot connect" | login form posts form-encoded; backend only parsed JSON | parse per content-type (b8) |
| 9 | RP-03 ดูทั้งปฏิทิน/เปิดแดชบอร์ดของฉัน → JSON 404 | buttons pointed at the bare app root | `/liff/calendar`, `/liff/summary` deep links |
| 10 | login success returned 200 JSON; UI expects 302 | false "cannot connect" after every successful login | 302 → role home |

All fixes verified **live in LINE** after each deploy (telemetry push 200 + cards rendered).
Gates at each commit: `bun test tests/unit/` **903/903**, `biome` clean.
New permanent regression guard: `tests/unit/line-flex-schema.test.ts` (strict per-component
whitelists from LINE's official OpenAPI schema + hero-slot rule + hex-only colours).

**Test-data preparation (documented, not faked):** deleted 3 stale Sep-19 fixture
`line_links` rows (`U-test-edge-001`, `U-test-happy-001`, `U-test-full-flow`) that
blocked real phone binding; reset this account's link to pending/welcome to walk the
registration; restored สมชาย's name mangled by a truncated form input.

---

## 1. Step verdicts

### J1 · Add friend → welcome (OB-01)
- **F: pass** — welcome card delivered unprompted in welcome state (screenshot 07:06);
  the follow-event path replies OB-01 for every `follow` (code `src/index.ts:185`,
  event verified delivered live at 06:21). True add-friend refire needs block→unblock
  on a real account — not attempted on the only available account (risk of stranding).
- **D: pass** — teal `#028D8A`, hugging ยินดีต้อนรับ badge, title สวัสดีครับ 🌾 นี่คือ LINE
  ของ NetZeroCarbon, green filled ผูกบัญชีของฉัน.

### J2 · PDPA consent (OB-15)
- **F: pass** — tapping ยินยอม advanced (audit: consent accepted → phone prompt);
  typed ยอมรับ path also implemented.
- **D: pass** — navy `#11337D`, CS-01 · PDPA badge, อ่านข้อความเต็ม + ยินยอม ★.
  (Was broken before fix: consent state sent plain text and the button label didn't
  match the handler — both fixed in b2/b7 commits.)

### J3 · Phone share (OB-02)
- **F: pass (desktop caveat)** — typed 10-digit input accepted and validated
  (`0\d{9}`, hyphens/spaces stripped). The native share-keyboard is a mobile-only
  surface; not verifiable from desktop — **needs the phone pass**.
- **D: pass** — plain oa text ask per artifact step 5 (implementation prompt text is
  functionally equivalent; wording not byte-identical to artifact sample).

### J4 · Identity confirm (OB-03)
- **F: pass** — registered phone → card with the farmer's real name; ใช่ ผมเอง
  (explicit postback) advanced to conditions immediately. Unknown phones loop with
  ไม่พบข้อมูลเกษตรกร (by design — registration requires a pre-registered farmer row).
- **D: pass** — teal hero, ยืนยันตัวตน badge, พบเบอร์นี้ในทะเบียนแล้ว, name/subtitle
  live from D1, ไม่ใช่ / ใช่ ผมเอง ★.

### J5 · Terms (OB-05)
- **F: fail** — there are no togglable checkboxes and ยอมรับทั้ง 3 ข้อ advances
  unconditionally (`handleConditions` accepts any accept keyword with no tick
  state). Expected (handoff §5 J5): accept proceeds **only** when all 3 are ticked.
  Node-table copy itself matches; the interactive gate from the artifact screen is
  not implemented. Fix suggestion: 3 checkbox postbacks persisting tick state on the
  link row + gated accept. Not a journey blocker (accept still advances) — but it is
  a spec gap to schedule.
- **D: pass** — navy hero, 3 ข้อ badge, อ่านข้อความเต็ม + ยอมรับทั้ง 3 ข้อ ★.

### J6 · Registration form (LF-01) → documents (OB-13)
- **F: pass (after b2 fix)** — กรอกข้อมูล opened `/liff/register` (was the dev demo
  page — fixed); form filled and submitted successfully server-side (farmer + plot
  updated in D1); state advanced to documents. Caveat: submitted from a plain
  browser there is no LIFF identity, so the push wiring (b3) must be verified inside
  LINE — see Blocked.
- **F (documents): pass** — 3 documents uploaded via `/liff/api/documents/upload`
  (DOC-01/03/06 → R2 persisted, `document_count: 3`, admin gate passes at DOC-01+
  DOC-03 per spec 012 FINDING-F). Note: OB-13 copy says 3 รายการ while the hard
  gate is 2 — deliberate (spec 012) but the copy/gate mismatch is worth a look.
- **D: pass** — LF-01 teal hero + 1 จาก 2 badge ✓; OB-13 amber hero + 2 จาก 2 ✓
  (card verified live post-fix). The register page keeps its older green header
  (no roundel/close) — see Design debt.

### J7 · Pending-review gate (OB-10)
- **F: pass** — after uploads the bot pushed ✅ ได้รับเอกสารแล้วครับ + OB-10; a photo
  sent in chat while pending was **refused** with the SY-03 no-GPS/time message
  (live 07:34, screenshot in session).
- **D: pass** — grey `#53616F`, pending_review badge, รอเจ้าหน้าที่ตรวจเอกสาร hero,
  ระหว่างนี้ยังส่งภาพกิจกรรมไม่ได้ body, แก้ไขใบสมัคร / กรอกข้อมูลย้อนหลัง ★.
  Subtitle now shows live farmer · plot · rai (was hardcoded artifact sample — fixed).

### J8 · Admin approval → activation (OB-11)
- **F: pass (after b7/b8 fixes)** — admin login works (worker domain); approving
  สมชาย's application assigned **CPA0002**, flipped the link to activation, and
  **proactively pushed OB-11** to LINE (desktop notification + card, live 07:50).
  เริ่มใช้งาน advanced to season setup.
- **D: pass** — teal hero, active badge, บัญชีของคุณเปิดใช้งานแล้ว 🎉, รหัสเกษตรกร
  CPA0002 (real code; artifact sample is SPB-0142 — data-driven).
- **⚠ Release blocker found (see §2):** on `netzero-frontend.pages.dev` the login
  POST returns **405** — Pages `_redirects` only apply to GET, so login can never
  succeed there. The working admin URL is
  `https://netzero-frontend.poom-a1d.workers.dev/admin/login`.

### J9 · Season setup (PJ-00 → PJ-13)
- **F: pass (after b9 fix)** — เริ่มใช้งาน → sow-date ask → typed `01/07/2569` parsed
  (BE→CE) and **season created in D1**: `season_plot-happy-1_2026-07-01`, open.
  PJ-13 card lists all 9 steps + 4 camera deep links carrying step/plot/season.
  ดูทั้งปฏิทิน opened `/liff/calendar?plot_id=…&season_id=…` (was a JSON 404 — fixed).
  Parser format is DD/MM/BBBB; the handoff's example `1 ก.ค. 2569` (Thai month
  names) is not parsed — prompt text tells farmers the right format, note for copy.
- **D: pass with finding** — teal hero, 9 dashed rows SG-01→SG-09 with real dates,
  ดูทั้งปฏิทิน ★ + camera buttons (documented deviation). **Finding:** the PJ-13
  badge pill did not render on desktop LINE across three structure variants
  (07:51/07:54/07:57) while identical payloads render on other cards — payload
  verified correct (fixture `calendar-bubble.json`); suspected LINE client render
  quirk; needs a mobile-render check before release.

### J10 · Photo rounds
- **F: pass (SY-03 rejection)** — chat photo refused live (07:34): ภาพที่ส่งทางแชตใช้
  เป็นหลักฐานไม่ได้ครับ (ระบบจะไม่เห็นพิกัดและเวลาถ่าย) + camera quick-reply. This is
  the handoff's "single most important open check" — **verified working**.
- **F: blocked on desktop (rest of the round)** — the LIFF camera page opens with
  correct step/plot/season params and degrades honestly without a camera device
  (ไม่สามารถเปิดกล้องได้…); its file-picker fallback does not submit (no request
  reaches the backend). Real capture → GPS/timestamp validation → wet/dry vision →
  PJ-06/07/08/09 cards **require the Xiaomi phone pass** (adb not needed if the
  device opens the LIFF directly).
- **D: pass (PJ-02 variants verified via unit parity + snapshots; wet navy / dry amber
  live render not observable without a capture)** — PJ-06/PJ-09 unobservable desktop.

### J11 · Results (RP-03) + dashboard LIFF
- **F: pass (after b11 fix)** — ดูผล → RP-03 with live data (PLOT-001, คาร์บอนลดได้
  0 tCO₂e — correct for 0 approved photos; FINDING-J behavior confirmed honest).
  เปิดแดชบอร์ดของฉัน → `/liff/summary?plot_id=…&farmer_id=…` (was app root 404 —
  fixed). `/liff/fields` lists PLOT-001; `/liff/summary` renders the estimate card
  with the honest ภาพไม่ครบ ระบบคำนวณต่ำลง (SF_w = 0) note.
- **D: pass** — teal hero, นาปี 2569 badge, dashed rows, both actions. Minor: summary
  subtitle shows the raw season_id string; RP-03 showed ภาพ 1/4 for a plot with 0
  evidences — count-source worth a look (non-blocking).

### J12 · Cross-surface closure
- **F: pass (mechanism)** — admin evidence queue returns the 6 seeded evidences
  behind auth (401 unauthenticated); `POST /api/admin/review/:photoId` → 200 ok and
  D1 `admin_status` updates. Full J10-photos→queue→counts loop inherits the J10
  desktop block (needs the phone pass).

---

## 2. §7 regressions
- `/liff/register`, `/liff/camera`: **pass** (both live, register tested end-to-end).
- Welcome on add-friend: pass at card level (J1); follow-event refire untested live.
- Admin login → dashboard → evidence queue: **pass on workers.dev**, **BLOCKED on
  pages.dev** (405 on POST /login — §2 blocker above).
- Sponsor login: **pass** — `sponsor@netzero.com / ClawTest2026!` → 302 `/sponsor`
  with session cookie (worker domain; same pages.dev POST caveat).

## 3. Known limitations honoured (not reported as findings)
Rich menu not activated; `/liff/baseline` validate-only; summary credit-comparison
omitted; LIFF empty state outside LINE; hero gradients as solids; `/health`
`environment: development`; web `/chat` removal; GPS 0,0 device caveat.
**One addition to that list:** bare `/liff` still serves the old dev chat demo —
recommend removing or redirecting it to `/liff/register` (it is the LIFF app
endpoint and confusing when hit directly).

## 4. Additional findings (non-blocking, worth scheduling)
1. Activation card double-sends: admin push OB-11 + `handleActivation` sends it
   again on เริ่มใช้งาน (two identical cards, 07:50).
2. OB-10 hard gate is DOC-01+DOC-03 (2) while OB-13 copy promises 3 รายการ.
3. Summary subtitle exposes the raw `season_plot-…` id string.
4. RP-03 ภาพ 1/4 for a plot with zero evidences — verify count source.
5. LINE webhook POST accepts events without `X-Line-Signature` when the header is
   absent (`processed` 200). LINE always sends it; recommend requiring it when
   `LINE_CHANNEL_SECRET` is configured.
6. J5 checkbox gate (see J5 F above).

## 5. GO / NO-GO

**NO-GO for release as-is — GO after two conditions are met:**

1. **Deploy the frontend correctly:** `netzero-frontend.pages.dev` cannot log anyone
   in (POST /login → 405; `_redirects` are GET-only). Release must either make the
   Worker (`netzero-frontend.poom-a1d.workers.dev` — verified working end-to-end)
   the canonical admin/sponsor URL, or add a Pages function to proxy POST auth
   routes. Today a staff member on the pages.dev URL is locked out.
2. **Run the phone pass for J10** (real LIFF camera capture, GPS/timestamp
   enforcement, wet/dry vision, PJ-06/07/08/09 renders). Everything before the
   camera and the SY-03 rejection is verified green on desktop.

**Decision 2026-09-29 (product owner):** condition 1 is met (b14 + verified live
302 /admin with session cookie on pages.dev). Condition 2 is **waived for now** —
agent-driven testing through the real LINE desktop app is accepted as the
sufficient bar; the phone pass stays on the backlog as future hardening, and the
two desktop-only render quirks (PJ-13 badge pill, refusal text not displaying)
remain documented known issues. **Verdict with this decision: GO.**

Farmer-facing chat is otherwise in the best state it has been: every artifact card
now renders, all buttons act, the full J1→J9→J11 loop walked live on a real LINE
account, and a schema guard now prevents this class of silent card failure from
shipping again.

*Evidence: session screenshots (LINE renders at 07:06–08:02), Workers observability
events (rayIds in session log), D1 rows (`season_plot-happy-1_2026-07-01`,
`automation_audit_log` sign-ins, `application_documents` 3/3), commits
`aa62238..054228d` local on `main` (push pending user approval).*
---

## Addendum — session 2, 2026-09-29 ~11:15–11:55 UTC (no phone available)

User could not use the local device; the remaining dev-only items were done
and two of them verified live on the desktop LINE client.

1. **J5 gate shipped + LIVE-VERIFIED (was the only F-fail)** — commit `7142d09`
   (b12), deployed to the test Worker (sha `5cc227f4…`). The OB-05 card now
   renders one ☐/☑ toggle per condition (postback `conditions_tick_1..3`);
   ticks persist append-only in a new `flow_scratch` table (migration applied
   to D1 `netzero`); ยอมรับ/conditions_accept is refused until all 3 are
   ticked. Live walk on the real account: tick 1 → ☑ renders, tick 2 → typed
   ยอมรับ refused at 2/3 (state stayed `conditions`, D1 confirms), tick 3 →
   ยอมรับทั้ง 3 ข้อ advanced to the LF-01 registration card (state
   `registration` in D1). Tick rows are dated (11:34:39 / 11:34:57 / 11:38:47)
   — the audit the card copy promises. Link state restored to `results` after
   the walk. Suite 985→987/987, `bun run check` fully green.
2. **OB-11 duplicate card fixed** — commit `50e10ef` (b13), deployed (sha
   `edd29796…`). Admin approval already pushes the card; handleActivation no
   longer re-sends it on เริ่มใช้งาน (single sender). Not re-walked live (the
   activation step would need a second admin approve); covered by 2 new tests.
3. **pages.dev login RELEASE BLOCKER FIXED end-to-end** — commit `720ed5c`
   (b14) + project settings change. Root cause confirmed: Pages `_redirects`
   are GET-only, so POST /login 405'd. Fix: Pages advanced-mode
   `frontend/functions/_worker.js` — 1:1 port of the workers.dev proxy
   (assets via `env.ASSETS`, API paths via the new `BACKEND` service binding
   → `netzero-carbon-poc`). Deployed via the Pages direct-upload API
   (blake3 manifest of the 145 existing assets matched exactly — 0 uploads;
   gotchas: the `_worker.bundle` part must be a multipart FILE part with a
   filename, and the /pages/assets/* endpoints are host-level with a
   wrangler-style UA). Verified live on pages.dev: `POST /login` →
   **302 /admin**, `POST /sponsor-login` → **302 /sponsor**,
   `GET /admin/login` → 200.
4. **RP-03 "ภาพ 1/4" was correct, not a nit** — the 1 approved photo is the
   evidence I flipped via the review API during J12. No change.
5. Pre-existing `check:type` debt from b9/b11 cleared (`liff.ts` Bindings
   APP_URL, `pushToFarmer` typing) + stale `/chat` integration checks removed
   (route was removed in `a3bef31`) — commit `cc7ab4b`.

New live finding (documented, needs mobile render check): in the refusal
push, the TEXT message ("กรุณาติ๊กยอมรับให้ครบทั้ง 3 ข้อ… (ติ๊กแล้ว 2/3 ข้อ)")
did not display on the desktop LINE client while the re-rendered card right
after it did. Unit tests prove both messages are in the same push payload;
server accepted it (card rendered). Same class as the PJ-13 badge quirk.

*Commits this session: `7142d09`, `cc7ab4b`, `f8bbe6c`, `50e10ef`, `720ed5c`
— all local on `main`; push still awaits user approval. Rollback snapshots:
`_deploy/rollback-netzero-carbon-poc-20260929-pre-b12.js`, `…-pre-b13.js`.*
