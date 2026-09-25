# Verification matrix: 008 — Fix login wiring

Every requirement has ≥1 verification row or an explicit exception. Evidence paths are relative to repo root.

| Req | Requirement (short) | Verification | Type | Owner | Evidence (planned → actual) |
|---|---|---|---|---|---|
| R1 | Failure never logs in | J2 (401 → Thai error, no nav) · J3 (backend down → generic error, no nav) · happy-path 302 only | runtime QA | checker | `.super-speckit/qa/<run>/` + screenshots |
| R2 | No credentials client-side | J1 sessionStorage eval empty of `nzc_admin_pass` · repo grep `nzc_admin_pass\|setItem` on login pages | runtime + static | maker (grep) / checker (runtime) | grep log + J1 evidence |
| R3 | No Authorization header | J1 network capture on `/api/admin/*` · grep `lib/api.ts` | runtime + static | maker / checker | network trace + grep log |
| R4 | Same-origin transport | dev: J1 cookie is first-party on `localhost:3000` · prod: `out/_redirects` exists (J6) | runtime + build | checker | J1 cookie dump + J6 build log |
| R5 | Real session gate | unit: `/session` 200/401/tampered · J4 fresh-context `/admin` → `/admin/login` · J1 post-login `/admin` renders | unit + runtime | maker (unit) / checker (runtime) | unit log + J4/J1 evidence |
| R6 | Bypass removed | grep "Bypass" in frontend/src · J1 login page screenshot | static + runtime | maker / checker | grep log + screenshot |
| R7 | Flags truthful | grep defaults in `login-features.ts` · login page shows no forgot-password link | static + runtime | maker / checker | grep log + screenshot |
| R8 | Gates green | lint/type/unit/integration logs from candidate SHA | deterministic | maker | gate logs in `.super-speckit/qa/<run>/` |

Exceptions: none — all rows verified or explicitly marked `not-verified` in QA summary. Sponsor subpage gating and prod deploy are out-of-scope follow-ups (spec Non-goals).
