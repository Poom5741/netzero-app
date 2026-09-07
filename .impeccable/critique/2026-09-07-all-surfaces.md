---
target: all-surfaces
total_score: 16
max_score: 40
na_heuristics: ""
p0_count: 2
p1_count: 3
p2_count: 4
date: 2026-09-07
method: dual-agent
---

# Impeccable Critique: NetZeroCarbon (All Surfaces)

**Method: dual-agent (A: design review · B: code scan)**

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Summary progress starts at 25% falsely; sponsor loading is plain text; no upload progress bar; no message quota indicator |
| 2 | Match System / Real World | 1 | Admin detail panel labels are English while queue is Thai; "Chat Hub" header in English; sponsor trends mix English/Thai; "Q3 2024" hardcoded |
| 3 | User Control and Freedom | 2 | Chat dead "add file" button; no undo after admin approve; summary has no draft save; upload has no CTA after verdict |
| 4 | Consistency and Standards | 1 | Admin uses banned `lg:ml-72`; raw HTML buttons bypass shared Button component; `badge-pending` uses non-token colors; typing indicator uses wrong depth layer |
| 5 | Error Prevention | 1 | Admin approve has no confirmation; season gate approve has no confirmation; upload uses `window.confirm` instead of design-system modal |
| 6 | Recognition Rather Than Recall | 2 | Sponsor map has no data markers; province codes have no legend; hardcoded dates require user to know context |
| 7 | Flexibility and Efficiency | 1 | No keyboard shortcuts, no batch operations, no search, no saved views |
| 8 | Aesthetic and Minimalist Design | 3 | Depth system is well-applied; sponsor map is decorative clutter |
| 9 | Error Recovery | 2 | Chat errors are generic; upload has no retry; admin 401 is vague |
| 10 | Help and Documentation | 1 | No onboarding, no tooltips, no help section |

**Total: 16/40 — Acceptable (40%)**

## Design Specificity Verdict

60% authored, 40% category-interchangeable. The depth system is genuinely specific; admin and sponsor surfaces are generic dashboard templates.

## Priority Issues

- **P0**: Admin sidebar offset broken (`lg:ml-72` invalid in Tailwind v4)
- **P0**: Upload hardcoded to demo data (plot-004, 2568-napi)
- **P1**: Pervasive English-Thai inconsistency across admin and sponsor
- **P1**: Upload photo-type-first order wrong for field use
- **P1**: Multiple WCAG AA contrast failures on timestamps and placeholders
- **P2**: No message quota indicator
- **P2**: Approve action has no confirmation dialog
- **P2**: Raw HTML buttons bypass shared Button component
- **P2**: Typing indicator uses wrong depth layer
