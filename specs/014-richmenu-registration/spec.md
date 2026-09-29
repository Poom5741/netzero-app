# Feature Specification: Rich Menu Registration (Slice 2)

**Feature ID**: 013-farmer-chat-design-parity · slice 2
**Status**: planned
**Umbrella**: `.super-speckit/purpose/013-farmer-chat-design-parity/purpose-map.md`
**Reassessment**: `.super-speckit/atlas/changes/013-farmer-chat-design-parity/reassessment-01.md` (decision: `split`)

## Why

`buildRichMenu()` already returns a correct, artifact-matching 3×2 configuration with the six
Thai labels. **Nothing ever sends it to LINE.** A repo-wide search for
`createRichMenu|uploadRichMenu|setDefaultRichMenu|linkRichMenu` returns zero matches, so the
rich menu farmers see is whatever was configured by hand in the LINE console — it cannot track
the code, and the artifact's "active" cell state can never be expressed.

## Scope

### In scope
- A `createRichMenu()` client call mirroring the existing `replyMessage` / `pushMessage` pattern.
- A `setDefaultRichMenu()` call so the menu is actually attached to the chat bar.
- Tests using the existing capture seam, proving the correct payload and endpoint are used.

### Out of scope
- Cell imagery. LINE requires a 2500×843 PNG upload (`POST /v2/bot/richmenu/{id}/content`);
  no such asset exists in the repo. Configuration without imagery renders as a blank menu, so
  this slice ships the API capability behind an explicit opt-in and does **not** enable it in
  production until an asset exists.
- Per-user menu linking (`linkRichMenuToUser`) — no requirement yet.
- The quick-reply vs Flex action-row question — a product decision, recorded in the matrix.

## Requirements

### R-201 `createRichMenu` issues the correct request
Given an access token and a rich menu config, the client MUST issue
`POST https://api.line.me/v2/bot/richmenu` with `Authorization: Bearer <token>`,
`Content-Type: application/json`, and the config as the body. It MUST return
`{ status, statusText, body }` exactly like the existing helpers.

### R-202 `setDefaultRichMenu` issues the correct request
Given a rich menu id, the client MUST issue
`POST https://api.line.me/v2/bot/user/all/richmenu/{richMenuId}`.

### R-203 No credential leakage
No token may appear in logs or returned bodies. The existing helpers already truncate the body
to 200 chars; registration MUST match that discipline.

### R-204 No production wiring without an asset
The bot MUST NOT call these functions on a live `follow` event while no rich menu image exists,
because LINE rejects a rich menu without content and the failure would break the welcome flow.

## Success criteria

- `tests/unit/line-richmenu-client.test.ts` proves the exact method, URL, headers, and body.
- Full backend suite stays green; `bun run check:test` passes.
- No call site is added to the webhook in this slice.
