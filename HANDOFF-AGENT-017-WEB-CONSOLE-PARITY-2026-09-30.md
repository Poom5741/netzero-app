# Handoff — Feature 017 "Web Console Design Parity" (Admin + Sponsor)

**Date:** 2026-09-30
**For:** A completely fresh agent, with no prior context, picking up orchestration of this repo on a different machine.
**Mission:** Take feature `017-admin-sponsor-design-parity` from its current blocked state to a signed-off, QA-verified release — or to a truthfully documented stop.

**You are not starting from scratch.** The expensive, error-prone work is done. What remains is gated on ONE human answer, then 9 mechanical stages. Read §3 before you do anything.

---

## 0. Orientation — read this first, it saves hours

| Question | Answer | Where to verify |
|---|---|---|
| What is the feature? | Bring the Next.js **admin console** (9 screens) and **sponsor portal** (4 screens) to visual parity with client Claude Design artifacts | `specs/017-admin-sponsor-design-parity/` |
| Is it Flex/LINE work? | **No.** Principle IV (LINE-Native UX) governs the farmer surface only. Admin/sponsor are operator web dashboards. No Flex, no rich menu, no LINE API. | `purpose-map.md` "Constitutional boundary" |
| Who sees the UI? | The **Next.js frontend**, not the Worker. Verified: the redirect host is live HTTP 200. | §4 below |
| What is blocking? | **One human confirmation at the purpose gate.** Everything else is unblocked. | §3 |
| What is NOT done? | No production code has been touched. Zero lines changed in `frontend/`. | `git status` — only untracked new spec files |

**Do not re-decode the artifacts.** They are already decoded and every value is traced to a source line. Decoding again wastes ~20 minutes and risks re-introducing transcription errors (three already occurred — see §6).

---

## 1. Repo facts (verify, don't assume)

- **Repo:** `/Users/poom-work/netzero-app` · branch `main` · remote `https://github.com/Poom5741/netzero-app.git` (public)
- **Backend:** Cloudflare Workers + Hono in `src/`, D1/R2/KV
- **Frontend:** Next.js 16 static export in `frontend/`, Tailwind v4, React 19
- **At handoff:** local `main` (`564983c`) was **exactly level with `origin/main`**, working tree clean except untracked new spec files.

**Critical structural fact** — `src/index.ts` registers these BEFORE the API routes:

- `src/index.ts:385` → `app.get("/admin(/*)?")` → 302 to `https://netzero-frontend.poom-a1d.workers.dev` + path
- `src/index.ts:390` → `app.get("/sponsor(/*)?")` → same
- `src/index.ts:404` → `app.route("/", adminRoutes)`
- `src/index.ts:407` → `app.route("/sponsor", sponsorRoutes)`

Hono matches in registration order, so the Worker-rendered admin/sponsor **HTML is unreachable over HTTP**. The Next.js app is what users see. **Build parity in `frontend/`, not in `src/routes/`.** Getting this backwards is the exact trap a previous feature (013) fell into.

---

## 2. Artifacts already produced (all verified)

**Decoded design evidence** — `specs/017-admin-sponsor-design-parity/`
| File | Lines | Contents |
|---|---|---|
| `admin-design-spec.md` | 1052 | 9 screens + `ConsoleShell`, 186 tokens, 22 components with source line numbers, GAP A/B/C |
| `admin-artifact.json` | 2173 | machine-readable; keys `tokens`, `components`, `adminShell`, `implementationGap` |
| `sponsor-design-spec.md` | 1001 | 4 screens, 180 tokens, 18 components, nav, credit chart, filter defaults |
| `sponsor-artifact.json` | 1723 | same shape + `additionalFindings` |
| `feedback-loop.md` | 760 | 75 Tier-1 + 18 Tier-2 tests, Map C decided, mutation-proofing steps |

**Gate document** — `.super-speckit/purpose/017-admin-sponsor-design-parity/purpose-map.{md,html}`
Open the `.html`. Automated success signal 1–7, human lane 8–9.

⚠️ **`.gitignore:53` ignores all of `.super-speckit/`.** The purpose map, grill, and matrix are **local-only** and will not appear in git history. This matches feature 013's precedent. It was raised with the maintainer and not yet decided.

---

## 3. ⛔ THE ONE BLOCKER — ask this, then continue

**Purpose is the only gate an orchestrator may not self-confirm.** The purpose map is written, fact-checked, and awaiting a human. Do NOT fabricate confirmation.

**Ask the maintainer for:**

1. Confirm/correct **outcome, people, success signal, non-goals**
2. Confirm the **R-901 revocation** — `013-farmer-chat-design-parity.md:57` records "Admin and sponsor surfaces — excluded by confirmed non-goals", status `not-applicable`. This feature reverses that carve-out. It must be annotated `superseded`.
3. A letter per **Tension 0–6** (or "go with your recommendations")
4. **Hex criterion**: "zero inlined hex" vs **"zero inlined hex that isn't an artifact token value"** — 4 of the 17 are `#52ECCA`, a genuine artifact token (`--teal-300`)
5. Whether to keep `.super-speckit/` gitignored

**Recommendations on record:** Tension 0 → (c) amend nothing, record documented deviations · 1 → (b) desktop exact + drawer <1024px · 2 → (b) admin (9 screens) then sponsor (4) · 3 → (b) restyle existing components, add the 8 missing · 4 → (b) `/admin/charts` as shell, defer 6 chart types · 5 → (b) keep routes, restyle nav · 6 → (b) existing logo pipeline, ask designer for the wind-farm image.

**Tension 0 is the subtle one.** Constitution Principle VIII mandates "neumorphic cards white on gray `#f0f4f8`" and "the sponsor sidebar MUST be responsive". The artifact mandates the opposite on both (cool-grey ramp; fixed 232px sidebar, no mobile breakpoint). The constitution says it supersedes conflicting practice, so literal 100% matching violates it in two places. Recommendation (c): record both as documented deviations, amend nothing in this feature.

**On confirmation, write** `.super-speckit/purpose/017-admin-sponsor-design-parity/decision.json` (schema: `feature`, `status: confirmed`, `map`, `visual`, `confirmed_by`, `confirmed_at` ISO, `confirmation`) and annotate the 013 matrix row to `superseded`.

---

## 4. Environment — verified live

| Surface | Status |
|---|---|
| Admin / sponsor frontend | `https://netzero-frontend.poom-a1d.workers.dev` — **HTTP 200**, `text/html`, `<title>NetZeroCarbon</title>`, Thai `lang="th"`, real `_next/static` assets. Confirmed live 2026-09-30. |
| Backend Worker | `wrangler.toml` name `netzero-carbon-poc`, main `src/index.ts`, `compatibility_date = 2024-09-23` |

**API base URL — documented design, unverified in practice.** `frontend/src/lib/api.ts:4` is `process.env.NEXT_PUBLIC_API_BASE || ""`, and the comment at `api.ts:1-3` states the intent: same-origin traffic, proxied to the Worker in production via **Cloudflare Pages `_redirects`** ("Next.js rewrites proxy to localhost:8787 in dev; Cloudflare Pages _redirects proxies to the Worker in production (static export). Override only with NEXT_PUBLIC_API_BASE."). No `.env.production` exists in the repo, so the variable is unset and relative `/api/...` paths are used — which is consistent with that design **provided the deployed site actually has `_redirects` in place**. That file is not in the repo and could not be verified.

**Consequence for QA:** do not assume API-backed data renders. **Tier-2 Playwright must assert computed CSS, not API-sourced values**, and if a page shows empty/loading state because the proxy is missing, that is an environment finding to report — not a parity defect to "fix".

No in-repo deploy pipeline exists for `frontend/` (no `vercel.json`, `netlify.toml`, `Dockerfile`, or `.github/workflows/`). Deployment is manual/external.

---

## 5. Measured baseline — run these yourself before changing anything

Dependencies ARE installed in both trees, so these are true baselines (this repo has a history of fake "pre-existing failures" caused by missing `node_modules`).

```
cd frontend && npx vitest run     # 118 tests, 114 pass, 4 FAIL
cd frontend && npx tsc --noEmit  # CLEAN
cd frontend && npx eslint .      # 0 errors, 17 warnings
bun test tests/unit/             # 914 pass / 0 fail
bun test tests/integration/      # 73 pass / 0 fail
```

**`bun test` cannot parse `.tsx`.** Frontend tests only run under `cd frontend && npx vitest run`. Do not run bare `bun test` repo-wide.

### The 4 failures are STALE ASSERTIONS, not regressions

- `frontend/src/components/__tests__/button.test.tsx` — 3 tests assert `claymorphic`, `neumorphic`, `text-on-error`
- `frontend/src/components/sponsor/__tests__/live-calc.test.tsx` — 1 test asserts `.neumorphic`

Grep proves all three tokens have **0 occurrences** in `frontend/src`, and `frontend/src/app/globals.css:90` carries the comment `/* neumorphic/claymorphic removed — not in reference */`. The design language was deliberately deleted; the tests outlived it. **Delete or rewrite them against the artifact. Never "fix" them by re-adding dead CSS.**

Note `frontend/src/components/admin-review/__tests__/review-card-two-tier.test.tsx` is GREEN (5 pass) — it was misreported red in early triage.

---

## 6. Hard-won lessons — violating these caused real rework

1. **jsdom cannot compute the cascade. Measured:** class `bg-blue-500` → computed `backgroundColor` = `rgba(0, 0, 0, 0)`; `border border-red-500` → computed `border` = `16px none rgb(0, 0, 0)`; INLINE style `backgroundColor:"#061E5C"` → `rgb(6, 30, 92)` (inline resolves, classes don't). `frontend/src/test/setup.ts` is ONE line and never injects `globals.css`. **Therefore: Tier 1 = `readFileSync` + regex (the technique in `tests/unit/liff-page-parity.test.ts`). Tier 2 = Playwright. A jsdom computed-style parity test is a fabricated-evidence generator.**
2. **Components never contain `var(--token)`.** They use Tailwind utilities (`bg-surface-container-low`, `rounded-xl`) and arbitrary values (`ring-[#028E91]`). The R-013 precedent (`tests/unit/liff-page-parity.test.ts`) regex-matches the Worker's emitted HTML string — that does **not** transfer to a Tailwind app.
3. **Verify figures before publishing them.** The gate was about to be signed with three wrong numbers: hex "19" (real: **17 occurrences**), a "114 unmatched tokens" figure that was really **0 overlap** (186−72 was coincidence), and a single "186 tokens" masking **186 admin / 180 sponsor**.
4. **Hex count discipline.** `grep -o` = 17 matches; plain `grep` = 14 lines; 8 files. One source line can hold two literals (`button.tsx:14` has `from-[#02A8AC]` *and* `to-[#028E91]`). Always state scope and whether you counted occurrences or lines. 17 = 13 Tailwind arbitrary values + 4 inline `style` props.
5. **Worker self-reports are not evidence.** Multiple workers claimed "verified everywhere" / "no other files modified" while a wrong value remained. Verify with your own `read`/grep. A worker also fabricated an explanation ("3-digit hex in test files") for the 19-vs-14 gap; the real cause was regex matching `rgba(2,142,145,0.3)` fragments.
6. **Long-context workers die.** One hit HTTP 400 "prompt is too long" after many edits, leaving a half-applied file (duplicated heading, broken numbering). For narrow fixes, read only the line range, make ONE surgical edit, then re-read to verify. Do not pass a whole file back to a new worker.
7. **Never `git add -A`.** A prior worker in this repo committed `.zcode/plans/*` orchestration scaffolding by using `git add -A`. Stage explicit paths only. `.zcode/` is NOT gitignored.
8. **Don't trust `docs/claude-design-artifact-map.md`** — written from an older extraction; it understates the artifacts. The farmer artifact's flow module declared 43 steps/25 nodes where the map claimed "10 scenes".

---

## 7. After confirmation — the 9 stages

Everything below is unblocked the moment purpose is confirmed. Do not reorder.

1. **Grill** — fan THREE scouts in one batch: Builder (smallest coherent shape), Examiner (adversarial, `path:line`, severity-tagged), Investigator (6–8 questions, each proven/inferred/unknown). Write `.super-speckit/grills/017-admin-sponsor-design-parity/spec-grill.md` with a Resolver table: Question | Resolution | Classification | Evidence | Verification consequence.
2. **Route** → `milestone` (13 screens across two surfaces, not one demoable slice). Record rationale.
3. **Atlas init** + change story.
4. **Design-first** — `super-speckit.yml` sets `design.required_when_paths` to include `**/*.tsx`, and `require_decision_before_implementation: true`. Produce a design brief and set `decision.json` status `decided` BEFORE any UI code.
5. **Spec / plan / tasks** under `specs/017-admin-sponsor-design-parity/`, plus a requirements-to-verification matrix modelled on `013-farmer-chat-design-parity.md` (that matrix is the template — read it).
6. **Commit planning artifacts** with explicit paths.
7. **Maker worktree** `../.super-speckit-worktrees/ss/feature/017-admin-sponsor-design-parity`, branch `ss/feature/017-admin-sponsor-design-parity`. Note existing worktrees live at `/Users/poom-work/.super-speckit-worktrees/`, not inside the repo.
8. **Independent checker** — a DIFFERENT agent, fresh QA worktree, at a pinned candidate SHA. Never trust maker numbers; re-observe. `super-speckit.yml` requires `require_distinct_maker_and_checker: true` and `merge_requires_human: true` — **never merge automatically.**
9. **Release summary** — every matrix row labelled `verified` / `not-verified` / `not-applicable` with an evidence path. Missing environment access is an explicit *unverified*, never a pass.

**Note:** the `super_speckit.py` CLI the playbook references **does not exist in this repo**. State for 013 was hand-maintained under `.super-speckit/state/`. Maintain 017's the same way, matching the 013 schema: `.super-speckit/state/features/017-admin-sponsor-design-parity.json` + `work-state.yml`.

---

## 8. Repo hygiene before you cut worktrees

- 6 existing worktrees, all with live directories: `013-repository-hygiene-qa-002..005`, `BUG-013-001`, plus main. Do not remove them without asking.
- ~26 branches under `ss/*`; 8 `ss/qa/013-bot-parity-00*` are **merged**, the rest are **not**. Nothing is stale-prunable.
- `scripts/check-repository-hygiene.py` enforces 18 required paths and flags tracked-but-ignored files. Run `bun run check:repo` after commits.

---

## 9. Definition of done

- Every AD-*/SP-* screen has a route rendering its artifact-specified sections (AD-CHART ships as a shell; its 6 chart types are deferred).
- Zero non-artifact inlined hex literals in the parity-scoped paths.
- Artifact Button geometry: 36/46/54px heights, 999px pill radius, variants primary/secondary/outline/ghost/onDark.
- Shell: 232px sidebar, `rgb(6, 30, 92)`, sticky, 100vh.
- Tier 1 (static) + Tier 2 (Playwright computed-style) both green; the 4 stale tests deleted or rewritten.
- Backend suites still 914+73; `tsc --noEmit` clean.
- **Human visual sign-off obtained** — automated checks prove computed styles, not that it looks right.
- Release summary with per-row verdicts and evidence paths.

---

## 10. What I could not determine — do not assume otherwise

1. Whether the deployed site actually carries the Cloudflare Pages `_redirects` proxy described at `frontend/src/lib/api.ts:1-3`. It is not in the repo, so if it is absent every client `/api/...` call 404s. Verify against the live host before trusting any API-backed screen in QA.
2. How `frontend/` is actually deployed (no pipeline in repo).
3. Whether the live `workers.dev` host is the *current* build of this source.
4. The artifact's **binary assets** — logo files, the `renewables-wind-farm.png` login background, and the Lucide icon sprite are referenced but NOT recoverable from the bundles. Do not invent them; use the existing logo pipeline and record the gap.
5. Whether the maintainer accepts the documented constitutional deviations (Tension 0).
