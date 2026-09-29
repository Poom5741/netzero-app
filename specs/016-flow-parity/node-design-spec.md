# Spec — Artifact node design parity (all 25 script steps)

**Authority**: `specs/016-flow-parity/script.json`, parsed from the artifact's script module
`5a25b866-38ba-416b-afff-53fe6c36cc28.js`. That module states the copy "is taken from the NZC
chatbot spec", so its fields are requirements, not suggestions.

**Scope**: make every card the bot emits match the artifact's card design — hero tone, badge,
title, body, actions — and fix the node-numbering conflict.

## 1. The artifact card anatomy

Every `flex` node renders one `FlexMessage` card. Extracted from the artifact's design-system
module `c087a24f` (`components/line/FlexMessage.jsx`):

```
card      width 248px · bg #fff · radius 14px · shadow 0 1px 2px rgba(0,0,0,.1)
hero      min-height 56px · padding 9px 12px · font 11.5px bold · white
badge     absolute 8px/10px · rgba(0,0,0,.34) · padding 2px 8px · radius 999px · 10px semibold
title     padding 11px 12px · 13.5px bold · --line-chat-ink
subtitle  11px · --line-chat-ink-3 · margin-bottom 8px
rows      11.5px · dashed bottom #EAEFF4 · label --line-chat-ink-3 / value semibold
actions   border-top #EEF2F6 · each flex:1 · padding 9px 4px · 12px bold
          primary: bg --line-green, text #fff · secondary: bg #fff, text --line-green-dark
```

### Hero tones

The artifact defines five gradients. **LINE Flex cannot express gradients** — `backgroundColor`
is solid only. Each tone therefore maps to its gradient's midpoint, the closest single colour:

| Tone | Artifact gradient | Solid approximation |
|---|---|---|
| `teal`  | `120deg #027276 → #02A99E` | `#028D8A` |
| `navy`  | `120deg #061E5C → #1C489F` | `#11337D` |
| `green` | `120deg #04A344 → #06C755` | `#05B54C` |
| `amber` | `120deg #8A5A10 → #D9A21B` | `#B17E15` |
| `grey`  | `120deg #3B4753 → #6B7B8C` | `#53616F` |

Recorded as a deliberate approximation, not a silent one.

## 2. The 17 cards (22 unique nodes, 43 steps)

| Node | Tone | Badge | Hero | Title | Actions (★ primary) |
|---|---|---|---|---|---|
| OB-01 | teal | ยินดีต้อนรับ | โครงการทำนาลดโลกร้อน (เปียกสลับแห้ง) | สวัสดีครับ 🌾 นี่คือ LINE ของ NetZeroCarbon | ผูกบัญชีของฉัน ★ |
| OB-15 | navy | CS-01 · PDPA | ความยินยอมเก็บและใช้ข้อมูลส่วนบุคคล | ก่อนจะถามอะไรต่อ ขออนุญาตเรื่องข้อมูลส่วนตัวก่อนครับ | อ่านข้อความเต็ม · ยินยอม ★ |
| OB-03 | teal | ยืนยันตัวตน | พบเบอร์นี้ในทะเบียนแล้ว | สมชาย ใจดี | ไม่ใช่ · ใช่ ผมเอง ★ |
| OB-05 | navy | 3 ข้อ | เงื่อนไขการเข้าร่วมโครงการ | ต้องติ๊กครบทุกข้อจึงจะไปต่อได้ | อ่านข้อความเต็ม · ยอมรับทั้ง 3 ข้อ ★ |
| LF-01 | teal | 1 จาก 2 | ข้อมูลของท่านและทะเบียนโฉนด | ฟอร์มสมัครเข้าร่วมโครงการ | กรอกข้อมูล ★ |
| OB-13 | amber | 2 จาก 2 | เอกสารสิทธิ์ของแปลง 12345-01 | แปลงนี้ต้องแนบเอกสาร 3 รายการครับ | ดาวน์โหลดแบบฟอร์ม · ถ่ายเอกสาร ★ |
| OB-10 | grey | pending_review | รอเจ้าหน้าที่ตรวจเอกสาร | รับใบสมัครแล้วครับ ✅ | แก้ไขใบสมัคร · กรอกข้อมูลย้อนหลัง ★ |
| OB-11 | teal | active | บัญชีของคุณเปิดใช้งานแล้ว 🎉 | รหัสเกษตรกร SPB-0142 | เริ่มใช้งาน ★ |
| PJ-13 | teal | SG-01 ถึง SG-09 | ปฏิทินฤดูนี้ 9 ขั้นตอน | ฤดูนี้มี 9 ขั้นตอนที่ต้องบันทึกครับ | ดูทั้งปฏิทิน · บันทึกขั้นนี้ ★ |
| PJ-02 (wet) | navy | WET-1 · SG-04 | รอบที่ 1 · ช่วงเปียก | ถึงเวลารายงานแล้วครับ 🌾 | ยังไม่ได้ทำ · ถ่ายภาพส่งเลย ★ |
| PJ-02 (dry) | amber | DRY-1 · SG-05 | รอบที่ 1 · ช่วงแห้ง | ปล่อยน้ำแห้งรอบแรกได้แล้วครับ | ขอดูวิธีถ่าย · ถ่ายภาพส่งเลย ★ |
| PJ-06 | grey | ก่อนส่ง | ตรวจดูอีกครั้งนะครับ | แปลงนาหลังบ้าน · DRY-1 (SG-05) | ถ่ายภาพใหม่ · ส่งข้อมูล ★ |
| PJ-08 | teal | DRY-1 | ภาพผ่านการตรวจแล้ว ✅ | ครอปนี้ส่งแล้ว 2 จาก 4 ภาพ | ดูสรุปแปลง ★ |
| PJ-09 | amber | WET-2 · ตีกลับ | ภาพยังใช้ไม่ได้ครับ | เหตุผล: รอบนี้เป็นช่วงเปียก แต่ในภาพน้ำแห้งแล้ว | สอบถามเจ้าหน้าที่ · ถ่ายใหม่ ★ |
| RP-01 | navy | TODO | งานค้างของคุณ | เหลือ 3 เรื่องที่ต้องทำครับ | กรอกย้อนหลัง · บันทึกกิจกรรม ★ |
| RP-03 | teal | นาปี 2569 | สรุปผลของฉัน | แปลงนาหลังบ้าน · 14.0 ไร่ | ดูประวัติการส่ง · เปิดแดชบอร์ดของฉัน ★ |

Plus 7 dividers (see flow-spec.md) and 9 `oa` text nodes, 7 `me` nodes, 4 `photo` nodes.

## 3. Gap 1 — the numbering schemes disagree

The code and the artifact use **different node IDs for the same steps**:

| Step | Artifact | Code (`REGISTRATION_STEPS`) |
|---|---|---|
| PDPA consent | **OB-15** | OB-02 |
| Phone share | **OB-02** | OB-03 |
| Identity confirm | **OB-03** | OB-04 |
| Form prompt | **OB-12** | OB-06 |
| Documents | **OB-13** | OB-07 |
| Pending review | **OB-10** | OB-08 |
| Activation | **OB-11** | OB-09 |
| Sow date | **PJ-00** | OB-10 |
| Calendar intro | **PJ-13** | OB-11 |

**OB-10 and OB-11 collide**: in the artifact they are "application received" and "farmer code";
in the code they are "sow date" and "calendar". Any spec or log that mentions OB-10 is ambiguous
today.

**Decision**: the artifact numbering is canonical. Internal state names (`welcome`, `consent`,
…) stay — renaming them is a risky refactor with no farmer-visible benefit. What changes:
`REGISTRATION_STEPS` is corrected to carry the artifact codes so specs, logs, and tests can trace
a node unambiguously.

## 4. Gap 2 — no card has the artifact's hero/badge structure

Audited builders: `buildWelcomeBubble`, `buildConsentBubble`, `buildConsentCard`,
`buildIdentityConfirmBubble`, `buildConditionsBubble`, `buildConditions3Checkbox`,
`buildRegistrationLinkBubble`, `buildCalendarBubble`, `buildDashboardBubble`,
`composeRetakeMessage`.

**None render a hero band or a badge.** Every card is `title text → separator → body text → one
action button`. The artifact's most recognisable element — the coloured hero with a status chip —
is absent from all of them.

**Fix**: one shared `buildArtifactCard()` helper implementing the anatomy in §1, then each node
becomes data. No builder hand-rolls layout again.

### Documented deviation — PJ-13

The artifact's PJ-13 actions are `ดูทั้งปฏิทิน` + `บันทึกขั้นนี้`. The implementation emits one
camera button per photo step instead, each carrying `step`/`plot_id`/`season_id`, plus
`ดูทั้งปฏิทิน`. `บันทึกขั้นนี้` is functionally superseded by those buttons: the calendar page
cannot know which step to save, and the camera link is what actually starts a report. Asserted by
`tests/unit/line/calendar-photo-action.test.ts` (T005–T013), which existed before this spec and
tests behaviour the flow depends on. `flow-design-parity.test.ts` therefore checks PJ-13 by
containment rather than equality.

## 5. Gap 3 — nodes emitted as plain text

| Node | Artifact wants | Code emits |
|---|---|---|
| PJ-02 photo reminder | flex card, navy/amber hero | `composePhotoReminder` returns a `string` |
| PJ-08 photo accepted | flex card, teal hero | `composePhotoAccepted` returns a `string` |
| OB-13 documents | flex card, amber hero | text |
| RP-01 todo | flex card, navy hero | text |

Text nodes cannot carry hero/badge/actions, so these are structural gaps, not copy tweaks.

## 6. Gap 4 — nodes with no builder at all

| Node | Status |
|---|---|
| OB-13 documents prompt | no dedicated builder found |
| OB-10 pending review | no dedicated builder found |
| OB-11 activation + farmer code | no dedicated builder found |
| PJ-06 confirm-before-send | no builder found |
| PJ-08 progress after accept | no builder found |
| RP-01 todo list | no builder found |

## 7. Implementation plan

1. **`buildArtifactCard()`** in `flex-builders.ts` — the §1 anatomy, tone→solid map, badge, rows,
   actions with primary flag. Single source of card layout.
2. **Port the 10 existing builders** to it. Snapshots regenerate; a design-parity test asserts
   tone, badge, title, and action labels per node.
3. **Add the 6 missing builders** from the §2 table.
4. **Convert the 4 text emitters** to cards.
5. **Correct `REGISTRATION_STEPS`** to artifact codes, keeping a `legacyCode` field so existing
   logs stay readable.
6. **Extend `flow-copy-parity.test.ts`** to assert the full card: tone, badge, hero, title,
   actions, and primary — per node, from `script.json`.

Non-goals: no state-machine change, no new conversation edges, no DB schema change. The flow's
order and branching are already correct.

## 8. Acceptance

- `bun test tests/unit/flow-design-parity.test.ts` — every node's tone/badge/title/actions equal
  the §2 table.
- `bun test tests/unit/flow-copy-parity.test.ts` still green.
- `bun test tests/scenarios/` green — the 43-step walkthrough is unchanged.
- Snapshots show a hero box and badge on every card.
