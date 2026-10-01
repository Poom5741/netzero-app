# 017-admin-sponsor-design-parity — Admin + sponsor console design parity — Claude Design artifacts (modules c0d425a3 / 9a78bbdb)

## Problem
Design system of record = landed decoded artifacts (specs/017-admin-sponsor-design-parity/admin-design-spec.md, sponsor-design-spec.md, both artifact JSON token tables); prototype source = same artifacts (GAP B component geometry + screen sections), no external prototype tool. Decisions at design-first: (O-2) icons via vendored inline-SVG lucide-derived path subset in frontend/src, NO new icon dependency (repo installs none; artifact window.lucide sprite unrecoverable per HANDOFF 10.4; IconButton = Button render, excluded by plan); (O-6) PageTitle + Section classified (a) page-local inline patterns implemented per-screen from inventory geometry at ~:502-522 — canonical GAP B full-geometry list (919-1023) excludes them, the approved 8-count reconciles via GAP B arithmetic, no Card/SectionHeading primitive exists to derive from (b); any future promotion to shared components = scope change requiring user sign-off. Accessibility baseline WCAG 2.2 AA (drawer focus trap, Escape/backdrop, focus return). Documented deviations stand: cool-grey ramp vs Constitution VIII; 232px rail + <1024px drawer hybrid. No hex beyond artifact tokens (R-006 criterion).

## Assumptions to review

- User, hierarchy, and state behavior need product confirmation.
- Reuse the repository design system when one is declared.
- This prototype is not production code.
