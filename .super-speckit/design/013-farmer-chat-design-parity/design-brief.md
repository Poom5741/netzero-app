# Design Brief — 013-farmer-chat-design-parity

## Problem
The farmer LINE OA / LIFF surface (chat + LIFF pages) must match the client's
Claude Design artifact at 100% visual and flow parity. The artifact was
re-supplied 2026-09-28 and archived in-repo.

## Target users
Farmers (Thai, mobile-first, LINE-native), plus the farmer's delegate entering
data on their behalf.

## Authoritative design source (decision)
`design-artifacts/2026-09-28/line-oa-farmer.html` — client Claude Design
artifact, artifact ID `19c446b9-e2f5-4e09-a118-fca56ec0c0c8`.

**Decision: `approved`** — the user explicitly directed "update farmer design to
match 100% to html design chat design on claude" (2026-09-29). No alternative
direction is explored; the artifact is the single visual thesis. Downstream
implementation must not blend it with other style directions.

## Constraint: what "100% match" can mean per surface
- LIFF web pages rendered inside LINE (chat UI, registration, upload, camera,
  summary): full token/layout/component parity is implementable and verifiable.
- Native LINE bot messages (text + Flex): parity is bounded by the LINE
  FlexMessage schema — colors, layout, and copy must match; arbitrary CSS cannot.
  Divergences are recorded as evidence-backed deviations, not silently accepted.

## Acceptance assumptions
1. All farmer LIFF routes adopt the artifact's tokens (colors, fonts, radii,
   spacing) with no visual drift.
2. Chat scene/copy structure matches the artifact's 10-scene script where the
   current flow already implements the same steps; functional behavior already
   verified in Sep 19 full-flow review must not regress.
3. Visual verification via browser-use against a rendered artifact reference.

## Out of scope
Admin Console and Sponsor Portal artifacts (separate surfaces); backend
business logic changes; new features not present in either the artifact or the
current flow.
