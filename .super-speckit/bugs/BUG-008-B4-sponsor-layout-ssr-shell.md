# BUG-008-B4 — Sponsor layout: conditional hook + `typeof window` check → empty SSR/prerender shell

- Status: `confirmed` (found during maker pass 2 while verifying SUB-F1; code introduced by this feature in ce9072f)
- Found in: candidate SHA cc08022e165045169a6e60136e8eff554b1cc119
- Affected requirement: R4 (static export completeness), J5 first-paint quality
- Severity: `medium` (no crash — real browsers render after hydration — but the prerendered
  login page ships an empty shell, inconsistent with admin/login, and the code violates
  the Rules of Hooks)

## Expected / actual

Expected: `/sponsor/login` server-renders its login form like `/admin/login` does.
Actual: `frontend/src/app/sponsor/layout.tsx` gated the hook call on
`typeof window !== "undefined" && window.location.pathname === "/sponsor/login"`:
1. **Conditional hook call** (`isLoginPage ? true : useSponsorSessionGate()`) — violates
   Rules of Hooks; illegal branch-dependent hook order.
2. During SSR/prerender `typeof window` is `undefined`, so the gate hook ran, returned
   `null`, and the layout rendered `null` → the prerendered HTML contained no form.

Reproduction on cc08022: prerendered `out/sponsor/login.html` has 1 DOM node and no
`id="email"`; `out/admin/login.html` has 17 DOM nodes with the form (dev-server probe
confirmed the same asymmetry pre-fix).

## Fix (this pass)

- `frontend/src/app/sponsor/layout.tsx`: SSR-safe + hook-legal pattern mirroring the admin
  layout — `usePathname()` for the login-page check (works during SSR), unconditional
  `useSessionGate("sponsor", { enabled: !isLoginPage })`, and `return children` on the
  login page regardless of gate state.
- `frontend/src/lib/use-session-gate.ts`: additive `options.enabled` flag (default `true`)
  so the skipped gate does no session probe and cannot trigger a redirect loop on the
  login page. All other call sites are unaffected.

## Regression evidence

- Post-fix prerender: `out/sponsor/login.html` contains the full form (`id="email"`) —
  verified in J6 rebuild (`.super-speckit/qa/008-fix-login-wiring-maker2/j6-build3.log`
  companion check).
- Gates: frontend tsc 0, biome 0, root tsc 0, 860 tests / 0 fail.

## Regression obligation

- Independent retest: J5 (browser) + J6 (prerender contains `id="email"` in
  `out/sponsor/login.html`).
