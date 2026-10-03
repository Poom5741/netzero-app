# Tasks — Bot-Render Artifact Parity (Slice 1)

**Spec**: `specs/013-bot-render-parity/spec.md`
**Matrix**: `.super-speckit/matrices/013-farmer-chat-design-parity.md`
**Feedback loop**: `.super-speckit/feedback/013-farmer-chat-design-parity/feedback-loop.md`

**RECONCILED 2026-10-03**: all 12 tasks verified landed on `main` (`2df2513`); boxes ticked
with evidence citations in the Reconciliation section at the end of this file. Slice-1 QA
closed via `.super-speckit/qa/013-bot-parity-001..008/proof-pack.json` (verdicts: all `pass`).

## Baseline (red — verified 2026-09-29, commit `41fbe2e`)

```
bun test tests/unit/line-parity-artifact.test.ts
  → 3 pass, 4 fail
```

## Phase 1 — Maker (implementation)

- [x] **T-001** Retoken `src/line/flex-builders.ts:20-24` to artifact values.
      `COLOR_TEXT` `#333333` → `#16202C`. Keep `COLOR_PRIMARY` `#06c755`,
      `COLOR_ERROR` `#dc3545`, `COLOR_BG` `#FFFFFF` (already correct).
      → satisfies R-001. Red test: "uses artifact ink #16202C".
- [x] **T-002** Audit every colour literal outside the constants
      (`src/line/consent.ts`, `src/line/retake-message.ts`, `src/line/welcome.ts`) and
      align to artifact values. → R-001.
- [x] **T-003** Set bubble `cornerRadius: "13px"` on the Flex bubble containers.
      → R-003.
- [x] **T-004** Change action blocks from `paddingAll: "10px"` / `cornerRadius: "6px"`
      to `"9px 4px"` / `"4px"`. Affects all 9 builders' footers.
      → R-002. Red tests: "artifact padding 9px 4px", "artifact 4px action radius".
- [x] **T-005** Add a `chatDivider()` helper emitting the artifact divider block
      (translucent black, radius `999px`) and include it in `buildWelcomeBubble`.
      Label: `เพิ่ม NetZeroCarbon เป็นเพื่อนแล้ว`.
      → R-004. Red test: "emits a ChatDivider-equivalent pill".

## Phase 2 — Local checks (maker runs once)

- [x] **T-006** `bun test tests/unit/line-parity-artifact.test.ts` → all green.
- [x] **T-007** `bun test tests/unit/ tests/integration/` → no new failures vs baseline
      (baseline: 893 pass / 0 fail excluding this file's 4).
- [x] **T-008** Confirm the `src/line/` diff is constants + divider only — no message
      text, action payload, or state-machine change. → R-005.

## Phase 3 — Checker (independent, new QA branch from candidate SHA)

- [x] **T-009** Re-run the parity test from the candidate SHA; confirm green.
- [x] **T-010** Re-run the full backend suite; diff **failing test names** against the
      clean-`41fbe2e` worktree baseline (compare names, not counts).
- [x] **T-011** Assert the emitted welcome Flex document field-by-field against the
      artifact constants.
- [x] **T-012** Record evidence to `.super-speckit/qa/<run-id>/`.

## Dependencies and ordering

T-001 → T-002 (T-002 depends on the new constant existing).
T-003, T-004, T-005 are independent of each other.
All of Phase 1 must finish before T-006. Phase 3 requires a committed candidate SHA.

## Not in this slice

- Rich menu registration with the LINE API (R-007) — needs a new HTTP call + test seam.
- Rich menu cell imagery (R-011 deferred, blocked on a design asset).
- All LIFF/web parity — slice 2, blocked on confirming the channel's LIFF endpoint URL.

## Reconciliation evidence (2026-10-03)

| Task | Verdict | Evidence |
|---|---|---|
| T-001 | done | `src/line/flex-builders.ts:28-31` — `COLOR_TEXT #16202C`, `COLOR_ERROR #C8464F` (Bootstrap `#dc3545` replaced; the gap QA-013-001 caught) |
| T-002 | done | audit 2026-10-03: zero hex literals in `consent.ts`/`retake-message.ts`/`welcome.ts`; sole non-`const` literals are `flex-builders.ts:176` tone ternary `#0AA8A3`/`#E2A33C` — exact artifact status tokens (parity-diff row 1) |
| T-003 | done as landed | task text said `13px` (pre-implementation estimate); landed artifact-exact `4px` container + `999px` divider pill, checker-verified snapshots `welcome-bubble.json` (pack-001 R-003 pass, verdict `pass`) |
| T-004 | done | `flex-builders.ts:37-39` — `PADDING_ACTION_V "9px"`, `PADDING_ACTION_H "4px"`, `RADIUS_ACTION "4px"` = exactly the task's target values; applied via `RADIUS_ACTION`/`PADDING_ACTION_V` in all builders |
| T-005 | done | `flex-builders.ts:258` `chatDivider()` with the artifact label; present in `welcome-bubble.json` fixture (`cornerRadius 999px`) |
| T-006 | done | red 3 pass/4 fail at `41fbe2e` (baseline block above) → **8 pass / 0 fail** re-run live 2026-10-03 on `2df2513` |
| T-007 | done | pack-008 gate `backend-regression` at `d58e85c`: 953 pass / 0 fail (129 files); 2026-10-02 017 gate1 re-derivation: 914/0 |
| T-008 | done | `git show --stat 7c3d826`: flex-builders tokens+divider, 1-line `retake-message.ts` colour alignment, fixtures, new parity test, spec/tasks docs — no message text/action/state-machine change |
| T-009 | done | pack-001 (candidate `7c3d826`) checker re-run: all 4 gates pass |
| T-010 | done | QA-013-005 failing-name diff closed BUG-013-002 (pre-existing failures disclosed, `ready_for_merge=false` recorded truthfully); by pack-008 (`d58e85c`) full suite green: 953/0 |
| T-011 | done | `tests/unit/flow-design-parity.test.ts:243` builds `buildWelcomeBubble` and asserts contents field-by-field; pack-008 `flow-design-parity` 17 pass / 0 fail (15 nodes + PJ-02 variants) |
| T-012 | done | `.super-speckit/qa/013-bot-parity-001..008/proof-pack.json` — 8 runs, distinct maker/checker, verdicts all `pass` |
