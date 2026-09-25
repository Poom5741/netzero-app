# BUG-008-SUBF1 — Sponsor login POST shadowed by the `/sponsor/login` page route (dev)

- Status: `confirmed` (found in QA sub-run 008-fix-login-wiring-qa1-sub; fixed in maker pass 2)
- Found in: candidate SHA cc08022e165045169a6e60136e8eff554b1cc119 / QA run 008-fix-login-wiring-qa1-sub
- Affected requirement: R1 (J5 sponsor happy path), R4 (same-origin transport in dev)
- Severity: `medium` (J5 cannot pass: the form POST never reaches the backend)
- Reproduction: deterministic (HTTP probe ×2 + code inspection)

## Expected / actual

Expected: the sponsor login form POSTs same-origin and the dev rewrite forwards it to the
backend `/sponsor/login`, which answers 302 + `nzc_session` (mirroring the admin `/login` flow).
Actual: Next applies array (afterFiles) rewrites only after filesystem routes match. A page
exists at `/sponsor/login`, so `POST /sponsor/login` renders the page (200 HTML) and the
rewrite `/sponsor/:path*` never fires. QA probe: `via3000 sponsor POST: 200 loc: null
isNextPage: true` vs `direct8787 sponsor POST: 302 loc: /sponsor cookie: nzc_session=…`
(`.super-speckit/qa/008-fix-login-wiring-qa1-sub/sub-sponsor-post-probe.log` in the QA worktree).

## Fix (this pass)

- Form now POSTs to `/sponsor-login` (no page route possible at that path).
- `frontend/next.config.ts`: added rewrite `/sponsor-login` → `http://localhost:8787/sponsor/login`
  with a comment explaining the afterFiles shadowing constraint.
- `frontend/public/_redirects`: added matching prod line (Cloudflare `_redirects` rules are
  always followed regardless of asset matches, so the explicit line keeps dev/prod parity).

## Regression obligation

- Maker HTTP smoke: POST `/sponsor-login` valid → 302 `/sponsor` + `nzc_session`; wrong pw → 401
  (`.super-speckit/qa/008-fix-login-wiring-maker2/smoke-final.log`).
- Independent retest: QA journey J5 exercises the full browser flow.
