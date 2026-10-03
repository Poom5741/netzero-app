# Design-Evidence Report — line-oa-farmer.html ("NetZeroCarbon — LINE OA เกษตรกร")

> Extracted by evidence agent 2026-09-29 from `design-artifacts/2026-09-28/line-oa-farmer.html`
> (2.46 MB self-contained bundle; gzipped base64 modules in a `<script type="__bundler/manifest">` JSON, page HTML in `<script type="__bundler/template">`).

## 0. Module map

| Module | Contents |
|---|---|
| `5a4a870c` | React 18.3.1 dev |
| `2b190c38` | React DOM dev |
| `643521fc` | lucide icons 0.460.0 |
| `1e7be120` | Babel standalone (in-browser JSX) |
| `c087a24f` | Design system bundle `NetZeroCarbonDesignSystem_f3e7a8` (358 KB) — tokens via CSS vars + 28 components |
| `5a25b866` | **Chat script**: `SCRIPT` array, `CHAPTERS`, `RICH_MENU` (LINE Chatbot Flow AWD, nodes OB-01…OB-11, PJ-00…PJ-13, RP-01…RP-04) |
| `30fbaadd` | **LIFF screens**: `LiffShell`, `Panel`, 8 LIFF pages (`LIFF` registry) |
| template | App entry: `App()` = 3-column layout (nav / PhoneFrame 392px chat / spec aside) |
| fonts | Fira Sans (300–800), Fira Mono, Noto Sans Thai (woff2, embedded) |

## 1. Screens / scenes

**Chat page (single page, 3 columns).** Chat advances step-by-step through `SCRIPT`; nav jumps between 3 chapters; 8 LIFF overlays open over the phone.

Chapters (`CHAPTERS`): `ob` สมัครและผูกบัญชี (OB-01–OB-11), `pj` รายงานระบบฤดู (PJ-00–PJ-13), `rp` ดูผล/งานค้าง (RP-01–RP-04). 10 scene dividers, 43 script entries total.

**LIFF overlays** (all wrapped in `LiffShell`: gradient-deep navy header, white NZC mark in circle, grey-50 body, white footer bar):
1. `register` — LF-01 ฟอร์มสมัคร (2 steps, progress bars; step 1 person R-01–R-06, step 2 deed R-07–R-14 + GPS capture map placeholder `linear-gradient(150deg,#CFE3B9,#8FA95C)`)
2. `docs` — OB-13 แนบเอกสารสิทธิ์ (3 docs DOC-01/03/06, 44×56 doc thumbs, done state gradient `#E7FCF7→#8FF3DE`, Badge แนบแล้ว)
3. `camera` — LF-04 กล้องบังคับ (240px viewfinder with dashed frame, PVC-pipe placeholder, GPS overlay `14.9231, 100.1042 · 07:41`, water-level pill chips 0/5/10/15/>15/พิมพ์เอง)
4. `calendar` — PJ-13 ปฏิทินฤดู 9 ขั้น SG-01–SG-09 (ProgressBar 4/9; stage marks: done=✓ teal, now=● warning bg, next=○, lock=🔒 grey; 4-phase chips เปียก1/แห้ง1/เปียก2/แห้ง2)
5. `summary` — RP-05/LF-12 แดชบอร์ด (pill tabs ผล/เครดิต/ภาพ; hero stat card on gradient-deep: "9.42 tCO₂eq" 38px light; 3 ProgressBars; credit explainers, fertilizer log; 2×2 photo grid with pass/reject overlay tints `#8FF3DE`/`#FFB4B4`/`#FFE29A`)
6. `fields` — RP-02 แปลงของฉัน (3 plot cards CPA1001/F01-02, CPA1002/F01; Badge tones warning/success/danger; Tag area/rice)
7. `contact` — RP-04 ติดต่อเจ้าหน้าที่ (officer card, 16:9 video placeholder gradient `#061E5C→#027276`, SY-06 offline-queue panel)
8. `baseline` — BL-01–BL-15 ข้อมูลย้อนหลัง 3 ปี (6-season grid, 8-question accordion, "same as before" shortcut, SF_p/SF_w radio options WW-1/2/3, placeholder panels marked 🚧)

## 2. Design tokens (exact values)

**Brand:** `--nzc-navy:#061E5C`, `--nzc-teal:#028E91`, `--nzc-mint:#52ECCA`, `--nzc-aqua:#43D8B8`, `--nzc-space-grey:#273343`, `--nzc-black:#141414`.

**Ramps:** navy-950 `#030E2E` … navy-50 `#EEF2FB` (900 `#061E5C`, 800 `#0B2A72`, 700 `#123787`, 600 `#1C489F`, 400 `#5279CB`, 100 `#D6E0F4`); teal-950 `#012730` … teal-50 `#E7FCF7` (600 `#028E91`, 500 `#0AA8A3`, 400 `#24C4B2`, 300 `#52ECCA`, 200 `#8FF3DE`); grey-950 `#141414` … grey-50 `#F2F2F2` (800 `#273343`, 600 `#566277`, 400 `#9AA3B2`, 300 `#C2C8D2`, 200 `#DDE1E8`, 100 `#EDEFF3`).

**Status:** success `#0AA8A3` (+soft teal-50), warning `#E2A33C` (+soft `#FCF2E0`), danger `#C8464F` (+soft `#FBECEC`), info navy-600.

**Gradients:** mark `135deg #52ECCA→#02A99E 42%→#028E91 62%→#061E5C`; rule `90deg #52ECCA→#028E91 55%→#061E5C`; deep `150deg #061E5C→#0B2A72 45%→#027276`; protect `180deg transparent→rgba(6,30,92,.82)`. **FlexMessage hero tones:** teal `120deg #027276→#02A99E`, navy `#061E5C→#1C489F`, green `#04A344→#06C755`, amber `#8A5A10→#D9A21B`, grey `#3B4753→#6B7B8C`.

**Fonts:** `--font-sans:"Fira Sans","Noto Sans Thai",…`, `--font-thai:"Noto Sans Thai","Fira Sans"`, `--font-mono:"Fira Mono"`. Weights 300/400/500/600/700. Type scale 12/14/16/18/20/24/30/38/48/60/76px; display=76 light, H1=48, H2=38, H3=20, body=18, tracking display -0.02em, eyebrow 0.14em.

**Spacing:** 4-pt scale (4/8/12/16/20/24/32/40/48/64/80/96/128); gutter 24, container 1200/760, field-height 46, control 36/46/54.

**Radii:** xs 4, sm 8, md 12, lg 16, xl 24, 2xl 32, pill 999, circle 50%; card=lg, control=pill, field=sm.

**Shadows:** xs `0 1px 2px rgba(6,30,92,.06)` → xl `0 32px 72px rgba(6,30,92,.16)`; accent `0 12px 28px rgba(2,142,145,.24)`; focus ring `0 0 0 3px rgba(10,168,163,.32)`.

**Motion:** 80/140/220/420/700/1800ms; ease-standard `cubic-bezier(.4,0,.2,1)`, ease-out `(.16,1,.3,1)`; lift-hover -4px; press-scale .98.

**LINE-specific tokens:** `--line-green:#06C755`, `--line-green-dark:#04A344`, `--line-bubble-me:#A9E86B`, `--line-bubble-you:#FFFFFF`, `--line-chat-bg:#8FAAD0`, ink `#16202C`/`#4A5866`/`#78889A`, hairline `#EEF2F6`, QR border `#D6DFE9`, phone 360w/38r.

## 3. Component inventory (design system `c087a24f`)

Brand: GradientRule, Logo, SectionHeading, StatCounter. Core: Badge, Button (pill radius; primary teal-600, outline, ghost, sm), Card, Icon, IconButton, Tag. Data: DataTable, FilterBar, ProgressBar (tones default/mint/navy/grey), StatTile. Forms: Checkbox, Field, Input, Select, Textarea. **LINE set:**
- **ChatBubble** — max-width 232px; me `#A9E86B` radius `16 16 4 16`, OA white radius `16 16 16 4`; padding 9×12; 13px/1.55; shadow `0 1px 1px rgba(0,0,0,.06)`; 30px white circular avatar (NZC mark); time + "อ่านแล้ว" 9.5px rgba(255,255,255,.9).
- **ChatDivider** — centered pill `rgba(0,0,0,.22)` white 11px.
- **PhotoBubble** — 150×112, radius 14, sky-to-paddy gradient `180deg #9FC7E8→#CFE3B9 55%→#8FA95C`, PVC pipe strip `#E7EDF2`, GPS + caption chips `rgba(0,0,0,.55)` 9px.
- **FlexMessage** — 248px white card, radius 14, shadow `0 1px 2px rgba(0,0,0,.1)`; hero min-height 56 with tone gradient + badge pill `rgba(0,0,0,.34)`; title 13.5 bold; subtitle 11 ink-3; key-value rows 11.5px dashed `#EAEFF4` separators, value tones good=success/warn=warning; footer action bar split buttons, primary `--line-green` white bold, secondary white `--line-green-dark` text.
- **PhoneFrame** — 360 (used at 392) bezel `#0F1720`, radius 38; screen `--line-chat-bg` radius 26.
- **ChatHeader** — LINE green `#06C755`, back chevron, 30px avatar, title 14 bold + subtitle 10.5, hamburger.
- **QuickReplies** — white pills, border `#D6DFE9`, radius pill, 6×13 padding, 12px semibold `#04A344`.
- **RichMenu** — white bar over hairline; input bar (hamburger, grey `#F1F4F8` pill "พิมพ์ข้อความ", smiley, `#94A2B2`); 3-col grid 1px gaps; active cell `--teal-50`; emoji glyph 18px + 10.5px label.

## 4. Chat flow structure

`SCRIPT` = 43 entries, types: `divider`, `oa` text (+optional `quick`), `flex` (heroTone/heroBadge/title/subtitle/rows/actions, some `liff:` targets), `me`, `photo`. Header subtitle changes per phase. RichMenu switches from single "🔗 เริ่มผูกบัญชี" to 6-cell menu after account link (step≥13).

Scene sequence: (1) add-friend+PDPA OB-01/OB-15 → (2) phone share OB-02/OB-03 identity match "สมชาย ใจดี อ.สามชุก จ.สุพรรณบุรี" → (3) 3 conditions CS-02/03/04 → (4) register form OB-12/LF-01 → (5) documents OB-13 (DOC-01 โฉนด, DOC-03 บัตร, DOC-06 หนังสือมอบอำนาจ) → pending OB-10 → activation OB-11 (farmer code SPB-0142) → (7) season open PJ-00 + calendar PJ-13 (SG-01–SG-09) → (8) photo rounds PJ-02 (WET-1), PJ-04 water-depth quick replies, confirm PJ-06, review PJ-08 → (9) gallery-photo rejected SY-03, PJ-09 rejection → (10) TODO RP-01 + summary RP-03 (9.42 tCO₂eq, water -43%).

Quick replies: แชร์เบอร์จาก LINE / พิมพ์เบอร์เอง; ให้เจ้าหน้าที่กรอกแทน; หว่านแล้ว เลือกวันที่ / ยังไม่ได้หว่าน / ปีนี้ไม่ได้ปลูกแปลงนี้; water-depth 0/5/10/15/>15 + พิมพ์เอง; ถ่ายผ่านระบบ.

RICH_MENU: 📋 กรอกข้อมูลย้อนหลัง (BL_HOME), 📷 บันทึกงานในแปลง (SEASON_HOME), 🔔 งานที่ต้องทำ (TODO), 🌾 แปลงของฉัน (LIFF fields), 📊 สรุปผลของฉัน (LIFF summary), ☎️ ติดต่อเจ้าหน้าที่ (LIFF contact).

## 5. Key copy (Thai)

- OB-01 greeting: "สวัสดีครับ 🌾 นี่คือ LINE ของ NetZeroCarbon" / "ใช้ส่งภาพและกรอกข้อมูลแปลงนา เพื่อคิดคาร์บอนเครดิตให้พี่น้องเกษตรกรครับ ใช้เวลาตอนสมัครประมาณ 10 นาที หลังจากนั้นเดือนละไม่กี่ครั้ง" — CTA "ผูกบัญชีของฉัน".
- PJ-13: "ฤดูนี้มี 9 ขั้นตอนที่ต้องบันทึกครับ ขั้นที่ยังไม่ถึงกำหนดจะกดบันทึกไม่ได้".
- PJ-02: "ถึงเวลารายงานแล้วครับ 🌾 … ภาพท่อ PVC ตอนน้ำเต็มระดับผิวดิน … ครอปนี้ต้องส่งทั้งหมด 4 ภาพ — เปียก 2 แห้ง 2 สลับกัน".
- SY-03: "ภาพที่ส่งทางแชตใช้เป็นหลักฐานไม่ได้ครับ (ระบบจะไม่เห็นพิกัดและเวลาถ่าย)".
- Summary RP-03: คาร์บอนที่ลดได้ 9.42 tCO₂eq; น้ำที่ประหยัดได้ ลดลงประมาณ 43%; "ถ้าส่งภาพครบ 4 รอบจะได้เต็มค่านี้ ถ้าไม่ครบจะลดลงเหลือประมาณ 6.1 tCO₂eq"; fertilizer log 16-8-8 25 กก./ไร่ → 4.00 กก.N, 46-0-0 ยูเรีย 20 กก./ไร่ → 9.20 กก.N.
- Demo persona: สมชาย ใจดี, โฉนด 7218, แปลง CPA1001/F01 "แปลงนาหลังบ้าน" 2.40 ไร่ หอมปทุม, GPS 14.9231, 100.1042, officer คุณวิภา +66 (0) 63-298-4955.
- Artifact-internal placeholders (NOT implementation targets): contact video "🚧 ไฟล์วิดีโอจริงยังไม่ได้ส่งมา"; baseline forms 3–8 "🚧 ยังเป็นที่วางไว้".
