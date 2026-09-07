# Impeccable Task Queue

> Source: `/impeccable critique` run 2026-09-07 (all surfaces)
> Snapshot: `.impeccable/critique/2026-09-07-all-surfaces.md`
> Score: 16/40 (40%) — Acceptable

## Issues (9)

| # | Priority | Issue | Command | Status |
|---|----------|-------|---------|--------|
| 1 | P0 | Admin sidebar offset broken (`lg:ml-72` invalid in Tailwind v4) | `/impeccable polish` | ⬜ |
| 2 | P0 | Upload hardcoded to demo data (`plot-004`, `2568-napi`) | `/impeccable harden` | ⬜ |
| 3 | P1 | Pervasive English-Thai inconsistency across admin and sponsor | `/impeccable clarify` | ⬜ |
| 4 | P1 | Upload photo-type-first order wrong for field use | `/impeccable shape` | ⬜ |
| 5 | P1 | WCAG AA contrast failures on timestamps and placeholders | `/impeccable audit` | ⬜ |
| 6 | P2 | No message quota indicator on chat surface | `/impeccable clarify` | ⬜ |
| 7 | P2 | Approve action has no confirmation dialog | `/impeccable harden` | ⬜ |
| 8 | P2 | Raw HTML buttons bypass shared Button component | `/impeccable polish` | ⬜ |
| 9 | P2 | Typing indicator uses wrong depth layer (glass → neumorphic) | `/impeccable polish` | ⬜ |

## Execution Order

1. `/impeccable polish` — Issues #1, #8, #9 (sidebar, raw buttons, typing indicator)
2. `/impeccable harden` — Issues #2, #7 (hardcoded data, approve confirmation)
3. `/impeccable clarify` — Issues #3, #6 (language consistency, quota indicator)
4. `/impeccable shape` — Issue #4 (upload flow reorder)
5. `/impeccable audit` — Issue #5 (contrast fixes)
6. Final `/impeccable polish` — Verify all fixes, one pass

## Notes

- Every command follows the full impeccable process: load reference → analyze → edit → verify
- Re-run `/impeccable critique` after all fixes to measure score improvement
