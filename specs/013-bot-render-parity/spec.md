# Feature Specification: Bot-Render Artifact Parity (Slice 1)

**Feature ID**: 013-farmer-chat-design-parity · slice 1
**Status**: planned
**Umbrella purpose**: `.super-speckit/purpose/013-farmer-chat-design-parity/purpose-map.md` (human-confirmed 2026-09-29)

## Why

The farmer LINE OA product was designed in a Claude Design artifact
(`design-artifacts/2026-09-28/line-oa-farmer.html`, artifact `19c446b9`). The bot's
rendered output still carries a legacy palette and geometry that predate the
artifact. Farmers see the mismatch every time they open the chat.

This slice covers **only what this repository emits** to the LINE Messaging API.
The chat bubbles, header bar, and keyboard quick-reply chips are drawn by LINE's own
client and cannot be influenced by any code here (proved in the spec grill, I1).

## Scope

### In scope — bot-emitted rendering
- Flex Message body text colour → artifact ink `#16202C`.
- Flex bubble corner radius → artifact `13px`.
- Flex action row padding → artifact `9px 4px`; corner radius → artifact `4px`.
- A `ChatDivider`-equivalent system block (translucent black pill, radius `999px`).
- Rich menu: verify 3×2 grid and artifact Thai labels stay correct.

### Out of scope
- LINE client chat chrome (bubbles, header, chips) — not ours.
- Rich menu cell imagery — needs a 2500×843 PNG asset that does not exist.
- Registering the rich menu with the LINE API — separate capability, tracked R-007.
- All LIFF/web screens and the six unbuilt routes — slice 2, blocked on one human check.
- Conversation logic, state machine, photo verdicts, scoring, admin, sponsor.

## Requirements

### R-001 Flex body text uses artifact ink
Every Flex text component emitted by `src/line/flex-builders.ts` MUST use one of the
artifact colours (`#16202C`, `#06C755`, `#04A344`, `#FFFFFF`). The legacy grey `#333333`
MUST NOT appear.

**Why**: `#333333` is the pre-artifact palette and is the most visible divergence in every bubble.

### R-002 Action rows use artifact geometry
Action blocks MUST use `paddingAll: "9px 4px"` and `cornerRadius: "4px"`.

**Why**: artifact `FlexMessage` action row is `9px 4px` with a 4px radius; the code uses
`10px` and `6px`, so every CTA is visibly chunkier than designed.

### R-003 Bubbles use artifact corner radius
Bubble containers MUST use `cornerRadius: "13px"`.

### R-004 A system divider exists
The welcome Flex MUST include a centred divider block with a translucent black
(`rgba(0,0,0,0.22)`-equivalent) background and `999px` radius, carrying the
"เพิ่ม NetZeroCarbon เป็นเพื่อนแล้ว" label.

**Why**: the artifact shows this divider as the first element in every conversation; its
absence is a structural, not cosmetic, difference.

### R-005 No behavioural regression
All existing tests MUST still pass. This is a presentation-only change; no message text,
action payload, state transition, or database write may change.

## Success criteria

- `bun test tests/unit/line-parity-artifact.test.ts` — all green (currently 4 red).
- `bun test tests/unit/ tests/integration/` — no new failures vs the `41fbe2e` baseline.
- The only diff to `src/line/` is colour/size/radius constants and the added divider.

## Verification

Matrix: `.super-speckit/matrices/013-farmer-chat-design-parity.md`
Feedback loop: `.super-speckit/feedback/013-farmer-chat-design-parity/feedback-loop.md`

On-device confirmation that LINE's client renders these correctly is a **human
observation lane (R-011)**, not an automated gate.
