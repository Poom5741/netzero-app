# Tasks — Worker LIFF Page Artifact Parity (Slice 3)

**Spec**: `specs/015-worker-liff-parity/spec.md`
**Matrix**: `.super-speckit/matrices/013-farmer-chat-design-parity.md` (R-013 … R-020)
**Feedback loop**: `tests/unit/liff-page-parity.test.ts` (baseline 0/11)

> **LOCALLY AUTHORED RECONSTRUCTION — 2026-10-03.** Slice 3 was implemented (`10a267f` chat
> page, `c5c4005` remaining farmer pages) and independently QA'd
> (`.super-speckit/qa/013-bot-parity-003/` + `-004/proof-pack.json`, verdicts `pass`, both with
> `runtime_evidence`), but no task file ever existed for this slice. Created per the confirmed
> full-heal scope (user-approved 2026-10-03), limited to landed-evidence facts. The spec's
> "awaiting independent QA" status line is stale — QA packs 003/004 are that QA.

## RECONCILED 2026-10-03 — implemented and checker-verified

- [x] **T-301** Artifact token block as CSS custom properties on `:root` (R-013…R-018).
      Evidence: `10a267f` + `c5c4005` diffs on `src/routes/liff.ts`; pack-003/004 `runtime_evidence`.
- [x] **T-302** Legacy palette removed (R-019: no `#f0f2f5`/`#333`/`#06c755`/`#e0e0e0`/`#ddd`).
      Evidence: pack-004 `logic_preservation` + hex-clean audit recorded by checker.
- [x] **T-303** Bubble geometry: 232px cap, `9px 12px`, 13px radius + 4px tail (R-017).
      Evidence: `liff-page-parity.test.ts` assertions; green below.
- [x] **T-304** No behavioural change — markup structure, script, endpoints untouched (R-005).
      Evidence: pack-004 `logic_preservation`; presentation-only diff scope.
- [x] **T-305** `bun test tests/unit/liff-page-parity.test.ts` → 11/11.
      Evidence: re-run live 2026-10-03 on `2df2513` — **11 pass / 0 fail**.
- [x] **T-306** Runtime computed-style verification against artifact.
      Evidence: pack-003 `runtime_evidence` + pack-004 `runtime_evidence` (checker lane, candidates `10a267f`/`c5c4005`).
- [x] **T-307** Full backend suite + scenarios green at candidates.
      Evidence: pack-003/004 gates all pass (backend 953/0 recorded at slice-8 umbrella run).

## Not in this slice

- `/register`, `/camera`, `/documents` template parity (R-020) — same approach, separate work.
- LIFF screen routes still unbuilt (`/calendar` `/fields` `/docs` `/baseline`) — disclosed in
  pack-008 `remaining`; deep-linked flows unaffected.
- LIFF URL config (which runtime serves deep links) — resolved via
  `docs/handoff/HANDOFF-LIFF-URL-CONFIG.md`; Worker canonical per `.super-speckit/research/013-liff-runtime-resolution.md`.
