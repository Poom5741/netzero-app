# Tasks — Bot-Render Artifact Parity (Slice 1)

**Spec**: `specs/013-bot-render-parity/spec.md`
**Matrix**: `.super-speckit/matrices/013-farmer-chat-design-parity.md`
**Feedback loop**: `.super-speckit/feedback/013-farmer-chat-design-parity/feedback-loop.md`

## Baseline (red — verified 2026-09-29, commit `41fbe2e`)

```
bun test tests/unit/line-parity-artifact.test.ts
  → 3 pass, 4 fail
```

## Phase 1 — Maker (implementation)

- [ ] **T-001** Retoken `src/line/flex-builders.ts:20-24` to artifact values.
      `COLOR_TEXT` `#333333` → `#16202C`. Keep `COLOR_PRIMARY` `#06c755`,
      `COLOR_ERROR` `#dc3545`, `COLOR_BG` `#FFFFFF` (already correct).
      → satisfies R-001. Red test: "uses artifact ink #16202C".
- [ ] **T-002** Audit every colour literal outside the constants
      (`src/line/consent.ts`, `src/line/retake-message.ts`, `src/line/welcome.ts`) and
      align to artifact values. → R-001.
- [ ] **T-003** Set bubble `cornerRadius: "13px"` on the Flex bubble containers.
      → R-003.
- [ ] **T-004** Change action blocks from `paddingAll: "10px"` / `cornerRadius: "6px"`
      to `"9px 4px"` / `"4px"`. Affects all 9 builders' footers.
      → R-002. Red tests: "artifact padding 9px 4px", "artifact 4px action radius".
- [ ] **T-005** Add a `chatDivider()` helper emitting the artifact divider block
      (translucent black, radius `999px`) and include it in `buildWelcomeBubble`.
      Label: `เพิ่ม NetZeroCarbon เป็นเพื่อนแล้ว`.
      → R-004. Red test: "emits a ChatDivider-equivalent pill".

## Phase 2 — Local checks (maker runs once)

- [ ] **T-006** `bun test tests/unit/line-parity-artifact.test.ts` → all green.
- [ ] **T-007** `bun test tests/unit/ tests/integration/` → no new failures vs baseline
      (baseline: 893 pass / 0 fail excluding this file's 4).
- [ ] **T-008** Confirm the `src/line/` diff is constants + divider only — no message
      text, action payload, or state-machine change. → R-005.

## Phase 3 — Checker (independent, new QA branch from candidate SHA)

- [ ] **T-009** Re-run the parity test from the candidate SHA; confirm green.
- [ ] **T-010** Re-run the full backend suite; diff **failing test names** against the
      clean-`41fbe2e` worktree baseline (compare names, not counts).
- [ ] **T-011** Assert the emitted welcome Flex document field-by-field against the
      artifact constants.
- [ ] **T-012** Record evidence to `.super-speckit/qa/<run-id>/`.

## Dependencies and ordering

T-001 → T-002 (T-002 depends on the new constant existing).
T-003, T-004, T-005 are independent of each other.
All of Phase 1 must finish before T-006. Phase 3 requires a committed candidate SHA.

## Not in this slice

- Rich menu registration with the LINE API (R-007) — needs a new HTTP call + test seam.
- Rich menu cell imagery (R-011 deferred, blocked on a design asset).
- All LIFF/web parity — slice 2, blocked on confirming the channel's LIFF endpoint URL.
