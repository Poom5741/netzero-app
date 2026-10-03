# Parity Diff — current implementation vs line-oa-farmer.html artifact

Feature: 013-farmer-chat-design-parity · 2026-09-29

Scope note: the user directive names the **chat design**; the artifact's chat page
(LINE-style chat + LiffShell LIFF overlays) is the target. Milestone slice 1 below
covers the chat surface and shared tokens/sHELL that all farmer LIFF pages inherit.

## Slice 1 — Chat surface + tokens (this milestone)

| # | Area | Artifact | Current | Gap / action |
|---|---|---|---|---|
| 1 | Tokens | navy/teal/grey ramps, mint `#52ECCA`, aqua `#43D8B8`, status `#0AA8A3/#E2A33C/#C8464F`, gradients (mark/rule/deep/protect + 5 Flex hero tones), LINE tokens (`--line-green #06C755`, bubble-me `#A9E86B`, chat-bg `#8FAAD0`) | partial: navy `#061E5C`, teal `#028E91`, LINE green present; no mint/aqua/ramp/Flex tones/LINE chat tokens | Add full artifact token set to `globals.css` (additive; admin/sponsor share globals but read the same named vars, so parity improves rather than breaks) |
| 2 | Chat bubbles | me `#A9E86B` radius 16/16/4/16, OA white radius 16/16/16/4, max-w 232, padding 9×12, 13px/1.55, shadow `0 1px 1px rgba(0,0,0,.06)`, 30px NZC avatar, time/อ่านแล้ว 9.5px | user bubble hard-coded `bg-[#028E91]` (wrong color), bot bubble glassy surface | Restyle `chat-bubble.tsx` to artifact LINE bubble spec |
| 3 | Chat header | LINE green `#06C755`, back chevron, 30px avatar, title 14 bold + subtitle 10.5 (phase text), hamburger | generic glass header | Add LINE-style chat header to `/chat` with phase subtitle |
| 4 | Quick replies | white pills, border `#D6DFE9`, pill radius, 6×13, 12px semibold `#04A344` | generic teal pills | Restyle `quick-actions.tsx` |
| 5 | Chat background | `#8FAAD0` LINE chat bg + ChatDivider centered pill `rgba(0,0,0,.22)` white 11px | `#f0f4f8` app background | Chat page background + scene divider component |
| 6 | Flex-style cards in chat | 248px white card r14, tone hero gradient + badge, title 13.5 bold, dashed `#EAEFF4` rows, split green action bar | bubbles only / plain links | Render card-style bot messages (calendar, results, TODO) as FlexMessage component |
| 7 | Bottom composer/rich menu | white bar, grey `#F1F4F8` input pill "พิมพ์ข้อความ", green send | BottomNav glass app nav | Chat page gets LINE composer bar; keep BottomNav on non-chat farmer pages |
| 8 | LIFF shell | `LiffShell`: gradient-deep navy header `150deg #061E5C→#0B2A72 45%→#027276`, white NZC roundel, grey-50 body, white footer bar | no shared shell (pages roll their own) | New `LiffShell` component; adopt on `/upload`, `/summary`, `/contact` |
| 9 | Fonts | Fira Sans + Noto Sans Thai (already) | same | none |

## Slice 2 — LIFF page internals (follow-up, same feature)

- `/summary`: hero stat card on gradient-deep (38px light number), pill tabs, ProgressBars, photo grid tint overlays `#8FF3DE/#FFB4B4/#FFE29A`.
- `/contact`: officer card, 16:9 video placeholder gradient `#061E5C→#027276`, offline-queue panel.
- `/upload` + camera: viewfinder dashed frame, GPS overlay, water-level pill chips 0/5/10/15/>15/พิมพ์เอง.
- Missing routes from spec/`rich-menu`: `/fields` (plot cards), `/calendar` (SG-01–SG-09 progress), `/docs` (DOC-01/03/06 thumbs), `/baseline` (🚧 in artifact itself — reference only).

## Explicit non-targets

- Artifact demo fixtures (สมชาย ใจดี, 9.42 tCO₂eq, SPB-0142) are synthetic; real data flows unchanged.
- Native LINE Flex message JSON restyle is slice-3 (backend `flex-builders.ts` hero tones already match the Flex contract; verify colors against artifact).
- 🚧 placeholder panels in the artifact itself (contact video, baseline forms 3–8).
