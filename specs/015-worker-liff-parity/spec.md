# Feature Specification: Worker LIFF Page Artifact Parity (Slice 3)

**Feature ID**: 013-farmer-chat-design-parity · slice 3
**Runtime decision**: `.super-speckit/research/013-liff-runtime-resolution.md`
**Status**: implemented, awaiting independent QA

## Why

Two earlier slices made the **bot's Flex messages** match the artifact. But when a farmer taps a
button, LINE opens a **web page** — and that page is the Worker's, rendered at
`src/routes/liff.ts`. It still carried its own hand-rolled palette: a `#f0f2f5` grey canvas, `#333`
text, a `#06c755` user bubble, `#e0e0e0` and `#ddd` borders. None of those are artifact values.

The artifact's LINE chat is the blueprint for this page. This slice makes the page match it.

## Scope

### In scope — `/liff/` chat template (`src/routes/liff.ts:33+`)
- Artifact token block declared once as CSS custom properties on `:root`.
- Canvas, bubbles, system divider, typing indicator, composer, quick replies, loading spinner.
- Bubble geometry: 232px cap, `9px 12px` padding, 13px radius with a 4px tail, 13px/1.55 text.
- Legacy palette removed entirely.

### Out of scope
- `/register`, `/camera`, `/documents` templates — same approach, separate work (R-020).
- The page's `<script>` behaviour: state machine, API calls, LIFF SDK wiring. Presentation only.
- Conversation logic, photo verdicts, scoring, admin, sponsor.
- LINE's own client chrome, which no repo code can restyle (matrix R-011).

## Requirements

| ID | Requirement |
|---|---|
| R-013 | Chat canvas paints the artifact `--line-chat-bg: #8FAAD0` |
| R-014 | Bot bubble text uses `--line-chat-ink: #16202C`; the legacy `#333` MUST NOT appear |
| R-015 | User bubble uses `--line-bubble-me: #A9E86B` |
| R-016 | System divider is a `rgba(0,0,0,0.22)` pill, radius `999px`, `3px 12px`, 11px |
| R-017 | Bubbles cap at 232px with `9px 12px` padding, 13px radius, 4px tail, 13px/1.55 |
| R-018 | Composer hairline `#EEF2F6`; quick-reply border `#D6DFE9`, text `#04A344`, `6px 13px`, 12px semibold |
| R-019 | No legacy palette value remains in the template |
| R-005 | No behavioural change: markup structure, script, and endpoints untouched |

## Success criteria

- `bun test tests/unit/liff-page-parity.test.ts` → 11/11 (baseline was 0/11).
- Runtime: `npx wrangler dev`, load `/liff`, read computed styles, each equal to the artifact.
- `bun test tests/unit/ tests/integration/` → no new failures; scenarios still pass.

## Verification

Matrix: `.super-speckit/matrices/013-farmer-chat-design-parity.md` (R-013 … R-020)
Feedback loop: `.super-speckit/feedback/013-liff-page-parity/feedback-loop.md`
