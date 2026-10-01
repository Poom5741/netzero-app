# ⛔ Feature 017 is blocked at the Purpose Gate

**Status:** `awaiting_human_confirmation` · **Last updated:** 2026-09-30
**Feature:** `017-admin-sponsor-design-parity`

This file exists because the purpose map itself lives under `.super-speckit/`, which
`.gitignore:53` ignores. This stub is in a **tracked** path (`specs/`), so the block is
visible in git history and to any agent reading the repo.

**Nothing in `frontend/` has been changed.** No production code was touched.

---

## To unblock

Read `.super-speckit/purpose/017-admin-sponsor-design-parity/purpose-map.html` (open it in a
browser), then answer **one line**: *"go with your recommendations"* — or correct any part.

On confirmation, write `.super-speckit/purpose/017-admin-sponsor-design-parity/decision.json`
and **delete this file**.

---

## The five open questions

| # | Question | Recommendation |
|---|---|---|
| 1 | Confirm/correct outcome, people, success signal, non-goals | confirm as written |
| 2 | Revoke R-901? (`013-farmer-chat-design-parity.md:57` records "Admin and sponsor surfaces — excluded by confirmed non-goals", status `not-applicable`) | **revoke** — this feature is that carve-out's reversal; annotate the row `superseded` |
| 3 | Tensions 0–6 | 0→(c) · 1→(b) · 2→(b) · 3→(b) · 4→(b) · 5→(b) · 6→(b) |
| 4 | Hex criterion: "zero inlined hex" or "zero inlined hex that isn't an artifact token value"? (4 of 17 are `#52ECCA`, a real artifact token `--teal-300`) | the latter |
| 5 | Keep `.super-speckit/` gitignored (so purpose/grill/matrix stay local-only), or un-ignore it? | keep, matching 013's precedent — but the gate record then never reaches git history |

---

## Recommended options, spelled out

- **Tension 0 — artifact vs Constitution Principle VIII.** The constitution mandates "neumorphic cards white on gray `#f0f4f8`" and "the sponsor sidebar MUST be responsive"; the artifact mandates a cool-grey ramp and a fixed 232px sidebar with no mobile breakpoint. The constitution says it supersedes conflicting practice, so literal 100% matching violates it in two places. **(c)** — record both as documented deviations scoped to admin+sponsor, amend nothing here. A formal amendment (option a) needs a sync-impact report + version bump and is a separate workstream.
- **Tension 1 — desktop-only artifact vs WCAG 2.2 AA / Pixel 5 e2e.** **(b)** — desktop pixel-match plus a minimal collapse: 232px rail ≥1024px, hamburger + drawer <1024px.
- **Tension 2 — scope.** **(b)** — slice A: admin (9 screens); slice B: sponsor (4 screens).
- **Tension 3 — components.** **(b)** — restyle existing `components/ui|dashboard|sponsor|admin-review` and add the missing artifact components; do not build a parallel `ds/` tree.
- **Tension 4 — charts.** **(b)** — `/admin/charts` ships as a shell (PageTitle + FilterBar + layout); the 6 SVG chart types are deferred.
- **Tension 5 — shell.** **(b)** — keep the route-driven Next.js layout; apply the artifact's nav styling. Static export makes the artifact's state-driven shell a rewrite.
- **Tension 6 — missing binaries.** **(b)** — use the existing logo pipeline; record the wind-farm background as a gap for the designer. Do not invent assets.

---

## Key facts a resuming agent needs

- **Build in `frontend/`, not `src/routes/`.** `src/index.ts:385,390` register 302 redirects to the Next.js app *before* `adminRoutes`/`sponsorRoutes` register at `:404`/`:407`. Hono matches in order, so the Worker's admin/sponsor HTML is unreachable over HTTP.
- **Frontend is live:** `https://netzero-frontend.poom-a1d.workers.dev` → HTTP 200 (verified 2026-09-30).
- **Baseline (deps installed):** vitest 118 tests / 114 pass / **4 fail**; `tsc --noEmit` clean; lint 0 errors / 17 warnings; backend 914 pass + 73 pass.
- **The 4 failures are stale assertions, not regressions.** `claymorphic`, `neumorphic`, `text-on-error` have 0 occurrences in `frontend/src`; `frontend/src/app/globals.css:90` reads `/* neumorphic/claymorphic removed — not in reference */`. Delete or rewrite them against the artifact — never re-add dead CSS.
- **jsdom cannot compute the cascade** (measured: `bg-blue-500` → `rgba(0, 0, 0, 0)`). Tier 1 = `readFileSync` + regex; Tier 2 = Playwright. A jsdom computed-style parity test fabricates evidence.
- **17 inlined hex literal occurrences across 8 files** (13 Tailwind arbitrary values + 4 inline `style` props), not 19 — earlier figures were wrong and are corrected.
- **Token mapping is unstarted:** 186 admin tokens / 180 sponsor tokens, **0** of which appear in `globals.css`. Map C (alias tokens) is decided in `feedback-loop.md`.

## Full detail

`HANDOFF-AGENT-017-WEB-CONSOLE-PARITY-2026-09-30.md` in the repo root — includes the eight
hard-won lessons, the 9 post-confirmation stages, repo hygiene state, and the 5 things a
resuming agent must not assume.
