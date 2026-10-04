# Tasks — Rich Menu Registration (Slice 2)

**Spec**: `specs/014-richmenu-registration/spec.md`
**Matrix**: `.super-speckit/matrices/013-farmer-chat-design-parity.md`
**Feedback loop**: capture-seam client tests (spec success criterion)

> **LOCALLY AUTHORED RECONSTRUCTION — 2026-10-03.** Slice 2 was implemented and QA'd
> (candidate `bafb844`, `.super-speckit/qa/013-bot-parity-002/proof-pack.json`, verdict `pass`)
> but no task file ever existed for this slice. Created per the confirmed full-heal scope
> (user-approved 2026-10-03), limited to facts derivable from landed evidence.

## RECONCILED 2026-10-03 — implementation landed, capability shipped behind opt-in

- [x] **T-201** `createRichMenu()` client call per R-201.
      Evidence: `src/line/rich-menu-client.ts` (landed `bafb844`, 49 L);
      `tests/unit/line-richmenu-client.test.ts` proves method, URL
      `POST https://api.line.me/v2/bot/richmenu`, Bearer header, JSON body, `{status,statusText,body}` shape.
- [x] **T-202** `setDefaultRichMenu()` per R-202.
      Evidence: same client; test asserts `POST /v2/bot/user/all/richmenu/{richMenuId}`.
- [x] **T-203** No credential leakage per R-203.
      Evidence: client reuses the shared helpers' 200-char body truncation; secrets_scan clean in pack-002.
- [x] **T-204** No production wiring without an asset per R-204.
      Evidence: `grep createRichMenu|setDefaultRichMenu src/line/webhook.ts src/line/flow.ts` → 0 call sites (re-verified 2026-10-03).
- [x] **T-205** `bun test tests/unit/line-richmenu-client.test.ts` green.
      Evidence: re-run live 2026-10-03 on `2df2513` — pass / 0 fail.
- [x] **T-206** Full backend suite stays green at the slice candidate.
      Evidence: pack-002 gates all pass (candidate `bafb844`).
- [x] **T-207** Checker QA recorded.
      Evidence: `.super-speckit/qa/013-bot-parity-002/proof-pack.json` — verdict `pass`.

## Open (external dependency — not silently executable)

- [x] **T-208** Register the rich menu against the live LINE channel
      (`createRichMenu` → upload `assets/richmenu/richmenu-2500x843.png` as content →
      `setDefaultRichMenu`). **DONE 2026-10-05** with user-approved artwork (the tracked
      asset IS the chosen design; compressed 1.63MB → 588KB via 256-color palette to meet
      LINE's 1 MB limit). Evidence: `richmenu-38a19aa2844dc60e6d7bbdc41e5c376b` created,
      image uploaded, set as default — all HTTP 200; content downloaded back from
      `api-data.line.me` byte-identical at 2500×843. Fixed en route: `uploadRichMenuImage`
      must use the `api-data.line.me` binary host (first apply 404'd on `api.line.me`;
      tests pinned the wrong host and now pin the right one), plus a ≤1MB asset regression
      test. Orphaned image-less menu `richmenu-995a40b124affd18e4544a6e3253347e` deleted
      (200). Prior live menu (`richmenu-90d39bb2…`, 2500×1686) remains registered on the
      channel but is no longer the default. Decision trail: the probe found the prior menu
      (`richmenu-90d39bb2…`) open by default (`selected: true`); the artifact config's
      `selected: false` was kept per the QA'd artifact-of-record. If farmers report the menu
      feels hidden, flip `selected` in `src/line/rich-menu.ts` and re-apply.

## Not in this slice

- Per-user menu linking (`linkRichMenuToUser`) — no requirement yet.
- Quick-reply vs Flex action-row product decision — recorded in the matrix.
