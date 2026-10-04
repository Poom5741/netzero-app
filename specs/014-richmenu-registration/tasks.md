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

- [ ] **T-208** Register the rich menu against the live LINE channel
      (`createRichMenu` → upload `assets/richmenu/richmenu-2500x843.png` as content →
      `setDefaultRichMenu`). The 2500×843 asset NOW EXISTS (tracked at
      `assets/richmenu/richmenu-2500x843.png`; design brief
      `.super-speckit/design/rich-menu-image-brief.md`), so spec's asset precondition is met —
      but execution requires a live channel access token (secret) and mutates the production
      LINE channel. **Blocked on authorized credentials + go-ahead; never fabricated.**

      **Evidence update 2026-10-05** (read-only probe via `scripts/register-rich-menu.ts --check`):
      channel `netzero-test` (`@489xulzz`) **already has a default rich menu**
      (`richmenu-90d39bb27db377e604168ebaf69cabd9`, "NetZeroCarbon Post-Activation Menu Large") —
      same six postback actions (BL_HOME/SEASON_HOME/TODO/FIELD_LIST/SUMMARY/CONTACT) but a
      2500×1686 two-row layout with `selected: true`. The artifact-parity config is 2500×843 with
      `selected: false`. Applying would replace a working live menu and collapse it by default —
      **product decision required** (confirm `selected` state + visual choice) before `--apply`.

## Not in this slice

- Per-user menu linking (`linkRichMenuToUser`) — no requirement yet.
- Quick-reply vs Flex action-row product decision — recorded in the matrix.
